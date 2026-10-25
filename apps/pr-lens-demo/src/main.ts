import "./style.css";
import type {
  Catalog,
  CatalogPr,
  GraphDoc,
  GraphView,
  Manifest,
  ManifestAsset,
  Theme,
  WalkthroughStep,
} from "./types.ts";

const found = document.querySelector<HTMLDivElement>("#app");
if (!found) throw new Error("#app missing");
const root: HTMLDivElement = found;

type State = {
  catalog: Catalog;
  selectedId: string;
  view: string;
  theme: Theme;
  step: number;
};

const cache = new Map<string, { manifest: Manifest; graph: GraphDoc }>();

async function loadArtifacts(id: string) {
  const hit = cache.get(id);
  if (hit) return hit;
  const [manifest, graph] = await Promise.all([
    fetch(`/artifacts/${id}/render/manifest.json`).then((r) => {
      if (!r.ok) throw new Error(`manifest ${id}: ${r.status}`);
      return r.json() as Promise<Manifest>;
    }),
    fetch(`/artifacts/${id}/graph.json`).then((r) => {
      if (!r.ok) throw new Error(`graph ${id}: ${r.status}`);
      return r.json() as Promise<GraphDoc>;
    }),
  ]);
  const packed = { manifest, graph };
  cache.set(id, packed);
  return packed;
}

function viewsFor(manifest: Manifest): { id: string; lens: ManifestAsset["lens"] }[] {
  const seen = new Set<string>();
  const out: { id: string; lens: ManifestAsset["lens"] }[] = [];
  for (const asset of manifest.assets) {
    if (seen.has(asset.view)) continue;
    seen.add(asset.view);
    out.push({ id: asset.view, lens: asset.lens });
  }
  return out;
}

function pickAsset(manifest: Manifest, view: string, theme: Theme): ManifestAsset | undefined {
  return manifest.assets.find((a) => a.view === view && a.theme === theme);
}

function flattenViews(views: GraphView[] | undefined): GraphView[] {
  const out: GraphView[] = [];
  for (const view of views ?? []) {
    out.push(view);
    out.push(...flattenViews(view.children));
  }
  return out;
}

