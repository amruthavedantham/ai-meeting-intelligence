# AI Meeting Intelligence
## Phase 3 — Implementation Architecture Specification

**Status:** LOCKED FOR IMPLEMENTATION  
**Phase:** 3 — Implementation Architecture  
**Previous phases:** Phase 1 + Phase 2 LOCKED  
**MVP Development Budget:** 14 hours  
**Maximum Meeting Duration:** 45 minutes  
**Primary Browser:** Chrome / Edge  
**Repository:** Single repository  
**Package Manager:** npm  

---

# 1. Purpose

This document is the implementation-level architectural specification for AI Meeting Intelligence.

It converts the decisions made in Phase 1 and Phase 2 into concrete implementation boundaries.

The implementation must follow this document.

The coding assistant must not redesign the architecture while implementing individual components.

If an implementation problem genuinely requires an architectural change, stop and explain:

1. What problem was encountered.
2. Why the current architecture cannot solve it.
3. What change is proposed.
4. What existing contracts/components would be affected.
5. Why the change is justified.

No architectural change should be made silently.

---

# 2. Core Architectural Principle

The entire application follows:

> Capture once → normalize once → analyze once → communicate through stable contracts.

The browser does not know the AI provider.

The AI provider does not know the UI.

The UI does not know n8n's internal workflow.

n8n does not know how the browser captured the audio.

Provider-specific response formats never become application-level contracts.

---

# 3. Final System Topology

The MVP consists of four runtime areas:

```text
┌─────────────────────────────────────────────┐
│                  BROWSER                    │
│                                             │
│  React + Vite + TypeScript                  │
│                                             │
│  ┌────────────┐    ┌────────────────────┐  │
│  │ Recorder   │    │ Upload             │  │
│  └─────┬──────┘    └─────────┬──────────┘  │
│        └────────────┬─────────┘             │
└─────────────────────┼───────────────────────┘
                      │
                      │ HTTP
                      ▼
┌─────────────────────────────────────────────┐
│              APPLICATION API                │
│                                             │
│  Node.js + TypeScript                       │
│                                             │
│  POST /meetings                             │
│  GET  /meetings/:jobId                      │
│                                             │
│  Temporary Job Store                        │
│  /tmp/...                                   │
└─────────────────────┬───────────────────────┘
                      │
                      │ internal HTTP
                      ▼
┌─────────────────────────────────────────────┐
│                     n8n                     │
│                  Docker                     │
│                                             │
│  Process Meeting Workflow                  │
│  Cleanup Workflow                           │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
       ┌────────────────┐ ┌────────────────┐
       │    Deepgram    │ │     Gemini     │
       │                │ │                │
       │ STT + diarize  │ │ Meeting        │
       │ + timestamps   │ │ analysis       │
       └────────────────┘ └────────────────┘
```

---

# 4. Architectural Layers

The system is divided into:

```text
1. Presentation
2. Application API
3. Orchestration
4. Provider Adapters
5. Canonical Contracts
6. Temporary Job Storage
```

These are logical boundaries inside one small application.

They are NOT separate microservices.

---

# 5. Runtime Components

## 5.1 Frontend

Technology:

```text
React
Vite
TypeScript
Simple CSS
```

Responsibilities:

- recording controls
- microphone permission
- meeting/tab audio permission
- audio routing
- MediaRecorder
- upload
- processing-state presentation
- polling
- results rendering
- owner editing

The frontend must not:

- call Deepgram directly
- call Gemini directly
- contain provider credentials
- know n8n node structure
- parse provider-specific responses

---

# 6. Audio Capture Architecture

The preferred browser capture flow is:

```text
getUserMedia()
       │
       │ microphone
       ▼
Microphone Stream

getDisplayMedia()
       │
       │ meeting/tab audio
       ▼
Meeting Audio Stream

Both
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

The MVP targets Chrome and Edge.

The application must not claim universal system-audio capture.

The actual availability of meeting/tab audio depends on browser/platform support.

---

# 7. Audio Module Boundary

React must not directly manage:

- MediaStream
- AudioContext
- MediaStreamAudioSourceNode
- MediaStreamAudioDestinationNode
- MediaRecorder lifecycle

These belong inside:

```text
frontend/src/audio/
```

Primary module:

```text
frontend/src/audio/recorder.ts
```

Expected conceptual interface:

```typescript
interface AudioRecorder {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  isRecording(): boolean;
}
```

The implementation may internally contain additional helpers.

Those helpers must remain internal to the audio module.

---

# 8. Audio Contract

The processing layer receives one audio artifact.

Canonical concept:

```typescript
interface AudioInput {
  file: Blob;
  mimeType: string;
  channels: 2;
}
```

Transport representation:

```text
multipart/form-data
```

Field:

```text
audio
```

Example:

```text
audio=<audio.webm>
```

The processing layer must not care whether this file came from:

- browser recording
- uploaded audio

Both must enter the same pipeline.

---

# 9. Audio Validation

Validation occurs before expensive provider processing.

Required checks:

```text
File exists
↓
Supported audio type
↓
Reasonable file size
↓
Duration <= 45 minutes
↓
Usable audio
```

The frontend may perform early validation for user experience.

The API/processing layer must perform authoritative validation.

---

# 10. Application API

The application API is a small standalone Node.js + TypeScript process.

It is intentionally NOT a large backend.

Its purpose is to create a stable application-level boundary between React and n8n.

Runtime topology:

```text
React
  ↓
