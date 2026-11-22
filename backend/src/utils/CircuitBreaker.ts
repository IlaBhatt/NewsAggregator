import { CircuitState, CircuitBreakerConfig } from '../types';
import { logger } from '../config/logger';

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;

  constructor(private config: CircuitBreakerConfig) {
    logger.info(
      `Circuit Breaker initialized with threshold: ${config.threshold}, timeout: ${config.timeout}ms`
    );
  }

  public async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        logger.warn('Circuit breaker is OPEN, using fallback');
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is OPEN and no fallback provided');
      }
      // Try to close circuit (half-open state)
      this.state = CircuitState.HALF_OPEN;
      logger.info('Circuit breaker entering HALF_OPEN state');
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      logger.error('Circuit breaker execution failed', { error });

      if (fallback) {
        logger.info('Using fallback function');
        return fallback();
      }

      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error('Request timeout')),
          this.config.timeout
        )
      ),
    ]);
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      logger.info('Circuit breaker CLOSED');
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.config.resetTimeout;
      logger.error(
        `Circuit breaker OPEN after ${this.failureCount} failures. Next attempt at ${new Date(
          this.nextAttemptTime
        ).toISOString()}`
      );
    }
  }

  public getState(): CircuitState {
    return this.state;
  }


  public getStats(): {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
  } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  public reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
    logger.info('Circuit breaker manually reset');
  }
}
