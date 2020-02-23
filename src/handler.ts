import {
  respondBadRequest,
  respondOk,
  respondInternalError,
  respondNotFound,
} from './responses';
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */

import './environment';
import { Handler, APIGatewayEvent, Context } from 'aws-lambda';
import { isUri } from 'valid-url';
import { pick, isEmpty } from 'ramda';

import { connectToMongoDb } from './database/mongo';
import {
  findOneOrCreate,
  ShortURLModel,
  findAllStatsForUrl,
  ShortUrlType,
} from './models/shortUrl';

type CreateUrlRequestParameters = {
  readonly url: string;
};

export type StatsResponsePayload = {
  readonly url: string;
  readonly hashes: readonly string[];
  readonly ipAddresses: readonly string[];
};

export type CreateUrlResponsePayload = {
  readonly hash: string;
};

export type GetUrlByHashResponsePayload = Pick<
  CreateUrlRequestParameters,
  'url'
>;

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
    return respondBadRequest();
  }

  const body: CreateUrlRequestParameters = JSON.parse(event.body);
  if (isUri(body.url) === false) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();
    const { sourceIp } = event.requestContext.identity;
    const created = await findOneOrCreate({ url: body.url, ip: sourceIp });

    return respondOk({ hash: created._id });
  } catch (error) {
    return respondInternalError();
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
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();
    const shortUrlDocument = await ShortURLModel.findById(hash);
    const documentData = shortUrlDocument?.toObject() as ShortUrlType;

    return shortUrlDocument === null
      ? respondNotFound()
      : respondOk(pick(['url'], documentData));
  } catch (error) {
    return respondInternalError();
  }
};

export const getStatsByUrl: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  /**
   * Any outstanding events continue to run during the next invocation.
   */
  // eslint-disable-next-line functional/immutable-data
  context.callbackWaitsForEmptyEventLoop = false;

  if (typeof event.body !== 'string') {
    return respondBadRequest();
  }

  const body: CreateUrlRequestParameters = JSON.parse(event.body);
  if (isUri(body.url) === false) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();

    const statistics = await findAllStatsForUrl({ url: body.url });

    return isEmpty(statistics) === false
      ? respondOk(statistics)
      : respondNotFound();
  } catch (error) {
    return respondInternalError();
  }
};
