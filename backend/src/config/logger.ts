/**
 * Winston logger configuration
 * Following 12-Factor App principle XI: Treat logs as event streams
 */

import winston from 'winston';
import { config } from './config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

/**
 * Custom log format
 */
const logFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp as string} [${level}]: ${message as string}`;
  
  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack as string}`;
  }
  
  // Add metadata if present
  const metadataKeys = Object.keys(metadata);
  if (metadataKeys.length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

/**
 * Logger instance with different transports based on environment
 */
export const logger = winston.createLogger({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'news-aggregator' },
  transports: [
    // Console transport with colors in development
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      ),
    }),
  ],
  // Don't exit on uncaught exceptions
  exitOnError: false,
});

// Production: Add file transports
if (config.nodeEnv === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(timestamp(), winston.format.json()),
    })
  );
  
  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(timestamp(), winston.format.json()),
    })
  );
}

// Suppress logs during testing
if (config.nodeEnv === 'test') {
  logger.transports.forEach((t) => (t.silent = true));
}
