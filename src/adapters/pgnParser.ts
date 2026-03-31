import { parseGame, split } from "@mliebelt/pgn-parser";
import type { SplitGame } from "@mliebelt/pgn-parser";
import type { ParsedGame } from "../domain/types";

function tagsToParsed(rawPgn: string, tags: Record<string, string | undefined>): ParsedGame {
  return {
    white: String(tags.White ?? "?"),
    black: String(tags.Black ?? "?"),
    result: String(tags.Result ?? "*"),
    event: tags.Event != null ? String(tags.Event) : undefined,
    site: tags.Site != null ? String(tags.Site) : undefined,
    date: tags.Date != null ? String(tags.Date) : undefined,
    round: tags.Round != null ? String(tags.Round) : undefined,
    rawPgn: rawPgn.trim(),
  };
}

function splitGameToParsed(g: SplitGame): ParsedGame {
  const tree = parseGame(g.all);
  const tags = (tree.tags ?? {}) as Record<string, string | undefined>;
  return tagsToParsed(g.all, tags);
}

/**
 * Parses a PGN file that may contain multiple games (ports/adapters: parser behind a stable shape).
 */
export function parsePgnFile(content: string): ParsedGame[] {
  const trimmed = content.trim();
  if (!trimmed) return [];
  const pieces = split(trimmed);
  if (pieces.length === 0) {
    const single = parseGame(trimmed);
    const tags = (single.tags ?? {}) as Record<string, string | undefined>;
    return [tagsToParsed(trimmed, tags)];
  }
  return pieces.map(splitGameToParsed);
}
