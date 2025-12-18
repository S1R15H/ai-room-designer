# AI Room Designer

A full-stack application that uses Generative AI to redesign rooms based on user uploaded photos and text prompts. It orchestrates a sophisticed workflow using **LangGraph**, **AWS Bedrock**, and **MongoDB**.

![AI Room Designer Screenshot](https://via.placeholder.com/800x400?text=AI+Room+Designer+Demo)

## Features
- **AI Agent Workflow**: Uses [LangGraph](https://langchain-ai.github.io/langgraph/) to orchestrate prompt enhancement and item selection.
- **Intelligent Item Selection**: Agents use **Claude 3.5 Haiku** to suggest real-world furniture items with prices and links.
- **High-Fidelity Generation**: Uses **Stable Diffusion 3.5 Large** via AWS Bedrock for realistic image-to-image redesigns.
- **State Persistence**: Sessions are saved in MongoDB, allowing you to resume your design later.
- **Drag-and-Drop Upload**: Easy interface to upload room photos.
- **Real-time Preview**: Side-by-side "Before & After" comparison.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- **MongoDB** (running locally on port 27017 or remote URI)
- **AWS Account** with access to:
    - `stability.sd3-5-large-v1:0` (Stable Diffusion 3.5 Large)
    - `us.anthropic.claude-3-5-haiku-20241022-v1:0` (Claude 3.5 Haiku)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with your credentials:
```ini
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
BEDROCK_REGION=us-east-1
MONGODB_URI=mongodb://localhost:27017
```

Run the server:
```bash
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to start designing!

## Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Project Roadmap](docs/ROADMAP.md)

