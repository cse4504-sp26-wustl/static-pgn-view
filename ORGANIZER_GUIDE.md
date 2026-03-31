# Tournament site — organizer guide

This folder is a **static React app** (Vite) that reads PGN files from the repository and displays games in the browser. Deploy it with **GitHub Pages** using the workflow `.github/workflows/deploy-github-pages.yml`.

## One-time setup (repository maintainer)

1. In the GitHub repository, open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the **Deploy tournament site to GitHub Pages** workflow manually). The site will be available at:

   `https://<org-or-user>.github.io/<repository-name>/`

## Adding or updating rounds (no code changes)

1. Place PGN files under `web/public/pgn/` (for example `round_3.pgn`).
2. Edit `web/public/pgn/manifest.json`:
   - Set `tournamentName` if needed.
   - Add a `rounds` entry with a unique `id`, human-readable `label`, and the `file` name (must match the file you added).
3. Commit and push. The GitHub Actions workflow rebuilds the site; organizers do not edit React components for routine updates.

PGN files should follow normal export conventions: tag pairs, a blank line, then movetext. Multiple games in one file are supported (separate games with a blank line between them).

## Branding (optional code edit)

Edit `src/config/branding.ts` for site title, tagline, header colors, and optional logo.

- To use a logo, add an image under `web/public/` (for example `public/branding/logo.png`) and set `logoSrc` to `branding/logo.png` (path relative to `public/`).

Branding is isolated from PGN parsing: changing colors or copy does not affect how games are loaded or displayed.

## Local development

From the `web/` directory:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/`).

## Linking CLI-generated PGN

The root TypeScript app can produce PGN via `PgnFormatter` / PGN use cases. Copy or export those `.pgn` files into `web/public/pgn/`, update `manifest.json`, and rebuild or push to trigger deployment.
