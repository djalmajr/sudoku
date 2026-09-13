import { html } from "htm/preact";
import { Button } from "htm-ui/button.js";
import { NativeSelect, NativeSelectItem } from "htm-ui/native-select.js";
import { DIFFICULTY } from "../lib/sudoku.js";

export function Toolbar({ difficulty, onNewGame, onCheck, onDifficulty }) {
  return html`
    <div class="sudoku-toolbar">
      <${Button}
        type="button"
        size="lg"
        className="min-h-12 font-bold"
        onClick=${onNewGame}
      >
        New game
      <//>
      <${Button}
        type="button"
        variant="outline"
        size="lg"
        className="min-h-12"
        onClick=${onCheck}
      >
        Check
      <//>
      <div class="diff">
        <${NativeSelect}
          aria-label="Difficulty"
          value=${difficulty}
          onChange=${(e) => onDifficulty(e.target.value)}
          className="min-h-12"
        >
          ${Object.values(DIFFICULTY).map(
            (d) => html`
              <${NativeSelectItem} key=${d.id} value=${d.id}>${d.label}<//>
            `,
          )}
        <//>
      </div>
    </div>
  `;
}
