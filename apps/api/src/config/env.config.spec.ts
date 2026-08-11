import { validateEnv } from './env.schema';

describe('Environment Configuration Validation & Security Boundaries', () => {
  const validDevConfig = {
    NODE_ENV: 'development',
    PORT: '4000',
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    JWT_ACCESS_SECRET: 'super_secret_access_key_for_dev_mode_testing_123',
    JWT_REFRESH_SECRET: 'super_secret_refresh_key_for_dev_mode_testing_123',
  };

  it('should successfully parse valid development configuration', () => {
    const config = validateEnv(validDevConfig);
    expect(config.NODE_ENV).toBe('development');
    expect(config.PORT).toBe(4000);
    expect(config.DEFAULT_LOCALE).toBe('fr');
    expect(config.DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
  });

  it('should default language to French (fr) when unspecified', () => {
    const config = validateEnv(validDevConfig);
    expect(config.DEFAULT_LOCALE).toBe('fr');
  });

  it('should throw validation error when DATABASE_URL is not a valid URL', () => {
    const invalidConfig = {
      ...validDevConfig,
      DATABASE_URL: 'invalid-url-string',
    };
    expect(() => validateEnv(invalidConfig)).toThrow(
      /Environment Configuration Validation Failed/,
    );
  });

  it('should throw security failure in production when JWT_ACCESS_SECRET is weak or placeholder', () => {
    const prodConfigWeak = {
      ...validDevConfig,
      NODE_ENV: 'production',
      JWT_ACCESS_SECRET: 'placeholder_secret',
    };
    expect(() => validateEnv(prodConfigWeak)).toThrow(
      /Production Security Failure/,
    );
  });

  it('should isolate server-only secrets from client-safe variables', () => {
    const config = validateEnv(validDevConfig);
    // Server secrets should exist in backend config
    expect(config.JWT_ACCESS_SECRET).toBeDefined();
    expect(config.DATABASE_URL).toBeDefined();

    // Verify key names do not contain NEXT_PUBLIC_ prefix
    const keys = Object.keys(config);
    const publicExposedKeys = keys.filter((k) => k.startsWith('NEXT_PUBLIC_'));
    expect(publicExposedKeys.length).toBe(0);
  });
});
