# Project Work Breakdown Structure (WBS)

This WBS outlines the tasks required to master AI Agentic Flows, Modern GenAI requirements, Terraform, and CI/CD.
**Optimized Order**: This roadmap is structured to prioritize "DevOps Foundation" first. By setting up linting, testing, and infrastructure early, we ensure a stable environment for building complex AI features.

## 1.0 Project Setup & CI Foundation (GitHub Actions)
Focus: Establishing a robust development environment to catch errors early.

*   **1.1 Quality Assurance (The "Safety Net")**
    *   [x] **Linting & Formatting**: Configure `ruff` (Python) and `eslint/prettier` (TypeScript) to run locally.
    *   [x] **Pre-commit Hooks**: Prevent bad code from being committed using `pre-commit`.
    *   [x] **Unit Testing Framework**: Set up `pytest` (Backend) and `jest` (Frontend).
*   **1.2 Continuous Integration (CI) Pipeline**
    *   [x] **Automated Testing**: Create a GitHub Action to run tests/linting on every Pull Request.
    *   [x] **Security Scanning**: Add `trufflehog` (secrets) and `bandit` (vulnerabilities) to the CI pipeline.

## 2.0 Advanced Agentic Workflow (LangGraph & Bedrock)
Focus: Moving beyond linear chains to complex, stateful, and iterative agent behaviors.

*   **2.1 State Management & Persistence**
    *   [ ] Implement a database (MongoDB) to persist `LangGraph` state (checkpoints).
    *   [ ] Allow users to resume a design session from a previous state.
*   **2.2 Human-in-the-Loop (HITL)**
    *   [ ] Add a "Critique" node where the user can provide feedback on the generated image.
    *   [ ] Implement a feedback loop: `Generation -> User Critique -> Refinement -> Generation`.
    *   [ ] Allow users to manually edit the "Selected Items" list before generation.
*   **2.3 Multi-Agent Collaboration**
    *   [ ] **Researcher Agent**: Searches the web for current interior design trends (using a search tool).
    *   [ ] **Critic Agent**: Critiques the generated prompt against design principles before image generation.
    *   [ ] **Manager Agent**: Orchestrates the workflow and decides when the design is "finished".

## 3.0 Modern GenAI Requirements (RAG & Multimodal)
Focus: Enhancing the AI's context and capabilities using external data and multiple modalities.

*   **3.1 RAG (Retrieval-Augmented Generation) for Design Knowledge**
    *   [ ] **Knowledge Base**: Create a vector database (e.g., Pinecone, pgvector) with interior design guidelines, color theory, and furniture catalogs.
    *   [ ] **Retrieval Node**: Query the knowledge base to enrich the prompt with expert design advice based on the user's style choice.
*   **3.2 Multimodal Inputs**
    *   [ ] **Image Analysis**: Use a Vision Model (Claude 3.5 Sonnet / GPT-4o) to analyze the *uploaded* room image before generation.
    *   [ ] Extract existing furniture layout, lighting conditions, and architectural style to inform the generation prompt better.
*   **3.3 Structured Output**
    *   [ ] Enforce strict JSON schemas for all LLM outputs using Pydantic models.

## 4.0 Containerization & Infrastructure (Terraform)
Focus: Provisioning and managing AWS infrastructure professionally.

*   **4.1 Containerization**
    *   [ ] Create optimized `Dockerfile` for Backend (Python) and Frontend (Next.js).
    *   [ ] Test containers locally with `docker-compose`.
*   **4.2 Infrastructure as Code (Terraform)**
    *   [ ] **Setup**: Configure Terraform with remote state (S3 + DynamoDB).
    *   [ ] **Core Infra**: VPC, Subnets, Security Groups, ECR Repositories.
    *   [ ] **IAM**: Least-privilege roles for Bedrock, S3, and Lambda.
    *   [ ] **App Infra**: Provision AWS App Runner (or Lambda) and S3 buckets.

## 5.0 Continuous Delivery (CD)
Focus: Automating the deployment of the application.

*   **5.1 Build & Push**
    *   [ ] Create GitHub Action to build Docker images and push to AWS ECR on merge to `main`.
*   **5.2 Infrastructure Deployment**
    *   [ ] Automate `terraform apply` in the pipeline (with manual approval gate).
*   **5.3 Application Deployment**
    *   [ ] Update the running AWS services with the new Docker image tags.

## 6.0 Observability & Monitoring
Focus: Understanding how the system behaves in production.

*   **6.1 Structured Logging**
    *   [ ] Implement JSON logging for the backend.
*   **6.2 Tracing**
    *   [ ] Integrate AWS X-Ray to trace requests through the API -> LangGraph -> Bedrock.
*   **6.3 Metrics & Alarms**
    *   [ ] Set up CloudWatch Alarms for API errors and high latency.
