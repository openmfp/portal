import { bootstrapEnv } from './bootstrapEnv';

describe('Bootstrap env', () => {
  beforeEach(function () {
    delete process.env.GHT_GITHUB_CLIENT_ID;
  });

  it('should have an env matching the .env file', () => {
    process.env.NODE_ENV = 'test';

    bootstrapEnv({
      envFilePath: '.env-example',
    });

    expect(process.env.GHT_GITHUB_CLIENT_ID).toBe('fb86755e1358b11c7a8f');
  });

  it('should implemement unit-test for DXPFRAME-4', () => {
    expect(true).toBeTruthy();
  });
});
