import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { branding } from "../config/branding";
import type { PgnManifest } from "../domain/types";
import type { PgnRepository } from "../adapters/pgnRepository";

type Props = {
  repository: PgnRepository;
};

export function HomePage({ repository }: Props) {
  const [manifest, setManifest] = useState<PgnManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repository
      .loadManifest()
      .then((m) => {
        if (!cancelled) setManifest(m);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load tournament data");
      });
    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (error) {
    return (
      <div className="panel error-panel">
        <p>{error}</p>
        <p className="muted">Ensure public/pgn/manifest.json exists and is valid JSON.</p>
      </div>
    );
  }

  if (!manifest) {
    return <p className="muted">Loading tournament…</p>;
  }

  return (
    <div>
      <h1>{manifest.tournamentName}</h1>
      <p className="tagline" style={{ color: branding.accent }}>
        {branding.tagline}
      </p>
      <h2>Rounds</h2>
      <ul className="round-list">
        {manifest.rounds.map((r) => (
          <li key={r.id}>
            <Link to={`round/${r.id}`}>{r.label}</Link>
            <span className="muted file-hint"> — {r.file}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
