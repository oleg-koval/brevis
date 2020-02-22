import {
  getMongoDbUrl,
  initializeConnectionMap,
  ActiveConnections,
  getConnectionStateByName,
} from './helpers';

describe('helpers', (): void => {
  describe('getMongoDbUrl', (): void => {
    it('returns url', (): void => {
      expect.assertions(1);

      expect(
        getMongoDbUrl({ MONGODB_CONNECTION_STRING: 'test-url' }),
      ).toStrictEqual('test-url');
    });

    it('returns error if environment variable not set', (): void => {
      expect.assertions(1);

      expect(getMongoDbUrl({})).toMatchInlineSnapshot(
        `[Error: MongoDb url is not set.]`,
      );
    });
  });
});

describe('initializeConnectionMap', (): void => {
  it('initializes provided map by name', (): void => {
    expect.assertions(1);

    const testMap: ActiveConnections = new Map();

    expect(initializeConnectionMap(testMap, 'test-name'))
      .toMatchInlineSnapshot(`
        Map {
          "test-name" => 0,
        }
      `);
  });
  it('initializes provided map by default name', (): void => {
    expect.assertions(1);

    const testMap: ActiveConnections = new Map();

    expect(initializeConnectionMap(testMap)).toMatchInlineSnapshot(`
      Map {
        "DEFAULT_CONNECTION" => 0,
      }
    `);
  });
});

describe('getConnectionByName', (): void => {
  it('returns active connection if found', (): void => {
    expect.assertions(1);

    const testMap: ActiveConnections = new Map();

    initializeConnectionMap(testMap);

    testMap.set('DEFAULT_CONNECTION', 1);

    expect(
      getConnectionStateByName(testMap, 'DEFAULT_CONNECTION'),
    ).toStrictEqual(1);
  });

  it('returns default connection', (): void => {
    expect.assertions(1);

    const testMap: ActiveConnections = new Map();

    expect(
      getConnectionStateByName(testMap, 'DEFAULT_CONNECTION'),
    ).toStrictEqual(0);
  });
});
