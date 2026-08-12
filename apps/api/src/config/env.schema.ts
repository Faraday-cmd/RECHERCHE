import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  API_PREFIX: z.string().default('api/v1'),
  DEFAULT_LOCALE: z.string().default('fr'),
  SUPPORTED_LOCALES: z.string().default('fr,en'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database & Storage
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  DIRECT_URL: z.string().optional().default(''),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),

  // JWT Auth Secrets
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters long'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters long'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),

  // Integration Placeholders (Orange Money - Server-Only Secret Boundaries)
  ORANGE_MONEY_API_URL: z.string().optional().default(''),
  ORANGE_MONEY_MERCHANT_KEY: z.string().optional().default(''),
  ORANGE_MONEY_CLIENT_ID: z.string().optional().default(''),
  ORANGE_MONEY_CLIENT_SECRET: z.string().optional().default(''),
  ORANGE_MONEY_WEBHOOK_SECRET: z.string().optional().default(''),

  // Integration Placeholders (MTN Mobile Money - Server-Only Secret Boundaries)
  MTN_MOMO_BASE_URL: z.string().optional().default(''),
  MTN_MOMO_API_USER: z.string().optional().default(''),
  MTN_MOMO_API_KEY: z.string().optional().default(''),
  MTN_MOMO_PRIMARY_KEY: z.string().optional().default(''),
  MTN_MOMO_WEBHOOK_SECRET: z.string().optional().default(''),

  GOOGLE_MAPS_SERVER_API_KEY: z.string().optional().default(''),

  S3_ENDPOINT: z.string().optional().default('http://localhost:9000'),
  S3_BUCKET: z.string().optional().default('recherche-attachments'),
  S3_ACCESS_KEY: z.string().optional().default('placeholder_s3_access_key'),
  S3_SECRET_KEY: z.string().optional().default('placeholder_s3_secret_key'),
  S3_REGION: z.string().optional().default('us-east-1'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors.map(
      (err) => `  - ${err.path.join('.')}: ${err.message}`,
    );
    throw new Error(
      `[FATAL] Environment Configuration Validation Failed:\n${errors.join('\n')}`,
    );
  }

  // Production Security Verification Guard
  if (config.NODE_ENV === 'production') {
    const serverSecrets = [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
    ];
    for (const secretKey of serverSecrets) {
      const val = String(config[secretKey] || '');
      if (val.includes('placeholder') || val.length < 32) {
        throw new Error(
          `[FATAL] Production Security Failure: ${secretKey} must be a strong random secret (>= 32 chars) in production mode.`,
        );
      }
    }
  }

  return result.data;
}
