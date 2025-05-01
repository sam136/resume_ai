# ResumeAI

**ResumeAI** is a full-stack application that allows users to submit their resumes for AI-powered analysis and receive an ATS (Applicant Tracking System) score. Additionally, the platform recommends relevant job listings based on resume content and extracted skills.

## Features

- 🧠 AI-generated resume analysis
- 📊 ATS scoring
- 🔍 Job search based on resume relevance
- 🐳 Fully containerized (Docker + Docker Compose)
- 📁 Modular architecture: Node.js backend, React frontend, Python microservice

## Project Structure

```
resumeai/
├── backend/        # Node.js + Express API
├── frontend/       # React + TypeScript (Vite)
├── pyBackend/      # Python FastAPI service
├── compose.yml
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/sam136/resume_ai.git
   cd resume_ai
   ```

2. Ensure `.env` files are properly set in:
   - `backend/.env`
   - `frontend/.env`
   - `pyBackend/.env`

3. Start the application:

   ```bash
   docker-compose up --build
   ```

4. Access:
   - Frontend: `http://localhost:5173`
   - Node.js API: `http://localhost:5000`
   - Python API: `http://localhost:8000`

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **AI Service**: Python, FastAPI
- **Containerization**: Docker, Docker Compose

## License

This project is licensed under the MIT License.
