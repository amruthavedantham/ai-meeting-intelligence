/**
 * Audio Recorder Module
 *
 * Encapsulates browser audio capture (getUserMedia, getDisplayMedia, Web Audio API,
 * stereo channel packing, MediaRecorder lifecycle).
 *
 * React components must never manipulate low-level AudioContext or MediaStreams directly;
 * they interact strictly through this abstraction.
 */

export interface AudioRecorder {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  isRecording(): boolean;
}

export class BrowserAudioRecorder implements AudioRecorder {
  private recording = false;

  public async startRecording(): Promise<void> {
    // Skeleton placeholder: Full Web Audio stereo routing will be implemented in Milestone 5.
    this.recording = true;
  }

  public async stopRecording(): Promise<Blob> {
    // Skeleton placeholder: Returns an empty audio/webm Blob.
    this.recording = false;
    return new Blob([], { type: "audio/webm" });
  }

  public isRecording(): boolean {
    return this.recording;
  }
}

export const defaultAudioRecorder = new BrowserAudioRecorder();
