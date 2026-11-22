import { createApp } from "./app";
import { config } from "./config/config";
import { logger } from "./config/logger";
import { Cache } from "./utils/Cache";

function startServer() {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      logger.info(`🚀 Server started on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 API Version: ${config.apiVersion}`);
      logger.info(
        `🌐 Base URL: http://localhost:${config.port}/api/${config.apiVersion}`,
      );
    });

    const cache = Cache.getInstance(
      config.cache.ttlMinutes,
      config.cache.cleanupMultiplier,
    );
    const cleanupIntervalMs = config.cache.cleanupIntervalMinutes * 60 * 1000;
    logger.info(
      `🧹 Cache cleanup scheduled every ${config.cache.cleanupIntervalMinutes} minutes ` +
        `(removes entries older than ${config.cache.cleanupMultiplier}× TTL)`,
    );

    const cleanupInterval = setInterval(() => {
      cache.cleanup();
    }, cleanupIntervalMs);

    const shutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);

      clearInterval(cleanupInterval);

      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", { error });
      shutdown("UNCAUGHT_EXCEPTION");
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.error("Unhandled rejection", { reason, promise });
      shutdown("UNHANDLED_REJECTION");
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

// Start server if this file is executed directly
if (require.main === module) {
  startServer();
}

export { startServer };
