const { relative } = require('path');

module.exports = {
  '*.{js,json,md,ts,yml,yaml}': ['prettier --write', 'git add'],
  '*.ts': ['eslint', 'git add'],
  '*': filenames =>
    `cspell ${filenames
      .map(filename => `'${relative(__dirname, filename)}'`)
      .join(' ')}`,
};
