import { env as environment } from 'process';

/**
 * Configuration structures and variables.
 */

/**
 * Pathname mapping.
 */
export enum PathsMapping {
  health = '/health',
  greeter = '/sayHello',
}

/**
 * Server port allocation bounds.
 */
export const PORT_RANGE_LOWER_BOUND = 1024;
export const PORT_RANGE_UPPER_BOUND = 65535;

/**
 * Service-specific configuration.
 */
const DEFAULT_PORT = 3000;

/* istanbul ignore next */
export const PORT =
  environment.PORT === undefined
    ? DEFAULT_PORT
    : parseInt(environment.PORT, 10);
