import { AppError, ERROR_CODES } from "../errors/errors";

export interface AudioValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
  };
}

const SUPPORTED_MIME_TYPES = new Set([
  "audio/webm",
  "audio/wav",
  "audio/x-wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/ogg",
  "audio/m4a",
  "audio/x-m4a",
  "video/webm", // MediaRecorder sometimes labels audio-only webm as video/webm
]);

/**
 * Validates the uploaded audio file metadata and properties.
 */
export function validateAudioFile(file?: Express.Multer.File): void {
  if (!file) {
    throw new AppError(
      ERROR_CODES.INVALID_AUDIO,
      "No audio file was uploaded with field name 'audio'.",
      400
    );
  }

  if (file.size === 0) {
    throw new AppError(
      ERROR_CODES.INVALID_AUDIO,
      "The uploaded audio file is empty.",
      400
    );
  }

  // Check MIME type if present
  if (file.mimetype && !SUPPORTED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    throw new AppError(
      ERROR_CODES.INVALID_AUDIO,
      `Unsupported audio MIME type: ${file.mimetype}. Supported formats: WebM, WAV, MP3, OGG.`,
      400
    );
  }

  // Note: Deep duration validation (<= 45 mins) will be performed when audio inspection is implemented.
}
