// Use this code if you don't use the http event with the LAMBDA-PROXY integration
// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

type ResponseCode = 200 | 403;

type ReturnPayload = {
  readonly statusCode: ResponseCode;
  readonly body: string;
};

// eslint-disable-next-line @typescript-eslint/require-await
export const hello = async (event): Promise<ReturnPayload> => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2,
    ),
  };
};
