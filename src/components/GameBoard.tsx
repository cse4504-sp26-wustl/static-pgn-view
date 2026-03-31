import { useMemo, useState } from "react";
import { Chessboard } from "react-chessboard";
import { fenAtHalfMoveIndex, totalHalfMovesFromPgn } from "../lib/fenFromPgn";

type Props = {
  rawPgn: string;
};

export function GameBoard({ rawPgn }: Props) {
  const total = useMemo(() => totalHalfMovesFromPgn(rawPgn), [rawPgn]);
  const [halfMoveIndex, setHalfMoveIndex] = useState(0);

  const fen = useMemo(
    () => fenAtHalfMoveIndex(rawPgn, halfMoveIndex),
    [rawPgn, halfMoveIndex],
  );

  const canStep = total > 0;

  return (
    <div className="board-wrap">
      <div className="board-frame">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: "white",
            allowDragging: false,
            allowDrawingArrows: false,
          }}
        />
      </div>
      {canStep ? (
        <div className="board-controls">
          <button
            type="button"
            disabled={halfMoveIndex <= 0}
            onClick={() => setHalfMoveIndex((i) => Math.max(0, i - 1))}
          >
            ← Prev
          </button>
          <span className="muted move-counter">
            Move {halfMoveIndex} / {total}
          </span>
          <button
            type="button"
            disabled={halfMoveIndex >= total}
            onClick={() => setHalfMoveIndex((i) => Math.min(total, i + 1))}
          >
            Next →
          </button>
          <button type="button" onClick={() => setHalfMoveIndex(total)}>
            End
          </button>
          <button type="button" onClick={() => setHalfMoveIndex(0)}>
            Start
          </button>
        </div>
      ) : (
        <p className="muted small">
          No movetext in this PGN (headers only). Starting position shown.
        </p>
      )}
    </div>
  );
}
