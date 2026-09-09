

AI Meeting Intelligence
## Phase 1 — Requirements & Scope
## Status: 꼂꼃꼄 Locked
Project: AI Meeting Intelligence
MVP Development Budget: 14 hours
Maximum Meeting Duration: 45 minutes
## Primary User: Individual Professional
## Secondary Goal: Portfolio / Interview Project

## 1. Project Goal
AI Meeting Intelligence is an AI-powered meeting assistant designed for individual professionals.
The application should capture a complete meeting conversation, diƯerentiate the speakers, transcribe the conversation, and use
AI to extract useful meeting intelligence.
The core experience is:
## Meeting Conversation
## ↓
## Audio Capture / Upload
## ↓
Speaker DiƯerentiation
## ↓
Speech-to-Text
## ↓
Speaker-Labelled Transcript
## ↓
AI Meeting Analysis
## ↓
## Structured Results
## ↓
## User Reviews / Edits
The original project plan defines the MVP around recording a meeting, converting audio into a transcript, analyzing the transcript
with AI, and producing a summary, decisions, and action items with owner, deadline, and priority.

## 2. Target User
## Primary User — Individual Professional
The application is intended for an individual professional who regularly participates in meetings and wants to automatically extract:
 What was discussed
 What was decided
 What needs to be done
 Who is responsible
 When it is due
 How important the task is
## Secondary Goal — Portfolio / Interview Project
The project should also demonstrate practical engineering ability in:
 AI integration
 API integration
 Audio processing
 Speaker diƯerentiation
##  Speech-to-text
 Structured LLM output
 Workflow automation
 Frontend/backend integration
 Modular architecture
 Engineering trade-oƯs
The goal is therefore not simply to make a working demo, but to build the MVP in a way that can be understood, explained, and
extended.

## 3. Core Product Requirement
The application should not only record the user's microphone.
It should attempt to capture the complete meeting conversation from all sides.
The preferred approach is:
## BROWSER MEETING
## ↓

## ┌────────────┴────────────┐
## ↓                         ↓
User Microphone          Meeting/System Audio
## │                         │
## └────────────┬────────────┘
## ↓
## Complete Audio
## Preferred Capture — Option C
Microphone + meeting/system audio
This is the preferred implementation because the product is intended to work with browser-based meetings and should capture the
whole conversation.
## Fallback
If reliable microphone + meeting/system audio capture cannot be implemented within the 14-hour total project budget, we will
simplify the capture mechanism to:
 Option B: Meeting/system audio, or
 Option A: Microphone audio
The core meeting-intelligence pipeline takes priority over sophisticated audio capture.
## Browser Meeting Requirement
Browser-based meeting support is compulsory.

## 4. Audio Input Modes
The MVP should support two input modes.
## Mode 1 — Browser Meeting Recording
The user starts a meeting through the application and records the conversation.
## Browser Meeting
## ↓
## Audio Capture
## ↓
## Complete Meeting Audio
## Mode 2 — Audio Upload
The user can upload a previously recorded meeting audio file.
## Audio File
## ↓
## Upload
## ↓
## Processing Pipeline
This is especially useful for demonstrations because we can prepare an audio recording in advance and demonstrate the complete
AI pipeline without requiring multiple participants during the demo.
## Shared Processing Pipeline
Both input modes should eventually feed into the same processing pipeline.
## Browser Meeting ───┐
## ├──→ Audio Processing
## Audio Upload ──────┘
## ↓
Speaker DiƯerentiation
## ↓
## Transcription
## ↓
AI Analysis
## ↓
## Results
We should not create separate AI-processing systems for recordings and uploaded files.

## 5. Maximum Meeting Duration
MVP Limit: 45 Minutes
A meeting recording may be at most:
45 minutes
This is deliberately shorter than the previously considered one-hour limit.
The reduced duration gives the project more room within the 14-hour development budget for:
 Reliable audio capture
 Speaker diƯerentiation
##  Transcription
 AI analysis
 Owner extraction

##  Editing
##  UI
##  Testing
##  Deployment

- Speaker DiƯerentiation
Speaker diƯerentiation is a required MVP capability.
The system should distinguish diƯerent voices in the conversation.
For example:
## Speaker 1
## Speaker 2
## Speaker 3
The system should determine which speaker spoke each portion of the conversation.
MVP Speaker Identification
The MVP does not need to automatically identify people's real names.
We are not initially trying to produce:
## Speaker 1 = Amrutha
## Speaker 2 = Karthik
## Speaker 3 = Rahul
## Instead:
## Speaker 1
## Speaker 2
## Speaker 3
is suƯicient.
Automatic real-name/voice identification is a future enhancement.

- Speech Recognition vs Speaker Diarization
The system has two distinct requirements.
Speech-to-Text
## Answers:
What was said?
## Example:
"Let's target Friday for the report."
## Speaker Diarization
## Answers:
Who said it?
## Example:
## Speaker 1:
"Let's target Friday for the report."
Both capabilities are required because speaker information is necessary for reliable action-item ownership.

- Speaker-Labelled Transcript
The transcript should retain:
##  Timestamp
##  Speaker
 Spoken content
Expected format:
## [00:01] Speaker 1:
Let's target Friday for the report.

## [00:08] Speaker 2:
I'll review it once it's ready.

## [00:14] Speaker 1:
Great. I'll send it Thursday evening.
The transcript should therefore be speaker-labelled and timestamped.

## 9. Meeting Summary
The application should generate a concise summary of the meeting.
## Example:
## Meeting Summary

The team discussed the project launch timeline,
reviewed the CRM changes, and agreed on the

remaining tasks before release.
The summary should represent the actual discussion and should not invent information.

## 10. Decisions
The application should identify important decisions made during the meeting.
## Example:
## Decisions

✓ Launch target is September 10
✓ CRM changes approved
Only decisions supported by the conversation should be presented.

## 11. Action Items
The application should identify tasks resulting from the meeting.
Every action item should attempt to contain:
## Task
## Owner
## Deadline
## Priority
## Example:
Task: Finish report
## Owner: Speaker 1
## Deadline: Friday
## Priority: High

## 12. Owner Assignment
Speaker diƯerentiation should allow the AI to associate an action with the speaker responsible for it.
## Example:
## Speaker 1:
"I'll finish the report by Friday."

## ↓

## Action Item

Task: Finish the report
## Owner: Speaker 1
## Deadline: Friday

## 13. Unknown Owner Rule
The AI must not fabricate ownership.
If the conversation does not establish who is responsible:
## {
"task": "Update presentation",
"owner": null
## }
The UI should make it clear that the owner is unknown/unassigned.
This is an explicit reliability requirement.

## 14. Editable Owner
The user should be able to correct an owner assigned by the AI.
## Example:
## Action Item

Task: Update presentation

## Owner: [ Speaker 1 ▼ ]

## Deadline: Monday

## Priority: Medium
The user can change the owner when the AI's interpretation is incorrect.
Future versions may allow users to rename speakers:
## Speaker 1 → Amrutha
## Speaker 2 → Karthik
but this is not required for MVP.


- Editable AI Results
The AI output should not be treated as permanently authoritative.
The user should be able to review and correct extracted meeting information.
Required for MVP
 Owner editing
Potentially editable if time permits
##  Task
##  Deadline
##  Priority
 Decision text
##  Summary
The principle is:
AI generates the result; the user remains in control of the final information.

## 16. Recording Lifecycle
The original meeting recording should be deleted after processing.
Desired lifecycle:
## Recording
## ↓
## Processing
## ↓
## Transcript + Analysis
## ↓
Results displayed
## ↓
Original recording deleted
The MVP therefore does not require persistent storage of the original meeting recording.

## 17. Processing Status
Processing may take some time, particularly for longer recordings.
The UI should therefore communicate the current processing stage.
## Example:
Meeting ended

✓ Uploading audio
✓ Detecting speakers
✓ Transcribing conversation
● Analyzing meeting
○ Preparing results
## Then:
✓ Meeting analysis complete

## [ View Results ]
The application should not appear frozen while processing.

## 18. Results Page
The final results screen should contain four primary sections.
## 18.1 Summary
## Meeting Summary

The team discussed the project launch timeline,
reviewed the CRM changes, and agreed on the
remaining tasks before release.
## 18.2 Decisions
## Decisions

✓ Launch target is September 10
✓ CRM changes approved
## 18.3 Action Items
## Action Items

## ┌─────────────────┬───────────┬──────────┬──────────┐
## │ Task            │ Owner     │ Deadline │ Priority │

## ├─────────────────┼───────────┼──────────┼──────────┤
│ Finish report   │ Speaker 1 │ Friday   │ High     │
│ Review CRM      │ Speaker 2 │ Tomorrow │ Medium   │
│ Update slides   │ —         │ Monday   │ Low      │
## └─────────────────┴───────────┴──────────┴──────────┘
The owner should be editable.
## 18.4 Transcript
## Transcript

## [00:01] Speaker 1:
Let's target Friday for the report.

## [00:08] Speaker 2:
I'll review it once it's ready.

## [00:14] Speaker 1:
Great. I'll send it Thursday evening.

## 19. Modular & Replaceable Architecture
This is a first-class Phase 1 requirement.
The application should be designed as a collection of loosely coupled, independently replaceable components.
Changing one component in the future should require minimal or no changes to unrelated components.
The principle is:
Components communicate through clear contracts/interfaces rather than depending on each other's internal
implementation.

## 20. Modular System Structure
The system should conceptually be divided into:
## 1. Audio Input
## 2. Audio Processing
## 3. Speaker Diarization
- Speech-to-Text
## 5. Meeting Analysis
## 6. Results / Presentation
Potential future components include:
## 7. Storage
## 8. Authentication
## 9. Meeting Integrations
## 10. Notifications
## 11. Calendar Integration
## 12. Export
## 13. Speaker Identity / Name Mapping

## 21. Component Independence
Each component should have a clearly defined input and output.
## Conceptually:
## Audio Input
## │
## │ Audio
## ↓
## Audio Processing
## │
## │ Processed Audio
## ↓
## Speaker Diarization
## │
## │ Speaker Segments
## ↓
Speech-to-Text
## │
## │ Speaker-labelled Transcript
## ↓
## Meeting Analysis
## │
## │ Structured Meeting Data
## ↓

Results UI
The downstream component should depend on the output contract, not the internal implementation of the upstream component.

## 22. Provider Independence
The application should avoid being tightly coupled to one external provider.
For example, the architecture should conceptually support:
## Transcription Service
## ↑
## ┌─────────┼─────────┐
## │         │         │
## Provider A Provider B Provider C
If the transcription provider changes, the rest of the system should continue working through the same internal interface.
The same principle should eventually apply to:
 Speaker diarization
 LLM/AI analysis
 Audio processing
##  Storage
The architectural principle is:
Build around capabilities, not vendors.

## 23. Stable Internal Data Contracts
DiƯerent providers may return diƯerent data structures.
The application should normalize them into a stable internal representation.
For example:
## {
## "segments": [
## {
"speaker": "Speaker 1",
## "start": 1.2,
## "end": 4.8,
"text": "Let's target Friday for the report."
## },
## {
"speaker": "Speaker 2",
## "start": 5.1,
## "end": 8.4,
"text": "I'll review it once it's ready."
## }
## ]
## }
## Conceptually:
## Provider A ──┐
## ├──→ Internal Transcript Contract ──→ Analysis
## Provider B ──┘
This allows a provider to be replaced without rewriting the analysis layer.
The exact contracts and schemas will be finalized during Phase 2 and implementation.

## 24. Modular Architecture — Important Constraint
Modularity does not mean over-engineering the MVP.
We do not need:
 12 microservices
##  Kubernetes
 Message queues
 Complex dependency injection
 Dozens of design patterns
 Enterprise-scale infrastructure
For this project:
Modular means clear boundaries, simple contracts, and replaceable implementations.
The architecture should remain simple enough to build within the 14-hour budget.

## 25. Overall Architecture
## AI MEETING INTELLIGENCE


