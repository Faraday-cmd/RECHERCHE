import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('4000'),
  API_PREFIX: z.string().default('api/v1'),
  DEFAULT_LOCALE: z.string().default('fr'),
  SUPPORTED_LOCALES: z.string().default('fr,en'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Database & Storage (Safe fallback for serverless cold-start)
  DATABASE_URL: z.string().optional().default('postgresql://user:password@localhost:5432/postgres'),
  DIRECT_URL: z.string().optional().default(''),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),

  // JWT Auth Secrets (Safe fallback for serverless cold-start)
  JWT_ACCESS_SECRET: z.string().optional().default('dev_jwt_access_secret_recherche_v1_min_32_chars_long'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().optional().default('dev_jwt_refresh_secret_recherche_v1_min_32_chars_long'),
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

  // Resend Email Integration Secrets & Webhook Verification
  RESEND_API_KEY: z.string().optional().default(''),
  RESEND_WEBHOOK_SECRET: z.string().optional().default(''),
  RESEND_FROM_EMAIL: z.string().optional().default('RECHERCHE <notifications@recherche.cm>'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.errors.map(
      (err) => `  - ${err.path.join('.')}: ${err.message}`,
    );
    console.warn(`[WARN] Environment Configuration Warnings:\n${errors.join('\n')}`);
  }

  const validData = result.success ? result.data : (envSchema.parse({}) as EnvConfig);
  return validData;
}
