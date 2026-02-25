/**
 * Error Logger for Frame Flow X
 * Centralized error logging and reporting
 */

export type ErrorSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical'

export interface LogEntry {
  timestamp: number
  level: ErrorSeverity
  message: string
  details?: unknown
  context?: {
    component?: string
    action?: string
    userId?: string
    sessionId?: string
  }
  error?: {
    name: string
    message: string
    stack?: string
  }
}

export interface ErrorLogger {
  debug: (message: string, details?: unknown) => void
  info: (message: string, details?: unknown) => void
  warn: (message: string, details?: unknown) => void
  error: (message: string, error?: Error, context?: LogEntry['context']) => void
  critical: (message: string, error: Error, context?: LogEntry['context']) => void
  getLogs: (limit?: number) => LogEntry[]
  clearLogs: () => void
  exportLogs: () => string
}

class ErrorLoggerImpl implements ErrorLogger {
  private logs: LogEntry[] = []
  private maxLogs = 1000
  private sessionId = this.generateSessionId()

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Always log errors to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(entry)
    }
  }

  private logToConsole(entry: LogEntry): void {
    const prefix = `[${entry.level.toUpperCase()}]`
    const time = new Date(entry.timestamp).toISOString()

    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix} ${time} - ${entry.message}`, entry.details)
        break
      case 'info':
        console.info(`${prefix} ${time} - ${entry.message}`, entry.details)
        break
      case 'warning':
        console.warn(`${prefix} ${time} - ${entry.message}`, entry.details)
        break
      case 'error':
      case 'critical':
        console.error(`${prefix} ${time} - ${entry.message}`, entry.error, entry.details)
        break
    }
  }

  debug(message: string, details?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'debug',
      message,
      details,
      context: { sessionId: this.sessionId },
    })
  }

  info(message: string, details?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'info',
      message,
      details,
      context: { sessionId: this.sessionId },
    })
  }

  warn(message: string, details?: unknown): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'warning',
      message,
      details,
      context: { sessionId: this.sessionId },
    })
  }

  error(message: string, error?: Error, context?: LogEntry['context']): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'error',
      message,
      context: { ...context, sessionId: this.sessionId },
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      details: error?.stack,
    })
  }

  critical(message: string, error: Error, context?: LogEntry['context']): void {
    this.addLog({
      timestamp: Date.now(),
      level: 'critical',
      message,
      context: { ...context, sessionId: this.sessionId },
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      details: error.stack,
    })

    // In production, you might want to send critical errors to a monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(message, error, context)
    }
  }

  private async sendToMonitoringService(
    message: string,
    error: Error,
    context?: LogEntry['context']
  ): Promise<void> {
    // Placeholder for integration with error monitoring services
    // e.g., Sentry, LogRocket, etc.
    console.error('Critical error reported:', { message, error, context })
  }

  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(-limit)
  }

  clearLogs(): void {
    this.logs = []
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Create singleton instance
export const logger = new ErrorLoggerImpl()

/**
 * Retry utility with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    initialDelay?: number
    maxDelay?: number
    backoffMultiplier?: number
    onRetry?: (attempt: number, error: Error) => void
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    onRetry,
  } = options

  let lastError: Error | null = null
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        logger.warn(`Retry attempt ${attempt + 1}/${maxRetries} failed`, {
          error: lastError,
          delay,
        })

        onRetry?.(attempt + 1, lastError)

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay))

        // Increase delay for next retry (exponential backoff)
        delay = Math.min(delay * backoffMultiplier, maxDelay)
      }
    }
  }

  // All retries failed
  logger.error(`All ${maxRetries} retry attempts failed`, lastError!)
  throw lastError
}

/**
 * Wrap a function with error logging
 */
export function withErrorLogging<T extends (...args: unknown[]) => unknown>(
  fn: T,
  componentName: string,
  actionName: string
): T {
  return ((...args: unknown[]) => {
    try {
      logger.debug(`[${componentName}] ${actionName} started`, { args })
      const result = fn(...args)

      if (result instanceof Promise) {
        return result.catch((error) => {
          logger.error(`[${componentName}] ${actionName} failed`, error, {
            component: componentName,
            action: actionName,
          })
          throw error
        })
      }

      logger.debug(`[${componentName}] ${actionName} completed`)
      return result
    } catch (error) {
      logger.error(`[${componentName}] ${actionName} failed`, error as Error, {
        component: componentName,
        action: actionName,
      })
      throw error
    }
  }) as T
}