## ┌─────────────────────────────────────────────────────────┐
## │                    INPUT LAYER                          │
## │                                                         │
## │ Browser Meeting      Audio Upload      Future Inputs   │
## └──────────┬─────────────────┬────────────────────────────┘
## │                 │
## └────────┬────────┘
## ↓
## AUDIO CONTRACT
## ↓
## ┌─────────────────────────────────────────────────────────┐
## │                PROCESSING LAYER                         │
## │                                                         │
## │ Audio Processing → Speaker Diarization → Transcription │
## │                                                         │
│ Each component independently replaceable                │
## └────────────────────────┬────────────────────────────────┘
## ↓
## TRANSCRIPT CONTRACT
## ↓
## ┌─────────────────────────────────────────────────────────┐
## │                 INTELLIGENCE LAYER                      │
## │                                                         │
│              Meeting Analysis / LLM                    │
## │                                                         │
│              Independently replaceable                 │
## └────────────────────────┬────────────────────────────────┘
## ↓
## MEETING DATA CONTRACT
## ↓
## ┌─────────────────────────────────────────────────────────┐
## │                  PRESENTATION LAYER                     │
## │                                                         │
## │ Summary │ Decisions │ Actions │ Transcript │ Editing   │
## └─────────────────────────────────────────────────────────┘

- End-to-End Browser Meeting Flow
## Open Application
## ↓
## Start Meeting
## ↓
## Grant Audio Permissions
## ↓
## Capture Meeting Conversation
## ↓
## End Meeting
## ↓
## Processing
## ↓
Speaker DiƯerentiation
## ↓
Speech-to-Text
## ↓
Speaker-Labelled Transcript
## ↓
AI Analysis
## ↓
## Structured Results
## ↓
## User Reviews / Edits
## ↓
## Recording Deleted

- End-to-End Audio Upload Flow
## Open Application
## ↓

## Upload Audio
## ↓
## Validate Audio
## ↓
## Processing
## ↓
Speaker DiƯerentiation
## ↓
Speech-to-Text
## ↓
Speaker-Labelled Transcript
## ↓
AI Analysis
## ↓
## Structured Results
## ↓
## User Reviews / Edits
## ↓
## Uploaded Recording Deleted

## 28. Core Data Flow
## ┌── Browser Meeting ──┐
## │                     │
## └─────────────────────┤
## ↓
## ┌── Audio Upload ─────┤
## │                     │
## └─────────────────────┘
## ↓
## Audio Input
## ↓
## Audio Processing
## ↓
## Speaker Diarization
## ↓
## Speaker Segments
## ↓
Speech-to-Text
## ↓
Speaker-Labelled Transcript
## ↓
n8n
## ↓
LLM Analysis
## ↓
Structured JSON
## ↓
## Meeting Data
## ↓
Results UI

- Core AI Output
The AI should return structured data rather than an uncontrolled block of prose.
## Conceptually:
## {
## "summary": "...",
## "decisions": [
"Launch target is September 10"
## ],
## "action_items": [
## {
"task": "Finish report",
"owner": "Speaker 1",
"deadline": "Friday",
"priority": "High"
## },

## {
"task": "Update presentation",
"owner": null,
"deadline": null,
"priority": "Medium"
## }
## ]
## }
The exact schema will be finalized during Phase 2 after the technology stack is selected.

- MVP Features
The MVP includes:
 Browser-based meeting recording
 Complete conversation capture as far as technically feasible
 Microphone capture
 Meeting/system audio capture where feasible
 Audio upload
 Maximum 45-minute meeting
 Speaker diƯerentiation
 Speaker 1 / Speaker 2 / Speaker 3 labels
 Speaker-labelled transcript
##  Timestamps
##  Speech-to-text
 Meeting summary
 Decision extraction
 Action-item extraction
 Owner extraction
 Deadline extraction
 Priority extraction
 null owner when ownership is unknown
 Editable owner
 Processing status
 Results UI
 Deletion of original recording
 Modular component architecture
 Replaceable service/provider boundaries

- Explicitly Out of Scope
The following are not required for MVP:
 User authentication
##  Database
 Calendar integration
 Zoom integration
 Microsoft Teams integration
 Live transcription
 Automatic recognition of people's real names
 Persistent meeting-recording storage
 Advanced collaboration
 Enterprise permissions
 Advanced analytics
##  Notifications
 Automatic speaker-name recognition
The original project plan also places authentication, database, calendar integration, and Zoom/Teams integration outside the initial
## MVP.

## 32. Development Strategy
We will build the project incrementally rather than attempting to build the entire system simultaneously.

## Phase 1
## Requirements & Scope
## ↓
## Phase 2
## Technology Understanding & Stack Selection
## ↓
## Architecture
## ↓
Text → AI Workflow
## ↓
## Audio Recording
## ↓
Speaker DiƯerentiation
## ↓
## Audio → Transcript
## ↓
## Complete Integration
## ↓
Results UI
## ↓
## Testing
## ↓
## Deployment
This approach allows each major component to be understood and tested independently.

- 14-Hour Scope Rule
The complete project should target approximately 14 hours.
The core priority is:
- Complete conversation capture
- Speaker diƯerentiation
- Speaker-labelled transcription
- AI analysis
- Correct owner extraction
- Editable results
- Audio upload
- Processing feedback
- Polished UI
- Additional features
Hard rule
If a feature threatens the 14-hour deadline, simplify or remove that feature rather than compromising the core pipeline.
The original plan similarly emphasizes incremental construction and avoiding unnecessary MVP scope.

## 34. Technical Risk Priority
The highest-risk technical requirement is:
Capturing both the user's microphone and browser meeting/system audio reliably.
Therefore, Phase 2 should investigate this before we commit to the final implementation.
The next technical questions should be:
- What browser APIs can capture microphone audio?
- What browser APIs can capture meeting/system audio?
- Can both streams be captured simultaneously?
- How should the two streams be combined?
- Can the resulting audio be processed reliably?
- What speaker-diarization approach fits the 14-hour budget?
- What transcription approach preserves speaker/timestamp information?
- How should n8n fit into the architecture?
- What internal data contracts should connect the components?
- What implementation gives us the best balance of reliability, simplicity, and future replaceability?

## 35. Phase 1 Acceptance Criteria
Phase 1 is complete when the following requirements have been defined:
 Target user
 Portfolio/interview objective
 Product goal
 Browser meeting requirement
 Preferred audio capture — Option C

 Fallback audio capture — Option B/A
 Audio upload
 45-minute maximum meeting duration
 Speaker diƯerentiation
 Speaker 1/2/3 MVP labels
 Speaker-labelled transcript
 Timestamped transcript
##  Summary
##  Decisions
 Action items
 Owner extraction
 null owner when unknown
 Editable owner
 Processing status
 Recording deletion after processing
 Results UI
 Modular architecture
 Replaceable components
 Provider independence
 Internal data contracts
 MVP exclusions
 14-hour development constraint
 Scope-priority rule
 Technical risk identified

- Final MVP Definition
AI Meeting Intelligence is a modular, browser-based meeting assistant for individual professionals. It records a meeting
conversation, preferably capturing both microphone and meeting/system audio, and also supports uploading a previously
recorded meeting audio file. The system diƯerentiates speakers as Speaker 1, Speaker 2, Speaker 3, produces a
timestamped speaker-labelled transcript, and uses AI to extract a meeting summary, decisions, and action items with owner,
deadline, and priority. When an owner cannot be reliably determined, the owner is set to null and can be edited by the user.
The application provides processing feedback, displays the final results in an editable interface, and deletes the original
recording after processing. Meetings are limited to 45 minutes for the MVP. The architecture must remain modular and use
clear internal contracts so that audio capture, speaker diarization, transcription, AI analysis, and other components can be
replaced or modified independently in future versions without requiring major changes to unrelated parts of the system. The
complete MVP should remain achievable within a 14-hour development budget.

## Phase 1 Status
## 꼂꼃꼄 PHASE 1 — LOCKED
Core principle
Build a small but real meeting-intelligence product, not a collection of tightly coupled demos.
Core pipeline
## ┌──────────────────┐
## │ Browser Meeting  │
## │       OR         │
## │  Audio Upload    │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
## │ Audio Processing │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
## │ Speaker Diarize  │
## │ Speaker 1/2/3    │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
│ Speech-to-Text   │
## └────────┬─────────┘

## ↓
## ┌──────────────────┐
│ Speaker-Labelled │
## │    Transcript    │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
│       n8n        │
## │    Workflow      │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
│   LLM Analysis   │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
## │ Structured Data  │
## └────────┬─────────┘
## ↓
## ┌──────────────────┐
## │ Results + Edit   │
## │       UI         │
## └──────────────────┘
Phase 2 will now focus on understanding and selecting the technology for each box — especially the browser audio + meeting
audio problem — before we write the first line of implementation code.
## Phase 2
## Phase 2.1 — Technology Stack & Core Architecture Decision
Status: 꼂꼃꼄 LOCKED
## Phase: 2 — Technology & Architecture
## Section: 2.1 — Technology Stack
MVP Development Budget: 14 hours

## 1. Purpose
Phase 2.1 establishes the technology choices and high-level architectural boundaries for the AI Meeting Intelligence MVP.
The objective is to select technologies that:
 Can realistically be implemented within the 14-hour MVP budget
 Provide a smooth but simple user experience
 Support browser-based meeting audio capture
 Preserve speaker/source separation as much as possible
 Provide reliable speaker-labelled transcription
 Produce structured AI meeting intelligence
 Maximize automation through n8n where appropriate
 Keep major components replaceable in the future
The decisions below form the technical foundation for Phase 2.2 and implementation.

## 2. Final Technology Stack
## Component Decision
## Frontend React + Vite
Styling Simple CSS / lightweight component styling
Microphone Capture getUserMedia()
Meeting/Tab Audio Capture getDisplayMedia()
Audio Routing Web Audio API
Audio Recording MediaRecorder
## Primary Browser Chrome / Edge
Audio Architecture Stereo channel packing
Left Channel Local microphone
Right Channel Meeting/tab audio
Primary STT Provider Deepgram
## Speaker Diarization Deepgram

## Component Decision
## Multichannel Transcription Enabled
Primary LLM Gemini Flash
LLM Output Structured JSON Schema
Workflow / Automation n8n
STT Fallback AssemblyAI
LLM Fallback OpenAI
Persistent Audio Storage Not required
Database Not required at this stage
Authentication Out of scope for MVP

## 3. Frontend Decision
## React + Vite
React + Vite is selected instead of plain HTML/CSS/JavaScript.
The application contains multiple states that need to be managed cleanly:
## Idle
## ↓
## Recording
## ↓
## Processing
## ↓
## Transcribing
## ↓
## Analyzing
## ↓
## Results
## ↓
## Editing
React provides a simple component and state model for this without introducing the additional complexity of a larger application
framework.
The frontend will remain intentionally lightweight.
Frontend responsibilities
The frontend owns:
 Meeting recording controls
 Recording timer
 Microphone permission
 Meeting/tab audio permission
 Audio capture
 Audio channel routing
 MediaRecorder
 Uploading audio
 Processing-state display
 Results display
 Editing meeting results
The frontend should not contain provider-specific transcription or LLM logic.

## 4. Browser Audio Capture Decision
The MVP will use native browser APIs:
getUserMedia()
## +
getDisplayMedia()
## ↓
Web Audio API
## ↓
MediaRecorder
## Microphone
getUserMedia({ audio: true }) captures the user's microphone.
## Meeting Audio
getDisplayMedia() will be used to request audio associated with the selected meeting/browser surface.
The MVP will primarily target Chrome/Edge because browser support for display/tab audio varies by browser and operating system.

The product should not claim universal "system audio capture."
Instead, the requirement is:
Capture meeting/tab audio when the selected browser surface and platform make that audio available.
The UI should clearly guide the user through the required permission and audio-sharing steps.

## 5. Audio Architecture Decision
## Stereo Channel Packing
The MVP will use a single stereo recording with logically separated channels:
## Left Channel  = Local Microphone
Right Channel = Meeting/Tab Audio
## Conceptually:
## Microphone ───────→ Left Channel
## │
├──→ Stereo MediaStream
## │
## Meeting Audio ─────→ Right Channel
## │
## ↓
MediaRecorder
## ↓
## Audio File
This approach was selected over both mono mixing and two independent recordings.
Why stereo packing?
It provides:
 One recording
 One upload
 One processing job
 Synchronized channels
 Source-level audio separation
 Lower implementation complexity than maintaining two independent recordings
The important distinction is:
Stereo packing provides channel/source separation, not guaranteed human-speaker identification.
The local channel will normally represent the local speaker, while the meeting channel may contain multiple remote speakers.
Speaker diarization is therefore still required for the meeting channel.

- Speaker DiƯerentiation Decision
Speaker diƯerentiation remains a required MVP capability.
The architecture will use the audio channels to simplify the problem:
## Channel 0
## ↓
Local audio
## ↓
Primarily local speaker

