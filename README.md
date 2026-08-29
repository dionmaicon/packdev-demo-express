# packdev-demo-repo

Live Dependabot target for [packdev-agents](https://github.com/dionmaicon/packdev-agents).
A small real npm-workspaces monorepo — `packages/api` is a minimal but real
Express app with real HTTP tests, pinned to an old exact `express` version
so Dependabot has something real to bump.

Meant to stay **private**. Only `packdev-agents` (the action being
referenced) needs to be public — see its README for why.

## Layout

- `package.json` — workspaces root, declares `"workspaces": ["packages/*"]`.
- `packages/api/` — the actual bump target. `express` pinned to an exact
  old version, a real Express app (`src/app.js`), and real tests that hit
  it over actual HTTP (`test/app.test.js`, no mocking).
- `.github/dependabot.yml` — `directory: "/packages/api"`, npm ecosystem,
  daily schedule.
- `.github/workflows/packdev-compat.yml` — runs on every `dependabot[bot]`
  PR, `uses: dionmaicon/packdev-agents@main` with
  `package-json-path: packages/api/package.json` (packdev-agents'
  monorepo-subdirectory support).

## Verified locally before ever touching GitHub

A real `express` bump (`4.18.2` → `4.22.2`) was run through
packdev-agents' actual `runGithubPipeline` against a real base/head commit
pair of this repo, with a fake GitHub sink (no network calls to the GitHub
API) — verdict came back `PASSED`, auto-merge eligible, control correctly
resolved to `4.18.2`. That commit was then dropped: this repo's default
branch stays at the pre-bump state so a real Dependabot run has something
genuine to propose, rather than the bump already having happened locally.

## To go live

1. Push `packdev-agents` to `github.com/dionmaicon/packdev-agents` (public).
2. Push this repo to GitHub (private is fine).
3. Enable Dependabot (already configured via `.github/dependabot.yml` —
   GitHub picks it up automatically once pushed).
4. Either wait for Dependabot's daily schedule, or trigger it immediately
   via **Insights → Dependency graph → Dependabot → Check for updates**.
