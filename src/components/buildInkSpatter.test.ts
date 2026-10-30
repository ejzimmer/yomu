import { describe, expect, it } from 'vitest'
import { buildInkSpatter } from './buildInkSpatter'

describe('buildInkSpatter', () => {
  it('splashes the same shape for the same seed, so spatters keep their shape between renders', () => {
    expect(buildInkSpatter(42, 10)).toEqual(buildInkSpatter(42, 10))
    expect(buildInkSpatter(42, 10)).not.toEqual(buildInkSpatter(43, 10))
  })

  it('keeps droplets within twice the radius, so they fit inside the drawing', () => {
    for (let seed = 0; seed < 50; seed++) {
      for (const droplet of buildInkSpatter(seed, 10).droplets) {
        expect(Math.hypot(droplet.x, droplet.y) + droplet.length).toBeLessThanOrEqual(20)
      }
    }
  })
})
