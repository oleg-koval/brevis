module.exports = {
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  coverageReporters: ['lcov', 'text', 'text-summary'],
  coverageThreshold: {
    global: {
      branches: 99,
      functions: 99,
      lines: 99,
      statements: 99,
    },
  },
  preset: 'ts-jest',
  resetMocks: true,
  roots: ['<rootDir>/src', '<rootDir>/__mocks__'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
