# Architecture Overview

The **AI Room Designer** is a full-stack web application that allows users to upload a photo of a room and redesign it using Generative AI. It employs a sophisticated AI pipeline using **LangGraph** to orchestrate prompt engineering, item selection, and image generation.

## High-Level Architecture

The system consists of three main sub-systems:

1.  **Frontend (Next.js)**: A responsive, multi-step wizard interface for user interaction and state management.
2.  **Backend (FastAPI)**: A REST API that orchestrates the AI workflow.
3.  **Data & AI Layer**:
    *   **LangGraph**: Manages the stateful AI workflows (Agents).
    *   **MongoDB**: Persists the conversation/workflow state (Checkpoints).
    *   **AWS Bedrock**: Provides the AI models (Claude 3.5 Sonnet/Haiku for logic, Stable Diffusion XL for images).
    *   **AWS S3**: Stores original and generated images.

### Data Flow

1.  **Session Initialization**:
    *   User uploads an image via the Frontend.
    *   `POST /init-session` uploads the image to **S3** and initializes a **LangGraph** state with a unique `thread_id`.
    *   State is saved to **MongoDB**.

2.  **User Preferences**:
    *   User steps through the Wizard (Style, Mood, Functionality, Palette, Clutter).
    *   Frontend aggregates answers.

3.  **Generation Request**:
    *   Frontend calls `POST /generate` with form data and `thread_id`.
    *   Backend resumes the LangGraph workflow using the `thread_id`.

4.  **AI Workflow (LangGraph)**:
    *   **Node 1: Build Prompt**: Combines user inputs into a detailed descriptive prompt using sophisticated mapping logic.
    *   **Node 2: Select Items (Agentic)**: Queries **Claude 3.5 Haiku** to suggest real-world furniture/decor items that match the design, searching for prices and standardizing names.
    *   **Node 3: Generate Image**:
        *   Constructs a final "Enhanced Prompt" including the selected items and structural integrity constraints.
        *   Invokes **Stable Diffusion XL** (via Bedrock) with the *original image* (Image-to-Image) and the *enhanced prompt*.
    *   Resulting image is uploaded to S3.

5.  **Result Display**:
    *   Backend returns the generated image URL and the list of suggested items with Amazon search links.
    *   Frontend displays the "Before" vs "After" slider and the shopping list.

## File Responsibilities

### Backend (`/backend`)
Built with **FastAPI**, **LangGraph**, and **Python**.

- **`main.py`**: Entry point. Handles HTTP routes (`/init-session`, `/generate`, `/session/{id}`), CORS, and MongoDB connection lifecycle.
- **`graph.py`**: Defines the LangGraph workflow, State schema, and the logic for each node (`build_prompt`, `select_items`, `generate_image`).
- **`services/aws_s3.py`**: Wrapper for boto3 S3 operations (upload, presigned URLs).
- **`services/aws_bedrock.py`**: Wrapper for boto3 Bedrock runtime (invoking models).
- **`.env`**: Configuration for AWS credentials, MongoDB URI, and Model IDs.

### Frontend (`/frontend`)
Built with **Next.js 14+** (App Router), **TypeScript**, and **Tailwind CSS**.

- **`app/page.tsx`**: Main landing page, hosting the `Wizard`.
- **`components/Wizard.tsx`**: The core state machine of the frontend. Manages the multi-step form, calls the API, and handles session resumption logic (via LocalStorage and URL params).
- **`components/Upload.tsx`**: Drag-and-drop file upload zone.
- **`components/StepQuestion.tsx`**: Reusable component for rendering wizard questions with visual feedback.
- **`components/ResultViewer.tsx`**: Displays the final image comparison and suggested items list.
- **`lib/api.ts`**: Typed API client for communicating with the backend.

## Infrastructure
- **MongoDB**: Used for storing LangGraph "Checkpoints" (application state), allowing users to refresh the page or return later without losing their progress. Configured with a 1-day TTL (Time To Live) to auto-cleanup old sessions.
- **AWS S3**: Bucket stores all user uploads and generated results.
- **AWS Bedrock**:
    - `anthropic.claude-3-5-haiku` (or similar): For JSON generation of items.
    - `stability.stable-diffusion-xl`: For high-quality interior redesigns.

