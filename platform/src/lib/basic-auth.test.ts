import { describe, expect, it } from 'vitest';
import { checkBasicAuth } from './basic-auth';

const header = (u: string, p: string) => 'Basic ' + btoa(`${u}:${p}`);

describe('checkBasicAuth', () => {
  it('accepts correct credentials', () => {
    expect(checkBasicAuth(header('ww', 'geheim'), 'ww', 'geheim')).toBe(true);
  });
  it('rejects wrong password, wrong user and missing header', () => {
    expect(checkBasicAuth(header('ww', 'falsch'), 'ww', 'geheim')).toBe(false);
    expect(checkBasicAuth(header('xx', 'geheim'), 'ww', 'geheim')).toBe(false);
    expect(checkBasicAuth(null, 'ww', 'geheim')).toBe(false);
    expect(checkBasicAuth('Bearer abc', 'ww', 'geheim')).toBe(false);
    expect(checkBasicAuth('Basic %%%', 'ww', 'geheim')).toBe(false);
  });
  it('fails closed when credentials env missing', () => {
    expect(checkBasicAuth(header('ww', 'geheim'), undefined, undefined)).toBe(false);
    expect(checkBasicAuth(header('', ''), '', '')).toBe(false);
  });
  it('keeps colons inside the password', () => {
    expect(checkBasicAuth(header('ww', 'a:b'), 'ww', 'a:b')).toBe(true);
  });
});
