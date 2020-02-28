import { getDateYearFromDate } from './date';
import { Context, APIGatewayEvent } from 'aws-lambda';

import {
  getUrlByHash,
  getStatsByUrl,
  createShortUrlByHash,
  cleanup,
} from './handler';
import { ShortURLModel } from './models/shortUrl';
import * as shortId from './shortId';
import * as database from './database/mongo';

/**
 * Test utilities.
 */
const callbackMock = jest.fn();

/**
 * Test setup.
 */
afterEach(
  async (): Promise<void> => {
    jest.restoreAllMocks();
  },
);

describe('getUrlByHash', (): void => {
  describe('error handling', (): void => {
    it('returns bad request if query params are not provided', async (): Promise<
      void
    > => {
      expect.assertions(1);

      const event = {};
      const context = {} as Context;

      const response = getUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
                        Object {
                          "body": "Bad Request",
                          "headers": Object {
                            "Content-Type": "text/plain",
                          },
                          "statusCode": 400,
                        }
                  `);
    });

    it('returns bad request if hash is not valid', async (): Promise<void> => {
      expect.assertions(1);

      const event = { queryStringParameters: { hash: '42' } };
      const context = {} as Context;

      const response = getUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
          Object {
            "body": "Bad Request",
            "headers": Object {
              "Content-Type": "text/plain",
            },
            "statusCode": 400,
          }
      `);
    });

    it('returns internal server error if connection to DB cant be established', async (): Promise<
      void
    > => {
      expect.assertions(1);

      jest
        .spyOn(database, 'connectToMongoDb')
        .mockRejectedValueOnce('database-connection-error');

      const event = { queryStringParameters: { hash: shortId.generateHash() } };
      const context = {} as Context;

      const response = getUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "Server Error",
          "headers": Object {
            "Content-Type": "text/plain",
          },
          "statusCode": 500,
        }
      `);
    });

    it('returns 404 if url not found', async (): Promise<void> => {
      expect.assertions(1);

      const context = {} as Context;

      const event = { queryStringParameters: { hash: 'es1kmI9f' } };
      const response = getUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "Not Found",
          "headers": Object {
            "Content-Type": "text/plain",
          },
          "statusCode": 404,
        }
      `);
    });
  });

  describe('data persistance', (): void => {
    it('returns url by hash', async (): Promise<void> => {
      expect.assertions(1);

      const context = {} as Context;

      // create entry in database
      await ShortURLModel.create({
        _id: 'foobar',
        url: 'https://google.com',
        ip: '1.1.1.1',
      });

      const event = { queryStringParameters: { hash: 'foobar' } };

      const response = getUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "{\\"url\\":\\"https://google.com\\"}",
          "headers": Object {
            "Content-Type": "application/json",
          },
          "statusCode": 200,
        }
      `);
    });
  });
});

describe('cleanup', (): void => {
  describe('error handling', (): void => {
    it('returns internal server error if connection to DB cant be established', async (): Promise<
      void
    > => {
      expect.assertions(1);

      jest
        .spyOn(database, 'connectToMongoDb')
        .mockRejectedValueOnce('database-connection-error');

      const response = cleanup({} as APIGatewayEvent, {} as Context, jest.fn());

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "Server Error",
          "headers": Object {
            "Content-Type": "text/plain",
          },
          "statusCode": 500,
        }
      `);
    });
  });

  describe('data persistance', (): void => {
    it('removes expired hashes', async (): Promise<void> => {
      expect.assertions(1);

      const dateNowSpy = jest.spyOn(Date, 'now');
      const fakeDate = new Date('2018-02-24T00:00:00.000Z');

      dateNowSpy.mockReturnValue(fakeDate.getTime());

      // create entry in database
      await ShortURLModel.create({
        _id: shortId.generateHash(),
        url: 'https://google.com',
        ip: '1.1.1.1',
        usedAt: getDateYearFromDate(fakeDate),
      });
      await ShortURLModel.create({
        _id: shortId.generateHash(),
        url: 'https://facebook.com',
        ip: '1.1.1.1',
        usedAt: getDateYearFromDate(fakeDate),
      });

      const response = cleanup({} as APIGatewayEvent, {} as Context, jest.fn());

      await expect(response).resolves.toMatchInlineSnapshot(`
Object {
  "statusCode": 204,
}
`);
    });
  });
});