Application API
  ↓
n8n
```

The frontend must interact with the API through:

```text
frontend/src/api/meetingApi.ts
```

---

# 11. API Responsibilities

The Application API owns:

- receiving audio
- creating job IDs
- maintaining temporary job state
- storing temporary audio
- exposing job status
- exposing completed results
- triggering n8n
- enforcing the result TTL
- hiding n8n implementation details from the browser

The Application API does NOT own:

- transcription
- diarization
- LLM analysis
- browser audio capture
- result presentation

---

# 12. Public API Surface

The MVP has only two HTTP endpoints:

```http
POST /meetings
GET  /meetings/:jobId
```

Do not create additional REST endpoints unless explicitly approved.

---

# 13. POST /meetings

Purpose:

Create a meeting-processing job.

Request:

```http
POST /meetings
Content-Type: multipart/form-data
```

Form field:

```text
audio
```

Example:

```text
audio = audio.webm
```

The endpoint should:

1. validate that audio exists
2. validate basic file properties
3. create a unique job ID
4. create a temporary job directory
5. save the audio
6. create initial job state
7. trigger n8n processing
8. return the job ID

---

# 14. POST /meetings Response

Successful response:

```json
{
  "job_id": "job_abc123",
  "status": "queued"
}
```

HTTP status:

```text
202 Accepted
```

The API must not wait for the complete AI pipeline.

---

# 15. GET /meetings/:jobId

Purpose:

Retrieve the current application-level job state.

Example:

```http
GET /meetings/job_abc123
```

While processing:

```json
{
  "job_id": "job_abc123",
  "status": "transcribing"
}
```

The frontend polls this endpoint.

---

# 16. Completed GET Response

```json
{
  "job_id": "job_abc123",
  "status": "completed",
  "result": {
    "speakers": [],
    "transcript": [],
    "meeting": {
      "summary": "...",
      "decisions": [],
      "action_items": []
    }
  }
}
```

This is the canonical application result.

The frontend must not need to know whether Deepgram or another provider generated the result.

---

# 17. Failed GET Response

```json
{
  "job_id": "job_abc123",
  "status": "failed",
  "error": {
    "code": "TRANSCRIPTION_FAILED",
    "message": "We couldn't transcribe this meeting."
  }
}
```

The API exposes application-level errors, not raw provider errors.

---

# 18. Unknown Job

If:

```text
GET /meetings/does-not-exist
```

returns no known job, use:

```text
HTTP 404
```

with an application-level error.

Example:

```json
{
  "error": {
    "code": "JOB_NOT_FOUND",
    "message": "Meeting processing job was not found."
  }
}
```

`JOB_NOT_FOUND` is an API-level operational error and does not represent an AI processing failure.

---

# 19. Job Storage

The MVP uses a filesystem-backed temporary job store.

No database.

No Redis.

No persistent object storage.

Conceptually:

```text
/tmp/ai-meeting-intelligence/
    jobs/
        job_abc123/
            audio.webm
            job.json
            result.json
```

The exact base path may be configured through an environment variable.

Recommended:

```text
JOB_STORAGE_DIR
```

---

# 20. Job Directory Responsibilities

Each job directory contains temporary processing state.

Possible contents:

```text
audio.webm
job.json
result.json
```

Do not create unnecessary intermediate artifacts.

Do not permanently retain raw provider responses.

Do not store raw audio in Git.

---

# 21. Job State

Canonical states:

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

---

# 22. Job Contract

```typescript
type JobStatus =
  | "queued"
  | "processing"
  | "transcribing"
  | "analyzing"
  | "completed"
  | "failed";
```

Conceptually:

```typescript
interface Job {
  job_id: string;
  status: JobStatus;
  result?: MeetingResult;
  error?: ProcessingError;
}
```

Only the appropriate fields should be present for the current state.

For example:

```text
queued
→ no result

completed
→ result present

failed
→ error present
```

---

# 23. Job TTL

Completed results have a maximum lifetime of:

```text
1 hour
```

The temporary job workspace should therefore be deleted no later than one hour after job completion.

This applies to:

- audio
- job metadata
- result data

The system is not a permanent meeting archive.

---

# 24. Cleanup Responsibility

Cleanup is processing/orchestration responsibility.

The Application API may enforce TTL-based cleanup as a safety mechanism, but the primary application flow should trigger the separate n8n Cleanup workflow.

The architecture must ensure that cleanup does not remove a result before the frontend has had reasonable time to retrieve it.

---

# 25. n8n Boundary

n8n is the orchestration layer.

n8n is responsible for:

- processing workflow
- provider calls
- data transformation
- validation
- status transitions
- cleanup orchestration

n8n is NOT responsible for:

- React UI
- browser permissions
- MediaRecorder
- frontend state
- user editing

---

# 26. n8n Workflows

Exactly two workflows exist for the MVP:

```text
1. Process Meeting
2. Cleanup
```

Do not split the processing pipeline into multiple workflows unless implementation evidence requires it.

---

# 27. Process Meeting Workflow

Conceptual sequence:

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
Validate Transcript Contract
   ↓
status = analyzing
   ↓
Gemini
   ↓
Validate Meeting Data
   ↓
Store Result
   ↓
status = completed
   ↓
Trigger Cleanup
```

