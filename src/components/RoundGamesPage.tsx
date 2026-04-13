import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { parsePgnFile } from "../adapters/pgnParser";
import type { ParsedGame, PgnManifest } from "../domain/types";
import type { PgnRepository } from "../adapters/pgnRepository";

type Props = {
  repository: PgnRepository;
};

export function RoundGamesPage({ repository }: Props) {
  const { roundId } = useParams<{ roundId: string }>();
  const [manifest, setManifest] = useState<PgnManifest | null>(null);
  const [games, setGames] = useState<ParsedGame[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const roundEntry = useMemo(
    () => manifest?.rounds.find((r) => r.id === roundId),
    [manifest, roundId],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setError(null);
      setGames([]);
      setReady(false);
      setManifest(null);
      try {
        const m = await repository.loadManifest();
        if (cancelled) return;
        setManifest(m);
        const entry = m.rounds.find((r) => r.id === roundId);
        if (!entry) {
          setError(`Unknown round id: ${roundId ?? ""}`);
          return;
        }
        const text = await repository.loadRoundPgnFile(entry.file);
        if (cancelled) return;
        setGames(parsePgnFile(text));
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load round");
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [repository, roundId]);

  if (!ready) {
    return <p className="muted">Loading round…</p>;
  }

  if (error) {
    return (
      <div className="panel error-panel">
        <p>{error}</p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  if (!roundEntry) {
    return (
      <div className="panel error-panel">
        <p>Round not found.</p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>{roundEntry.label}</h1>
      <p className="muted">{manifest?.tournamentName}</p>
      {games.length === 0 ? (
        <p className="muted">No games found in this PGN file.</p>
      ) : (
        <ul className="game-list">
          {games.map((g, i) => (
            <li key={`${g.white}-${g.black}-${i}`}>
              <Link to={`/round/${roundId}/game/${i}`}>
                <strong>
                  {g.white} — {g.black}
                </strong>
                <span className="result-badge">{g.result}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
