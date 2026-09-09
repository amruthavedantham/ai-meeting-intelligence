import React from "react";
import { MeetingData, Speaker } from "../../contracts/types";

export interface ResultsProps {
  meeting: MeetingData;
  speakers: Speaker[];
  onOwnerChange: (actionItemIndex: number, newOwner: string | null) => void;
}

export const Results: React.FC<ResultsProps> = ({
  meeting,
  speakers,
  onOwnerChange,
}) => {
  const getPriorityBadgeStyle = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return { background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid var(--danger)" };
      case "medium":
        return { background: "var(--warning-bg)", color: "var(--warning)", border: "1px solid var(--warning)" };
      case "low":
        return { background: "rgba(255, 255, 255, 0.1)", color: "var(--text-secondary)", border: "1px solid var(--bg-card-border)" };
    }
  };

  return (
    <div className="card results-card">
      <div style={{ marginBottom: "1.75rem" }}>
        <h2>Meeting Summary</h2>
        <p style={{ lineHeight: 1.6, color: "var(--text-primary)" }}>{meeting.summary}</p>
      </div>

      <div style={{ marginBottom: "1.75rem" }}>
        <h2>Decisions ({meeting.decisions.length})</h2>
        {meeting.decisions.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No explicit decisions recorded.</p>
        ) : (
          <ul style={{ paddingLeft: "1.25rem" }}>
            {meeting.decisions.map((decision, idx) => (
              <li key={idx} style={{ color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                {decision}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2>Action Items ({meeting.action_items.length})</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
          Owners can be adjusted directly below. Edits remain client-side without re-running the AI.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {meeting.action_items.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--bg-card-border)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div style={{ flex: "1 1 300px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                  {item.task}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  Deadline: {item.deadline || "None"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Local Owner Editing Dropdown */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label htmlFor={`owner-select-${idx}`} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Owner:
                  </label>
                  <select
                    id={`owner-select-${idx}`}
                    value={item.owner || ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : e.target.value;
                      onOwnerChange(idx, value);
                    }}
                    style={{
                      background: "var(--bg-secondary)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--bg-card-border)",
                      padding: "0.35rem 0.6rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.85rem",
                    }}
                  >
                    <option value="">Unassigned</option>
                    {speakers.map((speaker) => (
                      <option key={speaker.speaker_id} value={speaker.speaker_id}>
                        {speaker.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Badge */}
                <span
                  style={{
                    padding: "0.25rem 0.65rem",
                    borderRadius: "12px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    ...getPriorityBadgeStyle(item.priority),
                  }}
                >
                  {item.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
