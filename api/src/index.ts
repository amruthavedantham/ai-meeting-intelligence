import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { defaultJobStore } from "./jobs/jobStore";
import { defaultN8nClient } from "./n8n/n8nClient";
import { createMeetingsRouter } from "./routes/meetings";
import { AppError } from "./errors/errors";

dotenv.config();

const app = express();
const port = parseInt(process.env.API_PORT || "3000", 10);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow local development origins and same-origin requests
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Public Application API Routes
app.use("/meetings", createMeetingsRouter(defaultJobStore, defaultN8nClient));


// Centralized Error Handling Middleware
app.use(
  (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    if (err instanceof AppError) {
      res.status(err.statusCode).json({
        error: err.toProcessingError(),
      });
      return;
    }

    console.error("[API Unhandled Error]:", err);
    res.status(500).json({
      error: {
        code: "PROCESSING_FAILED",
        message: "An unexpected internal server error occurred.",
      },
    });
  }
);

// Start server
async function startServer(): Promise<void> {
  await defaultJobStore.initStorage();

  app.listen(port, () => {
    console.log(`[API] AI Meeting Intelligence API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error("[API] Failed to start server:", err);
    process.exit(1);
  });
}

export default app;
