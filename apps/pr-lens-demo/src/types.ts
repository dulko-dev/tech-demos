export type Theme = "dark" | "light";

export type CatalogPr = {
  id: string;
  repo: string;
  number: number;
  title: string;
  url: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  summary: string;
  diffNotes: string[];
  canvasUrl: string;
  defaultView: string;
};

export type Catalog = {
  generatedHow: string;
  cli: string;
  renderer: string;
  schemaVersion: string;
  prs: CatalogPr[];
};

export type ManifestAsset = {
  id: string;
  lens: "architecture" | "data-flow";
  theme: Theme;
  view: string;
  path: string;
  width: number;
  height: number;
  animated: boolean;
};

export type Manifest = {
  assets: ManifestAsset[];
  renderer: { name: string; version: string };
};

export type WalkthroughStep = {
  id: string;
  heading: string;
  body: string;
  stage?: { kind: "view" | "flow"; view?: string; flow?: string };
};

export type GraphView = {
  id: string;
  lens: string;
  scope?: { kind: string; flows?: string[] };
  children?: GraphView[];
};

export type GraphDoc = {
  title: string;
  summary?: string;
  views?: GraphView[];
  walkthrough?: { steps: WalkthroughStep[] };
};
