import { parseGame, split } from "@mliebelt/pgn-parser";
import type { SplitGame } from "@mliebelt/pgn-parser";
import type { ParsedGame } from "../domain/types";

function extractTagPairs(rawPgn: string): Record<string, string | undefined> {
  const tags: Record<string, string | undefined> = {};
  const tagLine = /^\[(\w+)\s+"([^"]*)"\]\s*$/gm;
  for (const match of rawPgn.matchAll(tagLine)) {
    const key = match[1];
    const value = match[2];
    if (!key) continue;
    tags[key] = value ?? "";
  }
  return tags;
}

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

function safeParseSingleGame(rawPgn: string): ParsedGame {
  try {
    const tree = parseGame(rawPgn);
    const tags = (tree.tags ?? {}) as Record<string, string | undefined>;
    return tagsToParsed(rawPgn, tags);
  } catch {
    // Fall back to header-only extraction for incomplete/invalid movetext.
    return tagsToParsed(rawPgn, extractTagPairs(rawPgn));
  }
}

function splitByRepeatedEventHeaders(rawPgn: string): string[] {
  const starts = [...rawPgn.matchAll(/^\[Event\s+".*"\]\s*$/gm)].map((m) => m.index ?? 0);
  if (starts.length <= 1) return [rawPgn];

  const pieces: string[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i]!;
    const end = i + 1 < starts.length ? starts[i + 1]! : rawPgn.length;
    const chunk = rawPgn.slice(start, end).trim();
    if (chunk.length > 0) pieces.push(chunk);
  }
  return pieces.length > 0 ? pieces : [rawPgn];
}

function splitGameToParsed(g: SplitGame): ParsedGame {
  return safeParseSingleGame(g.all);
}

/**
 * Parses a PGN file that may contain multiple games (ports/adapters: parser behind a stable shape).
 */
export function parsePgnFile(content: string): ParsedGame[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  // Some PGN variants contain header-only games; the library split() does not always
  // separate those reliably. PGN games normally begin with an [Event "..."] tag.
  const byEvent = splitByRepeatedEventHeaders(trimmed);
  if (byEvent.length > 1) {
    return byEvent.map(safeParseSingleGame);
  }

  const pieces = split(trimmed);
  if (pieces.length === 0) {
    return [safeParseSingleGame(trimmed)];
  }
  return pieces.map(splitGameToParsed);
}
