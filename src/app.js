import { html } from "htm/preact";
import { LocationProvider, Router, Route } from "preact-iso";
import { Play } from "./routes/play.js";

export function App() {
  return html`
    <${LocationProvider}>
      <${Router}>
        <${Route} path="/" component=${Play} />
        <${Route} default component=${Play} />
      <//>
    <//>
  `;
}
