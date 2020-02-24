import { ShortURLModel } from './../src/models/shortUrl';
import { connectToMongoDb } from '../src/database/mongo';
import { logger } from '../src/logging/winston';

jest.setTimeout(3000);
logger.transports[0].silent = true; // eslint-disable-line functional/immutable-data

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();

/**
 * Delete all collections and indexes
 */
export const cleanup = async (): Promise<void> => {
  await connectToMongoDb();
  await ShortURLModel.collection.drop();

  return;
};

afterEach(
  async (): Promise<void> => {
    // Reset all mocks after each test run.
    jest.clearAllMocks();

    // Clean database.
    await cleanup().catch(logger.warn);
  },
);

beforeAll(() => {
  connectToMongoDb().catch(logger.warn);
});
