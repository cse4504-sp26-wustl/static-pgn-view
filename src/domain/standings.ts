import type { ParsedGame, StandingEntry } from "./types";

type MutableStanding = StandingEntry;

function createBlankStanding(player: string): MutableStanding {
  return {
    player,
    points: 0,
    gamesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    pendingGames: 0,
  };
}

function getOrCreateStandingsEntry(
  table: Map<string, MutableStanding>,
  player: string,
): MutableStanding {
  const existing = table.get(player);
  if (existing) return existing;
  const next = createBlankStanding(player);
  table.set(player, next);
  return next;
}

export function createStandings(games: ParsedGame[]): StandingEntry[] {
  const table = new Map<string, MutableStanding>();

  for (const game of games) {
    const white = getOrCreateStandingsEntry(table, game.white);
    const black = getOrCreateStandingsEntry(table, game.black);

    // Includes all paired games from PGN files, including pending "*" results.
    white.gamesPlayed += 1;
    black.gamesPlayed += 1;

    if (game.result === "1-0") {
      white.points += 1;
      white.wins += 1;
      black.losses += 1;
      continue;
    }

    if (game.result === "0-1") {
      black.points += 1;
      black.wins += 1;
      white.losses += 1;
      continue;
    }

    if (game.result === "1/2-1/2") {
      white.points += 0.5;
      black.points += 0.5;
      white.draws += 1;
      black.draws += 1;
      continue;
    }

    white.pendingGames += 1;
    black.pendingGames += 1;
  }

  return [...table.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.player.localeCompare(b.player);
  });
}
