import React from "react";
import { JobStatus } from "../../contracts/types";

export interface ProcessingStatusProps {
  jobId: string;
  status: JobStatus;
}

interface StageInfo {
  key: JobStatus;
  label: string;
  description: string;
}

const STAGES: StageInfo[] = [
  { key: "queued", label: "Queued", description: "Audio received and queued for processing" },
  { key: "processing", label: "Processing", description: "Validating audio artifact and initializing workflow" },
  { key: "transcribing", label: "Transcribing", description: "Deepgram speech-to-text and speaker diarization" },
  { key: "analyzing", label: "Analyzing", description: "Gemini extracting summary, decisions, and action items" },
  { key: "completed", label: "Complete", description: "Meeting intelligence successfully generated" },
];

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({ jobId, status }) => {
  const currentStageIndex = STAGES.findIndex((s) => s.key === status);

  return (
    <div className="card status-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Processing Meeting</h2>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
          {jobId}
        </span>
      </div>

      <p style={{ marginBottom: "1.5rem" }}>
        Your meeting is being processed through the intelligence pipeline. Progress is polled automatically.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {STAGES.map((stage, idx) => {
          const isPassed = currentStageIndex > idx;
          const isCurrent = currentStageIndex === idx;

          let badgeColor = "rgba(255, 255, 255, 0.1)";
          let textColor = "var(--text-muted)";
          let icon = "○";

          if (isPassed) {
            badgeColor = "var(--success-bg)";
            textColor = "var(--success)";
            icon = "✓";
          } else if (isCurrent) {
            badgeColor = "var(--accent-glow)";
            textColor = "var(--accent-primary)";
            icon = "●";
          }

          return (
            <div
              key={stage.key}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                background: isCurrent ? "rgba(59, 130, 246, 0.08)" : "transparent",
                border: isCurrent ? "1px solid var(--accent-glow)" : "1px solid transparent",
              }}
            >
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: badgeColor,
                  color: textColor,
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  flexShrink: 0,
                }}
              >
                {icon}
              </span>
              <div>
                <div style={{ fontWeight: isCurrent ? 600 : 500, color: isCurrent ? "var(--text-primary)" : textColor }}>
                  {stage.label}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  {stage.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
