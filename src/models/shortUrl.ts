/**
 * @model ShortURLSchema
 */

import { Schema, model, Document } from 'mongoose';

import { shortId } from '../shortId';
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
      default: shortId.generate,
    },
    url: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now },
    usedAt: { type: Date, default: Date.now },
  },
  options,
);

/* eslint-disable functional/no-expression-statement */
ShortURLSchema.index({ ip: 1, url: 1 });
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

export const findOneOrCreate = async (
  condition: Pick<ShortUrlType, 'url' | 'ip'>,
): Promise<Document> => {
  const shortUrlDocument = await ShortURLModel.findOne(condition);

  return shortUrlDocument !== null
    ? shortUrlDocument
    : ShortURLModel.create(condition);
};

export const findAllStatsForUrl = async (
  condition: Pick<ShortUrlType, 'url'>,
): Promise<StatsResponsePayload> => {
  const shortUrlDocuments = await ShortURLModel.find(condition);

  return shortUrlDocuments.reduce<StatsResponsePayload>(
    (
      previous: StatsResponsePayload,
      current: Document,
    ): StatsResponsePayload => {
      const document: ShortUrlType = current.toObject();

      return Object.keys(previous).length !== 0
        ? {
            ...previous,
            hashes: [...previous.hashes, document._id],
            ipAddresses: [...previous.ipAddresses, document.ip],
          }
        : {
            url: condition.url,
            hashes: [document._id],
            ipAddresses: [document.ip],
          };
    },
    {} as StatsResponsePayload,
  );
};
