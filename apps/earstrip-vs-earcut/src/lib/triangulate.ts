import earcut from 'earcut'
import earstrip, { strips as earstripStrips, lastStatus } from 'earstrip'
import type { Poly } from './geometry'

export { lastStatus }

export interface TriangleSet {
  /** Flat x,y pairs; may extend the input vertices with points earstrip added at ring crossings. */
  vertices: ArrayLike<number>
  /** Three vertex indices per triangle. */
  triangles: number[]
  /** Strip id per triangle (strip visualization); undefined for plain triangle lists. */
  stripOf?: number[]
  /** Raw index count of the underlying output (3/triangle for lists, ~1.7/triangle for strips). */
  indexCount: number
  status?: ReturnType<typeof lastStatus>
}

export function runEarcut(p: Poly): TriangleSet {
  const triangles = earcut(p.vertices, p.holes, 2)
  return { vertices: p.vertices, triangles, indexCount: triangles.length }
}

export function runEarstrip(p: Poly): TriangleSet {
  const triangles = earstrip(p.vertices, p.holes, 2)
  return { vertices: p.vertices, triangles, indexCount: triangles.length, status: lastStatus() }
}

/** earstrip's native strips() output decoded into triangles tagged with their strip id. */
export function runEarstripStrips(p: Poly): TriangleSet {
  const { indices, ends, points } = earstripStrips(p.vertices, p.holes, 2)
  const status = lastStatus()
  let vertices: ArrayLike<number> = p.vertices
  if (points.length > 0) {
    const merged = new Float64Array(p.vertices.length + points.length)
    merged.set(p.vertices)
    merged.set(points, p.vertices.length)
    vertices = merged
  }
  const triangles: number[] = []
  const stripOf: number[] = []
  let start = 0
  for (let s = 0; s < ends.length; s++) {
    const end = ends[s]
    for (let i = start; i + 2 < end; i++) {
      const a = indices[i]
      const b = indices[i + 1]
      const c = indices[i + 2]
      if (a === b || b === c || a === c) continue // winding-fix degenerates
      triangles.push(a, b, c)
      stripOf.push(s)
    }
    start = end
  }
  return { vertices, triangles, stripOf, indexCount: indices.length, status }
}

export interface BenchRow {
  label: string
  medianMs: number
  totalMs: number
  triangles: number
  indexCount: number
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/** Times fn over `runs` runs (after a short warmup); fn returns { triangles, indexCount } of one pass over the scene. */
export function bench(label: string, fn: () => { triangles: number; indexCount: number }, runs: number): BenchRow {
  fn()
  fn()
  const times: number[] = []
  let last = { triangles: 0, indexCount: 0 }
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now()
    last = fn()
    times.push(performance.now() - t0)
  }
  return {
    label,
    medianMs: median(times),
    totalMs: times.reduce((a, b) => a + b, 0),
    triangles: last.triangles,
    indexCount: last.indexCount,
  }
}

export function benchScene(polys: Poly[], runs: number): BenchRow[] {
  const pass = (tri: (p: Poly) => { triangles: { length: number } | number[]; indexCount: number }) => () => {
    let triangles = 0
    let indexCount = 0
    for (const p of polys) {
      const r = tri(p)
      triangles += (Array.isArray(r.triangles) ? r.triangles.length : r.triangles.length) / 3
      indexCount += r.indexCount
    }
    return { triangles, indexCount }
  }
  return [
    bench('earcut', pass((p) => {
      const t = earcut(p.vertices, p.holes, 2)
      return { triangles: t, indexCount: t.length }
    }), runs),
    bench('earstrip (triangle list)', pass((p) => {
      const t = earstrip(p.vertices, p.holes, 2)
      return { triangles: t, indexCount: t.length }
    }), runs),
    bench('earstrip.strips()', pass((p) => {
      const { indices, ends } = earstripStrips(p.vertices, p.holes, 2)
      // triangles per strip = strip length - 2 (upper bound; winding-fix duplicates excluded is a detail)
      let tris = 0
      let start = 0
      for (let s = 0; s < ends.length; s++) {
        tris += Math.max(0, ends[s] - start - 2)
        start = ends[s]
      }
      return { triangles: { length: tris * 3 }, indexCount: indices.length }
    }), runs),
  ]
}
