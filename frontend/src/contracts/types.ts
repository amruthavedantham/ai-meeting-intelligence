/**
 * Canonical Contracts for AI Meeting Intelligence
 *
 * Authoritative shared contract definitions.
 * This file must remain identical to api/src/contracts/types.ts.
 */

export interface Speaker {
  /** Stable internal identifier, e.g. "speaker_1" */
  speaker_id: string;
  /** Presentation label, e.g. "Speaker 1" */
  label: string;
}

export interface TranscriptSegment {
  /** References Speaker.speaker_id */
  speaker_id: string;
  /** Numeric seconds */
  start: number;
  /** Numeric seconds */
  end: number;
  /** Spoken content */
  text: string;
}

export interface Transcript {
  segments: TranscriptSegment[];
}

export type Priority = "low" | "medium" | "high";

export interface ActionItem {
  task: string;
  owner: string | null;     // speaker_id or null if unknown
  deadline: string | null;  // Normalized YYYY-MM-DD or null
  priority: Priority;
}

export interface MeetingData {
  summary: string;
  decisions: string[];
  action_items: ActionItem[];
}

export interface MeetingResult {
  speakers: Speaker[];
  transcript: TranscriptSegment[];
  meeting: MeetingData;
}

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

export interface CreateMeetingResponse {
  job_id: string;
  status: "queued";
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  result?: MeetingResult;
  error?: ProcessingError;
}