## Channel 1
## ↓
Meeting audio
## ↓
Multiple remote speakers
## ↓
## Diarization
The MVP does not attempt to identify real people by name.
Speakers will initially be represented as:
## Speaker 1
## Speaker 2
## Speaker 3
## ...
Automatic mapping such as:
## Speaker 1 → Amrutha
## Speaker 2 → Karthik
remains a future enhancement.

- Speech-to-Text & Diarization Decision
## Primary Provider: Deepgram

Deepgram is selected as the primary transcription provider because it aligns well with the chosen audio architecture.
The transcription layer will use:
 Multichannel transcription
 Speaker diarization
##  Timestamps
 Speaker-labelled transcript information
The objective is to obtain a transcript that can be normalized into our internal format.
## Conceptually:
## Stereo Audio
## ↓
## Deepgram
## ↓
## ┌───────────────────────────┐
## │ Channel 0 → Local Speech  │
## │ Channel 1 → Remote Speech │
## │                           │
│ + timestamps              │
│ + speaker information     │
## └─────────────┬─────────────┘
## ↓
## Internal Transcript
## Contract
Important architectural decision
The rest of the application will not depend directly on Deepgram's response format.
## Instead:
## Deepgram
## ↓
STT Adapter
## ↓
## Internal Transcript Contract
This makes AssemblyAI or another provider replaceable later.

- STT Fallback
AssemblyAI
AssemblyAI is retained as the primary alternative transcription provider.
The architecture will therefore conceptually support:
STT Interface
## │
## ┌─────────┴─────────┐
## ↓                   ↓
Deepgram            AssemblyAI
## │                   │
## └─────────┬─────────┘
## ↓
## Transcript Contract
The MVP will implement Deepgram first.
AssemblyAI does not need to be implemented unless required; it is retained as the replacement/fallback architecture.

- LLM Decision
Primary LLM: Gemini Flash
Gemini Flash is selected for meeting analysis.
Its role is not transcription.
Its role begins after a normalized transcript has been produced.
Speaker-Labelled Transcript
## ↓
## Gemini Flash
## ↓
## Structured Meeting Data
The LLM will extract:
 Meeting summary
##  Decisions
 Action items
##  Owners

##  Deadlines
##  Priorities
The model should not invent missing information.
For example:
## {
"task": "Update presentation",
"owner": null,
"deadline": null,
## "priority": "medium"
## }

- Structured AI Output
The LLM will use JSON Schema structured output rather than relying solely on prompt instructions.
The schema will define:
 Required fields
##  Arrays
##  Objects
 Nullable fields
 Fixed enums where appropriate
For example:
priority
→ high
→ medium
→ low
## And:
owner
→ string
→ null
This establishes a stable contract between the AI analysis layer and the frontend.
The exact schema will be finalized in Phase 2.2.

- LLM Provider Independence
Gemini will be implemented behind an internal analysis boundary.
## Conceptually:
MeetingAnalyzer
## │
## ┌────────┴────────┐
## ↓                 ↓
Gemini             OpenAI
## │                 │
## └────────┬────────┘
## ↓
## Meeting Data Contract
This allows the LLM provider to be changed without redesigning the rest of the application.

- n8n Decision
n8n = Orchestration Layer
n8n will be used extensively for workflow automation.
However, n8n will not own browser interaction or audio capture.
Browser owns
## Capture
## Recording
## Permissions
## Upload
## UI
## Editing
n8n owns
Workflow orchestration
Provider calls
Data transformation
AI analysis
## Validation
Processing state
Cleanup orchestration

This establishes a clear architectural boundary.

## 13. Proposed Processing Workflow
The primary processing workflow will conceptually be:
## Frontend
## ↓
n8n Webhook
## ↓
## Validate Request
## ↓
## Process Audio
## ↓
## Deepgram
## ↓
## Normalize Transcript
## ↓
## Gemini
## ↓
## Validate Structured Output
## ↓
## Prepare Meeting Result
## ↓
Return / expose Result
## ↓
## Cleanup Temporary Audio
The exact implementation of job state and result retrieval will be finalized in Phase 2.2.

## 14. Asynchronous Processing
Meeting processing should be treated as an asynchronous operation rather than requiring the browser to wait for the entire pipeline.
## Conceptually:
## Frontend
## ↓
## Submit Meeting
## ↓
Job ID
## ↓
## Processing
## ↓
Frontend checks status
## ↓
Result available
The UI can therefore communicate progress:
✓ Audio uploaded
✓ Detecting speakers
## ● Transcribing
○ Analyzing meeting
○ Preparing results
This provides a smoother user experience and prevents the application from appearing frozen.
The precise job-state mechanism will be determined in Phase 2.2.

## 15. Audio Storage Decision
The original meeting recording is considered temporary processing data.
The intended lifecycle is:
## Recording
## ↓
Temporary processing
## ↓
## Transcription
## ↓
AI analysis
## ↓
## Results
## ↓
Delete recording
Permanent recording storage is not required for the MVP.

The actual deletion mechanism, including any temporary binary data retained by the workflow platform, will be addressed during
## Phase 2.2.

## 16. Modularity & Provider Independence
The architecture will follow the Phase 1 requirement that major components be independently replaceable.
The system should be organized around capabilities and internal contracts, rather than vendor-specific response formats.
The intended structure is:
## Audio Input
## ↓
## Audio Contract
## ↓
STT Adapter
## ↓
## Transcript Contract
## ↓
## Analysis Adapter
## ↓
## Meeting Data Contract
## ↓
## Presentation Layer
This means:
## Replace Deepgram
Only the STT adapter and provider-specific implementation should need modification.
## Replace Gemini
Only the analysis adapter/provider implementation should need modification.
Replace audio capture
The downstream processing pipeline should continue to consume the same audio contract.
Add another input source
For example:
## Browser Recording ──┐
## ├──→ Audio Contract
## Audio Upload ───────┘
Both can use the same processing pipeline.

## 17. Phase 2.1 Architecture
The resulting architecture is:
## ┌─────────────────────┐
│      React UI       │
## │       + Vite        │
## └──────────┬──────────┘
## │
## ┌──────────────┴──────────────┐
## │                             │
getUserMedia()              getDisplayMedia()
## │                             │
## ↓                             ↓
Microphone                   Meeting/Tab
## │                         Audio
## └──────────────┬──────────────┘
## ↓
Web Audio API
## ↓
## ┌────────────────────┐
## │   Stereo Stream    │
## │                    │
## │ L = Microphone     │
## │ R = Meeting Audio  │
## └─────────┬──────────┘
## ↓
MediaRecorder
## ↓
## Audio File
## ↓
## ┌────────────────────┐
│    n8n Webhook     │

## └─────────┬──────────┘
## ↓
## ┌────────────────────┐
│    STT Adapter     │
## └─────────┬──────────┘
## ↓
## ┌────────────────────┐
## │     Deepgram       │
## │                    │
## │ • Multichannel     │
## │ • Transcription    │
## │ • Diarization      │
## │ • Timestamps       │
## └─────────┬──────────┘
## ↓
## TRANSCRIPT CONTRACT
## ↓
## ┌────────────────────┐
## │  Analysis Adapter  │
## └─────────┬──────────┘
## ↓
## ┌────────────────────┐
## │   Gemini Flash     │
## │                    │
│ Structured JSON    │
## └─────────┬──────────┘
## ↓
## MEETING DATA CONTRACT
## ↓
## ┌────────────────────┐
│     React UI       │
## │                    │
## │ Summary            │
## │ Decisions          │
## │ Action Items       │
## │ Transcript         │
## │ Editing            │
## └────────────────────┘
## ↓
## Cleanup Temporary
## Audio

- Key Architectural Principles Locked in 2.1
Principle 1 — Simple frontend, not simplistic architecture
The UI should remain lightweight and smooth while the underlying system maintains clear boundaries.
Principle 2 — Browser handles capture
Audio permissions and browser-specific capture mechanisms remain in the frontend.
Principle 3 — Stereo packing over separate recordings
Use one synchronized recording containing logically isolated microphone and meeting channels.
Principle 4 — Channel separation is not diarization
Separate audio sources reduce the diarization problem but do not eliminate the need to identify multiple speakers within the
meeting channel.
Principle 5 — n8n orchestrates
n8n should automate the processing pipeline without becoming responsible for browser-specific functionality.
Principle 6 — AI produces structured data
The LLM should return schema-constrained meeting intelligence rather than uncontrolled prose.
Principle 7 — Providers are replaceable
Deepgram and Gemini are implementation choices, not architectural dependencies.
Principle 8 — Internal contracts protect the system
Provider responses must be normalized before being consumed by downstream components.
Principle 9 — Temporary audio only
Original meeting recordings should not become permanent application data.
Principle 10 — Do not over-engineer
The architecture must remain simple enough to implement within the 14-hour MVP budget.


## 19. Final Phase 2.1 Decision
The AI Meeting Intelligence MVP will use a lightweight React + Vite frontend with native browser audio APIs. Microphone
audio will be captured through getUserMedia(), while meeting/tab audio will be requested through getDisplayMedia() where
supported. The Web Audio API will combine the two sources into a single stereo stream, with the microphone on the left
channel and meeting audio on the right channel, and MediaRecorder will produce the recording.
Chrome/Edge will be the primary supported browser environment for the MVP. The application will not promise universal
system-audio capture across all browsers or operating systems.
Deepgram will serve as the primary speech-to-text and speaker-diarization provider, using multichannel transcription and
timestamps. The Deepgram-specific response will be normalized into an internal Transcript Contract so that providers such
as AssemblyAI can replace it later without aƯecting downstream components.
Gemini Flash will serve as the primary meeting-analysis model and will produce schema-constrained structured JSON
containing the meeting summary, decisions, and action items with owner, deadline, and priority. Missing information must
remain null rather than being fabricated. OpenAI will remain a potential alternative provider behind the same analysis
boundary.
n8n will serve as the primary orchestration and automation layer. The browser will remain responsible for user interaction
and audio capture, while n8n will coordinate transcription, normalization, AI analysis, validation, processing status, and
cleanup. Meeting processing will be designed as an asynchronous job rather than one long synchronous browser request.
The architecture will use stable internal contracts between audio input, transcription, AI analysis, and presentation layers.
This ensures that individual components can be replaced or modified independently in future versions.
Permanent meeting-audio storage is not required for the MVP; recordings are treated as temporary processing data and
should be deleted after processing.
The final architecture prioritizes reliability, modularity, simplicity, and implementation speed while remaining within the 14-
hour MVP development constraint.
## Phase 2.1 Status
## 꼂꼃꼄 LOCKED
## .
## Phase 2.2 — Internal Data Contracts & Exact Data Flow
Status: 꼂꼃꼄 LOCKED
## Phase: 2 — Technology & Architecture
## Section: 2.2 — Internal Data Contracts & Exact Data Flow
MVP Development Budget: 14 hours

## 1. Purpose
Phase 2.2 defines how information moves between the major components of AI Meeting Intelligence.
Phase 2.1 established the technology choices:
## React + Vite
Browser Audio APIs
Web Audio API
MediaRecorder
## Deepgram
## Gemini Flash
n8n
Phase 2.2 now establishes the data contracts, processing states, error model, provider boundaries, and end-to-end
communication flow between those components.
The objective is to ensure that:
 Components communicate through predictable structures
 Provider-specific responses do not leak into the rest of the application
 The frontend does not depend directly on Deepgram or Gemini
 AI output is predictable and structured
 Missing information is represented explicitly
 Processing can happen asynchronously
 Errors can be communicated clearly to the user
 Components can be replaced without redesigning unrelated parts of the system
 The implementation remains simple enough for the 14-hour MVP

## 2. Contract Architecture
The system will use four major internal contracts:
## Audio Contract
## ↓
## Transcript Contract
## ↓
## Meeting Data Contract

## ↓
Presentation / UI
Supporting these contracts are:
## Speaker Contract
## Job / Processing Contract
## Error Contract
## Provider Interfaces
The overall architecture is:
## Browser
## ↓
## Audio Contract
## ↓
STT Provider
## ↓
## Transcript Contract
## ↓
n8n
## ↓
## Meeting Analysis
## ↓
## Meeting Data Contract
## ↓
React UI