---

# 28. n8n Input

The processing workflow should receive an application-level job reference rather than forcing React to know anything about provider processing.

Conceptually:

```json
{
  "job_id": "job_abc123"
}
```

n8n can then resolve the job's temporary audio location through the Application API/job storage mechanism.

---

# 29. n8n Must Not Become the Public API

The browser must not depend on:

```text
n8n webhook URL
n8n node names
n8n execution IDs
n8n-specific response formats
```

The public application boundary remains:

```text
POST /meetings
GET /meetings/:jobId
```

If n8n is replaced later, the React application should not need to change.

---

# 30. Transcript Provider Boundary

Canonical interface:

```typescript
interface TranscriptProvider {
  transcribe(audio: AudioInput): Promise<TranscriptResult>;
}
```

Primary implementation:

```text
DeepgramTranscriptProvider
```

Potential future implementation:

```text
AssemblyAITranscriptProvider
```

The rest of the system depends on:

```text
TranscriptProvider
```

not:

```text
Deepgram
```

---

# 31. Deepgram Responsibilities

Deepgram is responsible for:

- speech-to-text
- multichannel transcription
- speaker diarization
- timestamps

Deepgram output must be normalized before entering the rest of the application.

---

# 32. Deepgram Adapter

Conceptually:

```text
Deepgram response
       ↓
Deepgram adapter
       ↓
Transcript Contract
+
Speaker Contract
```

The Deepgram response must never be passed directly to:

- React
- Gemini
- MeetingData
- application result consumers

---

# 33. Transcript Contract

Canonical structure:

```typescript
interface TranscriptSegment {
  speaker_id: string;
  start: number;
  end: number;
  text: string;
}
```

Transcript:

```typescript
interface Transcript {
  segments: TranscriptSegment[];
}
```

Example:

```json
{
  "segments": [
    {
      "speaker_id": "speaker_1",
      "start": 12.4,
      "end": 16.8,
      "text": "I'll finish the report by Friday."
    },
    {
      "speaker_id": "speaker_2",
      "start": 17.1,
      "end": 20.2,
      "text": "I'll review it once it's ready."
    }
  ]
}
```

---

# 34. Timestamp Rules

Backend canonical timestamps are numeric seconds.

Example:

```text
12.4
16.8
```

The backend must not store presentation formatting such as:

```text
[00:12]
```

The UI converts numeric timestamps into human-readable form.

---

# 35. Speaker Contract

Canonical:

```typescript
interface Speaker {
  speaker_id: string;
  label: string;
}
```

Example:

```json
{
  "speaker_id": "speaker_1",
  "label": "Speaker 1"
}
```

Internal identity:

```text
speaker_1
```

Display label:

```text
Speaker 1
```

---

# 36. Speaker Identity Rule

The MVP does not identify real-world names.

Therefore:

```text
speaker_1 → Speaker 1
speaker_2 → Speaker 2
speaker_3 → Speaker 3
```

Future:

```text
speaker_1 → Amrutha
```

must be possible without rewriting transcript segments.

---

# 37. Ownership Representation

Action-item ownership references:

```text
speaker_id
```

Example:

```json
{
  "task": "Finish the report",
  "owner": "speaker_1"
}
```

Not:

```json
{
  "owner": "Speaker 1"
}
```

This preserves stable identity.

---

# 38. Unknown Owner Rule

If ownership cannot be reliably determined:

```json
{
  "owner": null
}
```

Never guess.

Never substitute:

```text
Unknown
Unassigned
Speaker 1
```

inside the canonical data model.

The UI may display:

```text
Unassigned
```

while the underlying value remains:

```text
null
```

---

# 39. Meeting Analyzer Boundary

Canonical interface:

```typescript
interface MeetingAnalyzer {
  analyze(
    transcript: Transcript,
    speakers: Speaker[]
  ): Promise<MeetingData>;
}
```

Primary implementation:

```text
GeminiMeetingAnalyzer
```

Future implementation:

```text
OpenAIMeetingAnalyzer
```

The rest of the application depends on:

```text
MeetingAnalyzer
```

not:

```text
Gemini
```

---

# 40. Gemini Responsibilities

Gemini receives:

```text
Canonical Transcript
+
Speaker Contract
```

Gemini produces:

```text
Meeting Data
```

It extracts:

- summary
- decisions
- action items
- owners
- deadlines
- priorities

It must not invent missing information.

---

# 41. Meeting Data Contract

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

---

# 42. Meeting Result Contract

The application-level completed result combines:

```typescript
interface MeetingResult {
  speakers: Speaker[];
  transcript: TranscriptSegment[];
  meeting: MeetingData;
}
```

This is what the frontend ultimately consumes.

---

# 43. Canonical Completed Response

