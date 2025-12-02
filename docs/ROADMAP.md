# Project Roadmap

This document outlines the development plan for the AI Room Designer, from initial testing to final deployment.

## Phase 1: Testing & Validation (Current Status)
- [x] **Basic Functionality**: Verify image upload and generation flow.
- [ ] **Unit Tests**:
    - Backend: Test API endpoints with mocked AWS services.
    - Frontend: Test component rendering and user interactions.
- [ ] **Integration Tests**: End-to-end testing of the full flow.
- [ ] **Error Handling**: Improve error messages for failed uploads or AI timeouts.

## Phase 2: Improvements & Polish
- [ ] **Image Resizing**: Implement `backend/utils/image_helpers.py` to resize large images before sending to Bedrock (optimizes cost and latency).
- [ ] **Loading States**: Add a progress bar or skeleton loader during generation.
- [ ] **Input Validation**: Restrict file types (JPG, PNG) and sizes on both frontend and backend.
- [ ] **Prompt Engineering**: Experiment with system prompts to improve design quality (e.g., automatically appending "high quality, photorealistic").

## Phase 3: New Features
- [ ] **User Accounts**: Allow users to save their generated designs.
- [ ] **History View**: A gallery of past designs.
- [ ] **Social Sharing**: Buttons to share results on social media.
- [ ] **Style Presets**: Dropdown menu for common styles (Modern, Minimalist, Cyberpunk, etc.) instead of just free text.
- [ ] **Masking/Inpainting**: Allow users to select specific areas of the room to redesign.

## Phase 4: Deployment
- [ ] **Containerization**: Create `Dockerfile` for backend and frontend.
- [ ] **Backend Deployment**: Deploy FastAPI to AWS Lambda (using Mangum) or AWS App Runner.
- [ ] **Frontend Deployment**: Deploy Next.js to Vercel or AWS Amplify.
- [ ] **CI/CD**: Set up GitHub Actions for automated testing and deployment.
- [ ] **Domain & SSL**: Configure a custom domain and HTTPS.