## 3. Audio Contract
## 3.1 Purpose
The Audio Contract defines the format and expectations for audio entering the processing pipeline.
The frontend will produce one audio file rather than maintaining two independent recordings.
## Microphone ───────┐
## ↓
Web Audio API
## ↑
## │
## Meeting Audio ────┘
## ↓
## Stereo Stream
## ↓
MediaRecorder
## ↓
audio.webm

## 3.2 Channel Definition
The stereo recording will use:
## Left Channel  = Local Microphone
## Right Channel = Meeting / Tab Audio
## Conceptually:
## Channel 0
## ↓
## Microphone

## Channel 1
## ↓
## Meeting Audio
This creates source-level separation while maintaining a single synchronized recording.

## 3.3 Audio Input Contract
The internal representation should conceptually contain:
## {
## "audio": {
## "file": "audio.webm",
## "mime_type": "audio/webm",
## "channels": 2
## }
## }
The exact transport mechanism may be multipart/form-data or another appropriate HTTP mechanism during implementation.
The important architectural requirement is:

The downstream processing system receives one audio artifact representing the meeting.
The downstream components should not depend on how the browser created that artifact.

## 3.4 Audio Contract Responsibilities
## Frontend
Responsible for:
 Capturing microphone audio
 Capturing meeting/tab audio
 Combining channels
##  Recording
 Producing the audio file
 Uploading the file
## Processing Layer
Responsible for:
 Validating the audio
 Sending it to the transcription provider
 Processing the provider response
## Transcription Provider
Responsible for:
 Reading the audio
 Transcribing speech
 Processing channels
 Performing speaker diarization
 Producing timestamps

## 4. Transcript Contract
## 4.1 Purpose
The Transcript Contract is the most important boundary between transcription and AI analysis.
The application must not pass provider-specific transcription JSON directly to the LLM.
## Instead:
## Deepgram
## ↓
STT Adapter
## ↓
## Transcript Contract
## ↓
## LLM

## 4.2 Transcript Structure
The transcript will consist of timestamped segments.
## Example:
## {
## "segments": [
## {
## "speaker_id": "speaker_1",
## "start": 12.4,
## "end": 16.8,
"text": "I'll finish the report by Friday."
## },
## {
## "speaker_id": "speaker_2",
## "start": 17.1,
## "end": 20.2,
"text": "I'll review it once it's ready."
## }
## ]
## }

## 4.3 Transcript Segment Fields
Each segment contains:
## Field Purpose
speaker_id Identifies the speaker

## Field Purpose
start Start timestamp in seconds
end End timestamp in seconds
text Spoken content
The transcript therefore preserves:
## WHO
## WHEN
## WHAT

4.4 Speaker ID Rules
Speaker IDs will use stable internal identifiers:
speaker_1
speaker_2
speaker_3
## ...
The UI will display human-readable labels:
## Speaker 1
## Speaker 2
## Speaker 3
This distinction is deliberate.
## Internally:
speaker_1
## Externally:
## Speaker 1
This allows future speaker renaming without modifying the underlying transcript.
For example:
speaker_1
## ↓
## Speaker 1
can later become:
speaker_1
## ↓
## Amrutha
without rewriting transcript segments.

## 5. Speaker Contract
## 5.1 Purpose
The Speaker Contract defines how speakers are represented independently from the transcription provider.
## Example:
## {
## "speaker_id": "speaker_1",
"label": "Speaker 1"
## }
A meeting may contain:
## {
## "speakers": [
## {
## "speaker_id": "speaker_1",
"label": "Speaker 1"
## },
## {
## "speaker_id": "speaker_2",
"label": "Speaker 2"
## },
## {
## "speaker_id": "speaker_3",
"label": "Speaker 3"
## }
## ]
## }

## 5.2 Speaker Identity
The MVP does not attempt to determine real-world identities.
## Therefore:
speaker_1 = Speaker 1

speaker_2 = Speaker 2
speaker_3 = Speaker 3
Automatic name mapping is a future enhancement.

## 5.3 Speaker Ownership
Action-item ownership will reference the stable speaker_id.
## Example:
## {
"task": "Finish the report",
## "owner": "speaker_1"
## }
The UI resolves this to:
## Owner: Speaker 1
This is preferable to storing:
"owner": "Speaker 1"
because the internal ID remains stable if the label changes later.

## 5.4 Unknown Ownership
If the conversation does not provide enough evidence to determine who owns an action item:
## {
"task": "Update the presentation",
"owner": null
## }
null has a specific meaning:
The system could not reliably determine the responsible speaker.
It must not be replaced with a guessed speaker.

## 6. Meeting Data Contract
## 6.1 Purpose
The Meeting Data Contract represents the final structured output of the AI analysis layer.
It is the primary contract consumed by the frontend.
The core structure is:
## Summary
## Decisions
## Action Items
├── task
├── owner
├── deadline
└── priority

## 6.2 Meeting Data Structure
## Conceptually:
## {
"summary": "The team discussed the project launch timeline and agreed on the remaining tasks.",

## "decisions": [
## {
"text": "Launch target is September 10."
## }
## ],

## "action_items": [
## {
"task": "Finish the report",
## "owner": "speaker_1",
## "deadline": "2026-09-11",
## "priority": "high"
## },
## {
"task": "Update the presentation",
"owner": null,
"deadline": null,
## "priority": "medium"
## }
## ]
## }


## 6.3 Summary
The summary is a concise representation of the meeting.
## {
"summary": "The team discussed the project launch timeline and agreed on the remaining tasks."
## }
The summary should be grounded in the transcript.
The system should not invent information that is not supported by the conversation.

## 6.4 Decisions
Decisions represent important conclusions or agreements reached during the meeting.
## Example:
## {
## "decisions": [
## {
"text": "Launch target is September 10."
## },
## {
"text": "CRM changes were approved."
## }
## ]
## }
If no meaningful decisions were identified:
## {
## "decisions": []
## }
No confidence score will be included in the MVP.

## 6.5 Action Items
Each action item contains:
task
owner
deadline
priority
## Example:
## {
"task": "Finish the report",
## "owner": "speaker_1",
## "deadline": "2026-09-11",
## "priority": "high"
## }

## 6.6 Nullable Fields
The system must distinguish between:
## Known
and:
## Unknown
Unknown information should be represented as null.
## Example:
## {
"task": "Update the presentation",
"owner": null,
"deadline": null,
## "priority": "medium"
## }
This rule applies whenever the system cannot reliably determine a value.
The AI must not fabricate:
##  Owners
##  Deadlines
 Other meeting facts

## 6.7 Priority
Priority will use a controlled set of values:
high
medium

low
The LLM should not generate arbitrary priority strings.
If priority cannot be reliably determined, the implementation should preserve the agreed nullable-field principle rather than
inventing a value.
The exact schema validation behavior will be finalized during implementation.

## 7. Processing / Job Contract
## 7.1 Purpose
Meeting processing may take longer than a normal HTTP request.
Therefore, the system will use an asynchronous job model.
The frontend submits the meeting and receives a job_id.
## Frontend
## ↓
## Submit Meeting
## ↓
## Create Job
## ↓
job_id
The frontend can then retrieve the processing state.

## 7.2 Job Structure
## Conceptually:
## {
## "job_id": "abc123",
## "status": "processing"
## }
The job ID uniquely identifies a meeting-processing operation.

## 7.3 Processing States
The MVP will use a small number of meaningful states:
queued
processing
transcribing
analyzing
completed
failed
The UI can map these states to user-friendly descriptions.
## Example:
queued
## ↓
processing
## ↓
transcribing
## ↓
analyzing
## ↓
completed

## 7.4 Frontend Processing Flow
The frontend will conceptually perform:
POST /meeting
## ↓
{ job_id }
## ↓
GET /meeting/{job_id}
## ↓
processing
## ↓
GET /meeting/{job_id}
## ↓
transcribing
## ↓
GET /meeting/{job_id}
## ↓
analyzing
## ↓

GET /meeting/{job_id}
## ↓
completed
## ↓
## Meeting Data
The exact endpoint names are implementation details and are not part of the internal contract.

## 7.5 Completed Job
A completed job exposes the Meeting Data Contract:
## {
## "job_id": "abc123",
## "status": "completed",
## "result": {
## "summary": "...",
## "decisions": [],
## "action_items": []
## }
## }
The frontend consumes result without needing to know which STT or LLM provider generated it.

## 8. Error Contract
## 8.1 Purpose
Errors must be understandable to both:
 The application
 The user
The system therefore uses a two-level error model.

## 8.2 Error Structure
## {
## "status": "failed",
## "error": {
"code": "TRANSCRIPTION_FAILED",
"message": "We couldn't transcribe this meeting."
## }
## }

## 8.3 Internal Error Code
The code is intended for application logic.
## Examples:
## AUDIO_CAPTURE_FAILED
## AUDIO_UPLOAD_FAILED
## INVALID_AUDIO
## TRANSCRIPTION_FAILED
## ANALYSIS_FAILED
## INVALID_AI_OUTPUT
## PROCESSING_TIMEOUT
The exact list may expand during implementation.

8.4 User-Facing Message
The message should be understandable without technical knowledge.
## Example:
## Internal:
## TRANSCRIPTION_FAILED

## User:
"We couldn't transcribe this meeting."
The user should receive enough information to understand which stage failed, without exposing unnecessary technical
implementation details.

## 8.5 Error Handling Principle
The system should fail gracefully.
## Failure
## ↓
## Identify Stage
## ↓

## Create Error Code
## ↓
## Create User Message
## ↓
## Expose Failed Job
## ↓
## Frontend Displays Error
The UI should never simply appear frozen.

## 9. Provider Interfaces
Provider-specific implementations will exist behind capability-based interfaces.

## 9.1 Transcription Provider
## Conceptually:
TranscriptProvider
## │
## ├── Deepgram
## │
└── AssemblyAI
The application depends on:
TranscriptProvider
rather than:
## Deepgram
The provider implementation is responsible for converting its external response into the internal Transcript Contract.
## Provider Response
## ↓
## Provider Adapter
## ↓
## Transcript Contract

## 9.2 Meeting Analysis Provider
## Conceptually:
MeetingAnalyzer
## │
## ├── Gemini
## │
└── OpenAI
The rest of the application depends on:
MeetingAnalyzer
rather than:
## Gemini
The analysis implementation must return the internal Meeting Data Contract.

## 9.3 Provider Independence Rule
A provider-specific response must never become the application's internal data model.
## Incorrect:
Deepgram JSON
## ↓
## Frontend
## Correct:
## Deepgram
## ↓
## Deepgram Adapter
## ↓
## Transcript Contract
## ↓
n8n
and:
## Gemini
## ↓
## Gemini Adapter
## ↓
## Meeting Data Contract
## ↓
## Frontend


- n8n Data Flow
n8n acts as the orchestration layer.
The intended flow is:
n8n
## │
## ┌─────────────┴─────────────┐
## ↓                           ↓
## Receive                    Process
## Job                         Audio
## ↓                           ↓
## Validate                     Transcription
## Request                           ↓
## │                    Normalize Transcript
## │                           ↓
## │                    Meeting Analysis
## │                           ↓
## │                    Validate Output
## │                           ↓
└──────────────→ Store/Expose Result
## ↓
## Cleanup
n8n should coordinate the workflow rather than contain every piece of application logic.

- Frontend ↔ n8n Boundary
The frontend communicates using application-level concepts:
## Create Meeting Job
## Get Job Status
## Get Meeting Result
The frontend should not know:
Deepgram API format
Gemini API format
n8n node structure
provider credentials
This keeps the frontend independent of the implementation details of the processing pipeline.

- Complete End-to-End Sequence
## 12.1 Browser Recording
## User
## ↓
React UI
## ↓
## Start Recording
## ↓
## Request Microphone Permission
## ↓
Request Meeting/Tab Audio
## ↓
## Capture Audio
## ↓
Web Audio API
## ↓
## Stereo Stream
## ├── Left  = Microphone
## └── Right = Meeting Audio
## ↓
MediaRecorder
## ↓
audio.webm
## ↓
User clicks End Meeting
## ↓
## Upload Audio
## ↓
## Create Processing Job
## ↓
Receive job_id

## ↓
## Processing Begins
## ↓
## Deepgram
## ↓
## Speaker-labelled Transcript
## ↓
## Transcript Adapter
## ↓
## Transcript Contract
## ↓
## Gemini
## ↓
## Meeting Data Contract
## ↓
Job marked completed
## ↓
Frontend retrieves result
## ↓
Results displayed
## ↓
User reviews/edits
## ↓
Temporary recording deleted

