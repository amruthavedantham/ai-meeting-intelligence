import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AudioCaptureError,
  BrowserAudioRecorder,
  AudioRecorder,
} from "./recorder";

describe("Audio Capture Architecture & Error Contracts", () => {
  it("AudioCaptureError retains error code, name, and friendly message", () => {
    const error = new AudioCaptureError(
      "MIC_PERMISSION_DENIED",
      "Microphone permission was denied."
    );

    assert.equal(error.name, "AudioCaptureError");
    assert.equal(error.code, "MIC_PERMISSION_DENIED");
    assert.equal(error.message, "Microphone permission was denied.");
    assert.ok(error instanceof Error);
    assert.ok(error instanceof AudioCaptureError);
  });

  it("BrowserAudioRecorder initializes with isRecording === false", () => {
    const recorder = new BrowserAudioRecorder();
    assert.equal(recorder.isRecording(), false);
  });

  it("stopRecording() throws NOT_RECORDING if called without an active session", async () => {
    const recorder = new BrowserAudioRecorder();
    await assert.rejects(
      async () => {
        await recorder.stopRecording();
      },
      (err: unknown) => {
        assert.ok(err instanceof AudioCaptureError);
        assert.equal((err as AudioCaptureError).code, "NOT_RECORDING");
        return true;
      }
    );
  });

  it("startRecording() detects unsupported environment and throws BROWSER_NOT_SUPPORTED", async () => {
    // In Node.js environment without browser mediaDevices APIs
    const recorder = new BrowserAudioRecorder();
    await assert.rejects(
      async () => {
        await recorder.startRecording();
      },
      (err: unknown) => {
        assert.ok(err instanceof AudioCaptureError);
        assert.equal((err as AudioCaptureError).code, "BROWSER_NOT_SUPPORTED");
        return true;
      }
    );
  });

  it("Custom AudioRecorder implementation satisfies the AudioRecorder interface contract", async () => {
    class MockAudioRecorder implements AudioRecorder {
      private active = false;
      async startRecording(): Promise<void> {
        this.active = true;
      }
      async stopRecording(): Promise<Blob> {
        this.active = false;
        return new Blob(["mock-stereo-webm"], { type: "audio/webm" });
      }
      isRecording(): boolean {
        return this.active;
      }
    }

    const mockRecorder: AudioRecorder = new MockAudioRecorder();
    assert.equal(mockRecorder.isRecording(), false);
    await mockRecorder.startRecording();
    assert.equal(mockRecorder.isRecording(), true);
    const blob = await mockRecorder.stopRecording();
    assert.equal(mockRecorder.isRecording(), false);
    assert.equal(blob.type, "audio/webm");
  });
});
