import { describe, expect, it } from "vitest";
import { fenAtHalfMoveIndex, totalHalfMovesFromPgn } from "./fenFromPgn";

const mini = `
[White "A"]
[Black "B"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0
`.trim();

describe("fenFromPgn", () => {
  it("counts half-moves for a short game", () => {
    expect(totalHalfMovesFromPgn(mini)).toBe(7);
  });

  it("start position at index 0", () => {
    const fen = fenAtHalfMoveIndex(mini, 0);
    expect(fen).toContain("w KQkq");
  });

  it("final position at last index", () => {
    const n = totalHalfMovesFromPgn(mini);
    const start = fenAtHalfMoveIndex(mini, 0);
    const end = fenAtHalfMoveIndex(mini, n);
    expect(end).not.toBe(start);
  });
});
