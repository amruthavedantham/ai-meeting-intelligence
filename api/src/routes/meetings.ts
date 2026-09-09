import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import { JobStore } from "../jobs/jobStore";
import { IN8nClient } from "../n8n/n8nClient";
import { validateAudioFile } from "../validation/audioValidation";
import { AppError, ERROR_CODES } from "../errors/errors";
import { CreateMeetingResponse, JobStatusResponse } from "../contracts/types";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for 45 min WebM/audio
  },
});

export function createMeetingsRouter(
  jobStore: JobStore,
  n8nClient: IN8nClient
): Router {
  const router = Router();

  /**
   * POST /meetings
   * Accepts multipart audio, creates a processing job, triggers n8n, and returns 202 Accepted.
   */
  router.post(
    "/",
    upload.single("audio"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        validateAudioFile(req.file);

        const file = req.file!;
        const jobId = await jobStore.createJob(file.buffer, file.mimetype);

        // Trigger n8n processing workflow asynchronously
        n8nClient.triggerMeetingProcessing(jobId).catch((err) => {
          console.error(`[routes/meetings] Error triggering n8n for ${jobId}:`, err);
        });

        const response: CreateMeetingResponse = {
          job_id: jobId,
          status: "queued",
        };

        res.status(202).json(response);
      } catch (err) {
        next(err);
      }
    }
  );

  /**
   * GET /meetings/:jobId
   * Retrieves current application-level job status and result.
   */
  router.get(
    "/:jobId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { jobId } = req.params;
        const job = await jobStore.getJob(jobId);

        if (!job) {
          throw new AppError(
            ERROR_CODES.JOB_NOT_FOUND,
            "Meeting processing job was not found.",
            404
          );
        }

        const response: JobStatusResponse = {
          job_id: job.job_id,
          status: job.status,
          result: job.result,
          error: job.error,
        };

        res.status(200).json(response);
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
