import { describe, expect, it } from "vitest";
import { createStandings } from "./standings";
import type { ParsedGame } from "./types";

function game(white: string, black: string, result: string): ParsedGame {
  return {
    white,
    black,
    result,
    rawPgn: "",
  };
}

describe("createStandings", () => {
  it("sorts players descending by points", () => {
    const standings = createStandings([
      game("Alice", "Bob", "1-0"),
      game("Bob", "Cara", "1/2-1/2"),
      game("Cara", "Alice", "0-1"),
    ]);

    expect(standings[0]).toMatchObject({ player: "Alice", points: 2 });
    expect(standings.map((entry) => entry.points)).toEqual([2, 0.5, 0.5]);
  });

  it("counts draws for both players", () => {
    const standings = createStandings([game("Alice", "Bob", "1/2-1/2")]);
    expect(standings).toEqual([
      {
        player: "Alice",
        points: 0.5,
        gamesPlayed: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        pendingGames: 0,
      },
      {
        player: "Bob",
        points: 0.5,
        gamesPlayed: 1,
        wins: 0,
        draws: 1,
        losses: 0,
        pendingGames: 0,
      },
    ]);
  });

  it("includes players with only incomplete games", () => {
    const standings = createStandings([game("Alice", "Bob", "*"), game("Bob", "Cara", "*")]);
    const byPlayer = Object.fromEntries(standings.map((entry) => [entry.player, entry]));
    expect(byPlayer.Bob).toMatchObject({ points: 0, gamesPlayed: 2, pendingGames: 2 });
    expect(byPlayer.Alice).toMatchObject({ points: 0, gamesPlayed: 1, pendingGames: 1 });
    expect(byPlayer.Cara).toMatchObject({ points: 0, gamesPlayed: 1, pendingGames: 1 });
  });

  it("breaks ties by wins and then player name", () => {
    const standings = createStandings([
      game("Alice", "Bob", "1-0"),
      game("Cara", "Dora", "1-0"),
      game("Bob", "Dora", "1/2-1/2"),
      game("Cara", "Alice", "1/2-1/2"),
    ]);

    expect(standings.map((entry) => entry.player)).toEqual(["Alice", "Cara", "Bob", "Dora"]);
  });
});
