import { html } from "htm/preact";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { Button } from "htm-ui/button.js";
import {
  DIFFICULTY,
  EMPTY,
  SIZE,
  cloneBoard,
  conflictCells,
  generatePuzzle,
  isSolved,
} from "../lib/sudoku.js";
import { Toolbar } from "../components/toolbar.js";
import { Board } from "../components/board.js";
import { NumberPad } from "../components/number-pad.js";
import { WinDialog } from "../components/win-dialog.js";
import { Confetti } from "../components/confetti.js";

function firstEmpty(game) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!game.given[r][c]) return { r, c };
    }
  }
  return { r: 0, c: 0 };
}

export function Play() {
  const [difficulty, setDifficulty] = useState("easy");
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState(null);
  const [digitFilter, setDigitFilter] = useState(null);
  const [checkMode, setCheckMode] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const boardRef = useRef(null);
  const padRef = useRef(null);
  const showWin = useCallback((on) => {
    setWinOpen(on);
    if (on) setBurstKey((k) => k + 1);
  }, []);

  const startGame = useCallback(
    (diff = difficulty) => {
      showWin(false);
      // Defer heavy generate so UI can paint
      requestAnimationFrame(() => {
        const { puzzle, given } = generatePuzzle(diff);
        const next = {
          puzzle,
          given,
          board: cloneBoard(puzzle),
          difficulty: diff,
        };
        setGame(next);
        setSelected(firstEmpty(next));
        setDigitFilter(null);
        setCheckMode(false);
      });
    },
    [difficulty, showWin],
  );

  useEffect(() => {
    startGame("easy");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFocus = useCallback(() => {
    setSelected(null);
    setDigitFilter(null);
    setCheckMode(false);
  }, []);

  const select = useCallback((r, c) => {
    setSelected({ r, c });
    setDigitFilter(null);
    setCheckMode(false);
  }, []);

  const afterMove = useCallback(
    (board) => {
      if (isSolved(board)) {
        showWin(true);
      }
    },
    [showWin],
  );

  const enterDigit = useCallback(
    (n) => {
      if (!game || !selected) return;
      const { r, c } = selected;
      if (game.given[r][c]) return;
      const board = cloneBoard(game.board);
      board[r][c] = n;
      setGame({ ...game, board });
      setCheckMode(false);
      afterMove(board);
    },
    [game, selected, afterMove],
  );

  const onPadDigit = useCallback(
    (n) => {
      if (!game) return;
      if (selected) {
        const { r, c } = selected;
        if (game.board[r][c] === n) {
          if (game.given[r][c]) return;
          const board = cloneBoard(game.board);
          board[r][c] = EMPTY;
          setGame({ ...game, board });
          setCheckMode(false);
          afterMove(board);
          return;
        }
        enterDigit(n);
        return;
      }
      setDigitFilter((prev) => (prev === n ? null : n));
      setCheckMode(false);
    },
    [game, selected, enterDigit, afterMove],
  );

  const clearCell = useCallback(() => {
    if (!game || !selected) return;
    const { r, c } = selected;
    if (game.given[r][c]) return;
    const board = cloneBoard(game.board);
    board[r][c] = EMPTY;
    setGame({ ...game, board });
    setCheckMode(false);
    afterMove(board);
  }, [game, selected, afterMove]);

  const checkBoard = useCallback(() => {
    if (!game) return;
    if (isSolved(game.board)) {
      showWin(true);
      return;
    }
    setCheckMode(true);
  }, [game, showWin]);

  const onDifficulty = useCallback(
    (value) => {
      setDifficulty(value);
      startGame(value);
    },
    [startGame],
  );

  useEffect(() => {
    function onKey(ev) {
      if (!game) return;
      if (ev.key >= "1" && ev.key <= "9") {
        ev.preventDefault();
        onPadDigit(Number(ev.key));
        return;
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        clearFocus();
        return;
      }
      if (
        ev.key === "Backspace" ||
        ev.key === "Delete" ||
        ev.key === "0" ||
        ev.key === " "
      ) {
        ev.preventDefault();
        clearCell();
        return;
      }
      if (!selected) return;
      const move = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }[ev.key];
      if (move) {
        ev.preventDefault();
        select(
          (selected.r + move[0] + SIZE) % SIZE,
          (selected.c + move[1] + SIZE) % SIZE,
        );
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [game, selected, onPadDigit, clearFocus, clearCell, select]);

  useEffect(() => {
    function onDocumentPointerDown(ev) {
      const t = ev.target;
      if (!(t instanceof Node)) return;
      if (boardRef.current?.contains(t) || padRef.current?.contains(t)) return;
      const winEl = document.getElementById("sudoku-win-dialog");
      if (winEl?.contains(t) && winEl.open) return;
      if (!selected && !digitFilter) return;
      clearFocus();
    }
    document.addEventListener("pointerdown", onDocumentPointerDown);
    return () => document.removeEventListener("pointerdown", onDocumentPointerDown);
  }, [selected, digitFilter, clearFocus]);

  const conflictMap =
    checkMode && game ? conflictCells(game.board) : null;

  return html`
    <div class="sudoku-app">
      <${Toolbar}
        difficulty=${difficulty}
        onNewGame=${() => startGame(difficulty)}
        onCheck=${checkBoard}
        onDifficulty=${onDifficulty}
      />
      <${Board}
        board=${game?.board}
        given=${game?.given}
        selected=${selected}
        digitFilter=${digitFilter}
        checkMode=${checkMode}
        conflictMap=${conflictMap}
        onSelect=${select}
        boardRef=${boardRef}
      />
      <${NumberPad}
        board=${game?.board}
        selected=${selected}
        digitFilter=${digitFilter}
        onDigit=${onPadDigit}
        padRef=${padRef}
      />
      <div class="sudoku-actions">
        <${Button}
          type="button"
          variant="secondary"
          size="lg"
          className="min-h-12 w-full"
          onClick=${clearCell}
        >
          Clear cell
        <//>
      </div>
    </div>
    <${Confetti} burstKey=${burstKey} />
    <${WinDialog}
      open=${winOpen}
      onNewGame=${() => startGame(difficulty)}
      onClose=${() => setWinOpen(false)}
    />
  `;
}
