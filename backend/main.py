from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from services.aws_s3 import upload_file
from graph import app_graph
import json

load_dotenv()

app = FastAPI()

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

@app.post("/generate")
async def generate_room(
    file: UploadFile = File(...),
    style: str = Form(...),
    mood: str = Form(...),
    functionality: str = Form(...),
    palette: str = Form(...),
    clutter: str = Form(...),
    additional_prompt: str = Form(None)
):
    try:
        # Read file content
        file_content = await file.read()
        
        # 1. Upload original image to S3 (we still do this for the record)
        original_filename = f"original_{file.filename}"
        original_key = upload_file(file_content, original_filename)
        
        if not original_key:
             raise HTTPException(status_code=500, detail="Failed to upload original image to S3")

        # Generate presigned URL for original image
        from services.aws_s3 import create_presigned_url
        original_url = create_presigned_url(original_key)

        # 2. Invoke LangGraph
        initial_state = {
            "original_image_bytes": file_content,
            "original_filename": file.filename,
            "style": style,
            "mood": mood,
            "functionality": functionality,
            "palette": palette,
            "clutter": clutter,
            "additional_prompt": additional_prompt or ""
        }
        
        print("Invoking LangGraph...")
        result = app_graph.invoke(initial_state)
        print("LangGraph finished.")
        
        return {
            "original_url": original_url,
            "generated_url": result["generated_image_url"],
            "items": result["items"]
        }

    except Exception as e:
        print(f"Error in /generate: {e}")
        raise HTTPException(status_code=500, detail=str(e))
