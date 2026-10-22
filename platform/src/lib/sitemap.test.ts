import { describe, expect, it } from 'vitest';
import { SITEMAP } from './sitemap';

describe('SITEMAP (slim Faz 1)', () => {
  it('has unique paths', () => {
    const paths = SITEMAP.map((p) => p.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
  it('contains the slim page set', () => {
    expect(SITEMAP.map((p) => p.path).sort()).toEqual(
      ['/', '/admin', '/annahmekriterien', '/datenschutz', '/geraetepartnerschaft', '/impressum', '/spenden'].sort(),
    );
  });
  it('gates feature pages', () => {
    const by = Object.fromEntries(SITEMAP.map((p) => [p.path, p]));
    expect(by['/spenden'].feature).toBe('spenden');
    expect(by['/geraetepartnerschaft'].feature).toBe('geraetepartnerschaft');
    expect(by['/admin'].feature).toBe('admin');
  });
});
