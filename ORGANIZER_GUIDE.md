# Tournament site — organizer guide

This repository is a **static React app** (Vite) that displays chess games from PGN files.
The website code lives on `main`, while tournament data is read at runtime from a separate `data` branch.

## One-time setup (repository maintainer)

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Create a branch named `data`.
4. In `data`, add a `pgn/` folder with round files named like:
   - `pgn/round_1.pgn`
   - `pgn/round_2.pgn`
   - `pgn/round_3.pgn`
5. Push to `main` (or run the **Deploy tournament site to GitHub Pages** workflow manually). The site will be available at:

   `https://<org-or-user>.github.io/<repository-name>/`

## Adding or updating rounds (no code changes)

1. Switch to the `data` branch.
2. Add or update files under `pgn/` (for example `pgn/round_3.pgn`).
3. Keep filenames in the pattern `round_<number>.pgn` so rounds can be discovered automatically.
4. Commit and push to `data`. The live site reads from this branch automatically, so no website rebuild is required.

PGN files should follow normal export conventions: tag pairs, a blank line, then movetext. Multiple games in one file are supported (separate games with a blank line between them).

## Branding (optional code edit)

Edit `src/config/branding.ts` for site title, tagline, header colors, and optional logo.

- To use a logo, add an image under `public/` (for example `public/branding/logo.png`) and set `logoSrc` to `branding/logo.png` (path relative to `public/`).

Branding is isolated from PGN parsing: changing colors or copy does not affect how games are loaded or displayed.

## Local development

From the repository root:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`).

## Linking CLI-generated PGN

The root TypeScript app can produce PGN via `PgnFormatter` / PGN use cases. Copy or export those `.pgn` files into `pgn/` on the `data` branch using `round_<number>.pgn` names, then push to publish new rounds without changing site code.
