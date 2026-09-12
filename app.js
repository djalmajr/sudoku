import {
  DIFFICULTY,
  EMPTY,
  SIZE,
  cloneBoard,
  conflictCells,
  generatePuzzle,
  isSolved,
  remainingCounts,
} from "./src/sudoku.js";

const els = {
  board: document.getElementById("board"),
  pad: document.getElementById("pad"),
  status: document.getElementById("status"),
  newGame: document.getElementById("new-game"),
  check: document.getElementById("check"),
  clear: document.getElementById("clear-cell"),
  difficulty: document.getElementById("difficulty"),
  win: document.getElementById("win"),
  winNew: document.getElementById("win-new"),
};

/** @type {{ puzzle: number[][], given: boolean[][], board: number[][], difficulty: string }} */
let game = null;
let selected = { r: 0, c: 0 };
let checkMode = false;

function setStatus(msg, kind = "") {
  els.status.textContent = msg;
  els.status.dataset.kind = kind;
}

function cellId(r, c) {
  return `cell-${r}-${c}`;
}

function buildBoard() {
  els.board.replaceChildren();
  els.board.style.setProperty("--size", String(SIZE));
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = cellId(r, c);
      btn.className = "cell";
      btn.dataset.r = String(r);
      btn.dataset.c = String(c);
      btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
      if (c % 3 === 0) btn.classList.add("box-left");
      if (r % 3 === 0) btn.classList.add("box-top");
      if (c === SIZE - 1) btn.classList.add("box-right");
      if (r === SIZE - 1) btn.classList.add("box-bottom");
      btn.addEventListener("click", () => select(r, c));
      els.board.appendChild(btn);
    }
  }
}

function buildPad() {
  els.pad.replaceChildren();
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pad-key";
    btn.dataset.digit = String(n);
    btn.innerHTML = `<span class="pad-n">${n}</span><span class="pad-left" data-left="${n}"></span>`;
    btn.setAttribute("aria-label", `Enter ${n}`);
    btn.addEventListener("click", () => enterDigit(n));
    els.pad.appendChild(btn);
  }
}

function select(r, c) {
  selected = { r, c };
  checkMode = false;
  render();
}

function enterDigit(n) {
  if (!game) return;
  const { r, c } = selected;
  if (game.given[r][c]) {
    setStatus("That cell is a clue.", "warn");
    return;
  }
  game.board[r][c] = n;
  checkMode = false;
  afterMove();
}

function clearCell() {
  if (!game) return;
  const { r, c } = selected;
  if (game.given[r][c]) {
    setStatus("Cannot clear a clue.", "warn");
    return;
  }
  game.board[r][c] = EMPTY;
  checkMode = false;
  afterMove();
}

function afterMove() {
  if (isSolved(game.board)) {
    render();
    showWin(true);
    setStatus("Puzzle solved.", "ok");
    return;
  }
  render();
  setStatus("Keep going.");
}

function showWin(on) {
  els.win.hidden = !on;
}

function checkBoard() {
  if (!game) return;
  if (isSolved(game.board)) {
    showWin(true);
    setStatus("Puzzle solved.", "ok");
    render();
    return;
  }
  checkMode = true;
  const bad = conflictCells(game.board);
  let conflicts = 0;
  let empty = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (game.board[r][c] === EMPTY) empty += 1;
      else if (bad[r][c]) conflicts += 1;
    }
  }
  render();
  if (conflicts) setStatus(`${conflicts} conflicting cell${conflicts === 1 ? "" : "s"}.`, "warn");
  else if (empty) setStatus(`No conflicts. ${empty} empty cell${empty === 1 ? "" : "s"} left.`);
  else setStatus("Something is off — try again.", "warn");
}

function newGame() {
  const difficulty = els.difficulty.value || "easy";
  setStatus("Generating puzzle…");
  showWin(false);
  // Yield so the status paints on slower phones.
  requestAnimationFrame(() => {
    const { puzzle, given } = generatePuzzle(difficulty);
    game = {
      puzzle,
      given,
      board: cloneBoard(puzzle),
      difficulty,
    };
    selected = firstEmpty();
    checkMode = false;
    render();
    setStatus(`${DIFFICULTY[difficulty].label} game. Tap a cell, then a number.`);
  });
}

function firstEmpty() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!game.given[r][c]) return { r, c };
    }
  }
  return { r: 0, c: 0 };
}

function render() {
  if (!game) return;
  const { r: sr, c: sc } = selected;
  const selectedValue = game.board[sr][sc];
  const bad = checkMode ? conflictCells(game.board) : null;
  const sameBox = (r, c) =>
    Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3);

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const btn = document.getElementById(cellId(r, c));
      const v = game.board[r][c];
      btn.textContent = v === EMPTY ? "" : String(v);
      btn.classList.toggle("given", game.given[r][c]);
      btn.classList.toggle("selected", r === sr && c === sc);
      btn.classList.toggle("peer", r === sr || c === sc || sameBox(r, c));
      btn.classList.toggle(
        "same",
        selectedValue !== EMPTY && v === selectedValue && !(r === sr && c === sc),
      );
      btn.classList.toggle("conflict", Boolean(bad && bad[r][c]));
      btn.setAttribute("aria-pressed", r === sr && c === sc ? "true" : "false");
    }
  }

  const left = remainingCounts(game.board);
  for (const key of els.pad.querySelectorAll("[data-left]")) {
    const n = Number(key.dataset.left);
    const rem = Math.max(0, left[n]);
    key.textContent = rem ? String(rem) : "";
    key.parentElement.classList.toggle("done", rem === 0);
  }
}

function onKey(ev) {
  if (!game) return;
  if (ev.key >= "1" && ev.key <= "9") {
    ev.preventDefault();
    enterDigit(Number(ev.key));
    return;
  }
  if (ev.key === "Backspace" || ev.key === "Delete" || ev.key === "0" || ev.key === " ") {
    ev.preventDefault();
    clearCell();
    return;
  }
  const move = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  }[ev.key];
  if (move) {
    ev.preventDefault();
    select((selected.r + move[0] + SIZE) % SIZE, (selected.c + move[1] + SIZE) % SIZE);
  }
}

els.newGame.addEventListener("click", newGame);
els.check.addEventListener("click", checkBoard);
els.clear.addEventListener("click", clearCell);
els.difficulty.addEventListener("change", newGame);
els.winNew.addEventListener("click", newGame);
document.addEventListener("keydown", onKey);

buildBoard();
buildPad();
newGame();
