/* eslint-disable no-console */

export enum LogSeverity {
  DEFAULT = 'DEFAULT',
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  NOTICE = 'NOTICE',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
  ALERT = 'ALERT',
  EMERGENCY = 'EMERGENCY',
}

type LogEntry = {
  readonly [key: string]: unknown;
  readonly message: string; // eslint-disable-line functional/no-mixed-type
  readonly severity: LogSeverity;
};

export type LogPayload = {
  readonly [key: string]: unknown;
  readonly message?: never; // eslint-disable-line functional/no-mixed-type
  readonly severity?: never;
};

const consoleError = (string: string): null => {
  console.error(string); // eslint-disable-line functional/no-expression-statement

  return null;
};

const consoleLog = (string: string): null => {
  console.log(string); // eslint-disable-line functional/no-expression-statement

  return null;
};

const consoleDebug = (string: string): null => {
  console.debug(string); // eslint-disable-line functional/no-expression-statement

  return null;
};

const log = (entry: LogEntry): null => {
  const stringifiedEntry = JSON.stringify(entry);

  return entry.severity === LogSeverity.ERROR
    ? consoleError(stringifiedEntry)
    : entry.severity === LogSeverity.INFO
    ? consoleLog(stringifiedEntry)
    : consoleDebug(stringifiedEntry);
};

export const logDebug = (message: string, payload: LogPayload = {}): unknown =>
  log({
    message,
    severity: LogSeverity.DEBUG,
    ...payload,
  });

export const logError = (
  error: Error | string,
  payload: LogPayload = {},
): null =>
  log({
    message: error.toString(),
    severity: LogSeverity.ERROR,
    ...payload,
  });

export const logInfo = (message: string, payload: LogPayload = {}): unknown =>
  log({
    message,
    severity: LogSeverity.INFO,
    ...payload,
  });
