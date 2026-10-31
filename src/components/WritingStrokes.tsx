import { useEffect, useRef } from 'react'

const DRAWING_SHARE = 0.75
// Round line caps draw a dot for a zero-length dash, so an unwritten stroke's dash is pushed just
// past the path's start, with a gap long enough that the next dash never reaches its end.
const DASH_PATTERN = '1 2'
const UNWRITTEN_OFFSET = 1.01

interface Props {
  characters: readonly (readonly string[])[]
  characterSize: number
  height: number
  strokeWidth: number
  cycleMs: number
}

export function WritingStrokes({ characters, characterSize, height, strokeWidth, cycleMs }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll('path') ?? []
    const strokeShare = DRAWING_SHARE / paths.length
    const animations = [...paths].map((path, i) =>
      path.animate(
        [
          { offset: 0, strokeDashoffset: UNWRITTEN_OFFSET, opacity: 1 },
          { offset: i * strokeShare, strokeDashoffset: UNWRITTEN_OFFSET },
          { offset: (i + 1) * strokeShare, strokeDashoffset: 0 },
          { offset: 0.9, strokeDashoffset: 0, opacity: 1 },
          { offset: 1, strokeDashoffset: 0, opacity: 0 },
        ],
        { duration: cycleMs, iterations: Infinity },
      ),
    )
    return () => animations.forEach((animation) => animation.cancel())
  }, [cycleMs])

  return (
    <svg
      ref={svgRef}
      width={height * characters.length}
      height={height}
      viewBox={`0 0 ${characterSize * characters.length} ${characterSize}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {characters.map((strokes, i) => (
        <g key={strokes[0]} transform={`translate(${i * characterSize} 0)`}>
          {strokes.map((d) => (
            <path key={d} d={d} pathLength={1} strokeDasharray={DASH_PATTERN} strokeDashoffset={UNWRITTEN_OFFSET} />
          ))}
        </g>
      ))}
    </svg>
  )
}