## 13. Audio Upload Sequence
The upload path uses the same processing system.
## User
## ↓
React UI
## ↓
## Select Audio File
## ↓
## Validate File
## ↓
## Upload
## ↓
## Create Processing Job
## ↓
job_id
## ↓
## Same Processing Pipeline
## ↓
## Transcript
## ↓
AI Analysis
## ↓
## Meeting Data
## ↓
Results UI
The upload path does not create a separate AI pipeline.
This maintains:
## Browser Recording ──┐
## ├──→ Audio Processing
## Audio Upload ───────┘

## 14. Results Editing
The AI-generated Meeting Data Contract is not considered immutable.
The user remains the final authority over the information displayed in the UI.
At minimum:
## Owner
must be editable.
## Example:
## Task:
Finish the report


## Owner:
## [ Speaker 1 ▼ ]

## Deadline:
## Friday

## Priority:
## High
The UI may eventually support editing:
##  Task
##  Deadline
##  Priority
 Decision text
##  Summary
but only owner editing is mandatory for MVP.

## 15. Important Data Ownership Boundaries
The following boundaries are now established:
## Responsibility Owner
Microphone permission Browser
Meeting/tab permission Browser
Audio capture Browser
Audio channel routing Browser
Audio recording Browser
Audio submission Frontend
Workflow orchestration n8n
Transcription STT provider
Speaker diarization STT provider
Transcript normalization STT adapter
Meeting analysis LLM provider
AI output normalization/validation Analysis layer
Job status Processing layer
Result presentation React
Result editing React
Temporary audio cleanup Processing/orchestration layer
This separation prevents components from accumulating unrelated responsibilities.

## 16. Failure Scenarios
The MVP should explicitly handle the following cases.
## Microphone Permission Denied
Capture fails
## ↓
## AUDIO_CAPTURE_FAILED
User receives a clear instruction to allow microphone access.

## Meeting Audio Unavailable
Display capture succeeds
## ↓
No usable meeting audio
## ↓
User is informed
The application should not silently claim that complete meeting audio was captured.

## Audio Upload Failure
Upload fails
## ↓
## AUDIO_UPLOAD_FAILED
The user can retry.

## Transcription Failure

Deepgram fails
## ↓
## TRANSCRIPTION_FAILED
The job becomes:
## {
## "status": "failed",
## "error": {
"code": "TRANSCRIPTION_FAILED",
"message": "We couldn't transcribe this meeting."
## }
## }

AI Analysis Failure
LLM fails
## ↓
## ANALYSIS_FAILED
The user receives an appropriate processing error.

Invalid AI Output
If the LLM does not produce data matching the expected schema:
## LLM
## ↓
## Invalid Output
## ↓
## INVALID_AI_OUTPUT
The application must not blindly render malformed data.

## 17. Modularity Summary
The final modular structure is:
## ┌──────────────────┐
## │    Audio Input   │
## └────────┬─────────┘
## ↓
## Audio Contract
## ↓
## ┌──────────────────┐
│  STT Provider    │
## │    Adapter       │
## └────────┬─────────┘
## ↓
## Transcript Contract
## ↓
## ┌──────────────────┐
## │ Meeting Analyzer │
## │     Adapter      │
## └────────┬─────────┘
## ↓
## Meeting Data Contract
## ↓
## ┌──────────────────┐
## │   Presentation   │
## │       UI         │
## └──────────────────┘
Each provider is replaceable behind an interface.
Each major component consumes a predictable contract.

- What We Are Deliberately NOT Building
To protect the 14-hour MVP budget, Phase 2.2 does not introduce:
##  Microservices
##  Kubernetes
 Message queues
 Complex event buses
 Enterprise API gateways
 Advanced authentication

 Persistent meeting databases
 Complex state-management frameworks
 Separate transcription and diarization infrastructure
 Custom ML models
 Custom speaker-identification systems
The goal is:
Clear contracts without unnecessary infrastructure.

## 19. Phase 2.2 Acceptance Criteria
Phase 2.2 is complete when the following are defined:
##  Audio Contract
 Stereo audio channel definition
##  Transcript Contract
 Timestamp representation
 Speaker ID model
 Speaker label model
 Owner representation
 Unknown owner represented by null
##  Meeting Data Contract
 Summary structure
 Decision structure
 Action-item structure
 Deadline representation
 Priority values
 No confidence field
 Asynchronous job model
 Processing states
##  Error Contract
 Two-level error handling
 Provider abstraction
 STT provider interface
 LLM provider interface
 Frontend/n8n boundary
 Browser recording flow
 Audio upload flow
 End-to-end processing sequence
 Failure scenarios
 Temporary audio lifecycle
 MVP complexity constraints

## 20. Final Phase 2.2 Decision
AI Meeting Intelligence will use stable internal data contracts to connect its major components. The browser will produce
one stereo audio artifact with microphone audio on the left channel and meeting/tab audio on the right channel. This artifact
will enter the processing pipeline through a single audio contract.
The transcription layer will normalize provider-specific output into a Transcript Contract containing timestamped segments
with stable speaker IDs such as speaker_1, speaker_2, and speaker_3. Human-readable labels such as "Speaker 1" will
remain separate from the internal IDs so that speaker names can be introduced later without changing the underlying
transcript.
Meeting analysis will produce a Meeting Data Contract containing a summary, decisions, and action items. Each action item
contains a task, owner, deadline, and priority. Owners reference stable speaker IDs when ownership is known and use null
when the responsible speaker cannot be reliably determined. The system must not fabricate missing information.
Confidence scores are intentionally excluded from the MVP.
Meeting processing will use an asynchronous job model. The frontend submits an audio recording, receives a job ID, and
retrieves the processing state until the job reaches completed or failed. Processing states include queued, processing,
transcribing, analyzing, completed, and failed.
Errors will use a two-level structure consisting of an internal error code and a user-friendly message. This allows the
application to respond programmatically to specific failures while communicating understandable information to the user.

Transcription and AI analysis will be accessed through provider interfaces rather than directly coupling the application to
Deepgram or Gemini. Deepgram and Gemini are therefore replaceable implementations, while AssemblyAI and OpenAI
remain potential alternatives.
n8n will orchestrate the processing workflow, while the React frontend remains responsible for user interaction, audio
capture, upload, processing-state presentation, and result editing. Provider-specific formats and credentials will remain
hidden behind the processing layer.
The architecture deliberately favors simple contracts and clear boundaries over complex infrastructure. No microservices,
message queues, persistent audio storage, or unnecessary database infrastructure will be introduced unless later
implementation evidence proves that they are required.
## Phase 2.2 Status
## 꼂꼃꼄 LOCKED
We now have:
## PHASE 2.1
## Technology Decisions
## ↓
## PHASE 2.2
## Data Contracts & Data Flow
## ↓
## PHASE 3
## Implementation

AI Meeting Intelligence
Phase 2.4 — API & Data Flow
## Phase 2.5 — Implementation Blueprint
Status: 꼂꼃꼄 LOCKED
## Phase: 2.4 + 2.5
MVP Development Budget: 14 hours
Maximum Meeting Duration: 45 minutes

## Part I — Phase 2.4
API & Data Flow
## 1. Purpose
Phase 2.4 defines exactly how information moves through the application.
The central rule is:
Every boundary communicates through a stable application-level contract.
The browser should not know how Deepgram, Gemini, n8n, or any other provider works internally.
The processing layer should not care whether audio came from browser recording or upload.
The results UI should not care which transcription or AI provider generated the data.

- Complete End-to-End Flow
The final MVP flow is:
## USER
## │
## ┌──────────┴──────────┐
## │                     │
## ▼                     ▼
## Browser Recording       Audio Upload
## │                     │
## └──────────┬──────────┘
## ▼
audio.webm
## │
## ▼
API Boundary
## │
## ▼
## Create Job
## │
## ▼
n8n
## │
## ▼
## Process Meeting
## │
## ┌───────┴────────┐
## ▼                ▼

## Audio Validation   Job State
## │
## ▼
## Transcript Provider
(Deepgram)
## │
## ▼
## Transcript Contract
## │
## ▼
## Meeting Analyzer
(Gemini)
## │
## ▼
## Meeting Data Contract
## │
## ▼
## Result Validation
## │
## ▼
Job = completed
## │
## ▼
## React Polls
## │
## ▼
Results UI
## │
## ▼
User Reviews/Edits
## │
## ▼
## Cleanup
## │
## ▼
## Original Audio Deleted
This preserves the core product flow defined in Phase 1: capture/upload → speaker diƯerentiation → transcription → AI analysis →
structured results → user review/edit.

## 3. Two Input Modes, One Pipeline
The application has two ways to obtain audio.
Browser recording
## Microphone
## +
Meeting/Tab Audio
## ↓
Stereo WebM
## Upload
## Existing Audio File
## ↓
## Validation
Both become:
## Audio Input
## ↓
## Same Job
## ↓
## Same Processing Workflow
There must not be separate processing pipelines for recording and upload.

## 4. Audio Contract
The application-level audio artifact is:
audio.webm
For browser recordings:
Left channel  = microphone
Right channel = meeting/tab audio
The browser creates this artifact.

The processing layer receives the artifact and does not need to know how it was captured.

- Job Creation API
The frontend starts processing by creating a meeting-processing job.
## Conceptually:
POST /meetings
The exact deployment URL is not important to the architecture.
The application-level operation is:
createMeetingJob(audio)

## 6. Job Creation Request
The request contains the audio artifact.
## Conceptually:
multipart/form-data
with:
audio = audio.webm
Optional metadata may be included if useful, but the MVP should not add unnecessary fields.
The server/n8n layer creates the job.

## 7. Job Creation Response
The frontend receives:
## {
## "job_id": "job_12345",
## "status": "queued"
## }
The browser now knows:
"My meeting has been accepted and is being processed."
It does not need to know which workflow or provider will process it.

- Job Status API
The frontend polls:
GET /meetings/{job_id}
The response exposes the application-level job state.
## Example:
## {
## "job_id": "job_12345",
## "status": "transcribing"
## }
Possible statuses:
queued
processing
transcribing
analyzing
completed
failed
These statuses were established in the Phase 2.2 Job Contract.

## 9. Status Progression
The normal progression is:
queued
## ↓
processing
## ↓
transcribing
## ↓
analyzing
## ↓
completed
A failure can occur from any processing stage:
queued
processing
transcribing
analyzing
## │
## ▼
failed

The frontend does not need to understand internal node-level failures.

## 10. Polling
The frontend polls approximately every:
2–3 seconds
## Example:
GET job
## ↓
transcribing

wait 3 sec

GET job
## ↓
analyzing

wait 3 sec

GET job
## ↓
completed
Polling stops when the job is:
completed
or:
failed
WebSockets and SSE are intentionally excluded from the MVP.

## 11. Completed Job Response
When processing succeeds:
## {
## "job_id": "job_12345",
## "status": "completed",
## "result": {
## "speakers": [
## {
## "speaker_id": "speaker_1",
"label": "Speaker 1"
## },
## {
## "speaker_id": "speaker_2",
"label": "Speaker 2"
## }
## ],
## "transcript": [
## {
## "speaker_id": "speaker_1",
## "start": 1.2,
## "end": 4.8,
"text": "Let's target Friday for the report."
## }
## ],
## "meeting": {
"summary": "The team discussed the report timeline.",
## "decisions": [
"The report will target Friday."
## ],
## "action_items": [
## {
"task": "Finish the report",
## "owner": "speaker_1",
"deadline": "Friday",
## "priority": "high"
## }
## ]
## }
## }

## }
This is the canonical application result.

## 12. Why Speakers Are Included Separately
The transcript uses:
speaker_id
rather than:
## Speaker 1
as its internal reference.
The separate speaker list provides the mapping:
## {
## "speaker_id": "speaker_1",
"label": "Speaker 1"
## }
This gives us a stable internal identity.
Later, if the product allows the user to rename speakers:
speaker_1 → Amrutha
the transcript and action items can continue referencing:
speaker_1
without restructuring the underlying data.
This directly supports the modularity requirement.

