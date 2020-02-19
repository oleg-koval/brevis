import { logDebug, logError, logInfo } from '.';

/*
 * Tests
 */

describe('log', (): void => {
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

  beforeEach((): void => {
    jest.resetAllMocks();
  });

  describe('logDebug', (): void => {
    it('should call console log with the correct parameters', (): void => {
      expect.assertions(2);

      const message = 'Test debug message';
      const payload = {
        test: 'test',
      };

      logDebug(message, payload);

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleDebugSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: 'Test debug message',
        severity: 'DEBUG',
        test: 'test',
      });
    });

    it('should call console log with the default parameters', (): void => {
      expect.assertions(2);

      const message = 'Test debug message';

      logDebug(message);

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleDebugSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: 'Test debug message',
        severity: 'DEBUG',
      });
    });
  });

  describe('logError', (): void => {
    it('should call console log with the correct parameters for errors', (): void => {
      expect.assertions(2);

      const error = new Error('Test error message');
      const payload = {
        test: 'test',
      };

      logError(error, payload);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: expect.stringContaining('Error: Test error message'),
        severity: 'ERROR',
        test: 'test',
      });
    });

    it('should call console log with the correct parameters for strings', (): void => {
      expect.assertions(2);

      const error = 'Test error message';

      logError(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: 'Test error message',
        severity: 'ERROR',
      });
    });
  });

  describe('logInfo', (): void => {
    it('should call console log with the correct parameters', (): void => {
      expect.assertions(2);

      const message = 'Test info message';
      const payload = {
        test: 'test',
      };

      logInfo(message, payload);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: 'Test info message',
        severity: 'INFO',
        test: 'test',
      });
    });
    it('should call console log with the default parameters', (): void => {
      expect.assertions(2);

      const message = 'Test info message';

      logInfo(message);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      const logEntry = JSON.parse(consoleLogSpy.mock.calls[0][0]);

      expect(logEntry).toStrictEqual({
        message: 'Test info message',
        severity: 'INFO',
      });
    });
  });
});