describe('getStatsByUrl', (): void => {
  describe('error handling', (): void => {
    it('returns bad request if query params are not provided', async (): Promise<
      void
    > => {
      expect.assertions(1);

      const event = {};
      const context = {} as Context;

      const response = getStatsByUrl(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
          Object {
            "body": "Bad Request",
            "headers": Object {
              "Content-Type": "text/plain",
            },
            "statusCode": 400,
          }
      `);
    });

    it('returns 404 if no stats found', async (): Promise<void> => {
      expect.assertions(1);

      const context = {} as Context;

      // create entry in database
      await ShortURLModel.create({
        _id: 'foobar',
        url: 'https://google.com',
        ip: '1.1.1.1',
      });
      await ShortURLModel.create({
        _id: '424242',
        url: 'https://google.com',
        ip: '2.2.2.2',
      });

      const event = { body: JSON.stringify({ url: 'https://example.com' }) };

      const response = getStatsByUrl(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
      Object {
        "body": "Not Found",
        "headers": Object {
          "Content-Type": "text/plain",
        },
        "statusCode": 404,
      }
      `);
    });

    it('returns internal server error if connection to DB cant be established', async (): Promise<
      void
    > => {
      expect.assertions(1);

      jest
        .spyOn(database, 'connectToMongoDb')
        .mockRejectedValueOnce('database-connection-error');

      const event = { body: JSON.stringify({ url: 'https://example.com' }) };
      const context = {} as Context;

      const response = getStatsByUrl(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "Server Error",
          "headers": Object {
            "Content-Type": "text/plain",
          },
          "statusCode": 500,
        }
      `);
    });
  });

  describe('data persistance', (): void => {
    it('returns url by hash', async (): Promise<void> => {
      expect.assertions(1);

      const context = {} as Context;

      // create entry in database
      await ShortURLModel.create({
        _id: 'foobar',
        url: 'https://google.com',
        ip: '1.1.1.1',
      });
      await ShortURLModel.create({
        _id: 'foobar2',
        url: 'https://google.com',
        ip: '1.1.1.1',
      });
      await ShortURLModel.create({
        _id: '424242',
        url: 'https://google.com',
        ip: '2.2.2.2',
      });

      const event = { body: JSON.stringify({ url: 'https://google.com' }) };

      const response = getStatsByUrl(event, context, callbackMock);

      const res = await response;
      expect(JSON.parse(res.body)).toMatchInlineSnapshot(`
      Object {
        "hashes": Array [
          "foobar",
          "424242",
          "foobar2",
        ],
        "ipAddresses": Array [
          "1.1.1.1",
          "2.2.2.2",
        ],
        "url": "https://google.com",
      }
      `);
    });
  });
});

describe('createShortUrlByHash', (): void => {
  describe('error handling', (): void => {
    it('returns bad request if query params are not provided', async (): Promise<
      void
    > => {
      expect.assertions(1);

      const event = { requestContext: { identity: { sourceIp: '8.8.8.8' } } };
      const context = {} as Context;

      const response = createShortUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
          Object {
            "body": "Bad Request",
            "headers": Object {
              "Content-Type": "text/plain",
            },
            "statusCode": 400,
          }
      `);
    });

    it('returns internal server error if connection to DB cant be established', async (): Promise<
      void
    > => {
      expect.assertions(1);

      jest
        .spyOn(database, 'connectToMongoDb')
        .mockRejectedValueOnce('database-connection-error');

      const event = {
        body: JSON.stringify({ url: 'https://example.com' }),
        requestContext: { identity: { sourceIp: '8.8.8.8' } },
      };
      const context = {} as Context;

      const response = createShortUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
        Object {
          "body": "Server Error",
          "headers": Object {
            "Content-Type": "text/plain",
          },
          "statusCode": 500,
        }
      `);
    });

    it('returns error if ip is missing in event', async (): Promise<void> => {
      expect.assertions(1);

      const event = {
        body: JSON.stringify({ url: 'https://example.com' }),
        requestContext: {},
      };
      const context = {} as Context;

      const response = createShortUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
      Object {
        "body": "Bad Request",
        "headers": Object {
          "Content-Type": "text/plain",
        },
        "statusCode": 400,
      }
      `);
    });

    it('returns error if url is not valid', async (): Promise<void> => {
      expect.assertions(1);

      const event = {
        body: JSON.stringify({ url: 'foo' }),
        requestContext: { identity: { sourceIp: '8.8.8.8' } },
      };
      const context = {} as Context;

      const response = createShortUrlByHash(event, context, callbackMock);

      await expect(response).resolves.toMatchInlineSnapshot(`
      Object {
        "body": "Bad Request",
        "headers": Object {
          "Content-Type": "text/plain",
        },
        "statusCode": 400,
      }
      `);
    });
  });

  describe('data persistance', (): void => {
    it('creates url hash by provided url', async (): Promise<void> => {
      expect.assertions(1);

      const context = {} as Context;

      const event = {
        body: JSON.stringify({ url: 'https://google.com' }),
        requestContext: { identity: { sourceIp: '8.8.8.8' } },
      };

      const response = createShortUrlByHash(event, context, callbackMock);

      const res = await response;
      expect(JSON.parse(res.body)).toHaveProperty('hash');
    });

    it('return url hash if it was previously created for specific IP address', async (): Promise<
      void
    > => {
      expect.assertions(1);

      const context = {} as Context;

      await ShortURLModel.create({
        _id: '424242',
        url: 'https://google.com',
        ip: '8.8.8.8',
      });

      const event = {
        body: JSON.stringify({ url: 'https://google.com' }),
        requestContext: { identity: { sourceIp: '8.8.8.8' } },
      };

      const response = createShortUrlByHash(event, context, callbackMock);

      const res = await response;
      expect(JSON.parse(res.body)).toHaveProperty('hash');
    });
  });
});
