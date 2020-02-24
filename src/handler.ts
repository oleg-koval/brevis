/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */

import './environment';

import { Document } from 'mongoose';
import { Handler, APIGatewayEvent } from 'aws-lambda';
import { isUri } from 'valid-url';
import { pick, isEmpty, pathOr } from 'ramda';

import { logger } from './logging/winston';
import { generateHash } from './shortId';
import { connectToMongoDb } from './database/mongo';
import {
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
  respondNoContent,
} from './responses';
import { getDateYearFromDate } from './date';

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

/**
 * Request a shortened url. Even if a url was already requested it should generate a new hash.

   POST /hash
   body { url: string }

   returns json
   {
     "hash": ${some_hash}
   }
 */
export const createShortUrlByHash: Handler = async (event: APIGatewayEvent) => {
  const ip = ipAddressOrUndefined(event);

  if (isValidRequestBody(event) === false || ip === undefined) {
    return respondBadRequest();
  }

  try {
    await connectToMongoDb();

    const created = await ShortURLModel.create({
      url: JSON.parse(event.body!).url,
      ip,
    });

    return respondOk({ hash: created._id });
  } catch (error) {
    logger.error(error.message);

    return respondInternalError();
  }
};

/**
 * Get the url by using hash. A possible endpoint could look like this:

   GET /url?hash=${HASH}

   returns json

   {
     "url": ${URL}
   }
 */
export const getUrlByHash: Handler = async (event: APIGatewayEvent) => {
  const hash = event.queryStringParameters?.hash;

  if (typeof hash !== 'string') {
    return respondBadRequest();
  }

  if (generateHash.isValid(hash) === false) {
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

/**
 * Create cronjob which will delete every day at 12.00am hashes of URLs which are not longer used by 12 months.
 */
// eslint-disable-next-line functional/functional-parameters
export const cleanup: Handler = async () => {
  try {
    await connectToMongoDb();

    const shortUrlDocument = await ShortURLModel.remove({
      usedAt: { $lte: getDateYearFromDate(new Date()) },
    });

    logger.info(JSON.stringify(shortUrlDocument));

    return respondNoContent();
  } catch (error) {
    logger.error(error.message);

    return respondInternalError();
  }
};

/**
 * Get the statistics of a url.
 */
export const getStatsByUrl: Handler = async (event: APIGatewayEvent) => {
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
