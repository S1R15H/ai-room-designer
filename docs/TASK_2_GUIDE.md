# Task 2 Guide: Advanced Agentic Workflow (LangGraph & Bedrock)

This guide tracks the progress and detailed implementation steps for Task 2 of the Roadmap.

## Sub-task 2.1: State Management & Persistence
**Goal**: Persist LangGraph state to a database (MongoDB) and allow users to resume sessions.

### Steps
1.  [x] **Setup MongoDB**:
    *   Created `docker-compose.yml` for MongoDB.
    *   Installed `pymongo` and `langgraph-checkpoint-mongodb`.
2.  [x] **Integrate Checkpointer**:
    *   Refactored `backend/graph.py` to accept a checkpointer.
    *   Used `MongoDBSaver` (sync) due to async package limitations.
3.  [x] **API Updates**:
    *   Updated `/generate` in `backend/main.py` to accept `thread_id`.
    *   Implemented `lifespan` to manage MongoDB connection.
    *   **Added `/session/{thread_id}` endpoint** to retrieve past session state.
4.  [x] **Verification**:
    *   Verified with unit tests for `/generate` (persistence) and `/session/{thread_id}`.
5.  [x] **Retention Policy**:
    *   Set 7-day TTL index on MongoDB checkpoints.
6.  [x] **Frontend Integration**:
    *   Store `thread_id` in LocalStorage.
    *   Reload session from `thread_id` on page load.

## Sub-task 2.2: Human-in-the-Loop (HITL)
**Goal**: Allow user feedback and manual intervention in the generation process.

### Steps
1.  [ ] **Add Critique Node**:
    *   Add a new node `critique_design` in the graph.
    *   This node should pause execution and wait for user input? Or is it a separate API call?
    *   *Approach*: Use `interrupt_before` or `interrupt_after` in LangGraph for the "human" node.
2.  [ ] **Frontend Feedback UI**:
    *   Show the generated image (or initial plan).
    *   Provide a text area for feedback.
    *   Provide "Approve" and "Regenerate" buttons.
3.  [ ] **Refinement Loop**:
    *   If user provides feedback, route back to `generate_image` (or a `refine_prompt` node first).
    *   If approved, finish.
4.  [ ] **Manual Item Editing**:
    *   Display the list of "Selected Items" from the LLM *before* generating the image.
    *   Allow user to add/remove/edit items.
    *   Button to "Confirm Items & Generate".

## Sub-task 2.3: Multi-Agent Collaboration
**Goal**: Split responsibilities into specialized agents.

### Steps
1.  [ ] **Researcher Agent**:
    *   Create a tool/node that searches for trends (using Tavily or similar, or just a mock for now if no API key).
2.  [ ] **Critic Agent**:
    *   LLM call that reviews the prompt/plan against specific rules (Color Theory, Spacing, etc.).
3.  [ ] **Manager Agent**:
    *   Orchestrator node (can be the main graph logic) that decides flow.

---
**Progress Log**
- [Date] Started Task 2.
- [Date] Completed Task 2.1 (Backend). Implemented MongoDB persistence (sync). Added `/session/{thread_id}` endpoint.
