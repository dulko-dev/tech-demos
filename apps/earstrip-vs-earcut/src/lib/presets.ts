/** Preset polygons in draw-canvas pixel space (the canvas is SIZE x SIZE logical px). */
export const DRAW_SIZE = 420

type Rings = number[][]

function ngonRing(cx: number, cy: number, r: number, n: number, startAngle = -Math.PI / 2): number[] {
  const ring: number[] = []
  for (let i = 0; i < n; i++) {
    const a = startAngle + (i * 2 * Math.PI) / n
    ring.push(cx + r * Math.cos(a), cy + r * Math.sin(a))
  }
  return ring
}

export function squareWithHole(): Rings {
  const s = DRAW_SIZE
  return [
    [s * 0.15, s * 0.15, s * 0.85, s * 0.15, s * 0.85, s * 0.85, s * 0.15, s * 0.85],
    [s * 0.35, s * 0.35, s * 0.35, s * 0.65, s * 0.65, s * 0.65, s * 0.65, s * 0.35],
  ]
}

export function star(): Rings {
  const cx = DRAW_SIZE / 2
  const cy = DRAW_SIZE / 2
  const outer = DRAW_SIZE * 0.44
  const inner = DRAW_SIZE * 0.18
  const points = 7
  const ring: number[] = []
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / points
    const r = i % 2 === 0 ? outer : inner
    ring.push(cx + r * Math.cos(a), cy + r * Math.sin(a))
  }
  return [ring]
}

/** A pentagram drawn as one ring whose edges cross each other. */
export function selfIntersecting(): Rings {
  const pts = ngonRing(DRAW_SIZE / 2, DRAW_SIZE / 2, DRAW_SIZE * 0.44, 5)
  const order = [0, 2, 4, 1, 3]
  const ring: number[] = []
  for (const i of order) ring.push(pts[i * 2], pts[i * 2 + 1])
  return [ring]
}

/** A square with 1000 small hexagonal holes in a grid: the stress case. */
export function thousandHoles(): Rings {
  const s = DRAW_SIZE
  const margin = s * 0.04
  const rings: Rings = [[margin, margin, s - margin, margin, s - margin, s - margin, margin, s - margin]]
  const cols = 34
  const rows = 30
  const cellW = (s - 2 * margin) / cols
  const cellH = (s - 2 * margin) / rows
  const r = Math.min(cellW, cellH) * 0.3
  let count = 0
  for (let j = 0; j < rows && count < 1000; j++) {
    for (let i = 0; i < cols && count < 1000; i++) {
      const cx = margin + (i + 0.5) * cellW
      const cy = margin + (j + 0.5) * cellH
      rings.push(ngonRing(cx, cy, r, 6))
      count++
    }
  }
  return rings
}

export const presets = [
  { id: 'square-hole', label: 'Square + hole', make: squareWithHole },
  { id: 'star', label: 'Star', make: star },
  { id: 'self-intersecting', label: 'Self-intersecting', make: selfIntersecting },
  { id: 'thousand-holes', label: '1000 holes', make: thousandHoles },
] as const
