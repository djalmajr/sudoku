# Sudoku

Mobile-first 9×9 Sudoku in the browser. No account, no backend, no analytics.

Built with [Preact](https://preactjs.com) + [htm](https://github.com/developit/htm) via [htm-ui](https://github.com/djalmajr/htm-ui) (buildless ESM + importmap).

**Live:** https://sudoku.djalmajr.dev

## Play locally

```bash
python3 -m http.server 4173
# or: npm start
```

Open http://127.0.0.1:4173/

Needs network on first load for CDN modules (htm-ui, Preact, Tailwind browser). Offline works after the service worker caches local assets.

## Structure

```
index.html          # importmap, Tailwind, theme, mount
src/main.js         # render App + SW register
src/app.js          # shell + preact-iso router
src/routes/play.js  # play route
src/components/     # toolbar, board, pad, win dialog, confetti
src/lib/sudoku.js   # pure engine
styles/sudoku.css   # board/pad surfaces
```

## Deploy (Cloudflare Workers)

Static assets Worker. Custom domain: `sudoku.djalmajr.dev`.

```bash
npm run deploy
```

Requires Cloudflare auth (`wrangler login` or API token).

## How to play

- Choose Easy, Medium, or Hard, then **New game**.
- Tap a cell and use the number pad (or keys 1–9).
- Tap a pad digit with no cell focused to highlight that digit’s rows/cols.
- Tap the same digit again on a focused cell to clear it.
- Click outside the board and pad to clear selection.
- **Clear cell** removes your entry (clues stay locked).
- **Check** highlights conflicts. A full valid board shows the win state + confetti.
