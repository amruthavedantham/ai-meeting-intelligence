import React, { useState, useRef } from "react";

export interface RecorderProps {
  onAudioSelected: (audio: Blob) => void;
  disabled?: boolean;
}

export const Recorder: React.FC<RecorderProps> = ({
  onAudioSelected,
  disabled = false,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitSelectedFile = () => {
    if (selectedFile) {
      onAudioSelected(selectedFile);
    }
  };

  const handleGenerateSampleAudio = () => {
    // Generate a mock 30-second WebM audio blob for end-to-end slice testing
    const mockAudioData = new Uint8Array(1024 * 16); // 16 KB simulated audio payload
    const sampleBlob = new Blob([mockAudioData], { type: "audio/webm" });
    onAudioSelected(sampleBlob);
  };

  return (
    <div className="card recorder-card">
      <h2>Audio Input</h2>
      <p style={{ marginBottom: "1.25rem" }}>
        Upload a meeting audio file ($\le 45$ min) or test the pipeline with sample audio.
      </p>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,.webm,.wav,.mp3,.m4a"
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.25rem" }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          Select Audio File
        </button>

        <button
          type="button"
          onClick={handleGenerateSampleAudio}
          disabled={disabled}
          style={{ background: "rgba(255, 255, 255, 0.1)", color: "#fff" }}
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

      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
        Supported formats: WebM (stereo preferred), WAV, MP3, M4A. Max meeting duration: 45 minutes.
      </p>
    </div>
  );
};
