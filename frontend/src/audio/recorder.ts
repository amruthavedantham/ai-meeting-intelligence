/**
 * Browser Audio Recorder Engine
 *
 * Encapsulates browser audio capture:
 * - getUserMedia() for microphone audio
 * - getDisplayMedia() for meeting/tab audio
 * - Web Audio API routing & stereo packing (L = Mic, R = Meeting)
 * - MediaRecorder lifecycle & stream cleanup
 *
 * Target Browsers: Chrome / Edge.
 * React components must NOT manipulate MediaStream, AudioContext, or MediaRecorder directly.
 */

export type AudioErrorCode =
  | "MIC_PERMISSION_DENIED"
  | "MEETING_PERMISSION_DENIED"
  | "NO_MEETING_AUDIO"
  | "BROWSER_NOT_SUPPORTED"
  | "ALREADY_RECORDING"
  | "NOT_RECORDING"
  | "RECORDING_FAILED";

export class AudioCaptureError extends Error {
  public readonly code: AudioErrorCode;

  constructor(code: AudioErrorCode, message: string) {
    super(message);
    this.name = "AudioCaptureError";
    this.code = code;
  }
}

export interface AudioRecorderOptions {
  /** If true, requires meeting/tab audio track to be present. Default: true */
  requireMeetingAudio?: boolean;
  /** Audio bitrate in bits per second. Default: 128000 */
  audioBitsPerSecond?: number;
}

export interface AudioRecorder {
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  isRecording(): boolean;
}

export class BrowserAudioRecorder implements AudioRecorder {
  private recording = false;
  private micStream: MediaStream | null = null;
  private displayStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private options: Required<AudioRecorderOptions>;

  constructor(options?: AudioRecorderOptions) {
    this.options = {
      requireMeetingAudio: options?.requireMeetingAudio ?? true,
      audioBitsPerSecond: options?.audioBitsPerSecond ?? 128000,
    };
  }

  /**
   * Returns true if recording is currently in progress.
   */
  public isRecording(): boolean {
    return this.recording;
  }

  /**
   * Starts the stereo recording process:
   * 1. Requests microphone stream via getUserMedia()
   * 2. Requests display/tab audio stream via getDisplayMedia()
   * 3. Combines both streams via Web Audio API into a stereo stream:
   *    - Channel 0 (Left) = Microphone
   *    - Channel 1 (Right) = Meeting / Tab audio
   * 4. Starts MediaRecorder
   */
  public async startRecording(): Promise<void> {
    if (this.recording) {
      throw new AudioCaptureError(
        "ALREADY_RECORDING",
        "A recording session is already in progress."
      );
    }

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      throw new AudioCaptureError(
        "BROWSER_NOT_SUPPORTED",
        "Your browser does not support required audio capture APIs. Please use Google Chrome or Microsoft Edge."
      );
    }

    this.recordedChunks = [];

