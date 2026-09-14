process.env.NODE_ENV = "test";
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { JobStore } from "./jobStore";

const testStorageDir = path.resolve(process.cwd(), "data/test_ttl_jobs");

// Helper: set a directory's mtime to a specific time in the past
async function setMtimePast(dirPath: string, ageSeconds: number): Promise<void> {
  const past = new Date(Date.now() - ageSeconds * 1000);
  await fs.utimes(dirPath, past, past);
}

describe("JobStore TTL Cleanup", () => {
  let store: JobStore;

  before(async () => {
    // Use a very short TTL (10 seconds) for testing
    store = new JobStore({ storageDir: testStorageDir, ttlSeconds: 10 });
    await store.initStorage();
  });

  beforeEach(async () => {
    // Clear the test storage directory before each test
    try {
      const entries = await fs.readdir(testStorageDir);
      for (const entry of entries) {
        await fs.rm(path.join(testStorageDir, entry), {
          recursive: true,
          force: true,
        });
      }
    } catch {
      // Directory may not exist yet
    }
  });

  after(async () => {
    try {
      await fs.rm(testStorageDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  });

  it("removes expired job directories", async () => {
    // Create a job and artificially age it beyond TTL
    const jobId = await store.createJob(Buffer.from("OLD_AUDIO"), "audio/webm");
    const jobDir = store.getJobDir(jobId);
    await setMtimePast(jobDir, 60); // 60 seconds old > 10 second TTL

    const removed = await store.cleanupExpiredJobs();

    assert.ok(removed.includes(jobId), "Expired job should be in the removed list");

    // Verify the directory no longer exists
    try {
      await fs.stat(jobDir);
      assert.fail("Job directory should have been removed");
    } catch (err: unknown) {
      assert.equal((err as NodeJS.ErrnoException).code, "ENOENT");
    }
  });

  it("preserves fresh job directories", async () => {
    // Create a job — its mtime is now (well within the 10s TTL)
    const jobId = await store.createJob(
      Buffer.from("FRESH_AUDIO"),
      "audio/webm"
    );
    const jobDir = store.getJobDir(jobId);

    const removed = await store.cleanupExpiredJobs();

    assert.ok(
      !removed.includes(jobId),
      "Fresh job should NOT be in the removed list"
    );

    // Verify the directory still exists
    const stat = await fs.stat(jobDir);
    assert.ok(stat.isDirectory());
  });

  it("removes expired jobs while preserving fresh jobs", async () => {
    // Create an expired job
    const expiredJobId = await store.createJob(
      Buffer.from("EXPIRED"),
      "audio/webm"
    );
    await setMtimePast(store.getJobDir(expiredJobId), 60);

    // Create a fresh job
    const freshJobId = await store.createJob(
      Buffer.from("FRESH"),
      "audio/webm"
    );

    const removed = await store.cleanupExpiredJobs();

    assert.ok(removed.includes(expiredJobId), "Expired job should be removed");
    assert.ok(!removed.includes(freshJobId), "Fresh job should be preserved");

    // Verify states
    try {
      await fs.stat(store.getJobDir(expiredJobId));
      assert.fail("Expired job dir should be removed");
    } catch (err: unknown) {
      assert.equal((err as NodeJS.ErrnoException).code, "ENOENT");
    }

    const freshStat = await fs.stat(store.getJobDir(freshJobId));
    assert.ok(freshStat.isDirectory());
  });

  it("does not crash on non-directory entries in storage", async () => {
    // Place a random file (not a directory) in the storage dir
    const randomFilePath = path.join(testStorageDir, "random_file.txt");
    await fs.writeFile(randomFilePath, "not a job directory");

    // Should not throw
    const removed = await store.cleanupExpiredJobs();
    assert.ok(
      !removed.includes("random_file.txt"),
      "Non-directory entries should be skipped"
    );

    // File should still exist
    const stat = await fs.stat(randomFilePath);
    assert.ok(stat.isFile());
  });

  it("does not crash when storage directory does not exist", async () => {
    const noSuchStore = new JobStore({
      storageDir: path.resolve(process.cwd(), "data/nonexistent_dir_12345"),
      ttlSeconds: 10,
    });

    // Should not throw
    const removed = await noSuchStore.cleanupExpiredJobs();
    assert.deepEqual(removed, []);
  });

  it("is safe to run multiple times (idempotent)", async () => {
    // Create and age a job
    const jobId = await store.createJob(
      Buffer.from("IDEMPOTENT_AUDIO"),
      "audio/webm"
    );
    await setMtimePast(store.getJobDir(jobId), 60);

    // First cleanup removes it
    const first = await store.cleanupExpiredJobs();
    assert.ok(first.includes(jobId));

    // Second cleanup: directory is already gone, should not crash
    const second = await store.cleanupExpiredJobs();
    assert.ok(!second.includes(jobId), "Already-removed job should not appear again");
  });
});
