# Architecture Overview

The **AI Room Designer** is a full-stack web application that allows users to upload a photo of a room and redesign it using Generative AI.

## High-Level Architecture

The system consists of two main components:

1.  **Frontend (Next.js)**: A responsive web interface for user interaction.
2.  **Backend (FastAPI)**: A REST API that handles business logic and communicates with AWS services.

### Data Flow

1.  **User Upload**: The user selects an image and enters a prompt on the Frontend.
2.  **API Request**: The Frontend sends a `POST /generate` request to the Backend with the image and prompt.
3.  **Storage (Input)**: The Backend uploads the original image to **AWS S3**.
4.  **AI Processing**: The Backend invokes **AWS Bedrock (Stable Diffusion XL)** with the image and prompt.
5.  **Storage (Output)**: The generated image returned by Bedrock is uploaded to **AWS S3**.
6.  **Response**: The Backend returns the URLs of both the original and generated images to the Frontend.
7.  **Display**: The Frontend displays the images side-by-side for comparison.

## File Responsibilities

### Root Directory
- `README.md`: Project entry point and setup guide.
- `.gitignore`: Specifies files to be ignored by Git.

### Backend (`/backend`)
Built with **FastAPI** and **Python**.

- **`main.py`**: The entry point of the API. Configures CORS and defines the `/generate` endpoint.
- **`services/aws_s3.py`**: Handles interactions with AWS S3 (uploading files).
- **`services/aws_bedrock.py`**: Handles interactions with AWS Bedrock (invoking the AI model).
- **`utils/image_helpers.py`**: Contains utility functions for image processing (currently a placeholder).
- **`.env`**: Stores sensitive environment variables (AWS credentials). **DO NOT COMMIT**.
- **`requirements.txt`**: Lists Python dependencies.

### Frontend (`/frontend`)
Built with **Next.js** (React framework) and **TypeScript**.

- **`app/page.tsx`**: The main page component. Manages application state (loading, results, errors).
- **`app/layout.tsx`**: Defines the global HTML structure and metadata.
- **`components/UploadForm.tsx`**: A reusable component for file upload and prompt input. Handles drag-and-drop.
- **`components/ResultViewer.tsx`**: A reusable component to display the "Before" and "After" images.
- **`lib/api.ts`**: Contains helper functions for making API calls to the backend.
- **`next.config.mjs`**: Configures the Next.js server, including the proxy to redirect `/api` requests to the backend (solving CORS issues during development).
