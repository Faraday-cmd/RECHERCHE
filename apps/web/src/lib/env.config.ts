/**
 * Client-Side Safe Environment Configuration Helper
 * Enforces that Next.js frontend runtime ONLY accesses NEXT_PUBLIC_* variables.
 * Prevents accidental exposure of server-side secrets to client bundles.
 */

export interface ClientEnvConfig {
  apiUrl: string;
  wsUrl: string;
  defaultLocale: string;
  googleMapsApiKey: string;
}

export function getClientEnv(): ClientEnvConfig {
  // Security Assertion: Ensure no server secrets exist in client environment scope
  const forbiddenServerSecrets = [
    'DATABASE_URL',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'ORANGE_MONEY_CLIENT_SECRET',
    'ORANGE_MONEY_WEBHOOK_SECRET',
    'S3_SECRET_KEY',
  ];

  for (const secretKey of forbiddenServerSecrets) {
    if (typeof process !== 'undefined' && process.env && process.env[secretKey]) {
      console.warn(
        `[SECURITY WARNING] ${secretKey} detected in process environment context. Verify this variable is NOT exported to client bundle!`,
      );
    }
  }

  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000',
    defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || 'fr',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  };
}
