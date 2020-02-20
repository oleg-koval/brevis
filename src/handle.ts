import { Handler, APIGatewayEvent, Context } from 'aws-lambda';

// import { logInfo } from './logging/index';

export const hello: Handler = async (
  event: APIGatewayEvent,
  context: Context,
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: { event, context },
      },
      null,
      2,
    ),
  };
};
