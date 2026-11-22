import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config/config";
import { logger } from "./config/logger";
import newsRoutes from "./routes/newsRoutes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): Express {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin: config.cors.origin,
      credentials: true,
    }),
  );

  // Compression middleware
  app.use(compression());

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
      status: "error",
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests, please try again later",
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(`/api/${config.apiVersion}`, limiter);

  app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  app.use(`/api/${config.apiVersion}/news`, newsRoutes);
  app.use(`/api/${config.apiVersion}/health`, healthRoutes);

  if (config.nodeEnv === "production") {
    const frontendBuildPath = path.join(__dirname, "../../frontend/dist");

    logger.info(`📁 Serving static files from: ${frontendBuildPath}`);

    app.use(
      express.static(frontendBuildPath, {
        maxAge: "1y",
        etag: true,
        lastModified: true,
      }),
    );

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return notFoundHandler(req, res, next);
      }
      res.sendFile(path.join(frontendBuildPath, "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.json({
        name: "News Aggregator API",
        version: config.apiVersion,
        description: "News aggregation service with sentiment analysis",
        mode: "development",
        note: "Frontend runs separately on Vite dev server (port 5173)",
        endpoints: {
          health: `/api/${config.apiVersion}/health`,
          search: `/api/${config.apiVersion}/news/search`,
          headlines: `/api/${config.apiVersion}/news/headlines`,
        },
      });
    });

    app.use(notFoundHandler);
  }

  app.use(errorHandler);

  return app;
}
