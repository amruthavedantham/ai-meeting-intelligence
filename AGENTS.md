# AI Meeting Intelligence — Agent Instructions

## 1. Project Identity

You are working on **AI Meeting Intelligence**, a modular meeting-recording and post-meeting analysis MVP.

The authoritative architecture is defined by the locked Phase 1, Phase 2, and Phase 3 specifications in `docs/`.

These specifications are the source of truth for implementation.

### Locked constraints

- MVP development budget: approximately 14 hours
- Maximum meeting duration: 45 minutes
- Primary browsers: Chrome / Edge
- Repository: single repository
- Package manager: npm
- Frontend: React + Vite + TypeScript
- Application API: Node.js + TypeScript
- Orchestration: n8n running in Docker
- Speech-to-text: Deepgram
- Meeting analysis: Gemini
- Temporary job storage: filesystem
- Job/result TTL: 1 hour

Do not redesign these choices during normal implementation.

---

# 2. Core Architectural Principle

The system follows:

> **Capture once → normalize once → analyze once → communicate through stable contracts.**

The browser must not know the AI provider.

The AI provider must not know the UI.

The UI must not know n8n's internal workflow.

n8n must not know how the browser captured the audio.

Provider-specific response formats must never become application-level contracts.

---

# 3. System Architecture

The locked runtime topology is:

```text
React + Vite + TypeScript
        │
        │ HTTP
        ▼
Node.js + TypeScript Application API
        │
        │ internal HTTP
        ▼
n8n Docker
        │
        ├── Deepgram
        │
        └── Gemini
```

Temporary job storage is owned by the Application API/job-storage layer.

The application is intentionally a **modular monolith**, not a collection of microservices.

Do not introduce microservices merely to create architectural separation.

Use clear module boundaries and contracts instead.

---

# 4. Locked Runtime Responsibilities

## Frontend

The frontend owns:

- recording controls
- microphone permission
- meeting/tab audio permission
- Web Audio API routing
- MediaRecorder
- upload UI
- processing status UI
- polling
- transcript display
- results display
- local owner editing

The frontend must NOT:

- call Deepgram directly
- call Gemini directly
- contain provider credentials
- know n8n node structure
- parse provider-specific responses

---

## Application API

The Node.js/TypeScript API owns:

- receiving audio
- validating incoming requests
- creating job IDs
- temporary job storage
- job state
- triggering n8n
- exposing job status/results
- application-level error mapping
- TTL safety cleanup

The API must NOT own:

- browser audio capture
- transcription logic
- LLM analysis logic
- result presentation

---

## n8n

n8n owns orchestration:

- processing workflow
- provider calls
- transformations
- validation stages
- status transitions
- cleanup orchestration

n8n must NOT become the public browser API.

The browser must never depend directly on:

- n8n webhook URLs
- n8n execution IDs
- n8n node names
- n8n-specific response structures

The public API remains:

```text
POST /meetings
GET /meetings/:jobId
```

---

# 5. Canonical Contracts

Canonical contracts are one of the most important architectural boundaries.

Provider-specific data must be normalized before entering the rest of the system.

At minimum, preserve these concepts:

```typescript
Speaker
TranscriptSegment
Transcript
ActionItem
MeetingData
MeetingResult
Job
JobStatus
ProcessingError
```

The canonical contracts must remain provider-independent.

Example:

```text
Deepgram response
       ↓
Deepgram adapter
       ↓
Transcript contract
       ↓
Gemini
```

Never:

```text
Deepgram JSON
       ↓
Gemini
```

Likewise:

```text
Gemini response
       ↓
Gemini adapter
       ↓
MeetingData contract
       ↓
Application API
       ↓
React
```

---

# 6. Provider Adapter Rule

External providers must remain behind adapters/interfaces.

Conceptually:

```typescript
interface TranscriptProvider {
  transcribe(audio: AudioInput): Promise<TranscriptResult>;
}
```

