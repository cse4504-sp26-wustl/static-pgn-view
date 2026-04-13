import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parsePgnFile } from "../adapters/pgnParser";
import type { PgnManifest, ParsedGame } from "../domain/types";
import type { PgnRepository } from "../adapters/pgnRepository";
import {
  buildPlayerSearchRows,
  filterPlayerSearchRows,
  normalizePlayerSearchQuery,
  type PlayerSearchRow,
} from "../lib/playerSearch";

const RESULTS_CHUNK = 150;

type Props = {
  repository: PgnRepository;
};

function PlayerSearchMatchList({ matches }: { matches: PlayerSearchRow[] }) {
  const [visibleCount, setVisibleCount] = useState(RESULTS_CHUNK);
  const visibleMatches = matches.slice(0, visibleCount);
  return (
    <div className="search-results-wrap">
      <ul className="game-list search-results-list">
        {visibleMatches.map((row) => (
          <li key={`${row.roundId}-${row.gameIndex}`}>
            <Link to={`/round/${row.roundId}/game/${row.gameIndex}`}>
              <strong>
                {row.white} — {row.black}
              </strong>
              <span className="result-badge">{row.result}</span>
              <span className="muted small search-result-round"> · {row.roundLabel}</span>
            </Link>
          </li>
        ))}
      </ul>
      {visibleCount < matches.length ? (
        <button
          type="button"
          className="search-load-more"
          onClick={() => setVisibleCount((c) => c + RESULTS_CHUNK)}
        >
          Show more ({matches.length - visibleCount} remaining)
        </button>
      ) : null}
    </div>
  );
}

export function PlayerSearchPage({ repository }: Props) {
  const [manifest, setManifest] = useState<PgnManifest | null>(null);
  const [gamesByRound, setGamesByRound] = useState<ParsedGame[][] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = useMemo(
    () => normalizePlayerSearchQuery(deferredQuery),
    [deferredQuery],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setError(null);
      setManifest(null);
      setGamesByRound(null);
      setReady(false);
      try {
        const m = await repository.loadManifest();
        if (cancelled) return;
        setManifest(m);
        const texts = await Promise.all(m.rounds.map((r) => repository.loadRoundPgnFile(r.file)));
        if (cancelled) return;
        setGamesByRound(texts.map((t) => parsePgnFile(t)));
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load games");
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [repository]);

  const indexRows = useMemo(() => {
    if (!manifest || !gamesByRound) return [];
    return buildPlayerSearchRows(manifest.rounds, gamesByRound);
  }, [manifest, gamesByRound]);

  const matches = useMemo(
    () => filterPlayerSearchRows(indexRows, normalizedQuery),
    [indexRows, normalizedQuery],
  );

  const pending = query !== deferredQuery;

  if (!ready) {
    return <p className="muted">Loading games for search…</p>;
  }

  if (error) {
    return (
      <div className="panel error-panel">
        <p>{error}</p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>Player search</h1>
      {manifest ? <p className="muted">{manifest.tournamentName}</p> : null}

      <form className="player-search-form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="player-search-input" className="player-search-label">
          Find games by player name
        </label>
        <input
          id="player-search-input"
          className="player-search-input"
          type="search"
          name="q"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="e.g. Carlsen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-busy={pending}
        />
      </form>

      <p className="muted small player-search-status" aria-live="polite">
        {normalizedQuery.length === 0
          ? `${indexRows.length} games indexed. Type a name to search.`
          : pending
            ? "Searching…"
            : matches.length === 0
              ? "No games match that name."
              : `${matches.length} game${matches.length === 1 ? "" : "s"} found`}
      </p>

      {normalizedQuery.length > 0 && matches.length > 0 ? (
        <PlayerSearchMatchList key={normalizedQuery} matches={matches} />
      ) : null}
    </div>
  );
}
