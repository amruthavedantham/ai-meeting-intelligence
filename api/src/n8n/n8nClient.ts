export interface IN8nClient {
  triggerMeetingProcessing(jobId: string): Promise<boolean>;
  triggerCleanup(jobId: string): Promise<boolean>;
}

export interface N8nClientConfig {
  processWebhookUrl: string;
  cleanupWebhookUrl: string;
}

export class N8nClient implements IN8nClient {
  private readonly processWebhookUrl: string;
  private readonly cleanupWebhookUrl: string;

  constructor(config?: Partial<N8nClientConfig>) {
    this.processWebhookUrl =
      config?.processWebhookUrl ||
      process.env.N8N_PROCESS_WEBHOOK ||
      "http://localhost:5678/webhook/process-meeting";
    this.cleanupWebhookUrl =
      config?.cleanupWebhookUrl ||
      process.env.N8N_CLEANUP_WEBHOOK ||
      "http://localhost:5678/webhook/cleanup";
  }

  /**
   * Triggers the n8n 'Process Meeting' workflow asynchronously.
   * Sends { job_id } to the configured webhook.
   */
  public async triggerMeetingProcessing(jobId: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(this.processWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.log(
        `[n8nClient] Note: n8n webhook at ${this.processWebhookUrl} not reachable (${(err as Error).message}).`
      );
      return false;
    }
  }

  /**
   * Triggers the n8n 'Cleanup' workflow asynchronously.
   */
  public async triggerCleanup(jobId: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(this.cleanupWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (err) {
      console.log(
        `[n8nClient] Note: n8n cleanup webhook at ${this.cleanupWebhookUrl} not reachable.`
      );
      return false;
    }
  }
}

export const defaultN8nClient = new N8nClient();
