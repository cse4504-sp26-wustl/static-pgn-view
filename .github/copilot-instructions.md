# Copilot instructions for static-pgn-view

Purpose: short, actionable guidance for future Copilot sessions working in this repository.

1) Build, test, and lint (how to run)

- Install:
  - npm install
- Dev server:
  - npm run dev
- Build (production):
  - npm run build
  - Note: build runs `tsc -b` then `vite build`.
- Preview production build locally:
  - npm run preview
- Lint:
  - npm run lint  (runs `eslint .`)
- Tests (Vitest):
  - Full test run: npm run test  (runs `vitest run`)
  - Watch mode: npm run test:watch  (runs `vitest`)
  - Run a single test file:
    - npx vitest run src/path/to/file.test.ts
    - or: npx vitest -t "test name regex" to run tests matching a name
  - Vitest configuration: see `vite.config.ts` (setupFiles: ./src/test/setup.ts, include patterns `src/**/*.test.ts?x`).

2) High-level architecture

- Single-page React app built with Vite and TypeScript.
- Entry points: `src/main.tsx` and `src/App.tsx`.
- Key folders:
  - src/components — UI components (chessboard, game viewers, lists)
  - src/domain — application use-cases / domain logic (PGN handling, formats)
  - src/adapters — I/O or external integration glue (fetching PGN blobs, GitHub raw access)
  - src/config — runtime configuration like `branding.ts` (site title, colors, logo path)
  - src/lib — lower-level utilities and wrappers
- Data flow:
  - PGN files live in a separate `data` branch (pushed to GitHub). A generated `pgn/index.json` maps rounds to commit revisions.
  - At runtime the app fetches rounds from raw.githubusercontent.com keyed by the `index.json` revision so the site shows exact file contents from a commit SHA.
- Third-party libraries:
  - @mliebelt/pgn-parser for PGN parsing
  - chess.js for game state and move validation
  - react-chessboard for board UI
- Deployment: GitHub Pages via workflows in `.github/workflows` (see README for deploy + data branch flow).

3) Key repository conventions and gotchas

- Data branch & PGN naming:
  - All tournament PGN files must be under `pgn/` on the `data` branch and follow the filename pattern `round_<number>.pgn` (this is relied on for discovery and indexing).
  - After pushing to `data`, run the repository workflow that generates `pgn/index.json` so the app can fetch specific commit SHAs.
- Env vars / local testing:
  - Copy `.env.example` → `.env.local` for local testing. Do not commit `.env.local`.
  - VITE_PGN_SOURCE_REPOSITORY controls where PGNs are fetched from (used to construct raw.githubusercontent.com URLs). VITE_BASE_PATH sets the app base path — vite config respects this.
- Branding:
  - Change `src/config/branding.ts` (title, tagline, header colors, `logoSrc`) to update site copy/branding. Static assets should be placed under `public/` and referenced relative to `public/`.
- Build order:
  - `npm run build` uses TypeScript project references (`tsc -b`) before running Vite, so incremental type-checking output matters. Keep `tsconfig.app.json` references in mind when moving files between packages.
- Tests:
  - Vitest runs in jsdom environment; setup file is `src/test/setup.ts`. Test file glob: `src/**/*.test.ts` and `src/**/*.test.tsx`.
- Lint:
  - ESLint entrypoint is `eslint .` (eslint.config.js present). Prefer limiting lint runs to changed files when iterating locally.

4) Where Copilot should look first when making changes

- For UI changes: `src/components` then `src/config/branding.ts` and `public/` for images.
- For PGN handling or format changes: `src/domain` and `src/lib` (and check `src/adapters` for network-loading code).
- For env and deploy specifics: `vite.config.ts` and `.github/workflows`.

5) Other automated/AI config files discovered

- No CLAUDE.md, AGENTS.md, .cursorrules, or other assistant config files were found in the repo root.
- Existing workflows and Pages configuration live in `.github/workflows`.

--
Created: .github/copilot-instructions.md — concise runtime, build/test/lint commands, architecture summary, and repo-specific conventions to guide Copilot sessions.
