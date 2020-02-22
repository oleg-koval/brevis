/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */

import './environment';
import { Handler, APIGatewayEvent, Context } from 'aws-lambda';
import {
  BAD_REQUEST,
  getStatusText,
  OK,
  INTERNAL_SERVER_ERROR,
} from 'http-status-codes';

import { logInfo } from './logging/index';
import { connectToMongoDb } from './database/mongo';
import { MessageModel } from './models/message';
import { Document } from 'mongoose';

export const create: Handler = async (
  event: APIGatewayEvent,
  context: Context,
) => {
  /**
   * If this is false, any outstanding events continue to run during the next invocation
   */
  // eslint-disable-next-line functional/immutable-data
  context.callbackWaitsForEmptyEventLoop = false;
  logInfo(JSON.stringify(context));
  await connectToMongoDb();

  if (typeof event.body !== 'string') {
    return {
      statusCode: BAD_REQUEST,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(BAD_REQUEST),
    };
  }

  try {
    const message: Document = await MessageModel.create(JSON.parse(event.body));
    return {
      statusCode: OK,
      body: JSON.stringify(message),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Could not create the note.',
    };
  }
};

export const get: Handler = async (context: Context) => {
  // eslint-disable-next-line functional/immutable-data
  context.callbackWaitsForEmptyEventLoop = false;
  logInfo(JSON.stringify(context));

  try {
    await connectToMongoDb();
    const messages: readonly Document[] = await MessageModel.find();

    return {
      statusCode: OK,
      body: JSON.stringify(messages),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'text/plain' },
      body: getStatusText(INTERNAL_SERVER_ERROR),
    };
  }
};
