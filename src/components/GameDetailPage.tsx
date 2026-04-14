import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { parsePgnFile } from "../adapters/pgnParser";
import type { ParsedGame } from "../domain/types";
import type { PgnRepository } from "../adapters/pgnRepository";
import { GameBoard } from "./GameBoard";

type Props = {
  repository: PgnRepository;
};

export function GameDetailPage({ repository }: Props) {
  const { roundId, gameIndex } = useParams<{ roundId: string; gameIndex: string }>();
  const index = Number.parseInt(gameIndex ?? "", 10);

  const [game, setGame] = useState<ParsedGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setGame(null);
    setReady(false);
    if (Number.isNaN(index) || index < 0) {
      setError("Invalid game index.");
      setReady(true);
      return;
    }

    repository
      .loadManifest()
      .then((m) => {
        if (cancelled) return;
        const entry = m.rounds.find((r) => r.id === roundId);
        if (!entry) {
          setError(`Unknown round id: ${roundId ?? ""}`);
          return;
        }
        return repository.loadRoundPgnFile(entry.file);
      })
      .then((text) => {
        if (cancelled) return;
        if (text === undefined) return;
        const games = parsePgnFile(text);
        const g = games[index];
        if (!g) {
          setError(`No game at index ${index}.`);
          return;
        }
        setGame(g);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load game");
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [repository, roundId, index]);

  if (!ready) {
    return <p className="muted">Loading game…</p>;
  }

  if (error || !game) {
    return (
      <div className="panel error-panel">
        <p>{error ?? "Game not found."}</p>
        <Link to={`/round/${roundId}`}>← Round</Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link to="/">Home</Link>
        {" · "}
        <Link to={`/round/${roundId}`}>Round</Link>
      </p>
      <h1>
        {game.white} <span className="vs">vs</span> {game.black}
      </h1>
      <p className="muted">
        Result: <strong>{game.result}</strong>
        {game.event ? ` · ${game.event}` : ""}
        {game.site ? ` · ${game.site}` : ""}
        {game.date ? ` · ${game.date}` : ""}
      </p>
      <GameBoard rawPgn={game.rawPgn} />
    </div>
  );
}
