import { useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { createStaticPgnRepository } from "./adapters/pgnRepository";
import { Layout } from "./components/Layout";
import { HomePage } from "./components/HomePage";
import { RoundGamesPage } from "./components/RoundGamesPage";
import { GameDetailPage } from "./components/GameDetailPage";

export default function App() {
  const repository = useMemo(
    () => createStaticPgnRepository(import.meta.env.BASE_URL),
    [],
  );

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage repository={repository} />} />
          <Route path="round/:roundId" element={<RoundGamesPage repository={repository} />} />
          <Route path="round/:roundId/game/:gameIndex" element={<GameDetailPage repository={repository} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
