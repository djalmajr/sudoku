import { html } from "htm/preact";
import { EMPTY, SIZE } from "../lib/sudoku.js";

function cellClass(r, c, { given, selected, peer, same, digitHit, conflict }) {
  const parts = ["sudoku-cell"];
  if (c % 3 === 0) parts.push("box-left");
  if (r % 3 === 0) parts.push("box-top");
  if (c === SIZE - 1) parts.push("box-right");
  if (r === SIZE - 1) parts.push("box-bottom");
  if (given) parts.push("given");
  if (selected) parts.push("selected");
  if (peer) parts.push("peer");
  if (same) parts.push("same");
  if (digitHit) parts.push("digit-hit");
  if (conflict) parts.push("conflict");
  return parts.join(" ");
}

export function Board({
  board,
  given,
  selected,
  digitFilter,
  checkMode,
  conflictMap,
  onSelect,
  boardRef,
}) {
  if (!board) return null;

  const hasCell = Boolean(selected);
  const sr = hasCell ? selected.r : -1;
  const sc = hasCell ? selected.c : -1;
  const selectedValue = hasCell ? board[sr][sc] : EMPTY;
  const filter = !hasCell && digitFilter ? digitFilter : null;

  let axes = null;
  if (filter) {
    const rows = new Set();
    const cols = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === filter) {
          rows.add(r);
          cols.add(c);
        }
      }
    }
    axes = { rows, cols };
  }

  const sameBox = (r, c) =>
    hasCell &&
    Math.floor(r / 3) === Math.floor(sr / 3) &&
    Math.floor(c / 3) === Math.floor(sc / 3);

  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      let peer = false;
      let same = false;
      let isSelected = false;

      if (hasCell) {
        isSelected = r === sr && c === sc;
        peer = r === sr || c === sc || sameBox(r, c);
        same = selectedValue !== EMPTY && v === selectedValue && !isSelected;
      } else if (filter) {
        same = v === filter;
        peer = axes.rows.has(r) || axes.cols.has(c);
      }

      cells.push(html`
        <button
          type="button"
          key=${`${r}-${c}`}
          class=${cellClass(r, c, {
            given: given[r][c],
            selected: isSelected,
            peer,
            same,
            digitHit: Boolean(filter && same),
            conflict: Boolean(checkMode && conflictMap && conflictMap[r][c]),
          })}
          aria-label=${`Row ${r + 1}, column ${c + 1}`}
          aria-pressed=${isSelected ? "true" : "false"}
          onClick=${(ev) => {
            ev.stopPropagation();
            onSelect(r, c);
          }}
          onPointerDown=${(ev) => ev.stopPropagation()}
        >
          ${v === EMPTY ? "" : String(v)}
        </button>
      `);
    }
  }

  return html`
    <div
      class="sudoku-board"
      role="grid"
      aria-label="Sudoku board"
      ref=${boardRef}
      onClick=${(ev) => ev.stopPropagation()}
      onPointerDown=${(ev) => ev.stopPropagation()}
    >
      ${cells}
    </div>
  `;
}
