/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
import { Handler, APIGatewayEvent, Context } from 'aws-lambda';

import { logInfo } from './logging/index';

enum Paths {
  SayHello = '/say-hello',
  Messages = '/messages',
}

const GetPayload = {
  statusCode: 200,
  body: JSON.stringify(
    {
      message: 'Hello, World!',
    },
    null,
    2,
  ),
};

const PostPayload = {
  statusCode: 201,
  body: JSON.stringify(
    {
      message: 'Created.',
    },
    null,
    2,
  ),
};

const getResponse = (
  path: Paths,
): { readonly statusCode: number; readonly body: string } => {
  switch (path) {
    case Paths.SayHello:
      return GetPayload;
    case Paths.Messages:
      return PostPayload;
    default:
      'wrong path';
  }

  return {
    statusCode: 403,
    body: JSON.stringify(
      {
        message: 'Bad request.',
      },
      null,
      2,
    ),
  };
};

export const hello: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  logInfo(JSON.stringify(context));

  return getResponse(event.path as Paths);
};
