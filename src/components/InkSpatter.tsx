import { buildInkSpatter } from './buildInkSpatter'

interface Props {
  seed: number
  radius: number
}

export function InkSpatter({ seed, radius }: Props) {
  const { blob, droplets } = buildInkSpatter(seed, radius)
  const reach = radius * 2

  return (
    <svg
      aria-hidden="true"
      width={reach * 2}
      height={reach * 2}
      viewBox={`${-reach} ${-reach} ${reach * 2} ${reach * 2}`}
      fill="currentColor"
    >
      <path d={blob} />
      {droplets.map((droplet) => (
        <ellipse
          key={`${droplet.x},${droplet.y}`}
          rx={droplet.length}
          ry={droplet.width}
          transform={`translate(${droplet.x} ${droplet.y}) rotate(${droplet.angle})`}
        />
      ))}
    </svg>
  )
}
