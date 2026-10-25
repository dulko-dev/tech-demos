import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { BenchmarkCard } from '@/components/BenchmarkCard'
import { DrawCanvas } from '@/components/DrawCanvas'
import { TrianglePanel } from '@/components/TrianglePanel'
import buildingsRaw from '@/data/buildings.json'
import { ringsToPoly, type Poly, type Pt } from '@/lib/geometry'
import { geojsonToPolys } from '@/lib/geojson'
import { presets, squareWithHole } from '@/lib/presets'
import { runEarcut, runEarstrip } from '@/lib/triangulate'

interface GeoStats {
  polys: number
  vertices: number
  earcutMs: number
  earcutTris: number
  earstripMs: number
  earstripTris: number
}

export default function App() {
  const [rings, setRings] = useState<number[][]>(squareWithHole)
  const [draft, setDraft] = useState<number[]>([])
  const [geojsonPolys, setGeojsonPolys] = useState<Poly[] | null>(null)
  const [geoStats, setGeoStats] = useState<GeoStats | null>(null)
  const [sceneLabel, setSceneLabel] = useState('Square + hole')
  const [stripMode, setStripMode] = useState(false)
  const [hover, setHover] = useState<Pt | null>(null)

  const polys = useMemo<Poly[]>(() => {
    if (geojsonPolys) return geojsonPolys
    return rings.length > 0 ? [ringsToPoly(rings)] : []
  }, [geojsonPolys, rings])

  const loadPreset = (make: () => number[][], label: string) => {
    setGeojsonPolys(null)
    setRings(make())
    setDraft([])
    setSceneLabel(label)
  }

  const loadGeojson = () => {
    const loaded = geojsonToPolys(buildingsRaw)
    let vertices = 0
    let earcutTris = 0
    let earstripTris = 0
    const t0 = performance.now()
    for (const p of loaded) earcutTris += runEarcut(p).triangles.length / 3
    const t1 = performance.now()
    for (const p of loaded) earstripTris += runEarstrip(p).triangles.length / 3
    const t2 = performance.now()
    for (const p of loaded) vertices += p.vertices.length / 2
    setGeojsonPolys(loaded)
    setGeoStats({
      polys: loaded.length,
      vertices,
      earcutMs: t1 - t0,
      earcutTris,
      earstripMs: t2 - t1,
      earstripTris,
    })
    setSceneLabel('OSM building footprints')
    setDraft([])
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="font-mono">earstrip</span> vs <span className="font-mono">earcut</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          <a className="underline" href="https://github.com/GLMap/earstrip" target="_blank" rel="noreferrer">earstrip</a> is a
          WebAssembly polygon triangulator with the same call signature as{' '}
          <a className="underline" href="https://github.com/mapbox/earcut" target="_blank" rel="noreferrer">earcut</a>, claiming
          1.4–2.1× earcut's speed. Draw a polygon (or pick a preset), compare the triangulations, and measure it yourself. More:{' '}
          <a className="underline" href="https://news.ycombinator.com/item?id=50193170" target="_blank" rel="noreferrer">HN thread</a>,{' '}
          <a className="underline" href="https://globus.software/blog/2026/10/16/cutting-map-polygons/" target="_blank" rel="noreferrer">blog post</a>.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {presets.map((p) => (
          <Button
            key={p.id}
            size="sm"
            variant={sceneLabel === p.label ? 'default' : 'outline'}
            onClick={() => loadPreset(p.make, p.label)}
          >
            {p.label}
          </Button>
        ))}
        <Button size="sm" variant={geojsonPolys ? 'default' : 'outline'} onClick={loadGeojson}>
          Load OSM buildings
        </Button>
        <span className="ml-auto flex items-center gap-2 text-sm">
          <Switch id="strips" checked={stripMode} onCheckedChange={setStripMode} />
          <label htmlFor="strips" className="cursor-pointer select-none">
            Color earstrip's triangle strips
          </label>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DrawCanvas
          rings={rings}
          draft={draft}
          disabled={geojsonPolys !== null}
          onAddPoint={(x, y) => setDraft((d) => [...d, x, y])}
          onCloseRing={() => {
            if (draft.length >= 6) {
              setRings((r) => [...r, draft])
              setDraft([])
              setSceneLabel('Drawn polygon')
            }
          }}
          onUndo={() => {
            if (draft.length > 0) setDraft((d) => d.slice(0, -2))
            else setRings((r) => r.slice(0, -1))
          }}
          onClear={() => {
            setGeojsonPolys(null)
            setGeoStats(null)
            setRings([])
            setDraft([])
            setSceneLabel('Drawn polygon')
          }}
        />
        <TrianglePanel lib="earcut" polys={polys} stripMode={stripMode} hover={hover} onHover={setHover} />
        <TrianglePanel lib="earstrip" polys={polys} stripMode={stripMode} hover={hover} onHover={setHover} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BenchmarkCard polys={polys} sceneLabel={sceneLabel} />
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Real data: OSM building footprints</span>
              {geoStats && <Badge variant="secondary">central Berlin · committed GeoJSON</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {geoStats ? (
              <>
                <p className="text-sm text-muted-foreground">
                  {geoStats.polys} polygons · {geoStats.vertices.toLocaleString()} vertices, triangulated in one pass per library:
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Library</TableHead>
                      <TableHead className="text-right">Total ms (1 pass)</TableHead>
                      <TableHead className="text-right">Triangles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">earcut</TableCell>
                      <TableCell className="text-right tabular-nums">{geoStats.earcutMs.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(geoStats.earcutTris).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">earstrip</TableCell>
                      <TableCell className="text-right tabular-nums">{geoStats.earstripMs.toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">{Math.round(geoStats.earstripTris).toLocaleString()}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground">
                  A single cold pass over a small dataset is noisy — use the benchmark on the left for medians over many runs.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                A small static GeoJSON of building footprints (OpenStreetMap, central Berlin) is committed in this app — no network, no
                API key. Load it to triangulate every footprint with both libraries and see totals and timing.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