    try {
      // 1. Request Microphone Permission & Stream
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (err) {
        throw new AudioCaptureError(
          "MIC_PERMISSION_DENIED",
          "Microphone permission was denied. Please allow microphone access to record the meeting."
        );
      }

      // 2. Request Meeting / Tab Audio Stream via getDisplayMedia
      // In Chrome/Edge, video: true is required by specification, audio: true captures tab audio.
      try {
        this.displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      } catch (err) {
        this.cleanupStreams();
        throw new AudioCaptureError(
          "MEETING_PERMISSION_DENIED",
          "Meeting/tab sharing was cancelled or denied. Both microphone and tab audio are required."
        );
      }

      // 3. Validate that an audio track was shared from the display media
      const displayAudioTracks = this.displayStream.getAudioTracks();
      if (displayAudioTracks.length === 0) {
        if (this.options.requireMeetingAudio) {
          this.cleanupStreams();
          throw new AudioCaptureError(
            "NO_MEETING_AUDIO",
            "No audio was shared from the selected tab or screen. Please select a Chrome/Edge tab and ensure 'Share tab audio' is checked."
          );
        }
      }

      // 4. Set up Web Audio API Stereo Routing
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioContext = new AudioCtx();

      // ChannelMergerNode with 2 inputs produces a stereo output (Input 0 = L, Input 1 = R)
      const merger = this.audioContext.createChannelMerger(2);

      // Route Local Microphone -> Channel 0 (Left)
      // Downmix mic to mono signal so it routes cleanly to Left channel
      const micSource = this.audioContext.createMediaStreamSource(this.micStream);
      const micMonoGain = this.audioContext.createGain();
      micMonoGain.channelCount = 1;
      micMonoGain.channelCountMode = "explicit";
      micMonoGain.channelInterpretation = "speakers";
      micSource.connect(micMonoGain);
      micMonoGain.connect(merger, 0, 0); // connect to merger input 0 (Left)

      // Route Meeting/Tab Audio -> Channel 1 (Right)
      if (displayAudioTracks.length > 0) {
        const displayAudioStream = new MediaStream(displayAudioTracks);
        const meetingSource =
          this.audioContext.createMediaStreamSource(displayAudioStream);
        const meetingMonoGain = this.audioContext.createGain();
        meetingMonoGain.channelCount = 1;
        meetingMonoGain.channelCountMode = "explicit";
        meetingMonoGain.channelInterpretation = "speakers";
        meetingSource.connect(meetingMonoGain);
        meetingMonoGain.connect(merger, 0, 1); // connect to merger input 1 (Right)
      }

      // Destination node provides the combined stereo MediaStream
      const destination = this.audioContext.createMediaStreamDestination();
      merger.connect(destination);

      // 5. Initialize MediaRecorder on the combined stereo stream
      const preferredMimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];
      let selectedMimeType = "";
      for (const mime of preferredMimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(
        destination.stream,
        selectedMimeType
          ? {
              mimeType: selectedMimeType,
              audioBitsPerSecond: this.options.audioBitsPerSecond,
            }
          : undefined
      );

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Start recording with timeslices for steady chunk buffering
      this.mediaRecorder.start(1000);
      this.recording = true;
    } catch (err) {
      this.cleanupStreams();
      if (err instanceof AudioCaptureError) {
        throw err;
      }
      throw new AudioCaptureError(
        "RECORDING_FAILED",
        `Failed to start audio recording: ${(err as Error).message}`
      );
    }
  }

  /**
   * Stops recording, closes all media tracks and AudioContext,
   * and returns the final stereo audio Blob.
   */
  public async stopRecording(): Promise<Blob> {
    if (!this.recording || !this.mediaRecorder) {
      throw new AudioCaptureError(
        "NOT_RECORDING",
        "No active recording session to stop."
      );
    }

    return new Promise<Blob>((resolve, reject) => {
      const recorder = this.mediaRecorder!;

      recorder.onstop = async () => {
        try {
          const mimeType = recorder.mimeType || "audio/webm";
          const finalBlob = new Blob(this.recordedChunks, { type: mimeType });

          // Full cleanup of tracks and Web Audio nodes
          await this.cleanupResources();
          this.recording = false;
          resolve(finalBlob);
        } catch (err) {
          await this.cleanupResources();
          this.recording = false;
          reject(
            new AudioCaptureError(
              "RECORDING_FAILED",
              `Error finalizing audio recording: ${(err as Error).message}`
            )
          );
        }
      };

      recorder.onerror = async (event) => {
        await this.cleanupResources();
        this.recording = false;
        reject(
          new AudioCaptureError(
            "RECORDING_FAILED",
            `MediaRecorder encountered an error: ${event}`
          )
        );
      };

      // Request any remaining audio data and stop
      recorder.stop();
    });
  }

  /**
   * Releases MediaStream tracks immediately.
   */
  private cleanupStreams(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.displayStream) {
      this.displayStream.getTracks().forEach((track) => track.stop());
      this.displayStream = null;
    }
  }

  /**
   * Fully cleans up streams, media recorder, and AudioContext.
   */
  private async cleanupResources(): Promise<void> {
    this.cleanupStreams();

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        await this.audioContext.close();
      } catch {
        // AudioContext may already be closed
      }
      this.audioContext = null;
    }

    this.mediaRecorder = null;
  }
}

export const defaultAudioRecorder = new BrowserAudioRecorder();
