import { resolve } from 'path';
import { config } from 'dotenv';

// eslint-disable-next-line functional/no-expression-statement
config({ path: resolve(__dirname, '../.env') });