function stageView(
  step: WalkthroughStep | undefined,
  fallback: string,
  graph: GraphDoc,
): string {
  if (!step?.stage) return fallback;
  if (step.stage.kind === "view" && step.stage.view) return step.stage.view;
  if (step.stage.kind === "flow" && step.stage.flow) {
    const flow = step.stage.flow;
    const match = flattenViews(graph.views).find((view) => view.scope?.flows?.includes(flow));
    return match?.id ?? flow;
  }
  return fallback;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function render(state: State, manifest: Manifest, graph: GraphDoc) {
  const pr = state.catalog.prs.find((p) => p.id === state.selectedId);
  if (!pr) return;
  const views = viewsFor(manifest);
  const steps = graph.walkthrough?.steps ?? [];
  const step = steps[state.step];
  const asset = pickAsset(manifest, state.view, state.theme);
  const svgSrc = asset ? `/artifacts/${pr.id}/render/${asset.path}` : "";

  root.innerHTML = `
    <header class="top">
      <div>
        <p class="eyebrow">PR Lens demo</p>
        <h1>What the diagrams look like on real diffs</h1>
      </div>
      <p class="how">${escapeHtml(state.catalog.generatedHow)}</p>
    </header>

    <aside class="list" aria-label="Pull requests">
      ${state.catalog.prs.map((item) => prCard(item, state.selectedId)).join("")}
    </aside>

    <section class="stage">
      <div class="stage-bar">
        <div class="tabs" role="tablist">
          ${views
            .map(
              (v) => `
            <button type="button" role="tab" data-view="${v.id}" aria-selected="${v.id === state.view}">
              <span class="lens">${v.lens}</span>
              ${escapeHtml(labelize(v.id))}
            </button>`,
            )
            .join("")}
        </div>
        <div class="theme">
          <button type="button" data-theme="dark" aria-pressed="${state.theme === "dark"}">Dark</button>
          <button type="button" data-theme="light" aria-pressed="${state.theme === "light"}">Light</button>
        </div>
      </div>
      <div class="frame ${state.theme}">
        ${
          svgSrc
            ? `<object data="${svgSrc}" type="image/svg+xml" aria-label="${escapeHtml(graph.title)}"></object>`
            : `<p class="empty">No SVG for this view.</p>`
        }
      </div>
      <p class="caption">
        Official <code>@coldtea/pr-lens-cli render</code> output
        (${escapeHtml(manifest.renderer.name)} ${escapeHtml(manifest.renderer.version)}).
        Animation is inside the SVG — no page JavaScript.
        ${asset?.animated ? "This file is marked animated." : ""}
      </p>
    </section>

    <aside class="meta">
      <p class="repo"><a href="${pr.url}" target="_blank" rel="noreferrer">${escapeHtml(pr.repo)}#${pr.number}</a></p>
      <h2>${escapeHtml(pr.title)}</h2>
      <p class="counts">
        <span>+${fmt(pr.additions)}</span>
        <span>−${fmt(pr.deletions)}</span>
        <span>${pr.filesChanged} files</span>
      </p>
      <p>${escapeHtml(pr.summary)}</p>
      <ul>${pr.diffNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
      <a class="canvas" href="${pr.canvasUrl}" target="_blank" rel="noreferrer">
        Open live canvas on prlens.dev
      </a>
      <p class="canvas-note">Pan, zoom, and Play / W for the walkthrough. Unlisted, no sign-in. Pushed with <code>pr-lens canvas push</code> (no key).</p>

      ${
        steps.length
          ? `
        <div class="walk">
          <div class="walk-bar">
            <h3>Walkthrough</h3>
            <span>${state.step + 1} / ${steps.length}</span>
          </div>
          <p class="walk-h">${escapeHtml(step?.heading ?? "")}</p>
          <p>${escapeHtml(step?.body ?? "")}</p>
          <div class="walk-nav">
            <button type="button" data-step="-1" ${state.step === 0 ? "disabled" : ""}>Prev</button>
            <button type="button" data-step="1" ${state.step === steps.length - 1 ? "disabled" : ""}>Next</button>
          </div>
        </div>`
          : ""
      }
    </aside>
  `;

  root.querySelectorAll<HTMLButtonElement>("[data-pr]").forEach((btn) => {
    btn.addEventListener("click", () => void selectPr(state, btn.dataset.pr ?? ""));
  });
  root.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view ?? state.view;
      render(state, manifest, graph);
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.theme = btn.dataset.theme === "light" ? "light" : "dark";
      render(state, manifest, graph);
    });
  });
  root.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = state.step + Number(btn.dataset.step);
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      state.step = clamped;
      state.view = stageView(steps[clamped], pr.defaultView, graph);
      render(state, manifest, graph);
    });
  });
}

function prCard(item: CatalogPr, selected: string): string {
  return `
    <button type="button" class="pr ${item.id === selected ? "on" : ""}" data-pr="${item.id}">
      <span class="pr-id">${escapeHtml(item.repo)}#${item.number}</span>
      <span class="pr-title">${escapeHtml(item.title)}</span>
      <span class="pr-stat">+${fmt(item.additions)} −${fmt(item.deletions)}</span>
    </button>
  `;
}

function labelize(id: string): string {
  return id.replace(/-/g, " ");
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function selectPr(state: State, id: string) {
  const pr = state.catalog.prs.find((p) => p.id === id);
  if (!pr) return;
  const { manifest, graph } = await loadArtifacts(id);
  state.selectedId = id;
  state.view = pr.defaultView;
  state.step = 0;
  render(state, manifest, graph);
}

async function boot() {
  const catalog = (await fetch("/catalog.json").then((r) => r.json())) as Catalog;
  const first = catalog.prs[0];
  if (!first) throw new Error("empty catalog");
  const state: State = {
    catalog,
    selectedId: first.id,
    view: first.defaultView,
    theme: "dark",
    step: 0,
  };
  const { manifest, graph } = await loadArtifacts(first.id);
  render(state, manifest, graph);
}

boot().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  if (root) root.innerHTML = `<p class="empty">Failed to load demo: ${escapeHtml(message)}</p>`;
});
