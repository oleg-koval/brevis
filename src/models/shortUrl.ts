/**
 * @model ShortURLSchema
 */

import { Schema, model, Document } from 'mongoose';
import { shortId } from '../shortId';

const options = {
  versionKey: false,
};

export type ShortUrlType = {
  readonly url: string;
  readonly hash: string;
  readonly ip: string;
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
