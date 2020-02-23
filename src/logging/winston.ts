import * as winston from 'winston';

const transport = new winston.transports.Console({
  silent: false,
});

const format = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss.SSSSS' }),
  winston.format.json(),
);

const options = {
  format,
  transports: [transport],
};

export const logger = winston.createLogger(options);
