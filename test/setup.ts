import { logger } from '../src/logging/winston';

jest.setTimeout(3000);
logger.transports[0].silent = true; // eslint-disable-line functional/immutable-data

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();

afterEach(
  async (): Promise<void> => {
    // Reset all mocks after each test run.
    jest.clearAllMocks();
  },
);
