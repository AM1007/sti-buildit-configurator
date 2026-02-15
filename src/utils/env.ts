type AppEnv = 'development' | 'staging' | 'production';

interface EnvConfig {
  APP_ENV: AppEnv;
  BASE_URL: string;
  IS_PRODUCTION: boolean;
  IS_STAGING: boolean;
  IS_DEVELOPMENT: boolean;
}

function getEnvConfig(): EnvConfig {
  const appEnv = (import.meta.env.VITE_APP_ENV as AppEnv) ?? 'development';

  return {
    APP_ENV: appEnv,
    BASE_URL: (import.meta.env.VITE_BASE_URL as string) ?? 'http://localhost:5173',
    IS_PRODUCTION: appEnv === 'production',
    IS_STAGING: appEnv === 'staging',
    IS_DEVELOPMENT: appEnv === 'development',
  };
}

export const env = getEnvConfig();