and:

```typescript
interface MeetingAnalyzer {
  analyze(
    transcript: Transcript,
    speakers: Speaker[]
  ): Promise<MeetingData>;
}
```

The application must depend on these abstractions rather than provider-specific SDK behavior.

Changing Deepgram should not require changing React.

Changing Gemini should not require changing the transcript UI.

---

# 7. Public API

The MVP intentionally exposes only:

```http
POST /meetings
GET /meetings/:jobId
```

Do not create additional public REST endpoints unless explicitly approved.

`POST /meetings`:

- accepts multipart audio
- validates the request
- creates a job
- stores temporary audio
- triggers n8n
- returns `202 Accepted`
- returns `job_id` and initial status

Example:

```json
{
  "job_id": "job_abc123",
  "status": "queued"
}
```

`GET /meetings/:jobId`:

- returns application-level job state
- returns canonical result when completed
- returns canonical error when failed
- returns `404` for an unknown job

---

# 8. Job State

Canonical backend states:

```text
queued
processing
transcribing
analyzing
completed
failed
```

Normal flow:

```text
queued
  ↓
processing
  ↓
transcribing
  ↓
analyzing
  ↓
completed
```

Any processing stage may transition to:

```text
failed
```

Do not invent additional states without approval.

---

# 9. Temporary Storage

MVP uses filesystem-backed temporary storage.

No database is required.

Do NOT introduce:

- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Redis
- Kafka
- RabbitMQ
- SQS
- BullMQ
- Celery
- persistent object storage

unless explicitly approved.

Conceptually:

```text
/tmp/ai-meeting-intelligence/
    jobs/
        <job_id>/
            audio.webm
            job.json
            result.json
```

The exact storage location may be configured through:

```text
JOB_STORAGE_DIR
```

Temporary meeting data must expire after approximately one hour.

---

# 10. Browser Audio Architecture

The preferred capture path is:

```text
getUserMedia()
       +
getDisplayMedia()
       ↓
Web Audio API
       ↓
Stereo MediaStream
       ├── Left  = microphone
       └── Right = meeting/tab audio
       ↓
MediaRecorder
       ↓
audio.webm
```

Primary target:

```text
Chrome / Edge
```

Do not claim universal system-audio capture.

Browser/platform support must be tested in reality.

React should not directly manage low-level:

- MediaStream
- AudioContext
- MediaStreamAudioSourceNode
- MediaStreamAudioDestinationNode
- MediaRecorder lifecycle

These belong in the audio module.

---

# 11. Audio Module Boundary

Primary location:

```text
frontend/src/audio/
```

Primary module:

```text
frontend/src/audio/recorder.ts
```

Conceptual interface:

```typescript
interface AudioRecorder {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  isRecording(): boolean;
}
```

Internal implementation details should remain inside the audio module.

---

# 12. Frontend API Boundary

All frontend network calls must be centralized in:

```text
frontend/src/api/meetingApi.ts
```

The React components should not independently construct API URLs or issue provider requests.

Conceptually:

```typescript
createMeeting(audio: Blob)
getMeetingStatus(jobId: string)
```

The frontend should consume application-level contracts only.

---

# 13. Frontend State

Frontend state is intentionally simpler than backend state:

```text
IDLE
  ↓
RECORDING
  ↓
UPLOADING
  ↓
PROCESSING
  ↓
RESULTS
```

Failure may occur during upload or processing:

```text
ERROR
```

Backend statuses are mapped to human-readable UI states/messages.

---

# 14. Polling

Use HTTP polling for MVP.

The frontend should poll:

```http
GET /meetings/:jobId
```

approximately every 2–3 seconds.

Polling stops when the job reaches:

```text
completed
```

or:

```text
failed
```

Do not introduce WebSockets or SSE for MVP.

---

# 15. Transcript Contract

Canonical transcript segments:

