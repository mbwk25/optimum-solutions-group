/* 
* File_path : src/shared/utils/logger.ts
* File_name : logger.ts
* File_description : A simple logging utility with different log levels and optional timestamping.
* File_version : 1.0.0
* File_author : ChatGPT
* File_date : 2023-10-05
* File_size : 1.76 KB
*/
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface LoggerOptions {
    level?: LogLevel;
    withTimestamp?: boolean;
}

export class Logger {
    private level: LogLevel;
    private withTimestamp: boolean;
    private static levels: Record<LogLevel, number> = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
    };

    constructor(options: LoggerOptions = {}) {
        this.level = options.level || 'error';
        this.withTimestamp = options.withTimestamp ?? true;
    }

    private formatMessage(level: LogLevel, message: string): string {
        const timestamp: string = this.withTimestamp ? `[${new Date().toISOString()}]` : '';
        return `${timestamp} [${level.toUpperCase()}] ${message}`.trim();
    }

    error(message: string, ...args: unknown[]): void {
        if (Logger.levels[this.level] >= Logger.levels.error) {
            console.error(this.formatMessage('error', message), ...args);
        }
    }

    warn(message: string, ...args: unknown[]): void {
        if (Logger.levels[this.level] >= Logger.levels.warn) {
            console.warn(this.formatMessage('warn', message), ...args);
        }
    }

    info(message: string, ...args: unknown[]): void {
        if (Logger.levels[this.level] >= Logger.levels.info) {
            console.info(this.formatMessage('info', message), ...args);
        }
    }

    debug(message: string, ...args: unknown[]): void {
        if (Logger.levels[this.level] >= Logger.levels.debug) {
            console.debug(this.formatMessage('debug', message), ...args);
        }
    }
}

// Singleton par défaut pour tout le projet
export const logger: Logger = new Logger({ level: 'error', withTimestamp: true });