```json
{
  "job_id": "job_abc123",
  "status": "completed",
  "result": {
    "speakers": [
      {
        "speaker_id": "speaker_1",
        "label": "Speaker 1"
      },
      {
        "speaker_id": "speaker_2",
        "label": "Speaker 2"
      }
    ],
    "transcript": [
      {
        "speaker_id": "speaker_1",
        "start": 1.2,
        "end": 4.8,
        "text": "Let's target Friday for the report."
      }
    ],
    "meeting": {
      "summary": "The team discussed the report timeline.",
      "decisions": [
        "The report will target Friday."
      ],
      "action_items": [
        {
          "task": "Finish the report",
          "owner": "speaker_1",
          "deadline": "2026-09-11",
          "priority": "high"
        }
      ]
    }
  }
}
```

---

# 44. Decision Representation

The MVP uses:

```typescript
decisions: string[]
```

Example:

```json
{
  "decisions": [
    "Launch target is September 10.",
    "CRM changes were approved."
  ]
}
```

No confidence score is included.

---

# 45. Deadline Representation

Canonical deadline:

```text
string | null
```

Where a reliable concrete date can be determined, use a normalized date such as:

```text
2026-09-11
```

If the system cannot reliably determine a deadline:

```text
null
```

Do not invent dates.

The UI may display a human-readable date.

---

# 46. Priority Representation

Only:

```text
high
medium
low
```

are valid.

No arbitrary values such as:

```text
urgent
critical
important
normal
```

may enter the canonical MeetingData contract.

---

# 47. AI Output Validation

Gemini output must be validated before being considered successful.

Validation must check:

```text
summary exists
decisions is array
action_items is array
each action item has task
owner is string or null
deadline is string or null
priority is valid enum
```

Invalid output:

```text
INVALID_ANALYSIS_RESULT
```

The UI must never render unchecked AI output.

---

# 48. Structured AI Output

The analysis provider must use structured JSON/schema-constrained output.

Prompt instructions alone are not sufficient.

The schema should enforce:

```text
summary
decisions[]
action_items[]
    task
    owner nullable
    deadline nullable
    priority enum
```

---

# 49. Error Contract

Canonical structure:

```typescript
interface ProcessingError {
  code: string;
  message: string;
}
```

Failed job:

```typescript
interface FailedJob {
  job_id: string;
  status: "failed";
  error: ProcessingError;
}
```

---

# 50. Initial Error Codes

Use a small meaningful set:

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

Do not create dozens of specialized error codes.

---

# 51. Error Mapping

Provider errors must be translated.

Example:

```text
Deepgram HTTP 500
       ↓
TRANSCRIPTION_FAILED
       ↓
"We couldn't transcribe this meeting."
```

Do not expose:

```text
Deepgram error body
API URL
provider request ID
internal credentials
stack trace
```

to the user.

---

# 52. Frontend API Module

All frontend network operations must be centralized in:

```text
frontend/src/api/meetingApi.ts
```

Conceptual interface:

```typescript
createMeeting(audio: Blob): Promise<CreateMeetingResponse>

getMeetingStatus(
  jobId: string
): Promise<JobStatusResponse>
```

If a result is returned through the same GET operation, a separate `getMeetingResult()` function is optional internally, but the public HTTP surface remains:

```text
GET /meetings/:jobId
```

---

# 53. Frontend State Machine

The UI state is:

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

Error can occur from processing states:

```text
PROCESSING
    ↓
ERROR
```

Upload may also fail:

```text
UPLOADING
    ↓
ERROR
```

---

# 54. Backend Processing State vs UI State

These are intentionally different.

Backend:

```text
queued
processing
transcribing
analyzing
completed
failed
```

Frontend:

```text
idle
recording
uploading
processing
results
error
```

The UI maps backend processing statuses to human-readable messages.

---

# 55. Polling

The frontend polls:

```http
GET /meetings/:jobId
```

approximately every:

```text
2–3 seconds
```

Polling stops when:

```text
completed
```

or:

```text
failed
```

No:

```text
WebSockets
SSE
Redis pub/sub
```

are required.

---

# 56. Processing Status UI

The user should see meaningful progress.

Example:

```text
Meeting ended

✓ Uploading audio
✓ Detecting speakers
● Transcribing conversation
○ Analyzing meeting
○ Preparing results
```

The UI must never appear frozen while processing.

---

# 57. Browser Recording Sequence

```text
User clicks Start
       ↓
React
       ↓
audio/recorder.ts
       ↓
Request microphone permission
       ↓
Request meeting/tab audio
       ↓
Capture both streams
       ↓
Web Audio API
       ↓
Stereo stream
       ├── L microphone
       └── R meeting/tab audio
       ↓
MediaRecorder
       ↓
audio.webm
       ↓
User clicks End
       ↓
stopRecording()
       ↓
Blob
       ↓
POST /meetings
       ↓
job_id
```

---

# 58. Upload Sequence

```text
User selects audio
       ↓
React
       ↓
Validate file
       ↓
POST /meetings
       ↓
job_id
       ↓
Same processing pipeline
```

There must not be a second AI workflow for uploads.

---

# 59. Shared Pipeline

