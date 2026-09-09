import { ProcessingError } from "../contracts/types";

export const ERROR_CODES = {
  AUDIO_CAPTURE_FAILED: "AUDIO_CAPTURE_FAILED",
  AUDIO_UPLOAD_FAILED: "AUDIO_UPLOAD_FAILED",
  INVALID_AUDIO: "INVALID_AUDIO",
  AUDIO_TOO_LONG: "AUDIO_TOO_LONG",
  AUDIO_PROCESSING_FAILED: "AUDIO_PROCESSING_FAILED",
  TRANSCRIPTION_FAILED: "TRANSCRIPTION_FAILED",
  ANALYSIS_FAILED: "ANALYSIS_FAILED",
  INVALID_ANALYSIS_RESULT: "INVALID_ANALYSIS_RESULT",
  PROCESSING_TIMEOUT: "PROCESSING_TIMEOUT",
  PROCESSING_FAILED: "PROCESSING_FAILED",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }

  public toProcessingError(): ProcessingError {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

export function createProcessingError(code: string, message: string): ProcessingError {
  return { code, message };
}
