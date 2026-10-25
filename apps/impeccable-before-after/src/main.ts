import "./style.css";
import data from "./findings-data.json" with { type: "json" };
import commands from "./commands.json" with { type: "json" };

type View = "before" | "after" | "split";

const found = document.querySelector<HTMLDivElement>("#app");
if (!found) {
  throw new Error("#app missing");
}
const root: HTMLDivElement = found;

let view: View = "split";

function frame(src: string, label: string): string {
  return `
    <figure class="frame">
      <figcaption>${label}</figcaption>
      <iframe title="${label}" src="${src}"></iframe>
    </figure>
  `;
}

function render(): void {
  const frames =
    view === "split"
      ? `${frame("/pages/before/index.html", "BEFORE")}
         ${frame("/pages/after/index.html", "AFTER")}`
      : frame(
          view === "before" ? "/pages/before/index.html" : "/pages/after/index.html",
          view === "before" ? "BEFORE" : "AFTER",
        );

  const rows = data.rows
    .map(
      (row) => `
        <tr>
          <th scope="row">${row.name}<code>${row.id}</code></th>
          <td class="num">${row.before}</td>
          <td class="num">${row.after}</td>
          <td class="delta">${row.after - row.before}</td>
        </tr>`,
    )
    .join("");

  const log = commands
    .map(
      (c) => `
        <li>
          <strong>${c.command}</strong>
          <span>${c.changed}</span>
        </li>`,
    )
    .join("");

  root.innerHTML = `
    <header class="top">
      <div>
        <p class="kicker">Impeccable detector demo</p>
        <h1>Does the skill make AI-built UI better?</h1>
        <p class="lead">
          Same fictional product (SyncFlow). BEFORE is a typical AI-default landing.
          AFTER was produced by running Impeccable commands on that page.
          Counts below come only from <code>impeccable detect --json</code>
          (CLI 4.7.0, static HTML engine).
        </p>
      </div>
      <dl class="score">
        <div>
          <dt>BEFORE</dt>
          <dd>${data.before.total}</dd>
          <p>${data.before.primary} primary · ${data.before.advisory} advisory</p>
        </div>
        <div>
          <dt>AFTER</dt>
          <dd>${data.after.total}</dd>
          <p>${data.after.primary} primary · ${data.after.advisory} advisory</p>
        </div>
      </dl>
    </header>

    <div class="toolbar" role="tablist" aria-label="Page view">
      <button type="button" data-view="before" ${view === "before" ? "aria-selected=true" : ""}>Before</button>
      <button type="button" data-view="after" ${view === "after" ? "aria-selected=true" : ""}>After</button>
      <button type="button" data-view="split" ${view === "split" ? "aria-selected=true" : ""}>Side by side</button>
    </div>

    <section class="stage ${view}">${frames}</section>

    <section class="panel" id="findings">
      <h2>Detector findings</h2>
      <p>
        Raw output is in <code>detector-output/</code>.
        A clean AFTER scan is a floor, not a beauty contest.
        URL / browser-engine scans were not run.
      </p>
      <table>
        <thead>
          <tr>
            <th scope="col">Rule</th>
            <th scope="col">Before</th>
            <th scope="col">After</th>
            <th scope="col">Δ</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td class="num">${data.before.total}</td>
            <td class="num">${data.after.total}</td>
            <td class="delta">${data.after.total - data.before.total}</td>
          </tr>
        </tfoot>
      </table>
    </section>

    <section class="panel">
      <h2>Commands used</h2>
      <ol class="log">${log}</ol>
    </section>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      view = button.dataset.view as View;
      render();
    });
  });
}

render();
