# n8n Orchestration Environment

This directory contains the local Docker setup and workflow definitions for **AI Meeting Intelligence**.

---

## 1. Local Runtime Topology

n8n runs as a local Docker container orchestrating the two-stage meeting intelligence pipeline:

```text
Node Application API (Host)
        │
        │ HTTP Trigger (webhook/process-meeting)
        │ Shared Filesystem (/data/jobs)
        ▼
n8n Container (Docker)
        ├── 1. Read /data/jobs/<job_id>/audio.webm
        ├── 2. Deepgram STT (Multichannel + Diarization + Timestamps)
        ├── 3. Normalize to Transcript Contract
        ├── 4. Gemini Flash Analysis (JSON Schema)
        ├── 5. Validate MeetingData Contract
        ├── 6. Write /data/jobs/<job_id>/result.json
        └── 7. Trigger Cleanup
```

---

## 2. Shared Storage Mapping

The Application API on the host and the n8n container share access to the job storage directory via a Docker volume mount:

| Environment | Path | Description |
| :--- | :--- | :--- |
| **Host System (Node API)** | `./data/jobs` (or `$JOB_STORAGE_DIR`) | Created by Node API; stores `audio.webm`, `job.json`, `result.json` |
| **Docker Container (n8n)** | `/data/jobs` | Mounted in `docker-compose.yml` for direct filesystem read/write |

---

## 3. Starting & Stopping n8n

### Start n8n
```bash
cd n8n
docker compose up -d
```

### Stop n8n
```bash
cd n8n
docker compose down
```

### Check Logs
```bash
docker compose logs -f n8n
```

Access the n8n UI at: **http://localhost:5678**

---

## 4. Credentials Configuration

In the n8n UI (`Credentials` section), create the following credentials:
1. **Deepgram API**:
   - Header Auth: `Authorization` = `Token <DEEPGRAM_API_KEY>`
2. **Google Gemini API**:
   - Query Parameter / Header Auth with `<GEMINI_API_KEY>`

---

## 5. Workflows

The `workflows/` directory contains the workflow definitions:
- `process-meeting.json`: The core end-to-end processing pipeline.
- `cleanup.json`: Idempotent cleanup of temporary audio and artifacts.
