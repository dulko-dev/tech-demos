/** A polygon in earcut's flat format: x,y pairs plus the vertex index where each hole starts. */
export interface Poly {
  vertices: number[]
  holes: number[]
}

export interface Pt {
  x: number
  y: number
}

/** Rings (flat x,y arrays, first = outer, rest = holes) to a flat Poly. */
export function ringsToPoly(rings: number[][]): Poly {
  const vertices: number[] = []
  const holes: number[] = []
  for (let r = 0; r < rings.length; r++) {
    if (r > 0) holes.push(vertices.length / 2)
    vertices.push(...rings[r])
  }
  return { vertices, holes }
}

export function bbox(polys: Poly[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of polys) {
    for (let i = 0; i < p.vertices.length; i += 2) {
      const x = p.vertices[i]
      const y = p.vertices[i + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
  }
  if (minX > maxX) return { minX: 0, minY: 0, maxX: 1, maxY: 1 }
  return { minX, minY, maxX, maxY }
}

export function pointInTriangle(px: number, py: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by)
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy)
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay)
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0
  return !(hasNeg && hasPos)
}
