# Nexus Automate — Hybrid Playwright + Stagehand Framework
## Project Plan

**License:** MIT
**Monetization:** None planned

---

## Phase 0 — Repo Setup (Day 1)

- Init repo: `nexus-automate` (or chosen name), TypeScript, `pnpm`
- Install: `playwright`, `@browserbasehq/stagehand`, `tsx`, `typescript`, `zod`, `pino`
- Add `.gitignore` (`screenshots/`, `traces/`, `reports/`, `.env.local`, `.nexus-cache.json`)
- License: **MIT**
- README stub, `e2e.config.ts` skeleton
- Commit the empty folder structure exactly as outlined below, so Git history shows clean evolution

---

## Phase 1 — MVP Core (Week 1)

Build only what's in this list, strictly in order:

1. **`config.ts`** — single config + env var overrides
2. **`core/browser.ts` — the CDP bridge.** Initializes Stagehand (`LOCAL` env) and connects native Playwright to it via:
   ```ts
   const browser = await chromium.connectOverCDP({
     wsEndpoint: stagehand.connectURL(),
   });
   ```
   This is the piece that lets Playwright and Stagehand share a single browser context — without it, Playwright and Stagehand end up driving two separate browsers.
3. **`executor.ts` — the hybrid router.** Tries standard Playwright locators first; only if a step is explicitly prefixed `ai:` does it fall through to `stagehand.act(instruction, { page: pwPage })`.
4. **`verifier.ts`** — `verifyFn` (Playwright assertions) first; AI extract fallback with a strict PASS/FAIL prompt, validated against a Zod schema.
5. **`lifecycle.ts`** — setup → steps → verify → teardown orchestration
6. **`auth/login.ts` + `cookie-store.ts`** — login once via UI, save cookies to JSON, reuse across runs
7. **`run.ts`** — CLI entry point, discovers spec files, runs sequentially
8. Console reporter + screenshot-on-failure

**Exit criteria:** 3–5 real specs pass against a live app, under 500 LOC (excluding specs), under 3 minutes total runtime.

---

## Phase 2 — Harden & Cache (Week 2)

Only add these once the MVP is proven stable:

- **`cache.ts` — the locator cache layer.** Once Stagehand resolves an `ai:` step to a concrete locator, cache that resolution to a local JSON file, keyed by `(instruction, URL path)`. On subsequent runs, check the cache before calling Stagehand at all — this is what keeps a hybrid framework fast and cheap at scale instead of paying an LLM call every run for steps that never actually change.
- **Test data factory** — `createUser()`, `createTodo()`, etc., run-scoped namespacing (`e2e-{runId}-`)
- **Guaranteed teardown** — `try/finally` blocks + a stale-data sweeper for anything older than 1 hour
- **Page Object layer** — one file per page/component, plus a central `selectors.ts` registry
- **Step-level retry** — AI steps only, 1 retry with backoff
- **Structured logging** — Pino for fast, low-overhead JSON logs

---

## Phase 3 — Production Features (Weeks 3–4)

Add in priority order:

1. Worker pool — parallel execution (`pool.ts`), isolated browser context per worker
2. Playwright trace capture on failure (DOM snapshots + network + console)
3. JUnit XML reporter (for CI) and self-contained HTML reporter + trend history
4. Sharding for CI (`--shard 1/3`, etc.)
5. Tagging (`@smoke`, `@regression`, `@critical`) + `--tag` filter
6. Multi-user auth — admin/regular roles, separate cookie jars per user

**Defer:** visual regression, Core Web Vitals, bundle-size guard — real, useful modules, but only worth building when an actual use case shows up.

---

## Phase 4 — GitHub Readiness (Week 4–5)

- CI template: GitHub Actions workflow (install → auth → run → upload artifacts)
- README: quickstart, spec example, config reference, architecture diagram
- CONTRIBUTING.md + spec-writing style guide
- ESLint rule for specs (warn on missing teardown, warn on unbounded timeout)
- Semantic versioning + CHANGELOG, tagged `v0.1.0` release
- `pnpm e2e:new` spec generator/scaffolder for developer experience

---

## Suggested Milestones

| Tag | Contains |
|---|---|
| v0.1.0 | MVP core (hybrid Playwright + Stagehand, CDP bridge) |
| v0.2.0 | Caching layer, data mgmt, page objects, Pino logging |
| v0.3.0 | Parallel execution + reporting |
| v1.0.0 | Full CI integration, docs complete |

---

## Project Structure

```
e2e/
├── run.ts                 # CLI entry point, arg parsing
├── config.ts              # Layered config resolution
├── core/
│   └── browser.ts          # CDP bridge: Stagehand <-> Playwright shared context
├── engine/
│   ├── executor.ts        # Hybrid step executor (Playwright-first, AI fallback)
│   ├── verifier.ts        # Verification (assert fn + AI extract)
│   ├── pool.ts            # Worker pool for parallel execution
│   ├── lifecycle.ts       # setup -> steps -> verify -> teardown orchestration
│   ├── cache.ts           # Locator cache (instruction + URL -> resolved locator)
│   └── retry.ts           # Step-level retry logic
├── auth/
│   ├── login.ts           # OAuth login flow
│   ├── cookie-store.ts    # Save/load/validate cookies
│   └── users.ts           # User registry (credentials per role)
├── data/
│   ├── factory.ts         # createTodo(), createUser() etc.
│   ├── cleanup.ts         # Teardown + stale data sweeper
│   └── api-client.ts      # Typed HTTP client for app API
├── pages/
│   ├── login.page.ts      # Page objects (selectors + actions)
│   ├── dashboard.page.ts
│   └── todo.page.ts
├── reporting/
│   ├── console.ts         # Live terminal output
│   ├── junit.ts           # XML generation
│   ├── html.ts            # Self-contained HTML report
│   └── history.ts         # Append to trend file
├── helpers/
│   ├── assertions.ts      # expectVisible, expectText, etc.
│   ├── errors.ts          # HTTP/console error capture
│   └── performance.ts     # Load time + vitals capture
├── specs/
│   ├── smoke/
│   │   ├── login.spec.ts
│   │   └── create-todo.spec.ts
│   └── regression/
│       ├── edit-todo.spec.ts
│       ├── delete-todo.spec.ts
│       └── bulk-actions.spec.ts
├── screenshots/           # gitignored
├── traces/                # gitignored
├── reports/               # gitignored
└── package.json           # playwright, @browserbasehq/stagehand, tsx, zod, pino
```

---

## Principles

- Total code under 500 lines (excluding specs) — if it's more, you're overengineering
- Every test is independent — runs alone, in any order, no shared state
- Setup via API, verify via UI — fastest reliable pattern
- AI is a luxury, not a crutch — used only where selectors are genuinely unstable, and cached once resolved
- Fail loud, fail fast — no retries at the test level, no heuristic PASS-flipping, no lenient verdicts
- Run in under 3 minutes at MVP scale — if slower, too many AI calls or too many tests
