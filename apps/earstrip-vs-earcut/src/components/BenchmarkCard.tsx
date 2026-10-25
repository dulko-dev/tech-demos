import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Poly } from '@/lib/geometry'
import { benchScene, type BenchRow } from '@/lib/triangulate'

interface Props {
  polys: Poly[]
  sceneLabel: string
}

const RUN_OPTIONS = [20, 100, 500]

export function BenchmarkCard({ polys, sceneLabel }: Props) {
  const [runs, setRuns] = useState(100)
  const [rows, setRows] = useState<BenchRow[] | null>(null)
  const [benchedLabel, setBenchedLabel] = useState('')
  const [running, setRunning] = useState(false)

  const run = () => {
    setRunning(true)
    // Let the button render its "running" state before the main thread blocks.
    setTimeout(() => {
      try {
        setRows(benchScene(polys, runs))
        setBenchedLabel(`${sceneLabel} · ${runs} runs`)
      } finally {
        setRunning(false)
      }
    }, 30)
  }

  const earcutMedian = rows?.[0]?.medianMs ?? 0

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center justify-between gap-2">
          <span>Benchmark</span>
          <span className="flex items-center gap-1.5">
            {RUN_OPTIONS.map((n) => (
              <Button key={n} size="sm" variant={runs === n ? 'default' : 'outline'} onClick={() => setRuns(n)}>
                {n}×
              </Button>
            ))}
            <Button size="sm" onClick={run} disabled={running || polys.length === 0}>
              {running ? 'Running…' : 'Run benchmark'}
            </Button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows ? (
          <>
            <Badge variant="secondary">{benchedLabel}</Badge>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Library</TableHead>
                  <TableHead className="text-right">Median ms</TableHead>
                  <TableHead className="text-right">Total ms</TableHead>
                  <TableHead className="text-right">Triangles</TableHead>
                  <TableHead className="text-right">Indices</TableHead>
                  <TableHead className="text-right">Speedup vs earcut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.label}>
                    <TableCell className="font-mono">{r.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.medianMs.toFixed(3)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.totalMs.toFixed(1)}</TableCell>
                    <TableCell className="text-right tabular-nums">{Math.round(r.triangles).toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.indexCount.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.medianMs > 0 ? `${(earcutMedian / r.medianMs).toFixed(2)}×` : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground">
              Real numbers measured in your browser just now ({navigator.userAgent.match(/(Chrome|Firefox|Safari)\/[\d.]+/)?.[0] ?? 'unknown browser'}).
              Timings vary with browser, machine, and load — rerun a few times and compare medians, not single runs.
            </p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Runs each triangulator {runs}× on the current scene and reports the median. Pick a preset or draw a polygon first.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
