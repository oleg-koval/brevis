/* eslint-disable functional/no-conditional-statement */

import { env as environment } from 'process';
import * as mongoose from 'mongoose';

import {
  ActiveConnections,
  DEFAULT_CONNECTION_NAME,
  EnvironmentOverride,
  getConnectionStateByName,
  getMongoDbUrl,
  initializeConnectionMap,
  updateConnectionByName,
} from './helpers';
import { logger } from '../logging/winston';

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

type Mongoose = typeof mongoose;

const activeConnections: ActiveConnections = new Map();

/**
 * Connects to MongoDb with connection string,
 * returns connection and readyState (ConnectionStates).
 * @param connectionString
 */
export const connectByMongoUrl = async (
  connectionString: string,
): Promise<{
  readonly connect: Mongoose;
  readonly readyState: number;
}> => {
  const connect = await mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return {
    connect,
    readyState: connect.connections[0].readyState,
  };
};

export const useActiveConnectionState = async (
  activeConnectionState: number,
  connectionName: string,
): Promise<Error | Mongoose | void> => {
  // eslint-disable-next-line functional/no-conditional-statement
  switch (activeConnectionState) {
    case ConnectionStates.connected: {
      const message = `Connection ${connectionName} is already in use`;

      // eslint-disable-next-line functional/no-expression-statement
      logger.warn(message);

      return Promise.resolve();
    }
    case ConnectionStates.connecting:
    case ConnectionStates.disconnected:
    case ConnectionStates.disconnecting: {
      const mongoUrlOrError = getMongoDbUrl(environment as EnvironmentOverride);

      if (typeof mongoUrlOrError !== 'string') {
        // eslint-disable-next-line functional/no-expression-statement
        logger.error(mongoUrlOrError);

        return mongoUrlOrError;
      }

      const mongooseConnectionState = await connectByMongoUrl(mongoUrlOrError);

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
): Promise<Mongoose | void> => {
  const connectionsMap = initializeConnectionMap(
    activeConnections,
    connectionName,
  );

  const activeConnectionState = getConnectionStateByName(
    connectionsMap,
    connectionName,
  );

  const connectedOrError = await useActiveConnectionState(
    activeConnectionState,
    connectionName,
  );

  if (connectedOrError instanceof Error) {
    // eslint-disable-next-line functional/no-expression-statement
    logger.error(connectedOrError);

    // eslint-disable-next-line functional/no-throw-statement
    throw connectedOrError;
  }

  return connectedOrError;
};
