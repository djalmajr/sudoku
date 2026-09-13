import { html } from "htm/preact";
import { useEffect } from "preact/hooks";
import { Button } from "htm-ui/button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "htm-ui/dialog.js";

const DIALOG_ID = "sudoku-win-dialog";

export function WinDialog({ open, onNewGame, onClose }) {
  useEffect(() => {
    const dialog = document.getElementById(DIALOG_ID);
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return html`
    <${Dialog}
      id=${DIALOG_ID}
      dismissible=${true}
      onClose=${onClose}
    >
      <${DialogContent} className="text-center">
        <${DialogHeader} className="items-center text-center">
          <${DialogTitle}>You solved it<//>
          <${DialogDescription}>
            Nice work. Start another puzzle when you are ready.
          <//>
        <//>
        <${DialogFooter} className="sm:justify-center">
          <${Button}
            type="button"
            size="lg"
            className="min-h-12 font-bold w-full sm:w-auto"
            onClick=${onNewGame}
          >
            New game
          <//>
        <//>
      <//>
    <//>
  `;
}
