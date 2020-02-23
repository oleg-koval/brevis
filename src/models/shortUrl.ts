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
  },
  options,
);

/* eslint-disable functional/no-expression-statement */
ShortURLSchema.index({ ip: 1, url: 1 });
ShortURLSchema.index({ url: 1 });
/* eslint-enable functional/no-expression-statement */

export const ShortURLModel = model('ShortUrl', ShortURLSchema);

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
