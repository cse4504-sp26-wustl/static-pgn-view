import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PgnRepository } from "../adapters/pgnRepository";
import { HomePage } from "./HomePage";

describe("HomePage", () => {
  it("loads manifest and lists rounds", async () => {
    const repo: PgnRepository = {
      loadManifest: async () => ({
        tournamentName: "Test Open",
        rounds: [
          { id: "1", label: "Round 1", file: "round_1.pgn" },
          { id: "2", label: "Round 2", file: "round_2.pgn" },
        ],
      }),
      loadRoundPgnFile: async () => "",
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage repository={repo} />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Test Open" })).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Round 1" })).toHaveAttribute("href", "/round/1");
    expect(screen.getByRole("link", { name: "Round 2" })).toHaveAttribute("href", "/round/2");
  });
});
