# Canonical Contracts Specification

This document defines the canonical data contracts for **AI Meeting Intelligence**.

Every component in the application communicates through these stable, provider-independent contracts. Provider-specific schemas (Deepgram, Gemini, etc.) must be translated into these contracts via adapters before entering the rest of the application.

---

## 1. Speaker Contract

Identifies speakers in the meeting independently of real-world names.

```typescript
export interface Speaker {
  /** Stable internal identifier, e.g. "speaker_1", "speaker_2" */
  speaker_id: string;
  /** Presentation label, e.g. "Speaker 1", "Speaker 2" */
  label: string;
}
```

---

## 2. Transcript Contract

Represents normalized transcript segments with numeric seconds timestamps and internal speaker IDs.

```typescript
export interface TranscriptSegment {
  /** References Speaker.speaker_id */
  speaker_id: string;
  /** Start time in numeric seconds */
  start: number;
  /** End time in numeric seconds */
  end: number;
  /** Spoken text content */
  text: string;
}

export interface Transcript {
  segments: TranscriptSegment[];
}
```

*Note: Timestamps are stored in numeric seconds. Human-readable formatting (e.g. `[00:15]`) is performed by the UI only.*

---

## 3. Meeting Data Contract

Represents the structured intelligence extracted from the meeting transcript.

```typescript
export type Priority = "low" | "medium" | "high";

export interface ActionItem {
  /** Specific task description */
  task: string;
  /** Speaker ID of the responsible party, or null if unknown. Never fabricate. */
  owner: string | null;
  /** ISO date string (YYYY-MM-DD) if determinable, or null */
  deadline: string | null;
  /** Action priority: "low" | "medium" | "high" */
  priority: Priority;
}

export interface MeetingData {
  summary: string;
  decisions: string[];
  action_items: ActionItem[];
}
```

*Rules:*
- If an owner cannot be reliably determined from the conversation, `owner` MUST be `null`.
- If a deadline cannot be reliably determined, `deadline` MUST be `null`.
- `priority` must strictly be one of `"low"`, `"medium"`, or `"high"`.
- `decisions` is an array of strings.

---

## 4. Meeting Result Contract

The complete canonical payload returned when a meeting job finishes successfully.

```typescript
export interface MeetingResult {
  speakers: Speaker[];
  transcript: TranscriptSegment[];
  meeting: MeetingData;
}
```

---

## 5. Job & Lifecycle Contract

Defines the asynchronous processing states and job metadata.

```typescript
export type JobStatus =
  | "queued"
  | "processing"
  | "transcribing"
  | "analyzing"
  | "completed"
  | "failed";

export interface ProcessingError {
  code: string;
  message: string;
}

export interface Job {
  job_id: string;
  status: JobStatus;
  result?: MeetingResult;
  error?: ProcessingError;
}
```

### Standard Error Codes:
- `AUDIO_CAPTURE_FAILED`
- `AUDIO_UPLOAD_FAILED`
- `INVALID_AUDIO`
- `AUDIO_TOO_LONG`
- `AUDIO_PROCESSING_FAILED`
- `TRANSCRIPTION_FAILED`
- `ANALYSIS_FAILED`
- `INVALID_ANALYSIS_RESULT`
- `PROCESSING_TIMEOUT`
- `PROCESSING_FAILED`
- `JOB_NOT_FOUND`
