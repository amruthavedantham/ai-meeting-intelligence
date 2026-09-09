process.env.NODE_ENV = "test";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "http";
import path from "path";
import fs from "fs/promises";
import express from "express";
import { JobStore } from "../jobs/jobStore";
import { IN8nClient } from "../n8n/n8nClient";
import { createMeetingsRouter } from "./meetings";
import { AppError } from "../errors/errors";
import { MeetingResult } from "../contracts/types";

let server: http.Server;
let baseUrl: string;
const testStorageDir = path.resolve(process.cwd(), "data/test_jobs");
let testJobStore: JobStore;

// Stub n8n client that records calls at the boundary
let triggeredJobId: string | null = null;
const stubN8nClient: IN8nClient = {
  triggerMeetingProcessing: async (jobId: string): Promise<boolean> => {
    triggeredJobId = jobId;
    return true;
  },
  triggerCleanup: async (_jobId: string): Promise<boolean> => {
    return true;
  },
};

before(async () => {
  testJobStore = new JobStore({ storageDir: testStorageDir });
  await testJobStore.initStorage();

  const app = express();
  app.use(express.json());
  app.use("/meetings", createMeetingsRouter(testJobStore, stubN8nClient));

  // Error middleware matching index.ts
  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ): void => {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.toProcessingError() });
        return;
      }
      res.status(500).json({
        error: { code: "PROCESSING_FAILED", message: (err as Error).message },
      });
    }
  );

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as { port: number };
      baseUrl = `http://localhost:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });

  try {
    await fs.rm(testStorageDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error
  }
});

describe("Application API & n8n Boundary Verification", () => {
  it("POST /meetings rejects requests without an audio file", async () => {
    const response = await fetch(`${baseUrl}/meetings`, {
      method: "POST",
    });

    assert.equal(response.status, 400);
    const body = (await response.json()) as { error: { code: string } };
    assert.equal(body.error.code, "INVALID_AUDIO");
  });

  it("GET /meetings/:jobId returns 404 for unknown jobs", async () => {
    const response = await fetch(`${baseUrl}/meetings/job_doesnotexist`);
    assert.equal(response.status, 404);
    const body = (await response.json()) as { error: { code: string } };
    assert.equal(body.error.code, "JOB_NOT_FOUND");
  });

  it("POST /meetings stores audio, initializes queued job, returns 202, and triggers n8n", async () => {
    triggeredJobId = null;
    const testAudioBytes = Buffer.from("MOCK_STEREO_WEBM_AUDIO_CONTENT");
    const formData = new FormData();
    const blob = new Blob([testAudioBytes], { type: "audio/webm" });
    formData.append("audio", blob, "meeting.webm");

    const response = await fetch(`${baseUrl}/meetings`, {
      method: "POST",
      body: formData,
    });

    // 1. Verify 202 response and body shape
    assert.equal(response.status, 202);
    const body = (await response.json()) as { job_id: string; status: string };
    assert.ok(body.job_id.startsWith("job_"));
    assert.equal(body.status, "queued");

    const jobId = body.job_id;

    // 2. Verify audio.webm is persisted in job storage directory
    const audioFilePath = path.join(testJobStore.getJobDir(jobId), "audio.webm");
    const savedAudio = await fs.readFile(audioFilePath);
    assert.deepEqual(savedAudio, testAudioBytes);

    // 3. Verify job.json on filesystem starts as queued
    const jobFilePath = path.join(testJobStore.getJobDir(jobId), "job.json");
    const savedJobData = JSON.parse(await fs.readFile(jobFilePath, "utf-8"));
    assert.equal(savedJobData.job_id, jobId);
    assert.equal(savedJobData.status, "queued");

    // 4. Verify n8n trigger was invoked at the boundary with the job_id
    // Wait briefly for asynchronous trigger dispatch
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(triggeredJobId, jobId);

    // 5. Verify GET /meetings/:jobId returns current queued state
    const getRes = await fetch(`${baseUrl}/meetings/${jobId}`);
    assert.equal(getRes.status, 200);
    const getBody = (await getRes.json()) as { job_id: string; status: string };
    assert.equal(getBody.job_id, jobId);
    assert.equal(getBody.status, "queued");
  });

  it("GET /meetings/:jobId returns updated state when external orchestrator writes progress and results", async () => {
    // 1. Create a job directly in store to simulate existing job
    const dummyAudio = Buffer.from("DUMMY_AUDIO");
    const jobId = await testJobStore.createJob(dummyAudio, "audio/webm");

    // 2. Initial state is queued
    let res = await fetch(`${baseUrl}/meetings/${jobId}`);
    assert.equal(res.status, 200);
    let data = (await res.json()) as { status: string };
    assert.equal(data.status, "queued");

    // 3. Simulate orchestrator updating status to 'transcribing'
    await testJobStore.updateJobStatus(jobId, "transcribing");
    res = await fetch(`${baseUrl}/meetings/${jobId}`);
    assert.equal(res.status, 200);
    data = (await res.json()) as { status: string };
    assert.equal(data.status, "transcribing");

    // 4. Simulate orchestrator writing completed canonical result
    const canonicalResult: MeetingResult = {
      speakers: [
        { speaker_id: "speaker_1", label: "Speaker 1" },
        { speaker_id: "speaker_2", label: "Speaker 2" },
      ],
      transcript: [
        {
          speaker_id: "speaker_1",
          start: 1.0,
          end: 4.0,
          text: "Let's review the release roadmap.",
        },
      ],
      meeting: {
        summary: "The team reviewed the release roadmap.",
        decisions: ["Target release date confirmed."],
        action_items: [
          {
            task: "Prepare release notes",
            owner: "speaker_1",
            deadline: "2026-09-15",
            priority: "high",
          },
          {
            task: "Verify deployment metrics",
            owner: null,
            deadline: null,
            priority: "medium",
          },
        ],
      },
    };

    await testJobStore.saveJobResult(jobId, canonicalResult);

    // 5. GET returns completed with full canonical result
    res = await fetch(`${baseUrl}/meetings/${jobId}`);
    assert.equal(res.status, 200);
    const completedBody = (await res.json()) as {
      status: string;
      result: MeetingResult;
    };
    assert.equal(completedBody.status, "completed");
    assert.ok(completedBody.result);
    assert.equal(completedBody.result.meeting.summary, canonicalResult.meeting.summary);
    assert.equal(completedBody.result.meeting.action_items[1].owner, null);
  });
});
