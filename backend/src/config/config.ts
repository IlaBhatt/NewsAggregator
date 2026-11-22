/**
 * Application configuration loaded from environment variables
 * Following 12-Factor App principle III: Store config in the environment
 */

import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Validates required environment variables
 */
function validateEnv(): void {
  const required = ["NEWS_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

// Validate on module load
if (process.env.NODE_ENV !== "test") {
  validateEnv();
}

export const config = {
  // Server
  port: parseInt(process.env.PORT || "8080", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  apiVersion: process.env.API_VERSION || "v1",

  // NewsAPI
  newsApi: {
    key: process.env.NEWS_API_KEY || "",
    baseUrl: process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2",
    timeout: parseInt(process.env.API_REQUEST_TIMEOUT_MS || "5000", 10),
  },

  // Cache
  cache: {
    ttlMinutes: parseInt(process.env.CACHE_TTL_MINUTES || "15", 10),
    cleanupIntervalMinutes: parseInt(
      process.env.CACHE_CLEANUP_INTERVAL_MINUTES || "30",
      10,
    ),
    cleanupMultiplier: parseInt(
      process.env.CACHE_CLEANUP_MULTIPLIER || "2",
      10,
    ),
  },

  // Circuit Breaker
  circuitBreaker: {
    threshold: parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD || "5", 10),
    timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT_MS || "60000", 10),
    resetTimeout: parseInt(
      process.env.CIRCUIT_BREAKER_RESET_TIMEOUT_MS || "30000",
      10,
    ),
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100", 10),
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
} as const;

export type Config = typeof config;