```typescript
interface TranscriptSegment {
  speaker_id: string;
  start: number;
  end: number;
  text: string;
}
```

Timestamps are numeric seconds.

Do not store presentation strings such as:

```text
[00:12]
```

in backend contracts.

The UI converts numeric timestamps to display format.

---

# 16. Speaker Identity

MVP does not identify real-world speaker names.

Use stable internal IDs:

```text
speaker_1
speaker_2
speaker_3
```

Display labels may be:

```text
Speaker 1
Speaker 2
Speaker 3
```

Action-item ownership references must use:

```text
speaker_id
```

not display labels.

If ownership cannot be reliably determined:

```text
owner = null
```

Never guess.

The UI may display `Unassigned`, but the canonical value remains `null`.

---

# 17. Meeting Data Contract

The canonical analysis result is:

```typescript
interface MeetingData {
  summary: string;
  decisions: string[];
  action_items: ActionItem[];
}

interface ActionItem {
  task: string;
  owner: string | null;
  deadline: string | null;
  priority: "low" | "medium" | "high";
}
```

Only these priority values are valid:

```text
low
medium
high
```

AI output must be validated before being exposed to the frontend.

---

# 18. AI Output Rule

Structured AI output is mandatory.

Prompt instructions alone are insufficient.

Gemini output must be schema-constrained and validated.

At minimum validate:

```text
summary exists
decisions is array
action_items is array
task exists
owner is string or null
deadline is string or null
priority is valid
```

Invalid output must become an application-level failure.

Never render unchecked AI output.

---

# 19. Error Handling

Use application-level errors.

Canonical shape:

```typescript
interface ProcessingError {
  code: string;
  message: string;
}
```

Useful MVP codes include:

```text
AUDIO_CAPTURE_FAILED
AUDIO_UPLOAD_FAILED
INVALID_AUDIO
AUDIO_TOO_LONG
AUDIO_PROCESSING_FAILED
TRANSCRIPTION_FAILED
ANALYSIS_FAILED
INVALID_ANALYSIS_RESULT
PROCESSING_TIMEOUT
PROCESSING_FAILED
JOB_NOT_FOUND
```

Do not create dozens of unnecessary error codes.

Provider errors must be translated into application-level errors.

Never expose:

- provider API keys
- stack traces
- raw provider error bodies
- internal URLs
- internal credentials
- unnecessary provider implementation details

to the user.

---

# 20. Owner Editing

Owner editing is a frontend operation.

When the user changes an action-item owner:

```text
MeetingData
   ↓
React state
   ↓
User edits owner
   ↓
React state updated
```

Do NOT re-run:

- Gemini
- n8n
- Deepgram

just because an owner was edited.

---

# 21. Cleanup

There are exactly two n8n workflows for MVP:

```text
Process Meeting
Cleanup
```

The Process Meeting workflow conceptually performs:

```text
Receive Job
 ↓
Validate Job
 ↓
status = processing
 ↓
Validate Audio
 ↓
status = transcribing
 ↓
Deepgram
 ↓
Normalize Transcript
 ↓
Validate Transcript
 ↓
status = analyzing
 ↓
Gemini
 ↓
Validate MeetingData
 ↓
Store Result
 ↓
status = completed
 ↓
Trigger Cleanup
```

Cleanup must be idempotent.

Deleting an already-missing temporary file should not itself cause cleanup failure.

The Application API should have a TTL safety mechanism so temporary jobs cannot remain indefinitely.

---

# 22. Security

Provider credentials are server-side only.

Examples:

```text
DEEPGRAM_API_KEY
GEMINI_API_KEY
```

Never expose provider credentials through frontend source or `VITE_*` variables.

Frontend `VITE_*` configuration may contain only non-sensitive configuration such as:

```text
VITE_API_URL
```

Never commit `.env`.

Commit `.env.example` with placeholders only.

---

# 23. Development Infrastructure

n8n runs through Docker.

Expected local topology:

```text
Browser
   ↓
React
   ↓
Node API
   ↓
n8n Docker
   ↓
Deepgram / Gemini
```

The repository should document how to:

- start n8n
- stop n8n
- configure credentials
- import workflows
- run the frontend
- run the API

---

# 24. Repository Structure

Use the agreed structure:

```text
ai-meeting-intelligence/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── audio/
│   │   ├── api/
│   │   ├── contracts/
│   │   └── styles/
│   └── ...
│
├── api/
│   ├── src/
│   │   ├── routes/
│   │   ├── jobs/
│   │   ├── n8n/
│   │   ├── validation/
│   │   ├── errors/
│   │   └── index.ts
│   └── ...
│
├── n8n/
│   ├── workflows/
│   │   ├── process-meeting.json
│   │   └── cleanup.json
│   └── README.md
│
├── docs/
│   ├── phase-1.md
│   ├── phase-2-architecture.md
│   ├── phase-3-architecture.md
│   └── contracts.md
│
├── .env.example
├── .gitignore
└── README.md
```

Do not add architectural layers simply for the sake of abstraction.

In particular, do not automatically introduce:

```text
controllers/
repositories/
use-cases/
domain/
infrastructure/
factories/
dependency-injection/
services/
```

unless actual implementation complexity demonstrates a need.

---

# 25. Python / Execution Rule

This project is primarily a TypeScript application.

Do NOT reinterpret this project as a Python `directives/ → execution/` automation system.

Do not create Python execution scripts for normal application functionality.

Use:

```text
TypeScript
React
Node.js
n8n
```

for the actual product architecture.

Python may only be used for an explicitly approved supporting task that is genuinely better suited to Python.

---

# 26. Documentation Rule

The locked Phase 1–3 specifications must not be silently modified.

Documentation is updated only when a verified implementation fact is discovered.

Examples of valid documentation updates:

- provider API constraint discovered during testing
- browser-specific recording limitation
- verified timing behavior
- reproducible failure mode
- configuration requirement
- implementation decision explicitly approved by the project owner

Do not rewrite architecture merely because an implementation is inconvenient.

---

# 27. Self-Annealing Rule

When something breaks:

```text
1. Read the error carefully.
2. Identify the smallest failing boundary.
3. Diagnose the actual cause.
4. Fix the relevant component.
5. Run the relevant test again.
6. Verify the fix.
7. Document a verified new constraint if one was discovered.
8. Continue.
```

Do not use failure as a reason to redesign unrelated parts of the system.

Do not silently change canonical contracts.

Do not silently add infrastructure.

Do not silently switch providers.

---

# 28. Architectural Change Protocol

If the current architecture genuinely cannot satisfy a requirement:

STOP.

Do not redesign it automatically.

Report:

1. What problem was encountered.
2. Why the current architecture cannot solve it.
3. What change is proposed.
4. Which contracts/components would be affected.
5. Why the change is justified.
6. What alternatives were considered.

Wait for explicit approval before making a material architectural change.

---

# 29. Change Boundary Rule

When implementing a task, modify only the relevant component and directly related tests unless another change is demonstrably required.

For example:

### Audio task

Normally modify:

```text
frontend/src/audio/
Recorder components
audio tests
```

Do not casually modify:

```text
Gemini
Deepgram
MeetingData
n8n architecture
```

### Transcription task

Normally modify:

```text
TranscriptProvider
Deepgram adapter
normalization
transcription tests
```

Do not casually modify:

```text
React recording
MeetingData
owner editing
```

---

# 30. Implementation Workflow

Build incrementally.

Use:

```text
Understand
   ↓
Plan
   ↓
Implement
   ↓
Run
   ↓
Test
   ↓
Inspect
   ↓
Explain
   ↓
Commit
   ↓
Next milestone
```

Do NOT generate the entire MVP in one pass.

Each milestone should leave the repository in a working or intentionally testable state.

---