## 13. Transcript Contract
Canonical transcript:
interface TranscriptSegment {
speaker_id: string;
start: number;
end: number;
text: string;
## }
## Example:
## {
## "speaker_id": "speaker_2",
## "start": 15.4,
## "end": 19.7,
"text": "I'll review the proposal tomorrow."
## }
The UI transforms timestamps into a human-readable format.
The backend does not need to store presentation-specific formatting such as:
## [00:15]

## 14. Speaker Contract
Canonical speaker:
interface Speaker {
speaker_id: string;
label: string;
## }
## Example:
## {
## "speaker_id": "speaker_1",
"label": "Speaker 1"
## }
MVP labels remain generic.
Real-name speaker identification is out of scope.

## 15. Meeting Data Contract
Canonical meeting analysis:
interface MeetingData {
summary: string;
decisions: string[];
action_items: ActionItem[];
## }

interface ActionItem {
task: string;
owner: string | null;

deadline: string | null;
priority: "low" | "medium" | "high";
## }
## Example:
## {
"summary": "The team reviewed the launch timeline.",
## "decisions": [
"Launch will proceed Friday."
## ],
## "action_items": [
## {
"task": "Prepare the final presentation",
## "owner": "speaker_2",
"deadline": "Thursday",
## "priority": "high"
## }
## ]
## }

## 16. Unknown Ownership
Ownership must never be guessed.
If the transcript does not establish the responsible speaker:
## {
"owner": null
## }
This is an important product rule, not merely a validation rule.
The user can subsequently assign the owner through the UI.
This follows the Phase 1 principle that AI generates the result while the user remains in control.

## 17. Failed Job Response
A failed job returns:
## {
## "job_id": "job_12345",
## "status": "failed",
## "error": {
"code": "TRANSCRIPTION_FAILED",
"message": "We couldn't transcribe this meeting."
## }
## }
The code is intended for debugging.
The message is intended for the user.

## 18. Error Codes
Initial error categories may include:
## INVALID_AUDIO
## AUDIO_TOO_LONG
## AUDIO_PROCESSING_FAILED
## TRANSCRIPTION_FAILED
## ANALYSIS_FAILED
## INVALID_ANALYSIS_RESULT
## PROCESSING_FAILED
We should not create dozens of error codes during the MVP.
Only meaningful categories should be added.

## 19. Provider Boundary
The application uses two major provider abstractions.
TranscriptProvider
## Input:
## Audio

## Output:
## Transcript Contract
## +
## Speaker Contract
## Implementation:
## Deepgram

Potential alternative:
AssemblyAI
MeetingAnalyzer
## Input:
## Transcript Contract
## +
## Speaker Contract

## Output:
## Meeting Data Contract
## Implementation:
## Gemini
Potential alternative:
OpenAI

## 20. Provider Data Flow
The provider-specific flow is:
Provider-specific output
## │
## ▼
## Adapter Layer
## │
## ▼
## Canonical Application Contract
## │
## ▼
Rest of application
## Therefore:
Deepgram response
## ↓
## Transcript Adapter
## ↓
## Transcript Contract
and:
Gemini response
## ↓
## Analysis Adapter
## ↓
## Meeting Data Contract
This is one of the most important modularity decisions in the project.

- n8n Internal Processing Flow
The Process Meeting workflow should conceptually look like:
Webhook / API Trigger
## ↓
Create / identify job
## ↓
Validate audio
## ↓
status = processing
## ↓
status = transcribing
## ↓
TranscriptProvider
## ↓
Normalize transcript
## ↓
## Validate Transcript Contract
## ↓
status = analyzing
## ↓
MeetingAnalyzer
## ↓
## Validate Meeting Data Contract
## ↓
status = completed

## ↓
Return result
## ↓
## Cleanup

## 22. Cleanup Flow
Cleanup is deliberately separate.
## Process Meeting
## ↓
## Completed / Failed
## ↓
## Cleanup
## ↓
Delete temporary audio
The original recording should not become persistent application data.
The intended lifecycle is:
## Audio
## ↓
Temporary processing
## ↓
## Transcript + Meeting Data
## ↓
Audio deleted
This matches the locked MVP requirement.

## 23. Result Editing Flow
AI generation and user editing are separate concepts.
## Initial:
## AI
## ↓
## Meeting Data
## ↓
## UI
User modifies owner:
## Speaker 2
## ↓
User selects Speaker 1
## ↓
Updated result
The UI should not re-run the AI just because a user changes an owner.
This prevents unnecessary AI calls and keeps the user in control.

- What the Frontend Knows
The frontend knows:
## Audio
## Job
## Job Status
## Speakers
## Transcript
## Meeting Data
## Errors
The frontend does NOT know:
Deepgram API details
Gemini API details
n8n node structure
Provider credentials
Provider-specific response formats
Internal workflow implementation

- What n8n Knows
n8n knows:
How to process audio
Which transcription provider to use
How to normalize provider output
Which analysis provider to use
How to validate results

How to update job status
How to perform cleanup
n8n does NOT own:
Browser recording UI
React state
Results presentation
User interaction

Part II — Phase 2.5
## Implementation Blueprint
## 26. Purpose
Phase 2.5 translates the architecture into an implementation sequence.
The goal is to build the smallest working version of each layer and connect them progressively.
We will not ask Codex to build the entire application in one shot.

## 27. Implementation Strategy
The build should proceed through vertical slices.
Instead of:
Build entire frontend
Build entire backend
Build entire n8n
Build everything
we use:
Small component
## ↓
## Test
## ↓
## Connect
## ↓
## Test
## ↓
Next component
This reduces debugging complexity.

## 28. Build Milestone 1 — Project Foundation
## Create:
## React
## Vite
TypeScript
Create the agreed structure:
src/
├── components/
## │   ├── Recorder/
│   ├── ProcessingStatus/
## │   ├── Results/
## │   └── Transcript/
## │
├── audio/
│   └── recorder.ts
## │
├── api/
│   └── meetingApi.ts
## │
├── contracts/
│   └── types.ts
## │
## ├── App.tsx
## │
└── styles/
└── global.css
Do not add unnecessary architecture.

## 29. Build Milestone 2 — Contracts First
Implement the TypeScript contracts before provider integrations.
At minimum:

## Speaker
TranscriptSegment
ActionItem
MeetingData
JobStatus
## Job
ProcessingError
MeetingResult
These become the shared vocabulary of the application.

## 30. Build Milestone 3 — Audio Recorder
## Implement:
audio/recorder.ts
## Responsibilities:
Request permissions
## ↓
Capture microphone
## +
Capture meeting/tab audio
## ↓
Route channels
## ↓
MediaRecorder
## ↓
audio.webm
## ↓
Release streams
The module should expose a small API to the React layer.

## 31. Audio Recorder Interface
## Conceptually:
startRecording(): Promise<void>

stopRecording(): Promise<Blob>

isRecording(): boolean
The exact implementation may diƯer.
The important point is that React should not directly manipulate:
MediaStream
AudioContext
MediaRecorder
throughout the UI.
Those concerns belong inside the audio module.

- Build Milestone 4 — Recording UI
Create the simplest usable recording screen.
## States:
## Idle
## Recording
## Stopping
## Uploading
## Example:
## ┌─────────────────────────────┐
│      AI Meeting Assistant   │
## │                             │
│      Ready to record        │
## │                             │
## │       [ Start Meeting ]     │
## │                             │
## │       [ Upload Audio ]      │
## └─────────────────────────────┘
During recording:
## ┌─────────────────────────────┐
## │       Meeting Recording     │
## │                             │
## │          12:34              │

## │                             │
## │        ● Recording          │
## │                             │
## │       [ End Meeting ]       │
## └─────────────────────────────┘
Do not spend significant time on visual polish yet.

## 33. Build Milestone 5 — Upload
## Add:
## Upload Audio
The upload path should produce the same application-level audio input expected by the processing pipeline.
Basic validation:
file exists
supported type
reasonable size
duration <= 45 minutes
usable audio

- Build Milestone 6 — API Boundary
## Implement:
api/meetingApi.ts
## Conceptually:
createMeeting(audio)
getMeetingStatus(jobId)
getMeetingResult(jobId)
The React components should use these functions.
They should not contain raw fetch() calls for each operation.

## 35. Build Milestone 7 — Job Creation
Connect the frontend to the API/n8n layer.
## Flow:
## Audio
## ↓
createMeeting(audio)
## ↓
job_id
## ↓
Processing UI
At this point we have the first real asynchronous application flow.

## 36. Build Milestone 8 — Polling
## Implement:
job_id
## ↓
poll
## ↓
status
## ↓
poll
## ↓
status
The UI displays:
Processing your meeting...

Transcribing conversation...
## Then:
Analyzing meeting...
## Then:
## Complete
The status should correspond to the canonical Job Contract.

- Build Milestone 9 — n8n Process Meeting
Create the first n8n workflow:
## Process Meeting
Initial responsibility:
## Receive

## ↓
## Validate
## ↓
## Transcribe
## ↓
## Normalize
## ↓
## Analyze
## ↓
## Validate
## ↓
## Complete
Do not split these into separate workflows yet.

## 38. Build Milestone 10 — Deepgram
Connect the transcription provider.
The first test should use a very short recording.
Recommended progression:
30–60 second audio
## ↓
## Deepgram
## ↓
## Transcript
Only after that works should we test longer meetings.

## 39. Build Milestone 11 — Normalize Transcript
Convert provider output into:
## {
## "speaker_id": "speaker_1",
## "start": 1.2,
## "end": 4.8,
"text": "Hello everyone."
## }
This is the point where provider-specific output becomes application data.

## 40. Build Milestone 12 — Gemini Analysis
Send the canonical transcript to the analysis provider.
The analysis prompt must require:
summary
decisions
action_items
and each action item:
task
owner
deadline
priority
The model must be instructed not to fabricate ownership.

## 41. Build Milestone 13 — Structured Output Validation
The AI response must be checked before being considered a successful result.
For example:
Is summary present?
Are decisions an array?
Are action_items an array?
Does every action item contain task?
Is owner valid or null?
Is priority valid?
If validation fails:
analysis_failed
or:
invalid_analysis_result
rather than silently passing malformed data to the UI.

- Build Milestone 14 — Results UI
Once a completed result is available, render:
## Summary

## Decisions
## Action Items
## Transcript
This corresponds directly to the Phase 1 results requirement.

## 43. Build Milestone 15 — Owner Editing
Implement owner editing first.
## Example:
## Action Item

Prepare final presentation

## Owner:
## [ Speaker 2 ▼ ]

## Deadline:
## Thursday

## Priority:
## High
The user can change:
## Speaker 2
to:
## Speaker 1
or:
## Unassigned
which maps internally to:
"owner": null
Other fields may become editable later if time remains.
The Phase 1 requirement specifically prioritizes owner editing.

## 44. Build Milestone 16 — Transcript Rendering
## Render:
## [00:01] Speaker 1
Let's target Friday.

## [00:06] Speaker 2
That works for me.
The transcript should be readable rather than attempting to imitate a professional transcription platform.

## 45. Build Milestone 17 — Cleanup
Create the second n8n workflow:
## Cleanup
Its job is simply:
Delete temporary audio
The cleanup operation must not interfere with the results already generated.

## 46. Build Milestone 18 — Failure Handling
## Test:
Invalid audio
Invalid audio file.
Audio too long
This meeting is longer than the 45-minute MVP limit.
Transcription failure
We couldn't transcribe this meeting.
Analysis failure
We couldn't analyze this meeting.
No usable audio
No usable audio was detected.
The application should fail gracefully rather than displaying raw provider errors.

## 47. Build Milestone 19 — Automated Tests
Automate the deterministic parts.
Contract tests
## Verify:
TranscriptSegment

ActionItem
MeetingData
## Job
API tests
## Verify:
create job
poll status
completed result
failed result
UI tests
## Verify:
Processing state
Completed state
Failed state
Owner editing
Result rendering
Do not spend large amounts of time attempting to automate every browser audio scenario.

- Build Milestone 20 — Manual End-to-End Test
Perform a real test:
Open application
## ↓
## Start Meeting
## ↓
Grant permissions
## ↓
## Speak
## ↓
Use second audio source if available
## ↓
## Stop
## ↓
## Processing
## ↓
## Transcript
## ↓
## Analysis
## ↓
## Results
## ↓
Edit owner
## ↓
Verify cleanup
This is the most important final test.

## 49. Implementation Priority
If time becomes limited, follow this order:
P0 — Must work

Browser audio capture
Audio upload
45-minute validation
Speaker diƯerentiation
## Transcript
## Summary
## Decisions
Action items
## Owner
## Deadline
## Priority
Processing status
Results UI
Owner editing
## Cleanup



## P1 — Important

Error handling
Automated tests
## Polish
## Deployment


P2 — Nice to have

Editing additional fields
Advanced UI
Additional provider fallback
Advanced validation
The Phase 1 scope rule remains:
If something threatens the 14-hour deadline, simplify or remove it rather than compromising the core pipeline.

- The First End-to-End Vertical Slice
Before building the complete application, we should aim for this:
30-second audio
## ↓
## Upload
## ↓
## Create Job
## ↓
n8n
## ↓
## Deepgram
## ↓
## Transcript Contract
## ↓
## Gemini
## ↓
## Meeting Data Contract
## ↓
## Completed Job
## ↓
## React
## ↓
## Display Summary
Once this works, the fundamental architecture has been proven.
Then we improve:
## Upload
## ↓
## Browser Recording
## ↓
## Speaker Separation
## ↓
## Full Results
## ↓
## Editing
## ↓
## Cleanup

- Important Development Rule for Codex
Codex should not be instructed to redesign the architecture while implementing individual pieces.
The implementation instructions should be:
Implement the requested component within the existing contracts and boundaries. Do not introduce new frameworks, services,
databases, state-management libraries, or architectural layers unless explicitly requested.
This prevents accidental over-engineering.

- Another Important Rule for Codex
When changing one component:
Do not modify unrelated components merely to make the implementation easier.
For example:
If changing the transcription provider:

## Allowed:
TranscriptProvider implementation
Provider configuration
Provider-specific adapter
Not normally allowed:
Rewrite React UI
Rewrite transcript rendering
Change MeetingData schema
Change action-item UI
This protects the modular architecture.

- API Boundary as the Long-Term Stable Interface
Even if the MVP eventually uses:
React → n8n webhook
the frontend must behave as though it is communicating with:
Meeting API
## Conceptually:
## React
## ↓
meetingApi.ts
## ↓
Application API
## ↓
## Processing System
This means a future migration from:
n8n
to:
custom backend
does not require rewriting the React application.

## 54. Future Replacement Examples
## Replace Deepgram
## Deepgram
## ↓
AssemblyAI
The Transcript Contract stays unchanged.

## Replace Gemini
## Gemini
## ↓
OpenAI
The Meeting Data Contract stays unchanged.

Replace n8n
n8n
## ↓
Custom backend / worker
The frontend API stays conceptually unchanged.

## Add Zoom
## Future:
Zoom recording
## ↓
Audio/Input Adapter
## ↓
## Existing Processing Pipeline
No new AI pipeline is necessary.

## Add Persistent Storage
## Future:
## Temporary Result
## ↓
## Storage Adapter
## ↓
Database/Object Storage
The UI does not need to know which storage technology is used.


- What We Are Deliberately NOT Doing
Even though the architecture is modular, we are not creating:
Audio microservice
Transcription microservice
Diarization microservice
Analysis microservice
Results microservice
Job microservice
Storage microservice
That would be inappropriate for this MVP.
The architecture is modular inside a small system.

## 56. Final Data Contracts
The MVP's core data vocabulary is:
## Audio Contract
## ↓
## Transcript Contract
## ↓
## Speaker Contract
## ↓
## Meeting Data Contract
## ↓
## Job Contract
## ↓
## Error Contract
These are the interfaces that protect the system from provider-specific coupling.

- Final API Operations
The application needs only a small number of operations:
createMeeting(audio)
## ↓
job_id

getMeetingStatus(job_id)
## ↓
status

getMeetingResult(job_id)
## ↓
result
Editing is handled separately at the UI/application level.
No unnecessary REST API surface should be created.

## 58. Final Application State Machine
The frontend state can be represented as:
## ┌─────────┐
## │  IDLE   │
## └────┬────┘
## │
## Start / Upload
## │
## ▼
## ┌──────────────┐
## │  RECORDING   │
## └──────┬───────┘
## │
## Stop
## │
## ▼
## ┌──────────────┐
## │   UPLOADING  │
## └──────┬───────┘
## │
## ▼
## ┌──────────────┐

## │  PROCESSING  │
## └──────┬───────┘
## │
## ┌──────┴──────┐
## │             │
## ▼             ▼
## ┌──────────┐   ┌─────────┐
## │ RESULTS  │   │  ERROR  │
## └──────────┘   └─────────┘
Within PROCESSING, the displayed backend status may be:
queued
processing
transcribing
analyzing

## 59. Final Acceptance Criteria
Phase 2.4 + 2.5 is considered complete when the implementation plan clearly defines:
 Browser recording flow
 Audio upload flow
 Shared processing pipeline
##  Audio Contract
 Job creation
 Job ID
 Job statuses
##  Polling
 Completed result structure
 Error structure
##  Transcript Contract
##  Speaker Contract
##  Meeting Data Contract
 Owner null behavior
 Provider adapter boundary
 n8n processing boundary
 Cleanup flow
 Frontend API boundary
 Result editing flow
 Implementation sequence
 Testing strategy
 MVP priority order
 Modularity/replacement rules
 Codex implementation rules

## 60. Final Architecture
The final system can now be understood as five major layers:
## ┌──────────────────────────────────────────┐
## │              PRESENTATION                │
## │                                          │
│ React / TypeScript / Results UI          │
## └────────────────────┬─────────────────────┘
## │
## ▼
## ┌──────────────────────────────────────────┐
## │                 API                      │
## │                                          │
│ meetingApi.ts / Application API          │
## └────────────────────┬─────────────────────┘
## │
## ▼
## ┌──────────────────────────────────────────┐
## │              ORCHESTRATION               │

## │                                          │
│ n8n / Process Meeting / Cleanup          │
## └────────────────────┬─────────────────────┘
## │
## ┌──────────┴──────────┐
## ▼                     ▼
## ┌──────────────────┐   ┌──────────────────┐
## │ TRANSCRIPT       │   │ ANALYSIS         │
## │                  │   │                  │
│ Transcript       │   │ MeetingAnalyzer  │
## │ Provider         │   │                  │
## │                  │   │ Gemini           │
## │ Deepgram         │   │                  │
## └────────┬─────────┘   └────────┬─────────┘
## │                      │
## ▼                      ▼
## ┌──────────────────────────────────────────┐
## │          CANONICAL CONTRACTS             │
## │                                          │
## │ Transcript / Speaker / Meeting Data      │
## │ Job / Error                              │
## └──────────────────────────────────────────┘

## 61. The Most Important Architectural Rule
The entire system should follow this principle:
Capture once, normalize once, analyze once, and communicate through stable contracts.
The browser does not know the AI provider.
The AI provider does not know the UI.
The UI does not know n8n's internal workflow.
n8n does not know how the browser captured the audio.
And the provider's proprietary response format never becomes the application's permanent data model.

## 62. Phase 2.4 + 2.5 Conclusion
The architecture is now suƯiciently concrete to begin implementation.
We have deliberately avoided premature infrastructure while still creating strong modular boundaries.
The MVP therefore has:
ONE frontend
ONE application API boundary
TWO n8n workflows
TWO provider abstractions
ONE canonical contract system
ONE shared processing pipeline
The two workflows are:
## 1. Process Meeting
## 2. Cleanup
The two primary provider abstractions are:
TranscriptProvider
MeetingAnalyzer
The two input modes are:
## Browser Recording
## Audio Upload
And both inputs converge on the same pipeline:
## Audio
## ↓
## Job
## ↓
Transcription + Speaker DiƯerentiation
## ↓
## Transcript Contract
## ↓
AI Analysis
## ↓
## Meeting Data Contract
## ↓
## Results
## ↓

## User Editing
## ↓
## Cleanup
This gives us a small MVP that can be implemented quickly while preserving the ability to replace individual components later.
## 꼂꼃꼄 PHASE 2.4 + 2.5 — LOCKED
The next step is no longer architecture design.
It is implementation.
Before we ask Codex to build the entire thing, we should start with the first concrete slice:
Create the React/Vite/TypeScript project + contracts + minimal application shell.
Then we build the audio recorder separately and test it before connecting the AI pipeline.

AI Meeting Intelligence
## Phase 2.6 — Development Environment, Tooling & Execution Plan
Status: 꼂꼃꼄 LOCKED
Phase: 2.6 — Final Pre-Implementation Phase
MVP Development Budget: 14 hours
Maximum Meeting Duration: 45 minutes

## 1. Purpose
Phase 2.6 defines the practical development environment, tooling, coding workflow, testing process, repository structure, and time-
management rules that will be used to implement the AI Meeting Intelligence MVP.
This is the final planning phase.
After Phase 2.6 is locked, the project moves into implementation.
No additional architecture phase is planned unless an actual implementation problem requires a decision.

## 2. Repository Structure
The project will use a single repository.
ai-meeting-intelligence/
├── frontend/
├── n8n/
├── docs/
└── README.md
This provides one source of truth for the MVP while keeping the major components clearly separated.
The repository is intentionally not split into multiple repositories because the MVP is small and being developed as one portfolio
project.

## 3. Package Manager
The project will use:
npm
No alternative package manager will be introduced unless a specific implementation requirement makes it necessary.

## 4. Node.js
The project will use the current Node.js LTS release available when implementation begins.
The selected version should be documented in the project setup so the development environment is reproducible.

## 5. Local Development Architecture
n8n will be developed locally.
The development environment will therefore be:
## ┌──────────────────┐
## │ React + Vite     │
│ localhost        │
## └────────┬─────────┘
## │
## ▼
## ┌──────────────────┐
│ Local n8n        │
## │ Docker           │
## └────────┬─────────┘
## │
## ▼
AI Providers
This keeps development independent of a hosted production environment.
The user already has Docker installed.

- n8n Development Environment

n8n will run through Docker during development.
The initial goal is a simple reproducible setup rather than a complex container architecture.
The project should be able to document:
How to start n8n
How to stop n8n
How to access n8n
How to configure credentials
How to import workflows
The n8n workflow definitions should be kept with the project where practical.

## 7. Frontend ↔ Processing Layer
The preferred MVP connection is:
## React
## ↓
Application API
## ↓
n8n
However, the API layer is subject to the MVP time constraint established in Phase 2.3.
The implementation rule is:
Build the small API layer if it can be implemented quickly and stably. If it becomes disproportionately expensive or introduces
instability, use the direct n8n webhook approach.
The frontend continues to communicate through:
src/api/meetingApi.ts
so that the rest of the application remains insulated from the implementation detail.

## 8. Environment Variables
Configuration will use environment files.
The project will maintain:
## .env
## .env.example
.env must not be committed to Git.
.env.example documents the variables required to run the application without containing real secrets.

## 9. Frontend Configuration
Frontend environment variables may contain non-sensitive configuration.
## Example:
## VITE_API_URL
The frontend must never contain provider credentials.

## 10. Provider Secrets
Provider API keys remain server-side/n8n-side.
## Examples:
## DEEPGRAM_API_KEY
## GEMINI_API_KEY
These must never be exposed through the browser.
The project must specifically avoid patterns such as:
## VITE_DEEPGRAM_API_KEY
## VITE_GEMINI_API_KEY
because VITE_* variables are intended for browser-visible configuration.

## 11. Git Strategy
The project will use a simple:
main
branch for the MVP.
Feature-branch management is not required for this project.
The priority is maintaining clear, recoverable milestones without introducing unnecessary process.

## 12. Commit Strategy
Commits will be organized around meaningful milestones.
## Example:
Initialize React project
Add canonical contracts
Implement audio recorder
Add upload flow
Connect job API
Add transcription

Add analysis
Add results UI
Add owner editing
Add cleanup
Add tests
Commits should represent a meaningful state of the application.
The goal is to make it possible to return to a known-good state if a later change causes a problem.

## 13. Antigravity Development Strategy
Antigravity will be used as the primary coding/implementation assistant.
The project will not ask Antigravity to blindly build the entire MVP in one operation.
Instead, development will happen through controlled implementation tasks.
## Example:
## Task 1
Project foundation

## ↓
## Test

## Task 2
## Contracts

## ↓
## Test

## Task 3
Audio recorder

## ↓
## Test

## Task 4
Upload/API

## ↓
## Test

## ...
This preserves control over the architecture and makes failures easier to isolate.

## 14. Antigravity Implementation Rule
Antigravity must implement requested functionality within the existing architecture and contracts.
It should not independently redesign the system.
The instruction for implementation tasks should eƯectively be:
Implement the requested functionality within the existing architecture and canonical contracts. Do not introduce new frameworks,
databases, services, state-management libraries, or architectural layers unless explicitly approved.

## 15. Antigravity Change Boundary
A strict change boundary is established.
When implementing a task, Antigravity should not modify unrelated components simply because doing so is easier.
For example:
Audio task
May modify:
audio/
Recorder component
related audio tests
Should not arbitrarily modify:
Meeting analysis
Results UI
Job contract
n8n architecture
Transcription task
May modify:
TranscriptProvider
Deepgram adapter
transcript normalization

related tests
Should not rewrite:
React recording UI
## Meeting Data Contract
Action Item UI
If a cross-component architectural change genuinely becomes necessary, Antigravity should explain the reason before making the
change.

## 16. Testing Checkpoint Rule
Testing happens after each meaningful implementation milestone.
The development loop is:
## Implement
## ↓
## Test
## ↓
## Fix
## ↓
## Verify
## ↓
## Commit
## ↓
Next milestone
We do not intentionally accumulate a large number of untested components before integration.

## 17. Browser Support
The primary browser targets are:
## Chrome
## Edge
These are the MVP's supported browser environments.
Firefox and Safari are not required for MVP validation.

## 18. Audio Testing Strategy
Testing will use two categories of audio.
Controlled test audio
Short recordings designed to test specific behavior.
## Examples:
30–60 second recording
single speaker
multiple speakers
known timestamps
known action item
Real browser meeting audio
Actual recordings using the browser capture flow.
This is necessary because browser permissions, meeting/tab audio, microphone routing, and real-world audio conditions cannot be
fully validated using synthetic test data alone.

## 19. Provider Implementation Strategy
The MVP implements the primary providers first.
## Transcription
## Deepgram
## Analysis
## Gemini
The fallback providers:
AssemblyAI
OpenAI
are not implemented initially.
The interfaces will still preserve provider independence.
The fallback providers can therefore be added later without redesigning the application.

## 20. Provider Testing Strategy
Provider integration should initially be tested with short recordings.
Recommended progression:
Short controlled audio
## ↓
## Provider
## ↓

Canonical output
## ↓
## Validation
Only after the short path works should we move to full meeting-length recordings.
This prevents a long recording from obscuring a basic integration problem.

## 21. Logging
The system will use simple structured development logs.
## Examples:
## JOB_CREATED
## JOB_PROCESSING
## TRANSCRIPTION_STARTED
## TRANSCRIPTION_COMPLETED
## ANALYSIS_STARTED
## ANALYSIS_COMPLETED
## CLEANUP_COMPLETED
## PROCESSING_FAILED
Logs should contain enough information to diagnose failures.
The system should avoid logging unnecessary sensitive meeting content.
Raw audio should not be logged.
Raw API credentials must never be logged.

## 22. README
The repository will contain one primary:
README.md
It should explain:
What the project does
Architecture overview
Repository structure
## Prerequisites
How to run the frontend
How to run n8n
Environment variables
How to run tests
How to run the complete application
The README should remain concise.
It is not intended to become a full technical book.

## 23. Architecture Documentation
The repository will also contain project documentation.
Initial structure:
docs/
├── phase-1.md
├── phase-2-architecture.md
└── contracts.md
These documents preserve the architectural decisions made during planning.
This is particularly useful for the portfolio/interview aspect of the project because it demonstrates not only the final implementation
but also the reasoning behind the system design.

## 24. Documentation Principle
Documentation should explain decisions, not document every line of code.
## Useful:
Why audio is stereo
Why speaker IDs are stable
Why n8n is used
Why providers are behind adapters
Why polling is used
Why there is no database
Why browser recording and upload share one pipeline
Not necessary:
This function calls this other function...
This variable stores...
unless the implementation is unusually complex.

- 14-Hour Hard Limit
The MVP development budget remains:

14 hours
This is a hard limit.
If implementation takes longer than expected, the solution is:
## Simplify
## ↓
## Defer
## ↓
## Cut
not:
Expand the project indefinitely

- Proposed 14-Hour Execution Budget
The initial allocation is:
## Time Work
0–1 hr Project setup + contracts
1–3 hr Browser audio capture
3–4 hr Upload + API/job creation
4–6 hr n8n + transcription
6–8 hr Speaker-labelled transcript
8–10 hr Gemini analysis
10–11 hr Results UI
11–12 hr Editing + error handling
12–13 hr Cleanup + testing
13–14 hr End-to-end testing + polish
This is an initial working allocation, not a requirement that every stage consume exactly that amount.
If one area finishes early, the remaining time can be moved to another area.

## 27. Priority During Time Pressure
The following must be protected.
## Core
Browser recording
Audio upload
45-minute validation
Speaker diƯerentiation
## Transcript
## Summary
## Decisions
Action items
## Owner
## Deadline
## Priority
Processing status
Results UI
Owner editing
## Cleanup
First things to cut
Visual polish
Additional editing
Advanced validation
Non-critical automated tests
Fallback providers
Extra deployment polish
The core meeting-intelligence pipeline takes priority over convenience or polish.

- MVP Kill-Switch Rules
If the project is running behind schedule:
## First
Remove visual polish.
## Second
Remove non-essential editing.
## Third
Reduce automated testing to critical deterministic paths.
## Fourth

Defer fallback providers.
## Fifth
Simplify deployment.
Never sacrifice
## Recording
## Upload
## Transcription
Speaker diƯerentiation
## Analysis
## Results
Processing status
Owner editing
## Cleanup
The goal is a complete working product rather than an incomplete product with sophisticated infrastructure.

- Definition of Done
The MVP is considered complete when a user can:
- Open the web application.
- Start a browser meeting recording or upload audio.
- Process an audio input within the 45-minute limit.
- See processing status.
- Receive a speaker-labelled transcript.
- See a meeting summary.
- See decisions.
- See action items.
- See owner, deadline, and priority for action items.
- See null/unassigned ownership when the owner cannot be determined.
- Edit an action-item owner.
- Receive a useful user-facing error if processing fails.
- Have the original temporary recording cleaned up.
Most importantly:
The complete flow must work end-to-end with real audio.

## 30. Checkpoint 1 — Foundation
Before proceeding to audio capture, verify:
React runs
TypeScript compiles
Folder structure exists
Contracts compile
Basic UI renders
Git repository works
Environment configuration works
If this checkpoint fails, do not proceed.

## 31. Checkpoint 2 — Audio
## Verify:
Microphone permission works
Meeting/tab audio permission works
Recording starts
Recording stops
Stereo artifact is produced
Recording can be uploaded
Streams are cleaned up
A short real recording must work before proceeding.

## 32. Checkpoint 3 — Transcription
## Verify:
Audio reaches n8n
Deepgram receives audio
Transcription succeeds
Speaker diƯerentiation succeeds
Transcript is normalized
Canonical Transcript Contract is produced
A short multi-speaker test should be used.

## 33. Checkpoint 4 — Analysis

## Verify:
Canonical transcript reaches Gemini
Structured output is returned
Meeting Data Contract validates
Summary exists
Decisions exist
Action items exist
Owner values are valid or null
Priority values are valid

## 34. Checkpoint 5 — Results
## Verify:
Processing state changes correctly
Completed result appears
Summary renders
Decisions render
Action items render
Transcript renders
Owner can be edited

- Checkpoint 6 — Full End-to-End
Perform a real meeting test:
Open app
## ↓
## Start Meeting
## ↓
Grant permissions
## ↓
## Record
## ↓
## Stop
## ↓
## Upload/process
## ↓
## Transcribe
## ↓
DiƯerentiate speakers
## ↓
## Analyze
## ↓
Display results
## ↓
Edit owner
## ↓
## Cleanup
This is the final acceptance test.

## 36. Recovery Strategy
Because implementation will happen incrementally, every major milestone should leave the repository in a usable state.
If a later implementation breaks the application:
Identify last known-good commit
## ↓
## Revert/fix
## ↓
Re-establish working state
## ↓
## Continue
This is one of the reasons milestone-based commits are required.

## 37. Architectural Change Rule
During implementation, unexpected problems may require changes.
Not every implementation detail needs to be frozen forever.
However, architectural changes should meet at least one of these conditions:
 Required to make a locked requirement work.
 Required because the selected technology cannot reliably perform the intended function.

