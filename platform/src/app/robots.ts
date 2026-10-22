import type { MetadataRoute } from 'next';
import { getAppEnv } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return getAppEnv() === 'test'
    ? { rules: { userAgent: '*', disallow: '/' } }
    : { rules: { userAgent: '*', allow: '/' } };
}
