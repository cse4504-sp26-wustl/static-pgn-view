import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { parsePgnFile } from "../adapters/pgnParser";
import type { PgnRepository } from "../adapters/pgnRepository";
import { createStandings } from "../domain/standings";
import type { PgnManifest, StandingEntry } from "../domain/types";

type Props = {
  repository: PgnRepository;
};

type StandingsState = {
  manifest: PgnManifest | null;
  standings: StandingEntry[];
  error: string | null;
  ready: boolean;
};

const initialState: StandingsState = {
  manifest: null,
  standings: [],
  error: null,
  ready: false,
};

export function StandingsPage({ repository }: Props) {
  const [state, setState] = useState<StandingsState>(initialState);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const manifest = await repository.loadManifest();
        const gamesByRound = await Promise.all(
          manifest.rounds.map(async (round) => {
            const fileContent = await repository.loadRoundPgnFile(round.file);
            return parsePgnFile(fileContent);
          }),
        );
        if (!cancelled) {
          setState({
            manifest,
            standings: createStandings(gamesByRound.flat()),
            error: null,
            ready: true,
          });
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setState({
            manifest: null,
            standings: [],
            error: e instanceof Error ? e.message : "Failed to load standings",
            ready: true,
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (!state.ready) {
    return <p className="muted">Loading standings…</p>;
  }

  if (state.error) {
    return (
      <div className="panel error-panel">
        <p>{state.error}</p>
        <Link to="/">← Home</Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>Standings</h1>
      <p className="muted">{state.manifest?.tournamentName}</p>
      {state.standings.length === 0 ? (
        <p className="muted">No results available yet.</p>
      ) : (
        <div className="panel standings-panel">
          <table className="standings-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Player</th>
                <th scope="col">Pts</th>
                <th scope="col">W</th>
                <th scope="col">D</th>
                <th scope="col">L</th>
                <th scope="col">Pending</th>
              </tr>
            </thead>
            <tbody>
              {state.standings.map((entry, index) => (
                <tr key={entry.player}>
                  <td>{index + 1}</td>
                  <td>{entry.player}</td>
                  <td>{entry.points}</td>
                  <td>{entry.wins}</td>
                  <td>{entry.draws}</td>
                  <td>{entry.losses}</td>
                  <td>{entry.pendingGames}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
