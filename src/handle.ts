import { Handler, APIGatewayEvent, Context } from 'aws-lambda';

// import { logInfo } from './logging/index';

enum Paths {
  SayHello = '/say-hello',
  Messages = '/messages',
}

export const hello: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Test',
        input: { event, context },
      },
      null,
      2,
    ),
  };
  const responseTwo = {
    statusCode: 500,
    body: JSON.stringify(
      {
        message: 'Bad',
        // input: { event, context },
      },
      null,
      2,
    ),
  };

  return event.path === Paths.SayHello ? response : responseTwo;
};
