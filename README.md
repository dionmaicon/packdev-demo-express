# packdev-demo-express

Live Dependabot target for [packdev-agents](https://github.com/dionmaicon/packdev-agents).
A real npm-workspaces monorepo with **two independently-Dependabot-tracked
apps** — `packages/api` and `packages/worker` — both minimal but real
Express services with real HTTP tests, both pinned to the same old exact
`express` version so either can get its own genuine Dependabot bump PR.

Meant to stay **private**. Only `packdev-agents` (the action being
referenced) needs to be public — see its README for why.

## Layout

- `package.json` — workspaces root, declares `"workspaces": ["packages/*"]`.
- `packages/api/` — a small user-lookup API (`/health`, `/users/:id`, `/echo`).
- `packages/worker/` — a small notification service (`/health`, `/notify`,
  `/notifications/:id`) — deliberately a different real app, not a copy of
  `api`, so the two are genuinely independent.
- Both: `express` pinned to an exact old version, real tests hitting the
  app over actual HTTP (`node:test` + `node:http`, no mocking, no test
  framework dependency).
- `.github/dependabot.yml` — **two** `updates:` entries, one per package
  directory. GitHub opens a separate PR per directory that has a bump —
  a bump never touches both `packages/api/package.json` and
  `packages/worker/package.json` in the same PR.
- `.github/workflows/packdev-compat.yml` — runs on every `dependabot[bot]`
  PR, `uses: dionmaicon/packdev-agents@main`. **No `package-json-path`
  input** — this is the point of having two apps: packdev-agents
  auto-discovers which one actually changed from the diff itself, rather
  than needing a hardcoded path (which could only ever have pointed at one
  of the two).

## Verified locally before ever touching GitHub

Two real `express` bumps (`4.18.2` → `4.22.2`) were run through
packdev-agents' actual `runGithubPipeline`, against real commits on
throwaway branches of this exact repo, with a fake GitHub sink (no GitHub
API calls) — **without** passing `packageJsonPath`:

- A bump to only `packages/worker/package.json` → correctly discovered
  `packages/worker/package.json` as the changed file, tested worker's own
  app in isolation, verdict `PASSED`, auto-merge eligible.
- A bump to only `packages/api/package.json` → correctly discovered
  `packages/api/package.json`, tested api's own app in isolation, verdict
  `PASSED`, auto-merge eligible.

Both verification branches were then deleted — `master` stays at the
pre-bump state (`express@4.18.2` in both packages) so a real Dependabot run
has something genuine to propose.

## To go live

1. Push `packdev-agents` to `github.com/dionmaicon/packdev-agents` (public).
2. Push this repo to GitHub (private is fine).
3. Enable Dependabot (already configured via `.github/dependabot.yml` —
   GitHub picks it up automatically once pushed).
4. Either wait for Dependabot's daily schedule, or trigger it immediately
   per ecosystem via **Insights → Dependency graph → Dependabot → Check
   for updates**.
