import { ConnectionStates } from './mongo';

/* eslint-disable functional/prefer-readonly-type */

export type EnvironmentOverride = {
  readonly [key: string]: string;
};

export type ActiveConnections = Map<string, number>;

export const DEFAULT_CONNECTION_NAME = 'DEFAULT_CONNECTION';

export const getMongoDbUrl = (
  environment: EnvironmentOverride,
): string | Error => {
  const mongoDbUrl = environment.MONGODB_CONNECTION_STRING;

  return mongoDbUrl ? mongoDbUrl : new Error('MongoDb url is not set.');
};

export const initializeConnectionMap = (
  map: ActiveConnections,
  connectionName: string = DEFAULT_CONNECTION_NAME,
): ActiveConnections => map.set(connectionName, 0);

export const getConnectionStateByName = (
  map: ActiveConnections,
  connectionName: string,
): number => map.get(connectionName) ?? 0;

export const updateConnectionByName = (
  // eslint-disable-next-line functional/prefer-readonly-type
  map: ActiveConnections,
  connectionName: string,
  state: ConnectionStates,
  // eslint-disable-next-line functional/prefer-readonly-type
): ActiveConnections => map.set(connectionName, state);
