#!/usr/bin/env bash
# Rebuild official PR Lens SVGs from the committed graph documents.
# Keyless: validate + render only. Does not call `analyze` (that needs a model key).
set -euo pipefail
cd "$(dirname "$0")/.."

ids=(tech-demos-1 tech-demos-2 react-13968)

for id in "${ids[@]}"; do
  graph="public/artifacts/${id}/graph.json"
  out="public/artifacts/${id}/render"
  echo "validate ${graph}"
  bunx @coldtea/pr-lens-cli@latest validate "${graph}"
  echo "render ${graph} -> ${out}"
  bunx @coldtea/pr-lens-cli@latest render "${graph}" --out "${out}" --theme both
done

echo "done. optional (writes a token into ignored .pr-lens/):"
echo "  bunx @coldtea/pr-lens-cli@latest canvas push public/artifacts/<id>/render/drawn.graph.json"