Both inputs converge here:

```text
Browser Recording ──┐
                    ├──→ Audio Input
Audio Upload ───────┘
                         ↓
                    Job Creation
                         ↓
                    n8n Processing
                         ↓
                      Deepgram
                         ↓
                  Transcript Contract
                         ↓
                       Gemini
                         ↓
                 Meeting Data Contract
                         ↓
                      React UI
```

---

# 60. Result Editing

AI output is not immutable.

The user remains the final authority.

Mandatory MVP editing:

```text
Action Item Owner
```

Example:

```text
Task: Finish report

Owner:
[ Speaker 2 ▼ ]

Deadline:
Friday

Priority:
High
```

The user can change:

```text
speaker_2
```

to:

```text
speaker_1
```

or:

```text
null
```

---

# 61. Editing Must Not Re-run AI

Changing the owner must remain a frontend operation.

Do not do:

```text
Owner changed
 ↓
n8n
 ↓
Gemini
```

Instead:

```text
AI result
 ↓
React state
 ↓
User edits
 ↓
React state updated
```

No additional AI call is necessary.

---

# 62. Temporary Audio Lifecycle

```text
Audio captured/uploaded
       ↓
Temporary job storage
       ↓
Processing
       ↓
Transcript generated
       ↓
Meeting analysis generated
       ↓
Result exposed
       ↓
Cleanup workflow
       ↓
Temporary files deleted
```

Original meeting audio is never intended to become persistent application data.

---

# 63. Cleanup Workflow

The second n8n workflow is:

```text
Cleanup
```

Conceptual input:

```json
{
  "job_id": "job_abc123"
}
```

Responsibilities:

1. locate temporary job workspace
2. delete audio
3. delete temporary processing artifacts
4. complete cleanup

Cleanup should be idempotent.

If the file is already absent, cleanup should not cause the overall application to fail.

---

# 64. TTL Cleanup

The system must enforce:

```text
1 hour maximum result lifetime
```

The implementation should ensure temporary job directories cannot remain indefinitely.

If n8n cleanup does not execute successfully, the Application API's TTL mechanism should eventually remove expired job directories.

---

# 65. Security

Provider credentials exist only server-side.

Examples:

```text
DEEPGRAM_API_KEY
GEMINI_API_KEY
```

Never expose them through:

```text
VITE_*
```

Do not put provider keys into frontend source code.

Do not log credentials.

Do not log raw meeting audio.

Avoid logging raw transcript content unless necessary for local debugging.

---

# 66. Environment Configuration

Repository contains:

```text
.env
.env.example
```

`.env`:

```text
never committed
```

`.env.example`:

```text
committed
contains placeholder values only
```

Likely configuration categories:

```text
API_PORT
N8N_BASE_URL
N8N_PROCESS_WEBHOOK
N8N_CLEANUP_WEBHOOK
JOB_STORAGE_DIR
JOB_TTL_SECONDS
DEEPGRAM_API_KEY
GEMINI_API_KEY
```

Frontend:

```text
VITE_API_URL
```

Only non-sensitive frontend configuration may use `VITE_*`.

---

# 67. Repository Structure

Final repository:

```text
ai-meeting-intelligence/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Recorder/
│   │   │   ├── ProcessingStatus/
│   │   │   ├── Results/
│   │   │   └── Transcript/
│   │   │
│   │   ├── audio/
│   │   │   └── recorder.ts
│   │   │
│   │   ├── api/
│   │   │   └── meetingApi.ts
│   │   │
│   │   ├── contracts/
│   │   │   └── types.ts
│   │   │
│   │   ├── App.tsx
│   │   └── styles/
│   │       └── global.css
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   └── meetings.ts
│   │   │
│   │   ├── jobs/
│   │   │   └── jobStore.ts
│   │   │
│   │   ├── n8n/
│   │   │   └── n8nClient.ts
│   │   │
│   │   ├── validation/
│   │   │   └── audioValidation.ts
│   │   │
│   │   ├── errors/
│   │   │   └── errors.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── n8n/
│   ├── workflows/
│   │   ├── process-meeting.json
│   │   └── cleanup.json
│   │
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

---

# 68. Important Structure Rule

Do not introduce:

```text
services/
controllers/
repositories/
use-cases/
domain/
infrastructure/
factories/
dependency-injection/
```

unless implementation complexity actually justifies them.

This is a 14-hour MVP.

The architecture is modular through boundaries and contracts, not through excessive directories.

---

# 69. API Internal Modules

The API should remain small.

Suggested responsibilities:

### `routes/meetings.ts`

HTTP concerns:

- parse request
- call job logic
- construct response

### `jobs/jobStore.ts`

Temporary filesystem state:

- create job
- read job
- update status
- save result
- delete job

### `n8n/n8nClient.ts`

Only responsible for:

- invoking n8n processing workflow
- invoking n8n cleanup workflow

### `validation/audioValidation.ts`

Audio-related request validation.

### `errors/errors.ts`

Application-level error definitions/mapping.

---

# 70. n8n Internal Modules

n8n is workflow-based rather than TypeScript-module-based.

The Process Meeting workflow should nevertheless maintain logical stages:

```text
Trigger
 ↓
