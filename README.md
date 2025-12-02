# AI Room Designer

A full-stack application that uses Generative AI to redesign rooms based on user uploaded photos and text prompts.

![AI Room Designer Screenshot](https://via.placeholder.com/800x400?text=AI+Room+Designer+Demo)

## Features
- **Drag-and-Drop Upload**: Easy interface to upload room photos.
- **AI Generation**: Uses AWS Bedrock (Stable Diffusion XL) to reimagine interiors.
- **Real-time Preview**: Side-by-side comparison of original and generated designs.

## Quick Start

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- AWS Account with Bedrock access

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
S3_BUCKET_NAME=your_bucket
BEDROCK_MODEL_ID=stability.stable-diffusion-xl-v1
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
