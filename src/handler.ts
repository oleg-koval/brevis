/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */

import './environment';
import { Handler, APIGatewayEvent, Context } from 'aws-lambda';
import {
  BAD_REQUEST,
  getStatusText,
  OK,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
} from 'http-status-codes';
import { isUri } from 'valid-url';
import { pick } from 'ramda';

import { connectToMongoDb } from './database/mongo';
import { findOneOrCreate, ShortURLModel } from './models/shortUrl';

type CreateUrlPayload = {
  readonly url: string;
};

export const createShortUrlByHash: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  /**
   * Any outstanding events continue to run during the next invocation.
   */
  // eslint-disable-next-line functional/immutable-data
  context.callbackWaitsForEmptyEventLoop = false;

  if (typeof event.body !== 'string') {
    return {
      statusCode: BAD_REQUEST,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(BAD_REQUEST),
    };
  }

  const body: CreateUrlPayload = JSON.parse(event.body);
  if (isUri(body.url) === false) {
    return {
      statusCode: BAD_REQUEST,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(BAD_REQUEST),
    };
  }

  try {
    await connectToMongoDb();
    const { sourceIp } = event.requestContext.identity;

    const created = await findOneOrCreate({ url: body.url, ip: sourceIp });
    return {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: created._id,
      }),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the note.',
    };
  }
};

export const getUrlByHash: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  // eslint-disable-next-line functional/immutable-data
  context.callbackWaitsForEmptyEventLoop = false;

  const hash = event.queryStringParameters?.hash;

  if (typeof hash !== 'string') {
    return {
      statusCode: BAD_REQUEST,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(BAD_REQUEST),
    };
  }

  try {
    await connectToMongoDb();
    const shortUrlDocument = await ShortURLModel.findById(hash);

    return shortUrlDocument === null
      ? {
          statusCode: NOT_FOUND,
          headers: { 'Content-Type': 'text/plain' },
          body: getStatusText(NOT_FOUND),
        }
      : {
          statusCode: OK,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pick(['url'], shortUrlDocument)),
        };
  } catch (error) {
    return {
      statusCode: error.statusCode || INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(INTERNAL_SERVER_ERROR),
    };
  }
};
