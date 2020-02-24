# url-shortener-service

![Continuous Integration](https://github.com/oleg-koval/brevis/workflows/Continuous%20Integration/badge.svg?branch=master)
![Continuous Delivery](https://github.com/oleg-koval/brevis/workflows/Continuous%20Delivery/badge.svg?branch=master)
[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d52bec96f419528495c4)

## Getting Started

Functions deployed with Serverless framework to
[AWS Lambda](https://aws.amazon.com/lambda/) at

[https://7b8kyoyw1e.execute-api.us-east-1.amazonaws.com/prod](https://7b8kyoyw1e.execute-api.us-east-1.amazonaws.com/prod)

Data storage - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Build with
[TypeScript](https://www.typescriptlang.org).

[Postman collection](https://www.getpostman.com/collections/d52bec96f419528495c4)
can be used to test endpoints locally and remotely.

| function             | type     | path           | execution time | description                                                                                            |
| -------------------- | -------- | -------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| createShortUrlByHash | http     | POST /hash     | -//-           | Request a shortened url. Even if a url was already requested it should generate a new hash.            |
| getUrlByHash         | http     | GET /url       | -//-           | Get the url by using hash.                                                                             |
| getStatsByUrl        | http     | GET /stats/url | -//-           | Get the statistics of a url.List of all hashes which were generated and list of ip addresses of users. |
| cleanup              | schedule | -//-           | `0 0 * * ? *`  | Cronjob which will delete every day at 12.00am hashes of URLs which are not longer used by 12 months.  |

### TODO:

Some things would be great to add:

- use base62 instead of base64 encoding for url hash. Additional characters `$@`
  are not "friendly" for short-url;
- add black list of urls, during creation check if url is not blacklisted or use
  bloom filter;
- alerting in slack channel;

### Prerequisites

Minimal requirements to set up the project:

- [Node.js](https://nodejs.org/en) v12, installation instructions can be found
  on the official website, a recommended installation option is to use
  [Node Version Manager](https://github.com/creationix/nvm#readme). It can be
  installed in a
  [few commands](https://nodejs.org/en/download/package-manager/#nvm).
- A package manager [npm](https://www.npmjs.com). All instructions in the
  documentation will follow the npm syntax.
- [Serverless](https://serverless.com/)
- [docker-compose](https://docs.docker.com/compose)
- Optionally, a [Git](https://git-scm.com) client.

### Installing

Start by cloning the repository:

```bash
git clone git@github.com:oleg-koval/brevis.git
```

In case you don't have a git client, you can get the latest version directly by
using [this link](https://github.com/oleg-koval/brevis/archive/master.zip) and
extracting the downloaded archive.

Go the the right directory and install dependencies:

```bash
cd brevis
npm install
```

Install serverless:

```bash
npm install -g serverless
```

Login to serverless:

```bash
sls login
```

That's it! You can now go to the next step.

#### Run locally

Environment is managed with [`dotenv`](https://www.npmjs.com/package/dotenv).
Rename `.env.example` to `.env`.

Environment variable **MONGODB_CONNECTION_STRING** should be present: f.e.:
`mongodb://0.0.0.0:27017/test`

Run `mongodb` container in detached mode:

```shell
docker-compose up -d
```

Run tests with coverage:

```shell
npm run test:coverage
```

Alternatively `serverless offline` can be used to run functions locally
(connection to local MongoDB or hosted should be provided):

```shell
sls offline start
```

It is possible to invoke functions locally (connection to local MongoDB or
hosted should be provided) with `sls invoke local --function <functionName>`

#### Run tests

## Tests

All tests are being executed using Jest. All tests files live side-to-side with
a source code and have a common suffix: `.spec.ts`. Some helper methods are
being stored in the `test` directory.

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

### Automation

- [GitHub Actions](https://github.com/features/actions)
- [Dependabot](https://dependabot.com/)
- [Serverless](https://serverless.com)
