//TODO: use base62 instead of 64. Additional characters '$@' are not "friendly" for short-url.

import * as _shortId from 'shortid';

const alphaNumericCharset =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const additionalCharacters = '$@';

// eslint-disable-next-line functional/no-expression-statement
_shortId.characters(`${alphaNumericCharset}${additionalCharacters}`);

export const shortId: typeof _shortId = _shortId;
