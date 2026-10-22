export type AppEnv = 'test' | 'production';

/** Anything other than an explicit "test" is treated as production, so hidden drafts never leak. */
export function getAppEnv(): AppEnv {
  return process.env.NEXT_PUBLIC_APP_ENV === 'test' ? 'test' : 'production';
}
