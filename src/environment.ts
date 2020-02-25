/**
 * An example of .env file:
 *
 *
 * MONGODB_CONNECTION_STRING=mongodb+srv://<login>:<password>@<cluster-name>.mongodb.net/<dbName>
 * NODE_ENV=production
 *
 */

import { resolve } from 'path';
import { config } from 'dotenv';

// eslint-disable-next-line functional/no-expression-statement
config({ path: resolve(__dirname, '../.env') });
