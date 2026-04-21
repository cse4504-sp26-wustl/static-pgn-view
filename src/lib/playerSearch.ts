import type { ParsedGame } from "../domain/types";

export function normalizePlayerSearchQuery(raw: string): string {
  return raw.trim().toLowerCase();
}

export type PlayerSearchRow = {
  roundId: string;
  roundLabel: string;
  gameIndex: number;
  white: string;
  black: string;
  result: string;
  whiteNorm: string;
  blackNorm: string;
};

export function buildPlayerSearchRows(
  rounds: { id: string; label: string }[],
  gamesByRound: ParsedGame[][],
): PlayerSearchRow[] {
  const rows: PlayerSearchRow[] = [];
  for (let r = 0; r < rounds.length; r++) {
    const round = rounds[r]!;
    const games = gamesByRound[r] ?? [];
    for (let i = 0; i < games.length; i++) {
      const g = games[i]!;
      rows.push({
        roundId: round.id,
        roundLabel: round.label,
        gameIndex: i,
        white: g.white,
        black: g.black,
        result: g.result,
        whiteNorm: g.white.toLowerCase(),
        blackNorm: g.black.toLowerCase(),
      });
    }
  }
  return rows;
}

export function filterPlayerSearchRows(rows: PlayerSearchRow[], query: string): PlayerSearchRow[] {
  const normalizedQuery = normalizePlayerSearchQuery(query);
  if (normalizedQuery.length === 0) return [];
  return rows.filter(
    (row) => row.whiteNorm.includes(normalizedQuery) || row.blackNorm.includes(normalizedQuery),
  );
}
