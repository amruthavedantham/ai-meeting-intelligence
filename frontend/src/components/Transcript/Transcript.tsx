import React from "react";
import { TranscriptSegment, Speaker } from "../../contracts/types";

export interface TranscriptProps {
  segments: TranscriptSegment[];
  speakers: Speaker[];
}

function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `[${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}]`;
}

export const Transcript: React.FC<TranscriptProps> = ({ segments, speakers }) => {
  const speakerMap = new Map(speakers.map((s) => [s.speaker_id, s.label]));

  return (
    <div className="card transcript-card">
      <h2>Transcript ({segments.length} segments)</h2>
      {segments.length === 0 ? (
        <p>No transcript segments available.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {segments.map((seg, idx) => {
            const label = speakerMap.get(seg.speaker_id) || seg.speaker_id;
            return (
              <div key={idx} style={{ lineHeight: 1.6 }}>
                <span style={{ color: "var(--accent-primary)", marginRight: "0.5rem" }}>
                  {formatSeconds(seg.start)}
                </span>
                <strong style={{ color: "var(--text-primary)", marginRight: "0.5rem" }}>
                  {label}:
                </strong>
                <span style={{ color: "var(--text-secondary)" }}>{seg.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
