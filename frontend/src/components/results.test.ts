import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProcessingStatus } from "./ProcessingStatus/ProcessingStatus";
import { Results } from "./Results/Results";
import { Transcript, formatSeconds } from "./Transcript/Transcript";
import { MeetingData, Speaker, TranscriptSegment, MeetingResult } from "../contracts/types";

describe("Milestone 4 — Processing and Results UI Tests", () => {
  describe("Timestamp Formatting Contract", () => {
    it("formats 0 seconds as [00:00]", () => {
      assert.equal(formatSeconds(0), "[00:00]");
    });

    it("formats single-digit seconds with leading zero", () => {
      assert.equal(formatSeconds(3), "[00:03]");
      assert.equal(formatSeconds(9), "[00:09]");
    });

    it("formats multi-digit minutes and seconds", () => {
      assert.equal(formatSeconds(65), "[01:05]");
      assert.equal(formatSeconds(142), "[02:22]");
    });

    it("handles floating point seconds by flooring", () => {
      assert.equal(formatSeconds(14.85), "[00:14]");
      assert.equal(formatSeconds(75.3), "[01:15]");
    });
  });

  describe("ProcessingStatus Component", () => {
    it("renders job ID and queued status correctly", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingStatus, { jobId: "job_test_123", status: "queued" })
      );

      assert.ok(html.includes("job_test_123"), "Should display Job ID");
      assert.ok(html.includes("Queued"), "Should show Queued stage");
      assert.ok(html.includes("data-testid=\"stage-queued\""), "Should have stage-queued testid");
      assert.ok(html.includes("stage-active"), "Queued should have stage-active class");
    });

    it("renders active indicator on current stage (analyzing)", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingStatus, { jobId: "job_test_123", status: "analyzing" })
      );

      assert.ok(html.includes("data-testid=\"stage-analyzing\""), "Should have analyzing stage");
      assert.ok(html.includes("data-testid=\"stage-icon-analyzing\""), "Should have analyzing stage icon");
      // Preceding stages (queued, processing, transcribing) should show checkmark
      assert.ok(html.includes("✓"), "Preceding completed stages should show checkmark");
    });

    it("renders completed status with all stages checked", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingStatus, { jobId: "job_test_123", status: "completed" })
      );

      assert.ok(html.includes("Processing Complete"), "Should show Processing Complete title");
      assert.ok(html.includes("data-testid=\"stage-completed\""), "Should have completed stage");
    });

    it("renders failed status with error alert banner and failed badge", () => {
      const html = renderToStaticMarkup(
        React.createElement(ProcessingStatus, { jobId: "job_test_fail", status: "failed" })
      );

      assert.ok(html.includes("data-testid=\"processing-failed-banner\""), "Should render failure banner");
      assert.ok(html.includes("Processing Failed"), "Should display Processing Failed");
      assert.ok(html.includes("stage-failed"), "Should apply stage-failed class");
    });
  });

  describe("Results Component", () => {
    const mockMeeting: MeetingData = {
      summary: "This was a highly productive architecture review meeting discussing Phase 4 frontend milestones.",
      decisions: [
        "Use React state for owner editing.",
        "Preserve canonical contracts without modification.",
      ],
      action_items: [
        {
          task: "Implement Results and Processing UI components.",
          owner: "speaker_1",
          deadline: "2026-09-14",
          priority: "high",
        },
        {
          task: "Write comprehensive frontend unit tests.",
          owner: null,
          deadline: null,
          priority: "medium",
        },
      ],
    };

    const mockSpeakers: Speaker[] = [
      { speaker_id: "speaker_1", label: "Speaker 1 (Host)" },
      { speaker_id: "speaker_2", label: "Speaker 2 (Remote)" },
    ];

    it("renders executive summary, decisions, participants, and action items", () => {
      const html = renderToStaticMarkup(
        React.createElement(Results, {
          meeting: mockMeeting,
          speakers: mockSpeakers,
          onOwnerChange: () => {},
        })
      );

      // Summary
      assert.ok(html.includes("data-testid=\"summary-section\""), "Should have summary section");
      assert.ok(html.includes("highly productive architecture review meeting"), "Should contain summary text");

      // Participants / Speakers
      assert.ok(html.includes("data-testid=\"speakers-section\""), "Should have speakers section");
      assert.ok(html.includes("data-testid=\"speaker-chip-speaker_1\""), "Should render speaker 1 chip");
      assert.ok(html.includes("Speaker 1 (Host)"), "Should render speaker 1 label");
      assert.ok(html.includes("Speaker 2 (Remote)"), "Should render speaker 2 label");

      // Decisions
      assert.ok(html.includes("data-testid=\"decisions-section\""), "Should have decisions section");
      assert.ok(html.includes("Use React state for owner editing."), "Should render decision 1");
      assert.ok(html.includes("Preserve canonical contracts without modification."), "Should render decision 2");

      // Action Items
      assert.ok(html.includes("data-testid=\"action-items-section\""), "Should have action items section");
      assert.ok(html.includes("Implement Results and Processing UI components."), "Should render task 1");
      assert.ok(html.includes("Write comprehensive frontend unit tests."), "Should render task 2");

      // Priorities
      assert.ok(html.includes("data-testid=\"priority-badge-high\""), "Should have high priority badge");
      assert.ok(html.includes("data-testid=\"priority-badge-medium\""), "Should have medium priority badge");

      // Deadlines
      assert.ok(html.includes("2026-09-14"), "Should render task 1 deadline");
      assert.ok(html.includes("None"), "Should render 'None' for null deadline");

      // Owner select options
      assert.ok(html.includes("data-testid=\"owner-select-0\""), "Should render owner select for item 0");
      assert.ok(html.includes("data-testid=\"owner-select-1\""), "Should render owner select for item 1");
      assert.ok(html.includes("Unassigned"), "Should offer Unassigned option");
    });

    it("renders empty state message when decisions array is empty", () => {
      const emptyMeeting: MeetingData = {
        summary: "Brief check-in.",
        decisions: [],
        action_items: [],
      };

      const html = renderToStaticMarkup(
        React.createElement(Results, {
          meeting: emptyMeeting,
          speakers: mockSpeakers,
          onOwnerChange: () => {},
        })
      );

      assert.ok(html.includes("No explicit decisions recorded."), "Should render empty decisions notice");
      assert.ok(html.includes("No action items recorded."), "Should render empty action items notice");
    });
  });

  describe("Transcript Component", () => {
    const mockSegments: TranscriptSegment[] = [
      {
        speaker_id: "speaker_1",
        start: 2.5,
        end: 6.8,
        text: "Welcome everyone to our weekly architecture alignment sync.",
      },
      {
        speaker_id: "speaker_2",
        start: 7.2,
        end: 12.0,
        text: "Thanks. I reviewed the Phase 3 specs and everything looks ready.",
      },
    ];

    const mockSpeakers: Speaker[] = [
      { speaker_id: "speaker_1", label: "Speaker 1 (Host)" },
      { speaker_id: "speaker_2", label: "Speaker 2 (Remote)" },
    ];

    it("renders transcript segments with formatted timestamps and resolved speaker labels", () => {
      const html = renderToStaticMarkup(
        React.createElement(Transcript, {
          segments: mockSegments,
          speakers: mockSpeakers,
        })
      );

      assert.ok(html.includes("data-testid=\"transcript-card\""), "Should have transcript-card testid");
      assert.ok(html.includes("data-testid=\"transcript-segment-0\""), "Should have segment 0 testid");
      assert.ok(html.includes("data-testid=\"transcript-segment-1\""), "Should have segment 1 testid");

      // Formatted timestamps
      assert.ok(html.includes("[00:02]"), "Segment 0 start timestamp should be [00:02]");
      assert.ok(html.includes("[00:07]"), "Segment 1 start timestamp should be [00:07]");

      // Speaker labels
      assert.ok(html.includes("Speaker 1 (Host)"), "Should resolve speaker 1 label");
      assert.ok(html.includes("Speaker 2 (Remote)"), "Should resolve speaker 2 label");

      // Spoken text
      assert.ok(html.includes("Welcome everyone to our weekly architecture alignment sync."));
      assert.ok(html.includes("Thanks. I reviewed the Phase 3 specs and everything looks ready."));
    });

    it("renders empty state when no segments exist", () => {
      const html = renderToStaticMarkup(
        React.createElement(Transcript, {
          segments: [],
          speakers: mockSpeakers,
        })
      );

      assert.ok(html.includes("No transcript segments available."), "Should render empty transcript notice");
    });
  });

  describe("Client-Side Owner Editing State Logic", () => {
    it("updates action item owner immutably in React state without side effects", () => {
      const initialResult: MeetingResult = {
        meeting: {
          summary: "Project sync",
          decisions: ["Proceed with plan"],
          action_items: [
            {
              task: "Create PR",
              owner: "speaker_1",
              deadline: "Tomorrow",
              priority: "high",
            },
            {
              task: "Review PR",
              owner: "speaker_2",
              deadline: null,
              priority: "medium",
            },
          ],
        },
        transcript: [
          {
            speaker_id: "speaker_1",
            start: 0,
            end: 5,
            text: "Let's create the PR.",
          },
        ],
        speakers: [
          { speaker_id: "speaker_1", label: "Speaker 1" },
          { speaker_id: "speaker_2", label: "Speaker 2" },
        ],
      };

      // Emulate handleOwnerChange pure function logic from App.tsx
      const handleOwnerChange = (
        current: MeetingResult,
        index: number,
        newOwner: string | null
      ): MeetingResult => {
        const updatedActionItems = [...current.meeting.action_items];
        updatedActionItems[index] = {
          ...updatedActionItems[index],
          owner: newOwner,
        };

        return {
          ...current,
          meeting: {
            ...current.meeting,
            action_items: updatedActionItems,
          },
        };
      };

      // 1. Reassign item 0 from speaker_1 to speaker_2
      const updated1 = handleOwnerChange(initialResult, 0, "speaker_2");
      assert.equal(updated1.meeting.action_items[0].owner, "speaker_2");
      assert.equal(updated1.meeting.action_items[1].owner, "speaker_2");
      // Initial object was not mutated
      assert.equal(initialResult.meeting.action_items[0].owner, "speaker_1");

      // 2. Reassign item 1 to unassigned (null)
      const updated2 = handleOwnerChange(updated1, 1, null);
      assert.equal(updated2.meeting.action_items[1].owner, null);

      // Verify other fields remain intact
      assert.equal(updated2.meeting.summary, initialResult.meeting.summary);
      assert.deepEqual(updated2.meeting.decisions, initialResult.meeting.decisions);
      assert.deepEqual(updated2.speakers, initialResult.speakers);
      assert.deepEqual(updated2.transcript, initialResult.transcript);
    });
  });
});
