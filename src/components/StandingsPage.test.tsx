import { render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { PgnRepository } from "../adapters/pgnRepository";
import { StandingsPage } from "./StandingsPage";

describe("StandingsPage", () => {
  it("builds standings from round PGN files", async () => {
    const files: Record<string, string> = {
      "round_1.pgn": `
[Event "T"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 1-0

[Event "T"]
[White "Cara"]
[Black "Dora"]
[Result "1/2-1/2"]

1. d4 d5 1/2-1/2
`.trim(),
      "round_2.pgn": `
[Event "T"]
[White "Bob"]
[Black "Cara"]
[Result "*"]

1. Nf3 d5 *
`.trim(),
    };

    const repo: PgnRepository = {
      loadManifest: async () => ({
        tournamentName: "Test Open",
        rounds: [
          { id: "1", label: "Round 1", file: "round_1.pgn" },
          { id: "2", label: "Round 2", file: "round_2.pgn" },
        ],
      }),
      loadRoundPgnFile: async (relativeFile: string) => files[relativeFile] ?? "",
    };

    render(
      <MemoryRouter initialEntries={["/standings"]}>
        <Routes>
          <Route path="/standings" element={<StandingsPage repository={repo} />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Standings" })).toBeInTheDocument();
    });
    expect(screen.getByText("Test Open")).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    const alice = rows.find((row) => within(row).queryByText("Alice"));
    const bob = rows.find((row) => within(row).queryByText("Bob"));
    expect(alice).toBeDefined();
    expect(bob).toBeDefined();
    expect(alice).toHaveTextContent("Alice");
    expect(alice).toHaveTextContent("1");
    expect(bob).toHaveTextContent("Bob");
    expect(bob).toHaveTextContent("1");
  });
});