Job validation
 ↓
Status update
 ↓
Audio retrieval
 ↓
Audio validation
 ↓
STT
 ↓
Transcript normalization
 ↓
Transcript validation
 ↓
Status update
 ↓
LLM analysis
 ↓
MeetingData validation
 ↓
Result storage
 ↓
Status update
 ↓
Cleanup trigger
```

Node names should clearly communicate their responsibility.

---

# 71. Provider-Specific Data Rule

Never let provider-specific data escape its adapter boundary.

Incorrect:

```text
Deepgram
 ↓
raw Deepgram JSON
 ↓
Gemini
```

Correct:

```text
Deepgram
 ↓
Deepgram Adapter
 ↓
Transcript Contract
 ↓
Gemini
```

Likewise:

```text
Gemini
 ↓
Gemini Adapter
 ↓
Meeting Data Contract
 ↓
Application API
 ↓
React
```

---

# 72. Dependency Direction

Allowed dependency direction:

```text
React
 ↓
meetingApi
 ↓
Application API
 ↓
n8n
 ↓
Provider adapters
 ↓
External providers
```

Canonical contracts are shared vocabulary.

No lower-level provider should depend on React.

No React component should import provider SDKs.

---

# 73. Component Replacement Rules

## Replace Deepgram

Allowed changes:

```text
STT provider implementation
provider configuration
provider adapter
provider tests
```

Should NOT require changes to:

```text
React
MeetingData
Results UI
Owner editing
```

---

# 74. Replace Gemini

Allowed:

```text
MeetingAnalyzer implementation
provider configuration
analysis adapter
analysis tests
```

Should NOT require:

```text
React redesign
Transcript redesign
Results redesign
```

---

# 75. Replace n8n

Future architecture:

```text
React
 ↓
Application API
 ↓
Custom worker
```

The frontend API should remain unchanged.

---

# 76. Replace Browser Audio Capture

Future input:

```text
Zoom recording
Teams recording
uploaded audio
browser recording
```

All must eventually produce:

```text
Audio Contract
```

The processing pipeline remains unchanged.

---

# 77. Add Persistent Storage Later

Future:

```text
Temporary Result
       ↓
Storage Adapter
       ↓
Database/Object Storage
```

The UI should not need to know the storage technology.

This is not part of MVP.

---

# 78. No Database

Do not introduce:

```text
PostgreSQL
MySQL
MongoDB
SQLite
Supabase
Firebase
```

for MVP job/result storage.

Filesystem is the selected temporary storage mechanism.

---

# 79. No Redis

Do not add Redis for:

- job state
- polling
- queues
- caching

The filesystem job store is sufficient for the MVP.

---

# 80. No Message Queue

Do not add:

```text
RabbitMQ
Kafka
SQS
BullMQ
Celery
```

n8n provides the required orchestration.

---

# 81. No WebSockets / SSE

Use HTTP polling.

This is deliberate.

The MVP does not require real-time streaming.

---

# 82. No Live Transcription

The MVP is:

```text
Record
 ↓
Stop
 ↓
Process
 ↓
Results
```

Not:

```text
Record
 ↓
Live transcript
 ↓
Live analysis
```

Live transcription is future scope.

---

# 83. API Sequence — Successful Meeting

```text
React
 │
 │ POST /meetings
 ▼
API
 │
 ├── save audio
 ├── create job
 ├── status=queued
 │
 └──────→ n8n
             │
             ├── processing
             ├── transcribing
             │
             ├── Deepgram
             │
             ├── normalize
             │
             ├── analyzing
             │
             ├── Gemini
             │
             ├── validate
             │
             ├── save result
             │
             └── completed
                    │
React ◄─────────────┘
 │
 │ GET /meetings/:id
 ▼
API
 │
 ▼
completed result
 │
 ▼
Results UI
 │
 ▼
Owner edited locally
```

---

# 84. API Sequence — Transcription Failure

```text
React
 ↓
POST /meetings
 ↓
API
 ↓
n8n
 ↓
Deepgram
 ↓
FAIL
 ↓
TRANSCRIPTION_FAILED
 ↓
job.status = failed
 ↓
React polling
 ↓
GET /meetings/:id
 ↓
failed
 ↓
Friendly error UI
 ↓
Cleanup
```

---

# 85. API Sequence — Analysis Failure

```text
Deepgram
 ↓
Transcript Contract
 ↓
Gemini
 ↓
FAIL
 ↓
ANALYSIS_FAILED
 ↓
job.status = failed
 ↓
Frontend displays error
 ↓
Cleanup
```

---

# 86. API Sequence — Invalid AI Output

```text
Gemini
 ↓
JSON
 ↓
Schema validation
 ↓
INVALID
 ↓
INVALID_ANALYSIS_RESULT
 ↓
job.status = failed
```

Never pass malformed data to React.

---

# 87. API Sequence — Unknown Owner

```text
Transcript
 ↓
Gemini
 ↓
Action item
 ↓
owner = null
 ↓
MeetingData validation
 ↓
React
 ↓
UI displays "Unassigned"
```

The canonical value remains:

```text
null
```

---

# 88. API Sequence — Owner Editing

```text
MeetingData
 ↓
