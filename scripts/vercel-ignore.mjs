// Vercel "Ignored Build Step" for weiterwert.de (project techverband): exit 0 skips the build, 1 builds.
// .vercelignore removes .git before this runs, so it asks the GitHub API what changed.
// Vercel fetches this file from GitHub at the deployed commit; see the project setting in CLAUDE.md.
const { VERCEL_GIT_PREVIOUS_SHA: prev, VERCEL_GIT_COMMIT_SHA: cur } = process.env;
const APP_ONLY = /^(platform|docs|tests|scripts)\/|\.md$|^package(-lock)?\.json$|^\.gitignore$/;

try {
  if (!prev || !cur) throw new Error('no previous deployment to compare with');
  const res = await fetch(`https://api.github.com/repos/fgulen/techverband/compare/${prev}...${cur}`, {
    headers: { 'User-Agent': 'weiterwert-ignore-step' },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const { files = [] } = await res.json();
  // The API lists at most 300 files; anything that large is always built.
  if (files.length === 0 || files.length >= 300) throw new Error(`${files.length} changed files`);
  const site = files.flatMap((f) => [f.filename, f.previous_filename]).filter(Boolean).filter((n) => !APP_ONLY.test(n));
  console.log(site.length ? `Site files changed: ${site.join(', ')}` : 'Only app, docs or tests changed: skipping build');
  process.exitCode = site.length ? 1 : 0;
} catch (e) {
  console.log(`Building anyway: ${e.message}`);
  process.exitCode = 1;
}
