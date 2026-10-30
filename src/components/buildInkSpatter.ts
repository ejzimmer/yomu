import { createRandom } from '../levelUp/createRandom'

const BLOB_POINTS = 18

export interface Droplet {
  x: number
  y: number
  length: number
  width: number
  angle: number
}

export interface InkSpatter {
  blob: string
  droplets: Droplet[]
}

export function buildInkSpatter(seed: number, radius: number): InkSpatter {
  const random = createRandom(seed)
  return { blob: drawBlob(random, radius), droplets: scatterDroplets(random, radius) }
}

function drawBlob(random: () => number, radius: number) {
  const points = Array.from({ length: BLOB_POINTS }, (_, i) => {
    const angle = ((i + random() * 0.2) / BLOB_POINTS) * Math.PI * 2
    const distance = radius * (0.94 + random() * 0.08)
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
  })
  const at = (i: number) => points[(i + points.length) % points.length]
  // Catmull-Rom spline through the points, written as cubic Béziers.
  const curves = points.map((_, i) => {
    const [before, start, end, after] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const control1 = { x: start.x + (end.x - before.x) / 6, y: start.y + (end.y - before.y) / 6 }
    const control2 = { x: end.x - (after.x - start.x) / 6, y: end.y - (after.y - start.y) / 6 }
    return `C${formatPoint(control1)} ${formatPoint(control2)} ${formatPoint(end)}`
  })
  return `M${formatPoint(points[0])} ${curves.join(' ')} Z`
}

function formatPoint({ x, y }: { x: number; y: number }) {
  return `${round(x)},${round(y)}`
}

function scatterDroplets(random: () => number, radius: number): Droplet[] {
  const count = 2 + Math.floor(random() * 2)
  return Array.from({ length: count }, () => {
    const angle = random() * 360
    const distance = radius * (1.25 + random() * 0.2)
    const width = Math.max(0.8, radius * (0.04 + random() * 0.08))
    return {
      x: round(Math.cos(toRadians(angle)) * distance),
      y: round(Math.sin(toRadians(angle)) * distance),
      length: round(width * (1 + random() * 0.3)),
      width: round(width),
      angle: round(angle),
    }
  })
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function round(value: number) {
  return Math.round(value * 100) / 100
}
