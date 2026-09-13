import React, { useState, useEffect } from "react";
import { Recorder } from "./components/Recorder/Recorder";
import { ProcessingStatus } from "./components/ProcessingStatus/ProcessingStatus";
import { Results } from "./components/Results/Results";
import { Transcript } from "./components/Transcript/Transcript";
import { createMeeting, getMeetingStatus } from "./api/meetingApi";
import { JobStatus, MeetingResult } from "./contracts/types";

export type UIState = "IDLE" | "RECORDING" | "UPLOADING" | "PROCESSING" | "RESULTS" | "ERROR";

export const App: React.FC = () => {
  const [uiState, setUiState] = useState<UIState>("IDLE");
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus>("queued");
  const [meetingResult, setMeetingResult] = useState<MeetingResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Triggered when user selects a file or recording completes
  const handleAudioSelected = async (audio: Blob) => {
    try {
      setErrorMessage(null);
      setUiState("UPLOADING");
      const res = await createMeeting(audio);
      setJobId(res.job_id);
      setJobStatus("queued");
      setUiState("PROCESSING");
    } catch (err) {
      setErrorMessage((err as Error).message || "Failed to submit meeting audio.");
      setUiState("ERROR");
    }
  };

  const handleRecordingStateChange = (isRecording: boolean) => {
    if (isRecording) {
      setUiState("RECORDING");
    } else {
      setUiState((current) => (current === "RECORDING" ? "IDLE" : current));
    }
  };

  // Polling mechanism: polls GET /meetings/:jobId every 2 seconds while in PROCESSING state
  useEffect(() => {
    if (uiState !== "PROCESSING" || !jobId) return;

    let isMounted = true;

    const pollInterval = setInterval(async () => {
      try {
        const data = await getMeetingStatus(jobId);
        if (!isMounted) return;

        setJobStatus(data.status);

        if (data.status === "completed" && data.result) {
          setMeetingResult(data.result);
          setUiState("RESULTS");
          clearInterval(pollInterval);
        } else if (data.status === "failed") {
          setErrorMessage(data.error?.message || "Meeting processing failed.");
          setUiState("ERROR");
          clearInterval(pollInterval);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [uiState, jobId]);

  // Local owner editing: strictly updates React state; does NOT call API or re-run AI
  const handleOwnerChange = (actionItemIndex: number, newOwner: string | null) => {
    if (!meetingResult) return;

    const updatedActionItems = [...meetingResult.meeting.action_items];
    updatedActionItems[actionItemIndex] = {
      ...updatedActionItems[actionItemIndex],
      owner: newOwner,
    };

    setMeetingResult({
      ...meetingResult,
      meeting: {
        ...meetingResult.meeting,
        action_items: updatedActionItems,
      },
    });
  };

  const handleReset = () => {
    setUiState("IDLE");
    setJobId(null);
    setJobStatus("queued");
    setMeetingResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="container">
      <header style={{ marginBottom: "2rem" }}>
        <h1>AI Meeting Intelligence</h1>
        <p>
          Modular meeting assistant capturing full two-way conversations with speaker-labelled intelligence.
        </p>
      </header>

      <main>
        {(uiState === "IDLE" || uiState === "RECORDING") && (
          <Recorder
            onAudioSelected={handleAudioSelected}
            onRecordingStateChange={handleRecordingStateChange}
          />
        )}

        {uiState === "UPLOADING" && (
          <div
            className="card"
            data-testid="uploading-card"
            style={{ textAlign: "center", padding: "3rem 1.5rem" }}
          >
            <div
              style={{
                display: "inline-block",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "3px solid rgba(59, 130, 246, 0.2)",
                borderTopColor: "var(--accent-primary)",
                animation: "spin 1s linear infinite",
                marginBottom: "1.25rem",
              }}
            />
            <h2 style={{ marginBottom: "0.5rem" }}>Uploading Audio...</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Uploading your meeting recording to initialize analysis.
            </p>
          </div>
        )}

        {uiState === "PROCESSING" && jobId && (
          <ProcessingStatus jobId={jobId} status={jobStatus} />
        )}

        {uiState === "ERROR" && (
          <div className="card" data-testid="error-card" style={{ borderColor: "var(--danger)" }}>
            <h2 style={{ color: "var(--danger)" }}>Processing Failed</h2>
            <p data-testid="error-message" style={{ marginBottom: "1.25rem" }}>
              {errorMessage || "An unexpected error occurred while processing the meeting."}
            </p>
            <button
              type="button"
              data-testid="retry-button"
              className="btn-primary"
              onClick={handleReset}
              style={{ background: "var(--accent-primary)", color: "#fff" }}
            >
              Try Another Meeting
            </button>
          </div>
        )}

        {uiState === "RESULTS" && meetingResult && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Job ID: <code data-testid="results-job-id" style={{ color: "var(--accent-primary)" }}>{jobId}</code>
              </span>
              <button
                type="button"
                data-testid="new-meeting-button"
                onClick={handleReset}
                style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}
              >
                Process Another Meeting
              </button>
            </div>

            <Results
              meeting={meetingResult.meeting}
              speakers={meetingResult.speakers}
              onOwnerChange={handleOwnerChange}
            />

            <Transcript
              segments={meetingResult.transcript}
              speakers={meetingResult.speakers}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
