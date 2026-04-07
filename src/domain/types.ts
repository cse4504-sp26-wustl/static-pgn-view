/** Round entry derived from organizer-managed pgn data. */
export type RoundManifestEntry = {
  id: string;
  label: string;
  file: string;
};

export type PgnManifest = {
  tournamentName: string;
  rounds: RoundManifestEntry[];
};

/** One game, ready for UI and optional chess.js replay. */
export type ParsedGame = {
  white: string;
  black: string;
  result: string;
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  /** Full game text (headers + movetext) for loadPgn. */
  rawPgn: string;
};