# 31. Learning Rule

For every significant component, be able to explain:

```text
What was built?
Why is it here?
What contract does it expose?
What can fail?
How is it tested?
How can it be replaced?
```

The goal is not merely to generate code.

The implementation should remain understandable to the project owner.

---

# 32. Testing Strategy

Test after every meaningful milestone.

At minimum verify:

### Foundation

```text
npm install
npm run dev
npm run build
```

### Audio

- permissions
- recording start
- recording stop
- Blob creation
- stereo output
- stream cleanup

### API

- POST /meetings
- GET /meetings/:jobId
- unknown job
- failed job
- completed job

### Contracts

- valid structures
- invalid structures
- enum validation
- nullable ownership

### Providers

First use short 30–60 second audio.

Verify:

```text
audio
 ↓
Deepgram
 ↓
canonical transcript
 ↓
Gemini
 ↓
canonical MeetingData
```

Only after the short pipeline works should full-length meetings be tested.

---

# 33. MVP Implementation Order

Follow this order unless a verified dependency requires otherwise:

1. Repository foundation
2. React/Vite/TypeScript
3. Canonical contracts
4. Application API foundation
5. Filesystem job store
6. Browser audio recorder
7. Recording UI
8. Audio upload
9. POST /meetings
10. GET /meetings/:jobId
11. n8n Process Meeting workflow
12. Deepgram integration
13. Transcript normalization
14. Gemini integration
15. MeetingData validation
16. Processing status UI
17. Results UI
18. Owner editing
19. Cleanup workflow
20. Failure handling
21. Full end-to-end testing

Polish only if time remains.

---

# 34. First Vertical Slice

Prioritize proving the complete technical path with a short audio file:

```text
30-second audio
 ↓
POST /meetings
 ↓
job_id
 ↓
n8n
 ↓
Deepgram
 ↓
Transcript Contract
 ↓
Gemini
 ↓
MeetingData Contract
 ↓
completed job
 ↓
GET /meetings/:jobId
 ↓
React
 ↓
display summary
```

Once this works, expand toward the full 45-minute MVP.

---

# 35. Scope Protection

The MVP does NOT include:

- live transcription
- live AI analysis
- persistent meeting archive
- authentication
- multi-user collaboration
- databases
- Redis
- queues
- WebSockets
- SSE
- multiple STT providers
- multiple LLM providers
- advanced analytics
- deployment infrastructure beyond what is required to run the MVP

Do not build these unless explicitly requested.

---

# 36. Time Protection

The MVP has a constrained implementation budget.

If time becomes limited, cut in approximately this order:

```text
1. Visual polish
2. Non-essential editing
3. Advanced testing
4. Deployment polish
5. Optional abstractions
```

Do NOT cut the core flow:

```text
record
upload
transcribe
speaker differentiation
analyze
results
processing status
owner editing
cleanup
```

---

# 37. Decision-Making Rule

When multiple implementation approaches are possible:

Prefer the approach that is:

1. simplest
2. explicit
3. testable
4. modular
5. replaceable
6. consistent with the locked architecture
7. appropriate for a 14-hour MVP

Do not optimize for theoretical future scale.

Do not add complexity merely because it is considered "best practice" in a large production system.

---

# 38. Final Authority

The following priority order applies:

```text
Explicit user decision
        ↓
Locked Phase 1–3 specification
        ↓
Project documentation
        ↓
This AGENTS.md
        ↓
Normal implementation preference
```

If an instruction conflicts with a locked architectural decision, stop and surface the conflict.

Never silently choose a different architecture.

---

# 39. Final Principle

Build a small system that works end-to-end.

Preserve clean boundaries.

Use stable contracts.

Keep provider details isolated.

Test real browser audio early.

Avoid unnecessary infrastructure.

Do not over-engineer.

Do not silently redesign.

The objective is:

> **A working, understandable, modular MVP whose major components can be replaced independently later.**