React state
 ↓
User selects Speaker 2
 ↓
Action item owner updated
 ↓
React state
```

No:

```text
API request
n8n request
Gemini request
```

is necessary.

---

# 89. API Sequence — TTL

```text
Job completed
 ↓
Temporary workspace remains available
 ↓
Frontend retrieves result
 ↓
TTL reaches 1 hour
 ↓
Workspace deleted
 ↓
Result no longer available
```

This is intentional because MVP results are temporary.

---

# 90. CORS

The Application API must allow the local frontend origin during development.

Example development relationship:

```text
Frontend:
http://localhost:<frontend-port>

API:
http://localhost:<api-port>
```

The API should configure CORS explicitly rather than allowing arbitrary origins in a production-like configuration.

---

# 91. API Port

The exact port is an implementation detail.

It should be configurable:

```text
API_PORT
```

Do not hardcode assumptions throughout the frontend.

The frontend receives:

```text
VITE_API_URL
```

---

# 92. n8n Local Runtime

n8n runs through Docker.

Development topology:

```text
Browser
   ↓
React
   ↓
Node API
   ↓
Local n8n Docker
   ↓
Deepgram / Gemini
```

The repository should document:

- starting n8n
- stopping n8n
- accessing n8n
- configuring credentials
- importing workflows

---

# 93. Provider Credentials

n8n should hold provider credentials.

At minimum:

```text
Deepgram credential
Gemini credential
```

Do not embed credentials inside workflow JSON.

Workflow exports must be safe to commit.

---

# 94. Logging

Use simple structured development logs.

Examples:

```text
JOB_CREATED
JOB_PROCESSING
TRANSCRIPTION_STARTED
TRANSCRIPTION_COMPLETED
ANALYSIS_STARTED
ANALYSIS_COMPLETED
CLEANUP_COMPLETED
PROCESSING_FAILED
```

Logs may include:

```text
job_id
stage
timestamp
error code
```

Do not log:

```text
raw audio
API credentials
unnecessary full meeting content
```

---

# 95. Testing Strategy

Testing occurs after every meaningful milestone.

Loop:

```text
Implement
 ↓
Test
 ↓
Fix
 ↓
Verify
 ↓
Commit
 ↓
Next milestone
```

---

# 96. Contract Tests

Test:

```text
Speaker
TranscriptSegment
MeetingData
ActionItem
Job
ProcessingError
MeetingResult
```

Test valid and invalid structures.

---

# 97. API Tests

At minimum:

```text
POST /meetings
```

Verify:

- audio accepted
- job created
- job ID returned
- queued status returned

And:

```text
GET /meetings/:jobId
```

Verify:

- queued
- processing
- transcribing
- analyzing
- completed
- failed
- job not found

---

# 98. Audio Tests

Test:

```text
microphone permission
meeting/tab audio permission
recording start
recording stop
Blob creation
stereo output
stream cleanup
```

Do not attempt to automate every browser audio behavior.

Real browser testing is required.

---

# 99. Provider Tests

Start with:

```text
30–60 second audio
```

Verify:

```text
audio
 ↓
Deepgram
 ↓
canonical transcript
```

Then:

```text
canonical transcript
 ↓
Gemini
 ↓
canonical MeetingData
```

Only after the short flow works should full-length meetings be tested.

---

# 100. Full End-to-End Test

Final manual test:

```text
Open application
 ↓
Start Meeting
 ↓
Grant permissions
 ↓
Record
 ↓
Stop
 ↓
Upload/process
 ↓
Processing status
 ↓
Transcription
 ↓
Speaker differentiation
 ↓
Analysis
 ↓
Results
 ↓
Edit owner
 ↓
Cleanup
```

This is the most important acceptance test.

---

# 101. Implementation Order

Implementation must follow controlled vertical slices.

## Milestone 1

Repository + React/Vite/TypeScript.

## Milestone 2

Canonical contracts.

## Milestone 3

Application API foundation.

## Milestone 4

Filesystem job store.

## Milestone 5

Browser audio recorder.

## Milestone 6

Recording UI.

## Milestone 7

Audio upload.

## Milestone 8

`POST /meetings`.

## Milestone 9

`GET /meetings/:jobId`.

## Milestone 10

n8n Process Meeting workflow.

## Milestone 11

Deepgram integration.

## Milestone 12

Transcript normalization.

## Milestone 13

Gemini integration.

## Milestone 14

MeetingData validation.

## Milestone 15

Processing status UI.

## Milestone 16

Results UI.

## Milestone 17

Owner editing.

## Milestone 18

Cleanup workflow.

## Milestone 19

Failure handling.

## Milestone 20

End-to-end testing.

Polish only if time remains.

---

# 102. First Vertical Slice

Before building the entire system, prove:

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
Meeting Data Contract
 ↓
completed job
 ↓
GET /meetings/:id
 ↓
React
 ↓
Display summary
```

Once this works, the architecture is proven.

---

# 103. Time Protection

The 14-hour budget is hard.

If implementation runs late:

### Cut first

```text
Visual polish
Additional editing
Advanced tests
Fallback providers
Deployment polish
```

