import type { Poly } from './geometry'

interface GeoJsonFeatureCollection {
  features: Array<{
    geometry: { type: string; coordinates: number[][][] | number[][][][] }
  }>
}

/** Flattens Polygon/MultiPolygon features into earcut-format polys, projected to local meters (y flipped for screen space). */
export function geojsonToPolys(fc: GeoJsonFeatureCollection): Poly[] {
  let lon0 = 0
  let lat0 = 0
  let n = 0
  for (const f of fc.features) {
    const polygons = asPolygons(f.geometry)
    for (const rings of polygons) {
      for (const [lon, lat] of rings[0]) {
        lon0 += lon
        lat0 += lat
        n++
      }
    }
  }
  if (n === 0) return []
  lon0 /= n
  lat0 /= n
  const kx = Math.cos((lat0 * Math.PI) / 180) * 111320
  const ky = 110540

  const polys: Poly[] = []
  for (const f of fc.features) {
    for (const rings of asPolygons(f.geometry)) {
      const vertices: number[] = []
      const holes: number[] = []
      for (let r = 0; r < rings.length; r++) {
        let ring = rings[r]
        // GeoJSON rings repeat the first point at the end; drop the duplicate
        const last = ring.length - 1
        if (last > 0 && ring[0][0] === ring[last][0] && ring[0][1] === ring[last][1]) ring = ring.slice(0, last)
        if (ring.length < 3) continue
        if (r > 0) holes.push(vertices.length / 2)
        for (const [lon, lat] of ring) {
          vertices.push((lon - lon0) * kx, -(lat - lat0) * ky)
        }
      }
      if (vertices.length >= 6) polys.push({ vertices, holes })
    }
  }
  return polys
}

function asPolygons(geometry: { type: string; coordinates: number[][][] | number[][][][] }): number[][][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates as number[][][]]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates as number[][][][]
  return []
}
