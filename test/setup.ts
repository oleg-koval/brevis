jest.setTimeout(3000);

jest.spyOn(console, 'log').mockImplementation();
jest.spyOn(console, 'error').mockImplementation();
jest.spyOn(console, 'warn').mockImplementation();

afterEach(
  async (): Promise<void> => {
    // Reset all mocks after each test run.
    jest.clearAllMocks();
  },
);
