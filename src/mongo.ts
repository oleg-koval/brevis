/* eslint-disable functional/prefer-readonly-type */

import { logInfo } from './logging';
import { env as environment } from 'process';
import * as mongoose from 'mongoose';

/**
 * TODO: Investigate why mongoose.ConnectionStates are not reachable after
 * build.
 */
export enum ConnectionStates {
  disconnected = 0,
  connected = 1,
  connecting = 2,
  disconnecting = 3,
  uninitialized = 99,
}

const DEFAULT_CONNECTION_NAME = 'DEFAULT_CONNECTION';

type ActiveConnections = Map<string, number>;
type Mongoose = typeof mongoose;
type EnvironmentOverride = {
  readonly [key: string]: string;
};

const activeConnections: ActiveConnections = new Map();

/**
 * Connects to MongoDb with connection string,
 * returns connection and readyState (ConnectionStates).
 * @param connectionString
 */
const connectByMongoUrl = async (
  connectionString: string,
): Promise<{
  connect: Mongoose;
  readyState: number;
}> => {
  const connect = await mongoose.connect(connectionString, {
    useNewUrlParser: true,
  });

  return {
    connect,
    readyState: connect.connections[0].readyState,
  };
};

const getConnectionByName = (
  // eslint-disable-next-line functional/prefer-readonly-type
  map: ActiveConnections,
  connectionName: string,
): number => map.get(connectionName) ?? 0;

const updateConnectionByName = (
  // eslint-disable-next-line functional/prefer-readonly-type
  map: ActiveConnections,
  connectionName: string,
  state: mongoose.ConnectionStates,
  // eslint-disable-next-line functional/prefer-readonly-type
): ActiveConnections => map.set(connectionName, state);

const initializeConnectionMap = (
  map: ActiveConnections,
  connectionName: string = DEFAULT_CONNECTION_NAME,
): ActiveConnections => map.set(connectionName, 0);

const getMongoDbUrl = (environment: EnvironmentOverride): string => {
  const mongoDbUrl = environment.MONGODB_CONNECTION_STRING;

  return mongoDbUrl ? mongoDbUrl : 'MongoDb url is not set.';
};

const useActiveConnectionState = async (
  activeConnectionState: number,
  connectionName: string,
): Promise<Error | Mongoose> => {
  // eslint-disable-next-line functional/no-conditional-statement
  switch (activeConnectionState) {
    case ConnectionStates.connected: {
      const message = `Connection ${connectionName} is already in use`;

      // eslint-disable-next-line functional/no-expression-statement
      logInfo(message);

      return new Error(message);
    }
    case ConnectionStates.connecting:
    case ConnectionStates.disconnected:
    case ConnectionStates.disconnecting: {
      const mongooseConnectionState = await connectByMongoUrl(
        getMongoDbUrl(environment as EnvironmentOverride),
      );

      const { readyState, connect } = mongooseConnectionState;

      // eslint-disable-next-line functional/no-expression-statement
      updateConnectionByName(activeConnections, connectionName, readyState);

      return connect;
    }
    case ConnectionStates.uninitialized:
      return new Error(
        `Connection to MongoDb using ${connectionName} is uninitialized`,
      );
    default:
      return new Error(
        `Unknown connection state ${activeConnectionState} using ${connectionName}`,
      );
  }
};

export const connectToMongoDb = async (
  connectionName: string = DEFAULT_CONNECTION_NAME,
): Promise<Mongoose | Error> => {
  const connectionsMap = initializeConnectionMap(
    activeConnections,
    connectionName,
  );

  const activeConnectionState = getConnectionByName(
    connectionsMap,
    connectionName,
  );

  return useActiveConnectionState(activeConnectionState, connectionName);
};
