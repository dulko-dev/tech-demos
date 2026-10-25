import { useEffect, useMemo, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { bbox, pointInTriangle, type Poly, type Pt } from '@/lib/geometry'
import { runEarcut, runEarstrip, runEarstripStrips, type TriangleSet } from '@/lib/triangulate'

export const PANEL_SIZE = 420

const STRIP_PALETTE = ['#60a5fa', '#f97316', '#34d399', '#e879f9', '#facc15', '#f87171', '#2dd4bf', '#a78bfa']

interface Props {
  lib: 'earcut' | 'earstrip'
  polys: Poly[]
  stripMode: boolean
  hover: Pt | null
  onHover: (p: Pt | null) => void
}

interface Rendered {
  sets: TriangleSet[]
  triangles: number
  ms: number
  status?: string
}

export function TrianglePanel({ lib, polys, stripMode, hover, onHover }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const staticLayer = useRef<HTMLCanvasElement | null>(null)
  const [hoverInfo, setHoverInfo] = useState<string | null>(null)

  const rendered: Rendered = useMemo(() => {
    const t0 = performance.now()
    const sets: TriangleSet[] = []
    let status: string | undefined
    for (const p of polys) {
      const set = lib === 'earcut' ? runEarcut(p) : stripMode ? runEarstripStrips(p) : runEarstrip(p)
      if (set.status && set.status !== 'exact') status = set.status
      sets.push(set)
    }
    const ms = performance.now() - t0
    const triangles = sets.reduce((a, s) => a + s.triangles.length / 3, 0)
    return { sets, triangles, ms, status }
  }, [lib, polys, stripMode])

  const box = useMemo(() => bbox(polys), [polys])

  const transform = useMemo(() => {
    const pad = 12
    const w = box.maxX - box.minX || 1
    const h = box.maxY - box.minY || 1
    const scale = Math.min((PANEL_SIZE - 2 * pad) / w, (PANEL_SIZE - 2 * pad) / h)
    const ox = (PANEL_SIZE - w * scale) / 2 - box.minX * scale
    const oy = (PANEL_SIZE - h * scale) / 2 - box.minY * scale
    return { scale, ox, oy }
  }, [box])

  // Static layer: all triangle fills + wireframe, redrawn only when the triangulation changes.
  useEffect(() => {
    const dpr = window.devicePixelRatio || 1
    const layer = document.createElement('canvas')
    layer.width = PANEL_SIZE * dpr
    layer.height = PANEL_SIZE * dpr
    const ctx = layer.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE)
    const { scale, ox, oy } = transform
    let globalTri = 0
    for (const set of rendered.sets) {
      const v = set.vertices
      const tris = set.triangles
      for (let t = 0; t < tris.length; t += 3) {
        const ax = v[tris[t] * 2] * scale + ox
        const ay = v[tris[t] * 2 + 1] * scale + oy
        const bx = v[tris[t + 1] * 2] * scale + ox
        const by = v[tris[t + 1] * 2 + 1] * scale + oy
        const cx = v[tris[t + 2] * 2] * scale + ox
        const cy = v[tris[t + 2] * 2 + 1] * scale + oy
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.lineTo(cx, cy)
        ctx.closePath()
        if (set.stripOf) {
          ctx.fillStyle = STRIP_PALETTE[set.stripOf[t / 3] % STRIP_PALETTE.length]
        } else {
          ctx.fillStyle = `hsl(${(globalTri * 47) % 360} 70% 80%)`
        }
        ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 0.5
        ctx.stroke()
        globalTri++
      }
    }
    staticLayer.current = layer
    drawComposite(canvasRef.current, layer, null)
  }, [rendered, transform])

  // Hover layer: composite the cached static layer plus the highlighted triangle.
  useEffect(() => {
    const layer = staticLayer.current
    if (!layer) return
    let highlight: { pts: number[]; label: string } | null = null
    if (hover) {
      outer: for (const set of rendered.sets) {
        const v = set.vertices
        const tris = set.triangles
        for (let t = 0; t < tris.length; t += 3) {
          const ax = v[tris[t] * 2]
          const ay = v[tris[t] * 2 + 1]
          const bx = v[tris[t + 1] * 2]
          const by = v[tris[t + 1] * 2 + 1]
          const cx = v[tris[t + 2] * 2]
          const cy = v[tris[t + 2] * 2 + 1]
          if (pointInTriangle(hover.x, hover.y, ax, ay, bx, by, cx, cy)) {
            const label = set.stripOf
              ? `triangle ${t / 3} — strip ${set.stripOf[t / 3]}`
              : `triangle ${t / 3} (${tris[t]}, ${tris[t + 1]}, ${tris[t + 2]})`
            highlight = { pts: [ax, ay, bx, by, cx, cy], label }
            break outer
          }
        }
      }
    }
    setHoverInfo(highlight?.label ?? null)
    drawComposite(canvasRef.current, layer, highlight ? toScreen(highlight.pts, transform) : null)
  }, [hover, rendered, transform])

  const toWorld = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * PANEL_SIZE
    const y = ((e.clientY - rect.top) / rect.height) * PANEL_SIZE
    return { x: (x - transform.ox) / transform.scale, y: (y - transform.oy) / transform.scale }
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="font-mono">{lib === 'earcut' ? 'earcut' : stripMode ? 'earstrip · strips()' : 'earstrip'}</span>
          <span className="flex gap-1">
            {rendered.status && <Badge variant="destructive">{rendered.status}</Badge>}
            <Badge variant="secondary">{rendered.triangles.toLocaleString()} tris</Badge>
            <Badge variant="outline">{rendered.ms.toFixed(1)} ms</Badge>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="w-full rounded-md border bg-white touch-none"
          style={{ aspectRatio: '1' }}
          onPointerMove={(e) => onHover(toWorld(e))}
          onPointerLeave={() => onHover(null)}
        />
        <p className="mt-1 h-4 text-xs text-muted-foreground">{hoverInfo ?? '\u00A0'}</p>
      </CardContent>
    </Card>
  )
}

function toScreen(pts: number[], t: { scale: number; ox: number; oy: number }): number[] {
  const out: number[] = []
  for (let i = 0; i < pts.length; i += 2) {
    out.push(pts[i] * t.scale + t.ox, pts[i + 1] * t.scale + t.oy)
  }
  return out
}

function drawComposite(canvas: HTMLCanvasElement | null, layer: HTMLCanvasElement, highlight: number[] | null) {
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  if (canvas.width !== PANEL_SIZE * dpr) {
    canvas.width = PANEL_SIZE * dpr
    canvas.height = PANEL_SIZE * dpr
  }
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(layer, 0, 0)
  if (highlight) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.beginPath()
    ctx.moveTo(highlight[0], highlight[1])
    ctx.lineTo(highlight[2], highlight[3])
    ctx.lineTo(highlight[4], highlight[5])
    ctx.closePath()
    ctx.fillStyle = 'rgba(37, 99, 235, 0.55)'
    ctx.fill()
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}
