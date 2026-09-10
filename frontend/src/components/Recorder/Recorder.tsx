import React, { useState, useRef, useEffect } from "react";
import { AudioRecorder, defaultAudioRecorder, AudioCaptureError } from "../../audio/recorder";

export interface RecorderProps {
  onAudioSelected: (audio: Blob) => void;
  audioRecorder?: AudioRecorder;
  disabled?: boolean;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export const Recorder: React.FC<RecorderProps> = ({
  onAudioSelected,
  audioRecorder = defaultAudioRecorder,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setElapsedSeconds(0);

    try {
      await audioRecorder.startRecording();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (err instanceof AudioCaptureError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(`Recording error: ${(err as Error).message}`);
      }
    }
  };

  const handleStopRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const audioBlob = await audioRecorder.stopRecording();
      setIsRecording(false);
      onAudioSelected(audioBlob);
    } catch (err) {
      setIsRecording(false);
      setErrorMessage(`Failed to finalize recording: ${(err as Error).message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage(null);
    }
  };

  const handleSubmitSelectedFile = () => {
    if (selectedFile) {
      onAudioSelected(selectedFile);
    }
  };

  const handleGenerateSampleAudio = () => {
    // Generate a mock 30-second WebM audio blob for testing the processing pipeline
    const mockAudioData = new Uint8Array(1024 * 16);
    const sampleBlob = new Blob([mockAudioData], { type: "audio/webm" });
    onAudioSelected(sampleBlob);
  };

  return (
    <div className="card recorder-card">
      <h2>Audio Input</h2>
      <p style={{ marginBottom: "1.25rem" }}>
        Record meeting conversation (mic + meeting tab audio) or upload a meeting recording.
      </p>

      {errorMessage && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-sm)",
            color: "#fff",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,.webm,.wav,.mp3,.m4a"
        style={{ display: "none" }}
      />

      {isRecording ? (
        <div
          style={{
            padding: "1.25rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: "var(--danger)",
                animation: "pulse 1.5s infinite",
              }}
            />
            <strong style={{ fontSize: "1.1rem", fontFamily: "monospace" }}>
              {formatTimer(elapsedSeconds)}
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Recording (Left: Mic | Right: Tab)
            </span>
          </div>

          <button
            type="button"
            className="btn-danger"
            onClick={handleStopRecording}
            disabled={disabled}
          >
            End Meeting & Process
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleStartRecording}
              disabled={disabled}
            >
              Start Meeting Recording
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff" }}
            >
              Upload Audio File
            </button>

            <button
              type="button"
              onClick={handleGenerateSampleAudio}
              disabled={disabled}
              style={{ background: "transparent", border: "1px solid var(--bg-card-border)", color: "var(--text-secondary)" }}
            >
              Use Sample 30s Audio
            </button>
          </div>

          {selectedFile && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ color: "var(--text-primary)" }}>{selectedFile.name}</strong>
                <span style={{ marginLeft: "0.75rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmitSelectedFile}
                disabled={disabled}
                style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}
              >
                Upload & Process
              </button>
            </div>
          )}
        </>
      )}

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        Chrome / Edge: Select the tab playing meeting audio and ensure &ldquo;Share tab audio&rdquo; is checked.
      </p>
    </div>
  );
};
