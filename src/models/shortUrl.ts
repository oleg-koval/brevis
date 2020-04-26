/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/**
 * @model ShortURLSchema
 */

import { Schema, model, Document } from 'mongoose';

import { generateHash } from '../shortId';
import { StatsResponsePayload } from '../handler';

const options = {
  versionKey: false,
};

export type ShortUrlType = {
  readonly _id: string;
  readonly url: string;
  readonly ip: string;
  readonly createdAt: number;
  // eslint-disable-next-line functional/prefer-readonly-type
  usedAt: number;
};

const ShortURLSchema = new Schema(
  {
    _id: {
      type: String,
      default: generateHash.generate,
    },
    url: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now },
    usedAt: { type: Date, default: Date.now },
  },
  options,
);

ShortURLSchema.index({ usedAt: 1 });
ShortURLSchema.index({ url: 1 });

export const ShortURLModel = model('ShortUrl', ShortURLSchema);

/**
 * Each time client requests url by hash, "usedAt" field is updated with current time.
 * "usedAt" date used for cleanup all hashes of URLs which are not longer used by N months.
 */
export const updateUsedAt = async (
  shortUrlDocument: Document & ShortUrlType,
  usedAt: number,
): Promise<Document> => {
  // eslint-disable-next-line functional/immutable-data
  shortUrlDocument.usedAt = usedAt;

  return shortUrlDocument.save();
};

export const aggregateStatistics = async (
  url: string,
): Promise<StatsResponsePayload> => {
  const [statistics] = await ShortURLModel.aggregate([
    { $match: { url } },
    {
      $group: {
        _id: '$url',
        ipAddresses: { $addToSet: '$ip' },
        hashes: { $addToSet: '$_id' },
      },
    },
    {
      $project: {
        _id: 0,
        url: '$_id',
        ipAddresses: 1,
        hashes: 2,
      },
    },
  ]);

  return statistics;
};