 Significantly simplifies the implementation without weakening the architecture.
 Required for stability/security.
Otherwise, defer the change.
This prevents scope drift.

## 38. No Unapproved Architecture Expansion
The implementation should not spontaneously introduce:
## Database
## Redis
## Redux
## Microservices
Message queues
WebSockets
Additional backend services
Additional providers
## Authentication
Persistent recording storage
unless explicitly approved.
The existence of a possible future requirement is not suƯicient justification for adding infrastructure now.

## 39. Implementation Assistant Instruction
The following principle applies whenever Antigravity is used:
Build the smallest correct implementation that satisfies the locked specification.
It should prioritize:
## Correctness
## Stability
Contract compliance
## Simplicity
## Testability
over:
## Complexity
## Generality
Premature optimization
Additional frameworks

## 40. Learning While Building
Although Antigravity will perform the coding, implementation should not become a black box.
For significant components, we should understand:
What was built?
Why was it built this way?
What contract does it expose?
What can fail?
How do we test it?
How could we replace it later?
This is particularly important for the portfolio/interview objective.
The goal is not merely:
"AI wrote the application."
The goal is:
"I designed the architecture, made the engineering decisions, directed the implementation, tested it, and understand how the
system works."

## 41. Final Development Loop
The complete working loop is:
## PLAN
## ↓
## IMPLEMENT
## ↓
## UNDERSTAND
## ↓
## TEST
## ↓
## FIX
## ↓
## COMMIT
## ↓

## NEXT COMPONENT
This loop will be repeated throughout Phase 3.

## 42. Final Phase 2 Structure
The complete technical planning phase is now:
## PHASE 2 — TECHNICAL DESIGN

## 2.1 Technical Architecture Decisions
## ↓
## 2.2 Contracts & Interfaces
## ↓
## 2.3 Implementation Architecture
## ↓
2.4 API & Data Flow
## ↓
## 2.5 Implementation Blueprint
## ↓
## 2.6 Development Environment,
## Tooling & Execution Plan
## ↓
## 띙띚띞띟띛띜띝 IMPLEMENTATION
There is intentionally no additional architecture phase after 2.6.

## 43. Final Locked Decisions
## Area Decision
Repository Single repository
Package manager npm
Node Current LTS
Local n8n Yes
n8n runtime Docker
Frontend/API API layer if quick + stable; otherwise direct n8n
Environment config .env + .env.example
Provider secrets Server-side/n8n-side
Git branch main
## Commits Milestone-based
Coding assistant Antigravity
Coding method Small controlled tasks
Unrelated changes Prohibited without justification
Testing After every milestone
Browser targets Chrome + Edge
Audio testing Controlled + real audio
Providers initially Deepgram + Gemini
Fallback providers Deferred
Logging Simple structured logging
Documentation README + architecture docs
Architecture docs Stored in repository
MVP time Hard 14-hour limit
Scope protection Core pipeline protected
Definition of Done End-to-end real-audio flow

## 44. Final Locked Execution Plan
The project is now ready to transition from planning into implementation.
The first implementation sequence is:
- Create repository
## ↓
- Initialize React + Vite + TypeScript
## ↓
- Establish folder structure

## ↓
- Create canonical contracts
## ↓
- Verify foundation
## ↓
- Build browser audio recorder
## ↓
- Test real audio capture
## ↓
- Build upload/API path
## ↓
- Build n8n processing workflow
## ↓
## 10. Integrate Deepgram
## ↓
- Normalize transcript
## ↓
## 12. Integrate Gemini
## ↓
## 13. Validate Meeting Data
## ↓
- Build results UI
## ↓
- Add owner editing
## ↓
- Add cleanup
## ↓
- Test failure paths
## ↓
- Full end-to-end test
## ↓
- Polish only if time remains

## 45. Phase 2.6 Conclusion
Phase 2.6 establishes the final practical rules for building the MVP.
The architecture remains modular, but the development process remains deliberately lightweight.
The project will use:
One repository
One frontend
Local Docker n8n
Two n8n workflows
Two primary provider integrations
Canonical contracts
Milestone-based development
Antigravity-assisted implementation
Automated + manual testing
14-hour hard limit
The project will now stop expanding its planning scope.
The next phase is implementation.
## 꼂꼃꼄 PHASE 2.6 — LOCKED
## 띙띚띞띟띛띜띝 PHASE 2 — COMPLETE
## Next: Phase 3 — Implementation