### Never cut

```text
Recording
Upload
Transcription
Speaker differentiation
Analysis
Results
Processing status
Owner editing
Cleanup
```

---

# 104. Architecture Change Rule

An architecture change is justified only when:

1. A locked requirement cannot otherwise be implemented.
2. A selected technology cannot reliably perform the required function.
3. The change significantly simplifies the implementation without weakening the architecture.
4. The change is required for stability or security.

Otherwise:

```text
Defer.
```

Do not expand scope because a technology has an interesting capability.

---

# 105. Codex / Antigravity Global Instruction

Every implementation task should be treated as operating inside this architecture.

The coding assistant must follow:

> Implement the requested functionality within the existing architecture and canonical contracts. Do not introduce new frameworks, databases, services, state-management libraries, queues, providers, or architectural layers unless explicitly approved.

---

# 106. Change Boundary Rule

When implementing a component, modify only the relevant component and its directly related tests.

Example:

### Audio task

Allowed:

```text
frontend/src/audio/
Recorder component
audio tests
```

Not allowed without justification:

```text
Gemini
Deepgram
MeetingData
Results UI
n8n architecture
```

### Transcription task

Allowed:

```text
TranscriptProvider
Deepgram adapter
normalization
transcription tests
```

Not allowed:

```text
React recording UI
MeetingData schema
owner editing
```

---

# 107. Learning Rule

For every significant component, explain before or immediately after implementation:

```text
What was built?
Why is it here?
What contract does it expose?
What can fail?
How is it tested?
How can it be replaced?
```

The implementation should remain understandable to the project owner.

The goal is not merely:

> AI generated the code.

The goal is:

> The architecture was designed intentionally, implemented incrementally, tested, and understood.

---

# 108. Definition of Done

The Phase 3 implementation is successful when a user can:

1. Open the application.
2. Start a browser meeting recording.
3. Grant microphone permission.
4. Grant meeting/tab audio permission where supported.
5. Produce a stereo recording.
6. Stop the meeting.
7. Upload/process the recording.
8. Alternatively upload an existing audio file.
9. Process an audio input <= 45 minutes.
10. See processing status.
11. Receive a speaker-labelled transcript.
12. See timestamps.
13. See a summary.
14. See decisions.
15. See action items.
16. See owner.
17. See deadline.
18. See priority.
19. See `null` ownership where ownership is unknown.
20. Edit an action-item owner.
21. Receive a useful error if processing fails.
22. Have temporary audio cleaned up.
23. Complete the entire flow using real audio.

---

# 109. Final Architecture

```text
                         AI MEETING INTELLIGENCE

┌──────────────────────────────────────────────────────────────┐
│                         PRESENTATION                         │
│                                                              │
│                 React + Vite + TypeScript                    │
│                                                              │
│  Recorder │ Upload │ Status │ Results │ Transcript │ Editing │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ HTTP
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                         APPLICATION API                      │
│                                                              │
│                    Node.js + TypeScript                      │
│                                                              │
│             POST /meetings                                   │
│             GET  /meetings/:jobId                            │
│                                                              │
│             Filesystem Job Store                             │
│             1-hour TTL                                       │
└────────────────────────────┬─────────────────────────────────┘
                             │
                             │ Internal API
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                          ORCHESTRATION                       │
│                                                              │
│                           n8n Docker                          │
│                                                              │
│                 ┌───────────────────────┐                    │
│                 │    Process Meeting    │                    │
│                 └───────────┬───────────┘                    │
│                             │                                │
│                 ┌───────────┴───────────┐                    │
│                 ▼                       ▼                    │
│          TranscriptProvider       MeetingAnalyzer             │
│                 │                       │                    │
│                 ▼                       ▼                    │
│             Deepgram                  Gemini                 │
│                 │                       │                    │
│                 ▼                       ▼                    │
│       Transcript Contract       Meeting Data Contract         │
│                                                              │
│                 ┌───────────────────────┐                    │
│                 │       Cleanup         │                    │
│                 └───────────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

---

# 110. The Architectural Guarantees

If this specification is followed:

### Change the audio capture mechanism

Does not require changing:

```text
Deepgram
Gemini
Results UI
```

### Change Deepgram

Does not require changing:

```text
React
MeetingData
Results UI
```

### Change Gemini

Does not require changing:

```text
Audio
Transcript
Results UI
```

### Replace n8n

Does not require changing:

```text
React API contract
```

### Add Zoom later

Can feed:

```text
Audio Contract
```

without creating another AI pipeline.

### Add persistence later

Can introduce:

```text
Storage Adapter
```

without changing the UI contract.

---

# 111. Final Rule

The implementation should always preserve these boundaries:

```text
Browser
   ↓
Application API
   ↓
n8n
   ↓
Provider Adapters
   ↓
Canonical Contracts
   ↓
Results
```

And never collapse them into:

```text
React
 ↓
Provider SDK
 ↓
Provider JSON
 ↓
UI
```

The architecture is intentionally small.

It is not a microservice architecture.

It is a **modular monolithic application with explicit API, orchestration, provider, and contract boundaries**.

That is the architecture to implement.