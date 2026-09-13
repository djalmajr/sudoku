# Sudoku

Mobile-first 9×9 Sudoku in the browser. No account, no backend, no analytics.

**Live:** https://sudoku.djalmajr.dev

## Play locally

```bash
python3 -m http.server 4173
```

Open http://127.0.0.1:4173/

## Deploy (Cloudflare Workers)

Static assets Worker. Custom domain: `sudoku.djalmajr.dev`.

```bash
npm run deploy
```

Requires Cloudflare auth (`wrangler login` or API token). DNS/route for `sudoku.djalmajr.dev` is managed in Cloudflare.

## How to play

- Choose Easy, Medium, or Hard, then **New game**.
- Tap a cell and use the number pad (or keys 1–9).
- **Clear cell** removes your entry (clues stay locked).
- **Check** highlights conflicts. A full valid board shows the win state.

## Tests

```bash
npm test
```

Requires Node 18+ (`node --test`).

## License

MIT. Contact: [github.com/djalmajr](https://github.com/djalmajr)
