import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DRAW_SIZE } from '@/lib/presets'

interface Props {
  rings: number[][]
  draft: number[]
  disabled: boolean
  onAddPoint: (x: number, y: number) => void
  onCloseRing: () => void
  onUndo: () => void
  onClear: () => void
}

export function DrawCanvas({ rings, draft, disabled, onAddPoint, onCloseRing, onUndo, onClear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = DRAW_SIZE * dpr
    canvas.height = DRAW_SIZE * dpr
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, DRAW_SIZE, DRAW_SIZE)

    if (disabled) {
      ctx.fillStyle = '#64748b'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('GeoJSON scene loaded — pick a preset or clear to draw', DRAW_SIZE / 2, DRAW_SIZE / 2)
      return
    }

    for (let r = 0; r < rings.length; r++) {
      const ring = rings[r]
      ctx.beginPath()
      ctx.moveTo(ring[0], ring[1])
      for (let i = 2; i < ring.length; i += 2) ctx.lineTo(ring[i], ring[i + 1])
      ctx.closePath()
      ctx.strokeStyle = r === 0 ? '#0f172a' : '#dc2626'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    if (draft.length >= 2) {
      ctx.beginPath()
      ctx.moveTo(draft[0], draft[1])
      for (let i = 2; i < draft.length; i += 2) ctx.lineTo(draft[i], draft[i + 1])
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#2563eb'
      for (let i = 0; i < draft.length; i += 2) {
        ctx.beginPath()
        ctx.arc(draft[i], draft[i + 1], 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (rings.length === 0 && draft.length === 0) {
      ctx.fillStyle = '#94a3b8'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Click to add points, then “Close ring”.', DRAW_SIZE / 2, DRAW_SIZE / 2 - 10)
      ctx.fillText('After the outline, draw rings inside it as holes.', DRAW_SIZE / 2, DRAW_SIZE / 2 + 10)
    }
  }, [rings, draft, disabled])

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * DRAW_SIZE
    const y = ((e.clientY - rect.top) / rect.height) * DRAW_SIZE
    onAddPoint(Math.round(x * 10) / 10, Math.round(y * 10) / 10)
  }

  return (
    <Card className="gap-3">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Draw</span>
          <span className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={onCloseRing} disabled={disabled || draft.length < 6}>
              Close ring
            </Button>
            <Button size="sm" variant="outline" onClick={onUndo} disabled={disabled || (draft.length === 0 && rings.length === 0)}>
              Undo
            </Button>
            <Button size="sm" variant="outline" onClick={onClear}>
              Clear
            </Button>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="w-full rounded-md border bg-white cursor-crosshair touch-none"
          style={{ aspectRatio: '1' }}
          onClick={handleClick}
        />
        <p className="mt-1 h-4 text-xs text-muted-foreground">
          {disabled ? '' : `${rings.length} ring${rings.length === 1 ? '' : 's'}${rings.length > 1 ? ` (${rings.length - 1} hole${rings.length === 2 ? '' : 's'})` : ''}${draft.length ? ` · drafting ${draft.length / 2} pts` : ''}`}
        </p>
      </CardContent>
    </Card>
  )
}
