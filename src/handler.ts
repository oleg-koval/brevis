import { Document } from 'mongoose';
import { pathOr } from 'ramda';
/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */

import './environment';
import { Handler, APIGatewayEvent } from 'aws-lambda';
import { isUri } from 'valid-url';
import { pick, isEmpty } from 'ramda';

import { logger } from './logging/winston';
import { shortId } from './shortId';
import { connectToMongoDb } from './database/mongo';
import {
  findOneOrCreate,
  ShortURLModel,
  findAllStatsForUrl,
  ShortUrlType,
  updateUsedAt,
} from './models/shortUrl';
import {
  respondBadRequest,
  respondOk,
  respondInternalError,
  respondNotFound,
} from './responses';

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

const ipAddressOrUndefined = (event: APIGatewayEvent): string | undefined =>
  pathOr(undefined, ['requestContext', 'identity', 'sourceIp'], event);

const isValidRequestBody = (event: APIGatewayEvent): boolean => {
  if (typeof event.body !== 'string') {
    return false;
  }

  const body: CreateUrlRequestParameters = JSON.parse(event.body);
  if (isUri(body.url) === undefined) {
    return false;
  }

  return true;
};

export const createShortUrlByHash: Handler = async (event: APIGatewayEvent) => {
  /**
   * Any outstanding events continue to run during the next invocation.
   */
  // eslint-disable-next-line functional/immutable-data
  // context.callbackWaitsForEmptyEventLoop = false;

  const ip = ipAddressOrUndefined(event);

  if (isValidRequestBody(event) === false || ip === undefined) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();

    const created = await findOneOrCreate({
      url: JSON.parse(event.body!).url,
      ip,
    });

    return respondOk({ hash: created._id });
  } catch (error) {
    logger.error(error.message);

    return respondInternalError();
  }
};

export const getUrlByHash: Handler = async (event: APIGatewayEvent) => {
  // eslint-disable-next-line functional/immutable-data
  // context.callbackWaitsForEmptyEventLoop = false;

  const hash = event.queryStringParameters?.hash;

  if (typeof hash !== 'string') {
    return respondBadRequest();
  }

  if (shortId.isValid(hash) === false) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();

    const shortUrlDocument = await ShortURLModel.findById(hash);

    const documentData = shortUrlDocument?.toObject() as ShortUrlType;
    if (shortUrlDocument === null) {
      return respondNotFound();
    }

    await updateUsedAt(shortUrlDocument as Document & ShortUrlType, Date.now());
    return respondOk(pick(['url'], documentData));
  } catch (error) {
    logger.error(error.message);

    return respondInternalError();
  }
};

export const getStatsByUrl: Handler = async (event: APIGatewayEvent) => {
  /**
   * Any outstanding events continue to run during the next invocation.
   */
  // eslint-disable-next-line functional/immutable-data
  // context.callbackWaitsForEmptyEventLoop = false;

  if (isValidRequestBody(event) === false) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();

    const statistics = await findAllStatsForUrl({
      url: JSON.parse(event.body!).url,
    });

    return isEmpty(statistics) === false
      ? respondOk(statistics)
      : respondNotFound();
  } catch (error) {
    logger.error(error.message);

    return respondInternalError();
  }
};
