function safeEqual(a: string, b: string): boolean {
  // Compare full length every time so timing does not reveal how many characters matched.
  let diff = a.length ^ b.length;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/** Validates an HTTP Basic Authorization header. Missing or empty configured credentials always fail. */
export function checkBasicAuth(header: string | null, user: string | undefined, pass: string | undefined): boolean {
  if (!user || !pass || !header?.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const userOk = safeEqual(decoded.slice(0, sep), user);
  const passOk = safeEqual(decoded.slice(sep + 1), pass);
  return userOk && passOk;
}
