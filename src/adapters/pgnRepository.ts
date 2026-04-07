import type { PgnManifest } from "../domain/types";

export type PgnRepository = {
  loadManifest(): Promise<PgnManifest>;
  loadRoundPgnFile(relativeFile: string): Promise<string>;
};

type StaticPgnRepositoryOptions = {
  pgnBaseUrl: string;
  githubRepository?: string;
  dataBranch?: string;
  pgnDirectory?: string;
  tournamentName?: string;
};

type GitHubContentsItem = {
  name: string;
  type: "file" | "dir" | "symlink" | "submodule";
};

type PgnIndex = {
  files: string[];
};

const ROUND_FILE_PATTERN = /^round_(\d+)\.pgn$/i;

function normalizeDirectory(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function createManifestFromRoundFiles(
  files: GitHubContentsItem[],
  tournamentName: string,
): PgnManifest {
  const rounds = files
    .filter((item) => item.type === "file")
    .map((item) => {
      const match = item.name.match(ROUND_FILE_PATTERN);
      if (!match) return null;
      const roundNumber = Number.parseInt(match[1], 10);
      if (Number.isNaN(roundNumber)) return null;
      return {
        id: String(roundNumber),
        label: `Round ${roundNumber}`,
        file: item.name,
        roundNumber,
      };
    })
    .filter((entry): entry is { id: string; label: string; file: string; roundNumber: number } => entry !== null)
    .sort((a, b) => a.roundNumber - b.roundNumber)
    .map(({ id, label, file }) => ({ id, label, file }));

  return {
    tournamentName,
    rounds,
  };
}

function createManifestFromIndexFiles(files: string[], tournamentName: string): PgnManifest {
  const rounds = files
    .map((name) => {
      const match = name.match(ROUND_FILE_PATTERN);
      if (!match) return null;
      const roundNumber = Number.parseInt(match[1], 10);
      if (Number.isNaN(roundNumber)) return null;
      return {
        id: String(roundNumber),
        label: `Round ${roundNumber}`,
        file: name,
        roundNumber,
      };
    })
    .filter((entry): entry is { id: string; label: string; file: string; roundNumber: number } => entry !== null)
    .sort((a, b) => a.roundNumber - b.roundNumber)
    .map(({ id, label, file }) => ({ id, label, file }));

  return {
    tournamentName,
    rounds,
  };
}

/**
 * Fetches manifest and round files from a configured PGN base URL.
 * The base URL can point at this app's public assets or an external data branch.
 */
export function createStaticPgnRepository({
  pgnBaseUrl,
  githubRepository,
  dataBranch = "data",
  pgnDirectory = "pgn",
  tournamentName = "Tournament",
}: StaticPgnRepositoryOptions): PgnRepository {
  const pgnBase = pgnBaseUrl.endsWith("/") ? pgnBaseUrl : `${pgnBaseUrl}/`;
  const normalizedDirectory = normalizeDirectory(pgnDirectory);

  return {
    async loadManifest() {
      if (githubRepository && githubRepository.length > 0) {
        // Prefer CDN-served index to avoid GitHub API rate limits / org restrictions.
        const indexRes = await fetch(`${pgnBase}index.json`, { cache: "no-store" });
        if (indexRes.ok) {
          const index = (await indexRes.json()) as PgnIndex;
          return createManifestFromIndexFiles(index.files ?? [], tournamentName);
        }

        const listUrl = `https://api.github.com/repos/${githubRepository}/contents/${normalizedDirectory}?ref=${encodeURIComponent(dataBranch)}`;
        const res = await fetch(listUrl);
        if (!res.ok) {
          throw new Error(
            `Failed to list PGN files from ${githubRepository}@${dataBranch}: ${res.status} ${res.statusText}. If this is a 403, add pgn/index.json on the data branch (or enable the index generator workflow).`,
          );
        }
        const payload = (await res.json()) as GitHubContentsItem[];
        return createManifestFromRoundFiles(payload, tournamentName);
      }

      const res = await fetch(`${pgnBase}manifest.json`);
      if (!res.ok) {
        throw new Error(
          `Failed to load manifest: ${res.status} ${res.statusText}. Configure VITE_PGN_SOURCE_REPOSITORY for upload-only mode.`,
        );
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
