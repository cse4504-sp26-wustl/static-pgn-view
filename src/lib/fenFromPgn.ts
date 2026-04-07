import { Chess } from "chess.js";

/** Number of half-moves played in the PGN (0 if no valid movetext). */
export function totalHalfMovesFromPgn(pgn: string): number {
  const chess = new Chess();
  try {
    chess.loadPgn(pgn.trim(), { strict: false });
  } catch {
    return 0;
  }
  return chess.history().length;
}

/** FEN after applying the first `halfMoveIndex` half-moves (0 = start position). */
export function fenAtHalfMoveIndex(pgn: string, halfMoveIndex: number): string {
  const end = new Chess();
  try {
    end.loadPgn(pgn.trim(), { strict: false });
  } catch {
    return new Chess().fen();
  }
  const sanMoves = end.history();
  const board = new Chess();
  const n = Math.max(0, Math.min(halfMoveIndex, sanMoves.length));
  for (let i = 0; i < n; i++) {
    board.move(sanMoves[i]!);
  }
  return board.fen();
}
