import { CreateMeetingResponse, JobStatusResponse } from "../contracts/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Creates a meeting processing job by submitting an audio Blob.
 */
export async function createMeeting(audio: Blob): Promise<CreateMeetingResponse> {
  const formData = new FormData();
  formData.append("audio", audio, "meeting.webm");

  const response = await fetch(`${API_BASE_URL}/meetings`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to create meeting: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Retrieves the current processing status and results of a meeting job.
 */
export async function getMeetingStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/meetings/${jobId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData?.error?.message || `Failed to fetch meeting status: ${response.statusText}`
    );
  }

  return response.json();
}
