import os
import uuid
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo import MongoClient

from graph import get_app_graph
from services.aws_s3 import create_presigned_url, upload_file

load_dotenv()

# MongoDB Setup
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = "room_designer"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup (Sync client)
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]

    # Set 1-day TTL index on checkpoints collection
    # The 'ts' field is usually used by LangGraph for timestamps, or we can use a custom createdAt if needed.
    # LangGraph checkpoints usually have a 'ts' (timestamp) field in the 'checkpoints' collection.
    try:
        # Ensure index on 'ts' field with expireAfterSeconds
        # 1 day = 24 * 60 * 60 = 86400 seconds
        db["checkpoints"].create_index("ts", expireAfterSeconds=86400)
    except Exception as e:
        # Check if it is an IndexOptionsConflict (code 85)
        # We need to import OperationFailure to check properly or check the code attribute safely
        if hasattr(e, "code") and e.code == 85:
            print("IndexOptionsConflict detected. Dropping old index and recreating...")
            db["checkpoints"].drop_index("ts_1")
            db["checkpoints"].create_index("ts", expireAfterSeconds=86400)
            print("TTL index recreated successfully.")
        else:
            print(f"Warning: Could not create TTL index: {e}")

    checkpointer = MongoDBSaver(client, db_name=DB_NAME)

    # Initialize the graph with the checkpointer
    app.state.graph = get_app_graph(checkpointer)
    app.state.mongo_client = client

    yield

    # Shutdown
    client.close()


app = FastAPI(lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "AI Room Designer API is running"}


@app.post("/init-session")
async def init_session(file: UploadFile = File(...)):
    try:
        thread_id = str(uuid.uuid4())

        file_content = await file.read()
        object_key = f"{thread_id}-{file.filename}"

        uploaded_key = upload_file(file_content, object_key)
        if not uploaded_key:
            raise HTTPException(status_code=500, detail="Failed to upload image to S3")

        original_url = create_presigned_url(uploaded_key)
        if not original_url:
            raise HTTPException(status_code=500, detail="Failed to generate presigned URL")

        # Initialize state in LangGraph
        config = {"configurable": {"thread_id": thread_id}}
        initial_state = {"original_image_url": original_url, "original_image_key": uploaded_key, "user_preferences": {}}

        # Update state directly (just save it)
        app.state.graph.update_state(config, initial_state)

        return {"thread_id": thread_id, "original_url": original_url}

    except Exception as e:
        print(f"Error in /init-session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/generate")
async def generate_room(
    file: Optional[UploadFile] = File(None),
    style: str = Form(...),
    mood: str = Form(...),
    functionality: str = Form(...),
    palette: str = Form(...),
    clutter: str = Form(...),
    additional_prompt: str = Form(""),
    thread_id: Optional[str] = Form(None),
):
    try:
        # Use provided thread_id or generate new
        final_thread_id = thread_id or str(uuid.uuid4())
        config = {"configurable": {"thread_id": final_thread_id}}

        original_url = None
        original_key = None
        # Check for existing state if no file provided
        current_state = app.state.graph.get_state(config).values
        if current_state:
            original_url = current_state.get("original_image_url")
            original_key = current_state.get("original_image_key")

        # If file provided, upload and update (override)
        file_bytes = None
        if file:
            file_bytes = await file.read()
            # Generate a unique key for the S3 object
            object_key = f"{uuid.uuid4()}-{file.filename}"

            # Upload the file to S3
            uploaded_key = upload_file(file_bytes, object_key)
            if not uploaded_key:
                raise HTTPException(status_code=500, detail="Failed to upload image to S3")

            # Generate presigned URL for the newly uploaded image
            original_url = create_presigned_url(uploaded_key)
            original_key = uploaded_key

        if not original_url:
            raise HTTPException(status_code=400, detail="No image provided or found in session.")

        # Fallback: If we have URL but no Key (legacy session), try to extract key
        if original_url and not original_key:
            try:
                # URL format expected: https://<bucket>.s3.<region>.amazonaws.com/<key>?...
                # or https://s3.<region>.amazonaws.com/<bucket>/<key>?...
                from urllib.parse import urlparse

                path = urlparse(original_url).path
                # Remove leading slash
                if path.startswith("/"):
                    path = path[1:]
                # If path contains bucket name (second format), we might need logic,
                # but usually boto3 generates virtual-hosted style by default.
                # Let's assume the key is the path.

                # Check if it looks like a valid key (uuid-filename)
                # Just use it as best guess
                original_key = path
                print(f"Fallback: Extracted key from URL: {original_key}")
            except Exception as e:
                print(f"Failed to extract key from URL: {e}")

        # Prepare Inputs
        # Prepare Inputs
        initial_state = {
            "original_image_url": original_url,
            "original_image_key": original_key,
            "original_filename": file.filename if file else "restored_image.jpg",
            "style": style,
            "mood": mood,
            "functionality": functionality,
            "palette": palette,
            "clutter": clutter,
            "additional_prompt": additional_prompt,
            "items": [],  # Initialize empty items list if needed by TypedDict, though Optional would be better
        }

        if file_bytes:
            initial_state["original_image_bytes"] = file_bytes

        print(f"Invoking LangGraph with thread_id: {final_thread_id} ...")

        # Use invoke (sync)
        # Since this is a FastAPI async route, blocking calls will block the event loop.
        # Ideally we run this in a threadpool, but for now strict sync invocation is consistent with existing code.
        result = app.state.graph.invoke(initial_state, config=config)
        print("LangGraph finished.")

        return {"original_url": original_url, "generated_url": result["generated_image_url"], "items": result["items"], "thread_id": final_thread_id}

    except Exception as e:
        print(f"Error in /generate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{thread_id}")
async def get_session(thread_id: str):
    try:
        config = {"configurable": {"thread_id": thread_id}}
        snapshot = app.state.graph.get_state(config)

        if not snapshot.values:
            raise HTTPException(status_code=404, detail="Session not found")

        values = snapshot.values
        return {
            "original_url": values.get("original_image_url"),
            "generated_url": values.get("generated_image_url"),
            "items": values.get("items", []),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
