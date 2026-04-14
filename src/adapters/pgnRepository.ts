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
  /** Git commit SHA written by the data-branch workflow. */
  revision?: string;
};

const ROUND_FILE_PATTERN = /^round_(\d+)\.pgn$/i;
const fetchNoStore: RequestInit = { cache: "no-store" };

function normalizeDirectory(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

function parseOwnerRepo(full: string): [string, string] | null {
  const parts = full.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  return [parts[0]!, parts[1]!];
}

/** https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path-under-repo> */
function rawGithubFileUrl(owner: string, repo: string, gitRef: string, pathInRepo: string): string {
  const rel = pathInRepo.replace(/^\/+/, "");
  return `https://raw.githubusercontent.com/${owner}/${repo}/${gitRef}/${rel}`;
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
 * When `githubRepository` is set, uses `raw.githubusercontent.com` (not a CDN) so
 * replaced files under the same name are visible without stale edge caches.
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
  let dataRevision: string | undefined;

  function roundFileUrl(relativeFile: string): string {
    const safe = relativeFile.replace(/^\/+/, "");
    const parsed = githubRepository ? parseOwnerRepo(githubRepository) : null;
    if (parsed) {
      const [owner, repo] = parsed;
      const ref = dataRevision && dataRevision.length > 0 ? dataRevision : dataBranch;
      const pathInRepo = `${normalizedDirectory}/${safe}`;
      return rawGithubFileUrl(owner, repo, ref, pathInRepo);
    }
    return new URL(safe, pgnBase).toString();
  }

  return {
    async loadManifest() {
      dataRevision = undefined;

      if (githubRepository && githubRepository.length > 0) {
        const parsed = parseOwnerRepo(githubRepository);
        if (!parsed) {
          throw new Error(`Invalid VITE_PGN_SOURCE_REPOSITORY: ${githubRepository} (expected owner/repo)`);
        }
        const [owner, repo] = parsed;

        const indexPath = `${normalizedDirectory}/index.json`;
        const indexUrl = rawGithubFileUrl(owner, repo, dataBranch, indexPath);
        const indexRes = await fetch(indexUrl, fetchNoStore);
        if (indexRes.ok) {
          const index = (await indexRes.json()) as PgnIndex;
          if (typeof index.revision === "string" && index.revision.length > 0) {
            dataRevision = index.revision;
          }
          return createManifestFromIndexFiles(index.files ?? [], tournamentName);
        }

        const listUrl = `https://api.github.com/repos/${githubRepository}/contents/${normalizedDirectory}?ref=${encodeURIComponent(dataBranch)}`;
        const res = await fetch(listUrl, fetchNoStore);
        if (!res.ok) {
          throw new Error(
            `Failed to list PGN files from ${githubRepository}@${dataBranch}: ${res.status} ${res.statusText}. If this is a 403, add pgn/index.json on the data branch (or enable the index generator workflow).`,
          );
        }
        const payload = (await res.json()) as GitHubContentsItem[];
        return createManifestFromRoundFiles(payload, tournamentName);
      }

      const res = await fetch(`${pgnBase}manifest.json`, fetchNoStore);
      if (!res.ok) {
        throw new Error(
          `Failed to load manifest: ${res.status} ${res.statusText}. Configure VITE_PGN_SOURCE_REPOSITORY for upload-only mode.`,
        );
      }
      return (await res.json()) as PgnManifest;
    },
    async loadRoundPgnFile(relativeFile: string) {
      const res = await fetch(roundFileUrl(relativeFile), fetchNoStore);
      if (!res.ok) {
        const safe = relativeFile.replace(/^\/+/, "");
        throw new Error(`Failed to load ${safe}: ${res.status} ${res.statusText}`);
      }
      return res.text();
    },
  };
}
