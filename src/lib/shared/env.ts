import { z } from 'zod';

/**
 * Centralized environment access.
 * - Public vars: safe for client bundles (VITE_*).
 * - Server vars: only read via getServerEnv() from server-only modules.
 */

const publicEnvSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default('Investigate'),
  VITE_APP_URL: z.string().url().default('http://localhost:3000'),
  VITE_ENABLE_ANALYTICS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  SERVER_SESSION_SECRET: z.string().min(32).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedPublicEnv: PublicEnv | undefined;
let cachedServerEnv: ServerEnv | undefined;

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
    .join('; ');
}

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  const result = publicEnvSchema.safeParse({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  });

  if (!result.success) {
    throw new Error(`Invalid public environment variables: ${formatZodError(result.error)}`);
  }

  cachedPublicEnv = result.data;
  return cachedPublicEnv;
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() must not be called from the browser');
  }

  if (cachedServerEnv) return cachedServerEnv;

  const result = serverEnvSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SERVER_SESSION_SECRET: process.env.SERVER_SESSION_SECRET,
  });

  if (!result.success) {
    throw new Error(`Invalid server environment variables: ${formatZodError(result.error)}`);
  }

  cachedServerEnv = result.data;
  return cachedServerEnv;
}

/** Test helper — clears memoized env values. */
export function resetEnvCacheForTests(): void {
  cachedPublicEnv = undefined;
  cachedServerEnv = undefined;
}
