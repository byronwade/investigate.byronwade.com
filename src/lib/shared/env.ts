import { z } from 'zod';

/**
 * Centralized environment access.
 * - Public vars: safe for client bundles (VITE_*).
 * - Server vars: only read via getServerEnv() from server-only modules.
 */

/** Treat missing/blank Vite env values as undefined so Zod defaults apply. */
export function emptyToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
}

const publicEnvSchema = z.object({
  VITE_APP_NAME: z.preprocess(emptyToUndefined, z.string().min(1).default('Investigate')),
  VITE_APP_URL: z.preprocess(emptyToUndefined, z.string().url().default('http://localhost:3000')),
  VITE_ENABLE_ANALYTICS: z.preprocess(
    emptyToUndefined,
    z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  ),
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

/** Parse public env from an explicit input map (also used by tests). */
export function parsePublicEnv(input: {
  VITE_APP_NAME?: string | undefined;
  VITE_APP_URL?: string | undefined;
  VITE_ENABLE_ANALYTICS?: string | undefined;
}): PublicEnv {
  const result = publicEnvSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`Invalid public environment variables: ${formatZodError(result.error)}`);
  }
  return result.data;
}

export function getPublicEnv(): PublicEnv {
  if (cachedPublicEnv) return cachedPublicEnv;

  cachedPublicEnv = parsePublicEnv({
    VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
    VITE_APP_URL: import.meta.env.VITE_APP_URL,
    VITE_ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS,
  });

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
