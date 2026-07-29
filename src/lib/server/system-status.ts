import { getServerEnv } from '#/lib/shared/env';

export type SystemStatus = {
  ok: true;
  app: string;
  environment: 'development' | 'test' | 'production';
  timestamp: string;
  nodeVersion: string;
};

/** Pure server utility — no external infrastructure required. */
export function getSystemStatus(appName: string): SystemStatus {
  const env = getServerEnv();
  return {
    ok: true,
    app: appName,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    nodeVersion: process.versions.node,
  };
}
