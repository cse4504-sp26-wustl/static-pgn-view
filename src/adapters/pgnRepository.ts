import type { PgnManifest } from "../domain/types";

export type PgnRepository = {
  loadManifest(): Promise<PgnManifest>;
  loadRoundPgnFile(relativeFile: string): Promise<string>;
};

/**
 * Fetches manifest and round files from /pgn/… (Vite public dir, works on GitHub Pages with correct base).
 */
export function createStaticPgnRepository(assetBaseUrl: string): PgnRepository {
  const pgnBase = `${assetBaseUrl}pgn/`;

  return {
    async loadManifest() {
      const res = await fetch(`${pgnBase}manifest.json`);
      if (!res.ok) {
        throw new Error(`Failed to load manifest: ${res.status} ${res.statusText}`);
      }
      return (await res.json()) as PgnManifest;
    },
    async loadRoundPgnFile(relativeFile: string) {
      const safe = relativeFile.replace(/^\/+/, "");
      const res = await fetch(`${pgnBase}${safe}`);
      if (!res.ok) {
        throw new Error(`Failed to load ${safe}: ${res.status} ${res.statusText}`);
      }
      return res.text();
    },
  };
}
