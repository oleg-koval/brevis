import * as mongoose from 'mongoose';

import * as mongo from './mongo';
import * as helpers from './helpers';

afterEach((): void => {
  jest.restoreAllMocks();
});

describe('connectToMongoDb', (): void => {
  describe('error handling', (): void => {
    it('re-uses connection if it is already in use - code 1', async (): Promise<
      void
    > => {
      jest
        .spyOn(helpers, 'initializeConnectionMap')
        .mockImplementationOnce(() => {
          const mockMap = new Map();
          mockMap.set('test-connection', 1);
          return mockMap;
        });

      jest
        .spyOn(helpers, 'getMongoDbUrl')
        .mockImplementationOnce(() => 'test-connection-url');

      jest.spyOn(mongoose, 'connect').mockResolvedValue(
        Promise.resolve({
          connections: [
            {
              readyState: 1,
            },
          ],
        } as typeof mongoose),
      );

      expect.assertions(1);

      await expect(mongo.connectToMongoDb('test-connection')).resolves
        .toMatchInlineSnapshot(`
              Object {
                "connections": Array [
                  Object {
                    "readyState": 1,
                  },
                ],
              }
            `);
    });

    it('throws if connection is uninitialized - code 99', async (): Promise<
      void
    > => {
      jest
        .spyOn(helpers, 'initializeConnectionMap')
        .mockImplementationOnce(() => {
          const mockMap = new Map();
          mockMap.set('test-connection', 99);
          return mockMap;
        });

      jest
        .spyOn(helpers, 'getMongoDbUrl')
        .mockImplementationOnce(() => 'test-connection-url');

      jest.spyOn(mongoose, 'connect').mockResolvedValue(
        Promise.resolve({
          connections: [
            {
              readyState: 99,
            },
          ],
        } as typeof mongoose),
      );

      expect.assertions(1);

      await expect(
        mongo.connectToMongoDb('test-connection'),
      ).rejects.toMatchInlineSnapshot(
        `[Error: Connection to MongoDb using test-connection is uninitialized]`,
      );
    });

    it('throws if connection is unknown', async (): Promise<void> => {
      jest
        .spyOn(helpers, 'initializeConnectionMap')
        .mockImplementationOnce(() => {
          const mockMap = new Map();
          mockMap.set('test-connection', 42);
          return mockMap;
        });

      jest
        .spyOn(helpers, 'getMongoDbUrl')
        .mockImplementationOnce(() => 'test-connection-url');

      jest.spyOn(mongoose, 'connect').mockResolvedValue(
        Promise.resolve({
          connections: [
            {
              readyState: 99,
            },
          ],
        } as typeof mongoose),
      );

      expect.assertions(1);

      await expect(
        mongo.connectToMongoDb('test-connection'),
      ).rejects.toMatchInlineSnapshot(
        `[Error: Unknown connection state 42 using test-connection]`,
      );
    });

    it.each([0, 2, 3])(
      'throws if MONGODB_CONNECTION_STRING is not provided',
      async (): Promise<void> => {
        jest
          .spyOn(helpers, 'initializeConnectionMap')
          .mockImplementationOnce(() => {
            const mockMap = new Map();
            mockMap.set('test-connection', 0);
            return mockMap;
          });

        jest
          .spyOn(helpers, 'getMongoDbUrl')
          .mockReturnValueOnce(new Error('MongoDb url is not set.'));

        jest.spyOn(mongoose, 'connect').mockResolvedValue(
          Promise.resolve({
            connections: [
              {
                readyState: 0,
              },
            ],
          } as typeof mongoose),
        );

        expect.assertions(1);

        await expect(
          mongo.connectToMongoDb('test-connection'),
        ).rejects.toBeTruthy();
      },
    );
  });

  describe('connection', (): void => {
    it.each([0, 2, 3])(
      'returns mongoose connected state, initializes connection',
      async (code: number): Promise<void> => {
        expect.assertions(1);

        jest
          .spyOn(helpers, 'initializeConnectionMap')
          .mockImplementationOnce(() => {
            const mockMap = new Map();
            mockMap.set('test-connection', code);
            return mockMap;
          });

        jest
          .spyOn(helpers, 'getMongoDbUrl')
          .mockImplementationOnce(() => 'test-connection-url');

        jest.spyOn(mongoose, 'connect').mockResolvedValue(
          Promise.resolve({
            connections: [
              {
                readyState: 1,
              },
            ],
          } as typeof mongoose),
        );

        const connection = await mongo.connectToMongoDb('test-connection');

        expect(connection).toMatchInlineSnapshot(`
        Object {
          "connections": Array [
            Object {
              "readyState": 1,
            },
          ],
        }
      `);
      },
    );

    it('returns mongoose connected state, initializes default connection', async (): Promise<
      void
    > => {
      expect.assertions(1);

      jest
        .spyOn(helpers, 'initializeConnectionMap')
        .mockImplementationOnce(() => {
          const mockMap = new Map();
          mockMap.set(helpers.DEFAULT_CONNECTION_NAME, 0);
          return mockMap;
        });

      jest
        .spyOn(helpers, 'getMongoDbUrl')
        .mockImplementationOnce(() => 'test-connection-url');

      jest.spyOn(mongoose, 'connect').mockResolvedValue(
        Promise.resolve({
          connections: [
            {
              readyState: 1,
            },
          ],
        } as typeof mongoose),
      );

      const connection = await mongo.connectToMongoDb();

      expect(connection).toMatchInlineSnapshot(`
        Object {
          "connections": Array [
            Object {
              "readyState": 1,
            },
          ],
        }
      `);
    });
  });
});
