# AI Meeting Intelligence

> A modular, browser-based meeting assistant and post-meeting analysis application designed for individual professionals.

---

## 1. Architectural Overview

AI Meeting Intelligence captures two-way meeting conversations (user mic + meeting audio) in Chrome and Edge, or processes uploaded meeting audio ($\le 45$ minutes). The audio is transcribed with speaker diarization via Deepgram, analyzed by Gemini Flash using structured JSON schemas, and rendered into an editable interface with summary, decisions, and action items.

The core architecture follows the modular monolith pattern:

```text
React + Vite + TypeScript (Frontend)
       │
       │ HTTP (POST /meetings, GET /meetings/:jobId)
       ▼
Node.js + TypeScript (Application API)
       │
       │ Shared Filesystem / Storage Mount (JOB_STORAGE_DIR)
       │ Internal HTTP Webhook Trigger
       ▼
n8n (Docker Orchestrator)
       ├── Deepgram (STT + Diarization + Timestamps)
       │      ↓
       │   Transcript Contract
       └── Gemini Flash (Structured JSON Schema Analysis)
              ↓
           Meeting Data Contract
```

### Core Invariants & Boundaries
- **Capture once $\to$ Normalize once $\to$ Analyze once $\to$ Communicate through stable contracts.**
- The browser never communicates directly with Deepgram, Gemini, or n8n.
- The browser interacts strictly with the Node.js Application API via two endpoints:
  - `POST /meetings`: Submits audio, creates job, returns `202 Accepted` with `job_id`.
  - `GET /meetings/:jobId`: Returns current job status (`queued`, `processing`, `transcribing`, `analyzing`, `completed`, `failed`) or completed result.
- Action-item owner editing is performed client-side in React state and never re-triggers the AI pipeline.
- All temporary meeting audio and job artifacts expire within 1 hour via an idempotent cleanup process.

---

## 2. Repository Structure

```text
ai-meeting-intelligence/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── README.md                 # Project documentation
├── AGENTS.md                 # Agent operating rules & instructions
├── docs/                     # Locked architecture & requirements specifications
│   ├── phase-1-2.md          # Requirements, technology selection & data contracts
│   ├── phase-3-architecture.md # Implementation architecture specification
│   └── contracts.md          # Canonical contracts definition
├── frontend/                 # React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/       # Presentation components (Recorder, Status, Results, Transcript)
│   │   ├── audio/            # Browser Web Audio API & MediaRecorder encapsulation
│   │   ├── api/              # Application API client (meetingApi.ts)
│   │   ├── contracts/        # Canonical TypeScript contracts
│   │   ├── styles/           # Vanilla CSS styles
│   │   ├── App.tsx           # Main application state machine
│   │   └── main.tsx          # React application entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── api/                      # Node.js + TypeScript Application API
│   ├── src/
│   │   ├── routes/           # Public HTTP endpoints (meetings.ts)
│   │   ├── jobs/             # Filesystem-backed job store (jobStore.ts)
│   │   ├── n8n/              # n8n webhook dispatcher (n8nClient.ts)
│   │   ├── validation/       # Audio request validation (audioValidation.ts)
│   │   ├── errors/           # Canonical errors and mappings (errors.ts)
│   │   ├── contracts/        # Canonical TypeScript contracts (identical to frontend)
│   │   └── index.ts          # Express server setup & CORS configuration
│   ├── package.json
│   └── tsconfig.json
└── n8n/                      # n8n workflow configurations & local Docker setup
    ├── docker-compose.yml    # Docker Compose for local n8n runtime
    ├── README.md             # n8n setup and credential instructions
    └── workflows/
        ├── process-meeting.json # Process Meeting orchestration workflow
        └── cleanup.json      # Temporary job cleanup workflow
```

---

## 3. Prerequisites

- **Node.js**: LTS (v20+ or v22+)
- **npm**: v10+
- **Docker & Docker Compose**: For running the local n8n orchestration instance

---

## 4. Setup & Running Locally

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `JOB_STORAGE_DIR` is set to an accessible directory (default: `./data/jobs`).

### Step 2: Install & Build Application API
```bash
cd api
npm install
npm run build
npm run dev
```

### Step 3: Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Step 4: Run n8n Orchestrator (Docker)
```bash
cd n8n
docker compose up -d
```
Access n8n at `http://localhost:5678`, configure Deepgram and Gemini API credentials, and activate the workflows.

---

## 5. Canonical Contracts

See [`docs/contracts.md`](docs/contracts.md) for full contract definitions:
- `Speaker`
- `TranscriptSegment` / `Transcript`
- `ActionItem` / `MeetingData`
- `MeetingResult`
- `Job` / `JobStatus` / `ProcessingError`
