import { html } from "htm/preact";
import { remainingCounts } from "../lib/sudoku.js";

export function NumberPad({
  board,
  selected,
  digitFilter,
  onDigit,
  padRef,
}) {
  if (!board) return null;
  const left = remainingCounts(board);
  const hasCell = Boolean(selected);
  const filter = !hasCell && digitFilter ? digitFilter : null;

  return html`
    <div
      class="sudoku-pad"
      aria-label="Number pad"
      ref=${padRef}
      onClick=${(ev) => ev.stopPropagation()}
      onPointerDown=${(ev) => ev.stopPropagation()}
    >
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
        const rem = Math.max(0, left[n]);
        const cls = [
          "sudoku-pad-key",
          rem === 0 ? "done" : "",
          filter === n ? "active-filter" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return html`
          <button
            type="button"
            key=${n}
            class=${cls}
            aria-label=${hasCell ? `Enter ${n}` : `Highlight ${n} on the board`}
            onClick=${(ev) => {
              ev.stopPropagation();
              onDigit(n);
            }}
          >
            <span class="sudoku-pad-n">${n}</span>
            <span class="sudoku-pad-left">${rem ? String(rem) : ""}</span>
          </button>
        `;
      })}
    </div>
  `;
}
