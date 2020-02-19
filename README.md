# service

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Usage

## Getting Started

These instructions will get you a copy of the project up and running on your
local machine for development and testing purposes. See usage notes on how to
consume this package in your project.

### Prerequisites

Minimal requirements to set up the project:

- [Node.js](https://nodejs.org/en) v12, installation instructions can be found
  on the official website, a recommended installation option is to use
  [Node Version Manager](https://github.com/creationix/nvm#readme). It can be
  installed in a
  [few commands](https://nodejs.org/en/download/package-manager/#nvm).
- A package manager [npm](https://www.npmjs.com). All instructions in the
  documentation will follow the npm syntax.
- Optionally, a [Git](https://git-scm.com) client.

### Installing

Start by cloning the repository:

```bash
git clone git@github.com:oleg-koval/type-script-express-open-api-template.git
```

In case you don't have a git client, you can get the latest version directly by
using
[this link](https://github.com/oleg-koval/type-script-express-open-api-template/archive/master.zip)
and extracting the downloaded archive.

Go the the right directory and install dependencies:

```bash
cd type-script-express-open-api-template
npm install
```

That's it! You can now go to the next step.

## Tests

All tests are being executed using Jest. All tests files live side-to-side with
a source code and have a common suffix: .spec.ts. Some helper methods are being
stored in the test directory.

```bash
npm run test:start
```

There are three helper scripts to run tests in the most common scenarios:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

### Formatting

This project uses [Prettier](https://prettier.io) to automate formatting. All
supported files are being reformatted in a pre-commit hook. You can also use one
of the two scripts to validate and optionally fix all of the files:

```bash
npm run format
npm run format:fix
```

### Linting

This project uses [ESLint](https://eslint.org) to enable static analysis.
TypeScript files are linted using a [custom configuration](./.eslintrc). You can
use one of the following scripts to validate and optionally fix all of the
files:

```bash
npm run lint
npm run lint:fix
```

### Coverage

[TBD]

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

### Automation

- [GitHub Actions](https://github.com/features/actions)
- [Dependabot](https://dependabot.com/)

### Source

- [TypeScript](https://www.typescriptlang.org)

## Versioning

This project adheres to [Semantic Versioning](http://semver.org) v2.
