import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createStaticPgnRepository } from "./adapters/pgnRepository";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { RoundGamesPage } from "./components/RoundGamesPage";
import { GameDetailPage } from "./components/GameDetailPage";
import { PlayerSearchPage } from "./components/PlayerSearchPage";

export default function App() {
  const configuredPgnBase = import.meta.env.VITE_PGN_BASE_URL;
  const localPgnBase = `${import.meta.env.BASE_URL}pgn/`;
  const pgnBase =
    configuredPgnBase && configuredPgnBase.length > 0 ? configuredPgnBase : localPgnBase;
  const sourceRepository = import.meta.env.VITE_PGN_SOURCE_REPOSITORY;
  const sourceBranch = import.meta.env.VITE_PGN_SOURCE_BRANCH;
  const sourceDirectory = import.meta.env.VITE_PGN_SOURCE_DIRECTORY;
  const tournamentName = import.meta.env.VITE_TOURNAMENT_NAME;

  const repository = useMemo(
    () =>
      createStaticPgnRepository({
        pgnBaseUrl: pgnBase,
        githubRepository:
          sourceRepository && sourceRepository.length > 0 ? sourceRepository : undefined,
        dataBranch: sourceBranch,
        pgnDirectory: sourceDirectory,
        tournamentName,
      }),
    [pgnBase, sourceBranch, sourceDirectory, sourceRepository, tournamentName],
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage repository={repository} />} />
          <Route path="search" element={<PlayerSearchPage repository={repository} />} />
          <Route path="round/:roundId" element={<RoundGamesPage repository={repository} />} />
          <Route path="round/:roundId/game/:gameIndex" element={<GameDetailPage repository={repository} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
