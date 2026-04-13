import { describe, expect, it } from "vitest";
import { buildPlayerSearchRows, filterPlayerSearchRows, normalizePlayerSearchQuery } from "./playerSearch";
import type { ParsedGame } from "../domain/types";

function game(white: string, black: string): ParsedGame {
  return {
    white,
    black,
    result: "1-0",
    rawPgn: "",
  };
}

describe("playerSearch", () => {
  it("normalizes queries with trim and case folding", () => {
    expect(normalizePlayerSearchQuery("  Carlsen ")).toBe("carlsen");
  });

  it("matches white or black case-insensitively via substring", () => {
    const rounds = [{ id: "1", label: "Round 1" }];
    const gamesByRound: ParsedGame[][] = [[game("Magnus Carlsen", "Fabiano Caruana")]];
    const rows = buildPlayerSearchRows(rounds, gamesByRound);
    expect(filterPlayerSearchRows(rows, "carlsen")).toHaveLength(1);
    expect(filterPlayerSearchRows(rows, "CARUANA")).toHaveLength(1);
    expect(filterPlayerSearchRows(rows, "nope")).toHaveLength(0);
  });

  it("returns no matches for empty normalized query", () => {
    const rounds = [{ id: "1", label: "Round 1" }];
    const rows = buildPlayerSearchRows(rounds, [[game("A", "B")]]);
    expect(filterPlayerSearchRows(rows, "")).toHaveLength(0);
  });
});
