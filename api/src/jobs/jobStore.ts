import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { Job, JobStatus, MeetingResult, ProcessingError } from "../contracts/types";

export interface JobStoreConfig {
  storageDir: string;
  ttlSeconds: number;
}

export class JobStore {
  private readonly storageDir: string;
  private readonly ttlSeconds: number;

  constructor(config?: Partial<JobStoreConfig>) {
    this.storageDir = path.resolve(
      process.cwd(),
      config?.storageDir || process.env.JOB_STORAGE_DIR || "./data/jobs"
    );
    this.ttlSeconds =
      config?.ttlSeconds ||
      parseInt(process.env.JOB_TTL_SECONDS || "3600", 10);
  }

  /**
   * Initializes the storage directory if it does not exist.
   */
  public async initStorage(): Promise<void> {
    await fs.mkdir(this.storageDir, { recursive: true });
  }

  /**
   * Atomically writes JSON to a file by writing to a temporary file first and then renaming it.
   */
  private async writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
    const tempPath = `${filePath}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    const serialized = JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, serialized, "utf-8");
    await fs.rename(tempPath, filePath);
  }

  /**
   * Generates a unique job identifier.
   */
  public generateJobId(): string {
    const randomHex = crypto.randomBytes(6).toString("hex");
    return `job_${randomHex}`;
  }

  /**
   * Returns the directory path for a given job.
   */
  public getJobDir(jobId: string): string {
    return path.join(this.storageDir, jobId);
  }

  /**
   * Creates a new job with initial status 'queued' and persists the audio file.
   */
  public async createJob(
    audioBuffer: Buffer,
    _mimeType = "audio/webm"
  ): Promise<string> {
    const jobId = this.generateJobId();
    const jobDir = this.getJobDir(jobId);

    await fs.mkdir(jobDir, { recursive: true });

    // Save audio file
    const audioPath = path.join(jobDir, "audio.webm");
    await fs.writeFile(audioPath, audioBuffer);

    // Save initial job.json
    const initialJob: Job = {
      job_id: jobId,
      status: "queued",
    };
    await this.writeJsonAtomic(path.join(jobDir, "job.json"), initialJob);

    return jobId;
  }

  /**
   * Retrieves current job status and results (if completed).
   */
  public async getJob(jobId: string): Promise<Job | null> {
    const jobDir = this.getJobDir(jobId);
    const jobJsonPath = path.join(jobDir, "job.json");

    try {
      const jobData = await fs.readFile(jobJsonPath, "utf-8");
      const job: Job = JSON.parse(jobData);

      // If completed, read result.json if present
      if (job.status === "completed") {
        const resultJsonPath = path.join(jobDir, "result.json");
        try {
          const resultData = await fs.readFile(resultJsonPath, "utf-8");
          job.result = JSON.parse(resultData);
        } catch {
          // result.json not yet available or corrupted
        }
      }

      return job;
    } catch {
      return null;
    }
  }

  /**
   * Updates job status and optional error.
   */
  public async updateJobStatus(
    jobId: string,
    status: JobStatus,
    error?: ProcessingError
  ): Promise<void> {
    const jobDir = this.getJobDir(jobId);
    const jobJsonPath = path.join(jobDir, "job.json");

    const job: Job = {
      job_id: jobId,
      status,
      ...(error ? { error } : {}),
    };

    await this.writeJsonAtomic(jobJsonPath, job);
  }

  /**
   * Saves completed meeting result.
   */
  public async saveJobResult(
    jobId: string,
    result: MeetingResult
  ): Promise<void> {
    const jobDir = this.getJobDir(jobId);
    await this.writeJsonAtomic(path.join(jobDir, "result.json"), result);
    await this.updateJobStatus(jobId, "completed");
  }

  /**
   * Deletes a job directory idempotently.
   */
  public async deleteJob(jobId: string): Promise<boolean> {
    const jobDir = this.getJobDir(jobId);
    try {
      await fs.rm(jobDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
    }
  }
}

export const defaultJobStore = new JobStore();
