import { describe, expect, it } from "vitest";
import { parsePgnFile } from "./pgnParser";

const sampleTwoGames = `
[Event "T"]
[White "A"]
[Black "B"]
[Result "1-0"]

1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0

[Event "T"]
[White "C"]
[Black "D"]
[Result "*"]

1. d4 d5 *
`.trim();

describe("parsePgnFile", () => {
  it("returns two games with correct names", () => {
    const games = parsePgnFile(sampleTwoGames);
    expect(games).toHaveLength(2);
    expect(games[0]!.white).toBe("A");
    expect(games[0]!.black).toBe("B");
    expect(games[0]!.result).toBe("1-0");
    expect(games[1]!.white).toBe("C");
    expect(games[1]!.black).toBe("D");
  });

  it("returns empty array for empty string", () => {
    expect(parsePgnFile("")).toEqual([]);
    expect(parsePgnFile("   ")).toEqual([]);
  });

  it("falls back to tag-only parsing when movetext is missing", () => {
    const headerOnly = `
[Event "T"]
[White "A"]
[Black "B"]
[Result "0-1"]

[Event "T"]
[White "C"]
[Black "D"]
[Result "*"]
`.trim();

    const games = parsePgnFile(headerOnly);
    expect(games).toHaveLength(2);
    expect(games[0]!.white).toBe("A");
    expect(games[0]!.black).toBe("B");
    expect(games[0]!.result).toBe("0-1");
    expect(games[1]!.white).toBe("C");
    expect(games[1]!.black).toBe("D");
    expect(games[1]!.result).toBe("*");
  });
});
