# Technical Review & Recommendations

This document outlines suggested improvements to align with industry best practices and enhance the user experience.

## 1. Backend Architecture & Performance

### 🔴 Critical: Blocking I/O in Async Endpoints
**Issue:** The `/generate` endpoint in `main.py` is defined as `async def`, but it calls `app.state.graph.invoke()`, which executes synchronous blocking code (Bedrock API calls via `boto3`).
**Impact:** This blocks the Python event loop. During a 10-second image generation, the entire API becomes unresponsive to other requests (health checks, session inits).
**Recommendation:**
1.  **Quick Fix:** Remove `async` from the `generate_room` function definition. FastAPI automatically runs synchronous path operations in a threadpool, preventing blocking.
2.  **Ideal Fix:** Refactor the LangGraph nodes to be asynchronous (`async def`) and use `aiobotocore` or run blocking boto3 calls in a threadpool executor. Then use `await app.state.graph.ainvoke()`.

### 🟠 Environment Configuration
**Issue:** Using `os.getenv` throughout the code makes it hard to validate configuration at startup.
**Recommendation:** Use **Pydantic Settings**. Define a `Settings` class that validates all required vars (AWS keys, Mongo URI) on application startup.

### 🟡 Structured Logging
**Issue:** The application uses `print()` statements. In production, these are hard to parse.
**Recommendation:** Implement **JSON Logging** (using `structlog` or `python-json-logger`). This allows log aggregators (Datadog, CloudWatch) to parse fields like `thread_id`, `status`, and `error` automatically.

---

## 2. Frontend Architecture (React/Next.js)

### 🟠 State Management
**Issue:** `Wizard.tsx` uses multiple independent `useState` hooks (`answers`, `currentStep`, `file`, `result`). This makes invalid states possible (e.g., having a result but being on step 1).
**Recommendation:** Use **`useReducer`** or a state machine (XState).
- Define explicit actions: `NEXT_STEP`, `SET_ANSWER`, `GENERATION_START`, `GENERATION_SUCCESS`.
- This ensures transitions are deterministic and centralized.

### 🟡 Component Composition
**Issue:** `Wizard.tsx` is becoming a "God Component" (500+ lines).
**Recommendation:** Extract logic into custom hooks:
- `useWizardNavigation()`: Handles steps and validation.
- `useDesignSession()`: Handles API calls, local storage persistence, and data fetching.

### 🟢 Type Safety
**Issue:** The API client manually constructs FormData.
**Recommendation:** Use a library like `zod` to share validation schemas between backend and frontend.

---

## 3. Security & Infrastructure

### 🔴 S3 Presigned URLs
**Recommendation:** Ensure the S3 bucket has a **Lifecycle Policy** to expire objects after 24h (to match MongoDB TTL). Currently, generated images accumulate indefinitely.
**Recommendation:** Presigned URLs should have short expiries (e.g., 15 minutes) rather than default, forcing the frontend to refresh the session if needed.

### 🟠 CORS
**Recommendation:** Strictly limit `allow_origins` to the production domain in the deployed environment, rather than allowing localhost patterns.

---

## 4. User Experience & Feature Suggestions

### 🚀 Interactive Refining (Inpainting)
**Idea:** Allow users to click on a specific part of the generated image (e.g., "The floor") and type "Change to dark wood".
**Tech Stack:** Use a segmentation model (Segment Anything Model - SAM) to create a mask, then use Stable Diffusion Inpainting.

### 🚀 Social & History
**Idea:** "My Designs" gallery.
**Tech Stack:** Requires User Authentication (Auth0/Clerk). Store metadata in MongoDB with `user_id`.

### 🚀 Progressive Loading
**Idea:** Instead of a generic spinner, show real-time progress.
**Tech Stack:** Use **Server-Sent Events (SSE)** or separate the generation into finer steps in LangGraph and stream the events back to the client. User sees: "Analyzing room..." -> "Selecting furniture..." -> "Generating image...".

### 🚀 Smart Shopping
**Idea:** The current item selection is text-based.
**Tech Stack:** Use **Google Lens API** or similar visual search tools to find *visually similar* real products to the generated image, rather than just text matching.
