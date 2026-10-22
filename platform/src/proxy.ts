import { NextResponse, type NextRequest } from 'next/server';
import { getAppEnv } from '@/lib/env';
import { checkBasicAuth } from '@/lib/basic-auth';

export function proxy(request: NextRequest) {
  if (getAppEnv() !== 'test') return NextResponse.next();

  const ok = checkBasicAuth(
    request.headers.get('authorization'),
    process.env.BASIC_AUTH_USER,
    process.env.BASIC_AUTH_PASSWORD,
  );
  const res = ok
    ? NextResponse.next()
    : new NextResponse('Anmeldung erforderlich', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="WeiterWert Test", charset="UTF-8"' },
      });
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|fonts/).*)'],
};
