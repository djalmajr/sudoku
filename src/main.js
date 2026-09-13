import { html } from "htm/preact";
import { render } from "preact";
import { App } from "./app.js";

render(html`<${App} />`, document.getElementById("app"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
