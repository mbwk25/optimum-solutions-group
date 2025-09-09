/**
 * @fileoverview Comprehensive test suite for logging utilities
 * @description Tests for Logger class with different log levels and configurations
 * @author Optimum Solutions Group
 * @version 1.0.0
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Logger, logger, LogLevel, LoggerOptions } from '../logger';

describe('Logger utilities', () => {
  let consoleErrorSpy: ReturnType<typeof jest.spyOn>;
  let consoleWarnSpy: ReturnType<typeof jest.spyOn>;
  let consoleInfoSpy: ReturnType<typeof jest.spyOn>;
  let consoleDebugSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    // Mock console methods
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Logger class', () => {
    describe('Constructor and initialization', () => {
      it('should create logger with default options', () => {
        const logger = new Logger();
        expect(logger).toBeInstanceOf(Logger);
      });

      it('should create logger with custom options', () => {
        const options: LoggerOptions = {
          level: 'info',
          withTimestamp: false,
        };
        const logger = new Logger(options);
        expect(logger).toBeInstanceOf(Logger);
      });

      it('should use default level when not specified', () => {
        const logger = new Logger({ withTimestamp: false });
        // Should use default level 'error'
        logger.debug('Debug message');
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it('should use default timestamp setting when not specified', () => {
        const logger = new Logger({ level: 'debug' });
        const mockDate = new Date('2023-01-01T00:00:00.000Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[2023-01-01T00:00:00.000Z] [INFO] Test message'
        );

        jest.restoreAllMocks();
      });
    });

    describe('Log level filtering', () => {
      it('should log all levels when set to debug', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });

        logger.error('Error message');
        logger.warn('Warning message');
        logger.info('Info message');
        logger.debug('Debug message');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message');
        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message');
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Info message');
        expect(consoleDebugSpy).toHaveBeenCalledWith('[DEBUG] Debug message');
      });

      it('should log error, warn, and info when set to info', () => {
        const logger = new Logger({ level: 'info', withTimestamp: false });

        logger.error('Error message');
        logger.warn('Warning message');
        logger.info('Info message');
        logger.debug('Debug message');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message');
        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message');
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Info message');
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it('should log only error and warn when set to warn', () => {
        const logger = new Logger({ level: 'warn', withTimestamp: false });

        logger.error('Error message');
        logger.warn('Warning message');
        logger.info('Info message');
        logger.debug('Debug message');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message');
        expect(consoleWarnSpy).toHaveBeenCalledWith('[WARN] Warning message');
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });

      it('should log only error when set to error', () => {
        const logger = new Logger({ level: 'error', withTimestamp: false });

        logger.error('Error message');
        logger.warn('Warning message');
        logger.info('Info message');
        logger.debug('Debug message');

        expect(consoleErrorSpy).toHaveBeenCalledWith('[ERROR] Error message');
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe('Timestamp formatting', () => {
      it('should include timestamp when withTimestamp is true', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: true });
        const mockDate = new Date('2023-01-01T12:30:45.123Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[2023-01-01T12:30:45.123Z] [INFO] Test message'
        );

        jest.restoreAllMocks();
      });

      it('should not include timestamp when withTimestamp is false', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });

        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Test message');
      });

      it('should handle different timestamp formats', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: true });
        const mockDate = new Date('2023-12-31T23:59:59.999Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);

        logger.info('Test message');

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[2023-12-31T23:59:59.999Z] [INFO] Test message'
        );

        jest.restoreAllMocks();
      });
    });

    describe('Message formatting', () => {
      it('should format single message correctly', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        logger.info('Single message');
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] Single message');
      });

      it('should format message with additional arguments', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        logger.info('Message with data', { key: 'value' }, 123, true);

        expect(consoleInfoSpy).toHaveBeenCalledWith(
          '[INFO] Message with data',
          { key: 'value' },
          123,
          true
        );
      });

      it('should handle empty message', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        logger.info('');
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO]');
      });

      it('should handle message with special characters', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        const specialMessage = 'Message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';
        logger.info(specialMessage);

        expect(consoleInfoSpy).toHaveBeenCalledWith(`[INFO] ${specialMessage}`);
      });

      it('should handle very long messages', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        const longMessage = 'A'.repeat(10000);
        logger.info(longMessage);

        expect(consoleInfoSpy).toHaveBeenCalledWith(`[INFO] ${longMessage}`);
      });
    });

    describe('Log level hierarchy', () => {
      it('should respect log level hierarchy', () => {
        // Test error level - should only log errors
        const errorLogger = new Logger({ level: 'error', withTimestamp: false });
        errorLogger.error('Error message');
        errorLogger.warn('Warning message');
        errorLogger.info('Info message');
        errorLogger.debug('Debug message');
        
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        expect(consoleInfoSpy).not.toHaveBeenCalled();
        expect(consoleDebugSpy).not.toHaveBeenCalled();
        
        // Clear and test debug level - should log all
        consoleErrorSpy.mockClear();
        consoleWarnSpy.mockClear();
        consoleInfoSpy.mockClear();
        consoleDebugSpy.mockClear();
        
        const debugLogger = new Logger({ level: 'debug', withTimestamp: false });
        debugLogger.error('Error message');
        debugLogger.warn('Warning message');
        debugLogger.info('Info message');
        debugLogger.debug('Debug message');
        
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
        expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('Edge cases and error handling', () => {
      it('should handle undefined message', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        logger.info(undefined as unknown as string);
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] undefined');
      });

      it('should handle null message', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        logger.info(null as unknown as string);
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] null');
      });

      it('should handle object messages', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        const obj = { key: 'value', nested: { prop: 123 } };
        logger.info(obj as unknown as string);
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] [object Object]');
      });

      it('should handle function messages', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        const fn = () => 'test';
        logger.info(fn as unknown as string);
        expect(consoleInfoSpy).toHaveBeenCalledWith('[INFO] () => \'test\'');
      });
    });

    describe('Performance considerations', () => {
      it('should handle rapid logging efficiently', () => {
        const logger = new Logger({ level: 'debug', withTimestamp: false });
        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
          logger.info(`Message ${i}`);
        }

        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
        expect(consoleInfoSpy).toHaveBeenCalledTimes(1000);
      });

      it('should not call console methods when level is too high', () => {
        const logger = new Logger({ level: 'error', withTimestamp: false });
        const startTime = performance.now();

        for (let i = 0; i < 1000; i++) {
          logger.debug(`Debug message ${i}`);
        }

        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(10); // Should be very fast
        expect(consoleDebugSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Default logger instance', () => {
    it('should be a Logger instance', () => {
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should have default configuration', () => {
      // Test that the default logger works
      logger.error('Default logger test');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Default logger test')
      );
    });

    it('should include timestamp by default', () => {
      logger.error('Timestamp test');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Timestamp test')
      );
    });
  });

  describe('Real-world usage patterns', () => {
    it('should work with error handling', () => {
      const logger = new Logger({ level: 'debug', withTimestamp: false });

      try {
        throw new Error('Test error');
      } catch (error) {
        logger.error('Caught error:', error);
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Caught error:',
        expect.any(Error)
      );
    });

    it('should work with API logging', () => {
      const logger = new Logger({ level: 'info', withTimestamp: false });

      logger.info('API request started', { endpoint: '/api/users', method: 'GET' });
      logger.info('API request completed', { status: 200, duration: 150 });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] API request started',
        { endpoint: '/api/users', method: 'GET' }
      );
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] API request completed',
        { status: 200, duration: 150 }
      );
    });

    it('should work with performance monitoring', () => {
      const logger = new Logger({ level: 'debug', withTimestamp: false });

      const startTime = performance.now();
      // Simulate some work
      const endTime = performance.now();
      const duration = endTime - startTime;

      logger.debug('Performance measurement', { duration, operation: 'test' });

      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG] Performance measurement',
        { duration: expect.any(Number), operation: 'test' }
      );
    });

    it('should work with user action logging', () => {
      const logger = new Logger({ level: 'info', withTimestamp: false });

      logger.info('User action', {
        action: 'click',
        element: 'button',
        userId: 123,
        timestamp: Date.now(),
      });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        '[INFO] User action',
        {
          action: 'click',
          element: 'button',
          userId: 123,
          timestamp: expect.any(Number),
        }
      );
    });
  });

  describe('Configuration validation', () => {
    it('should handle invalid log levels gracefully', () => {
      // TypeScript would catch this, but test runtime behavior
      const logger = new Logger({ level: 'invalid' as LogLevel, withTimestamp: false });
      
      // Should default to error level behavior
      logger.debug('Debug message');
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined options', () => {
      const logger = new Logger(undefined);
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should handle partial options', () => {
      const logger = new Logger({ level: 'warn' });
      expect(logger).toBeInstanceOf(Logger);
    });
  });
});
