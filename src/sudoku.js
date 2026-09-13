/** Pure Sudoku engine: generate, validate, solve. Browser + Node. */

export const SIZE = 9;
export const BOX = 3;
export const EMPTY = 0;
export const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export const DIFFICULTY = {
  easy: { id: "easy", label: "Easy", clues: 40 },
  medium: { id: "medium", label: "Medium", clues: 32 },
  hard: { id: "hard", label: "Hard", clues: 26 },
};

export function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(EMPTY));
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

export function flatten(board) {
  return board.flat();
}

function boxIndex(r, c) {
  return Math.floor(r / BOX) * BOX + Math.floor(c / BOX);
}

export function isValidPlacement(board, row, col, value) {
  if (value < 1 || value > 9) return false;
  for (let i = 0; i < SIZE; i++) {
    if (i !== col && board[row][i] === value) return false;
    if (i !== row && board[i][col] === value) return false;
  }
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return false;
    }
  }
  return true;
}

/** True when every filled cell obeys Sudoku rules (empties allowed). */
export function isValidSudoku(board) {
  const rows = Array.from({ length: SIZE }, () => new Set());
  const cols = Array.from({ length: SIZE }, () => new Set());
  const boxes = Array.from({ length: SIZE }, () => new Set());
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v === EMPTY) continue;
      if (v < 1 || v > 9) return false;
      const b = boxIndex(r, c);
      if (rows[r].has(v) || cols[c].has(v) || boxes[b].has(v)) return false;
      rows[r].add(v);
      cols[c].add(v);
      boxes[b].add(v);
    }
  }
  return true;
}

export function isComplete(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === EMPTY) return false;
    }
  }
  return true;
}

export function isSolved(board) {
  return isComplete(board) && isValidSudoku(board);
}

export function conflictCells(board) {
  const bad = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const mark = (cells) => {
    const seen = new Map();
    for (const [r, c, v] of cells) {
      if (v === EMPTY) continue;
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v).push([r, c]);
    }
    for (const locs of seen.values()) {
      if (locs.length > 1) {
        for (const [r, c] of locs) bad[r][c] = true;
      }
    }
  };
  for (let r = 0; r < SIZE; r++) {
    mark(Array.from({ length: SIZE }, (_, c) => [r, c, board[r][c]]));
  }
  for (let c = 0; c < SIZE; c++) {
    mark(Array.from({ length: SIZE }, (_, r) => [r, c, board[r][c]]));
  }
  for (let br = 0; br < SIZE; br += BOX) {
    for (let bc = 0; bc < SIZE; bc += BOX) {
      const cells = [];
      for (let r = br; r < br + BOX; r++) {
        for (let c = bc; c < bc + BOX; c++) cells.push([r, c, board[r][c]]);
      }
      mark(cells);
    }
  }
  return bad;
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rng() {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function candidates(board, row, col) {
  const used = new Set();
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] !== EMPTY) used.add(board[row][i]);
    if (board[i][col] !== EMPTY) used.add(board[i][col]);
  }
  const br = Math.floor(row / BOX) * BOX;
  const bc = Math.floor(col / BOX) * BOX;
  for (let r = br; r < br + BOX; r++) {
    for (let c = bc; c < bc + BOX; c++) {
      if (board[r][c] !== EMPTY) used.add(board[r][c]);
    }
  }
  return DIGITS.filter((d) => !used.has(d));
}

function findBestEmpty(board) {
  let best = null;
  let bestLen = 10;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== EMPTY) continue;
      const opts = candidates(board, r, c);
      if (opts.length === 0) return { row: r, col: c, opts };
      if (opts.length < bestLen) {
        bestLen = opts.length;
        best = { row: r, col: c, opts };
        if (bestLen === 1) return best;
      }
    }
  }
  return best;
}

/**
 * Count solutions up to `limit` (default 2). Mutates a copy only.
 */
export function countSolutions(board, limit = 2) {
  const grid = cloneBoard(board);
  let count = 0;

  function search() {
    if (count >= limit) return;
    const cell = findBestEmpty(grid);
    if (!cell) {
      count += 1;
      return;
    }
    if (cell.opts.length === 0) return;
    for (const n of cell.opts) {
      grid[cell.row][cell.col] = n;
      search();
      if (count >= limit) {
        grid[cell.row][cell.col] = EMPTY;
        return;
      }
      grid[cell.row][cell.col] = EMPTY;
    }
  }

  search();
  return count;
}

export function solve(board) {
  const grid = cloneBoard(board);
  function search() {
    const cell = findBestEmpty(grid);
    if (!cell) return true;
    if (cell.opts.length === 0) return false;
    for (const n of cell.opts) {
      grid[cell.row][cell.col] = n;
      if (search()) return true;
      grid[cell.row][cell.col] = EMPTY;
    }
    return false;
  }
  return search() ? grid : null;
}

function fillComplete(rng) {
  const board = emptyBoard();
  function search() {
    const cell = findBestEmpty(board);
    if (!cell) return true;
    const opts = shuffle(cell.opts, rng);
    for (const n of opts) {
      board[cell.row][cell.col] = n;
      if (search()) return true;
      board[cell.row][cell.col] = EMPTY;
    }
    return false;
  }
  if (!search()) throw new Error("Failed to fill a complete Sudoku");
  return board;
}

function clueCount(board) {
  let n = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== EMPTY) n += 1;
    }
  }
  return n;
}

/**
 * Generate a puzzle with a unique solution.
 * Returns { puzzle, solution, difficulty, given }.
 */
export function generatePuzzle(difficulty = "easy", seed) {
  const spec = DIFFICULTY[difficulty] || DIFFICULTY.easy;
  const rng = mulberry32(seed ?? (Math.floor(Math.random() * 2 ** 32) >>> 0));
  const solution = fillComplete(rng);
  const puzzle = cloneBoard(solution);

  const positions = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) positions.push([r, c]);
  }
  shuffle(positions, rng);

  const target = spec.clues;
  for (const [r, c] of positions) {
    if (clueCount(puzzle) <= target) break;
    const saved = puzzle[r][c];
    puzzle[r][c] = EMPTY;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = saved;
    }
  }

  const given = puzzle.map((row) => row.map((v) => v !== EMPTY));
  return { puzzle, solution, difficulty: spec.id, given };
}

export function remainingCounts(board) {
  const counts = Object.fromEntries(DIGITS.map((d) => [d, 9]));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (v !== EMPTY) counts[v] -= 1;
    }
  }
  return counts;
}
