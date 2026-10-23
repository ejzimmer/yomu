import { useEffect, useRef } from 'react'

// 永 ("eternity"), the classic brush-practice character: its five strokes
// cover the basic stroke types. Drawn in stroke order.
const STROKES = [
  'M45 9 L55 19',
  'M33 31 H57 V86 Q57 91 51 88 L45 84',
  'M17 48 H40 L13 80',
  'M83 34 Q74 46 58 56',
  'M58 56 Q72 76 90 86',
]
const CYCLE_MS = 2400
const DRAWING_SHARE = 0.75 // the rest of each cycle holds, then fades

// A loading indicator that writes 永 stroke by stroke, then starts again.
export function LoadingKanji() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll('path') ?? []
    const strokeShare = DRAWING_SHARE / paths.length
    const animations = [...paths].map((path, i) =>
      path.animate(
        [
          { offset: 0, strokeDashoffset: 1, opacity: 1 },
          { offset: i * strokeShare, strokeDashoffset: 1 },
          { offset: (i + 1) * strokeShare, strokeDashoffset: 0 },
          { offset: 0.9, strokeDashoffset: 0, opacity: 1 },
          { offset: 1, strokeDashoffset: 0, opacity: 0 },
        ],
        { duration: CYCLE_MS, iterations: Infinity },
      ),
    )
    return () => animations.forEach((animation) => animation.cancel())
  }, [])

  return (
    <svg
      ref={svgRef}
      width={26}
      height={26}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {STROKES.map((d) => (
        <path key={d} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1} />
      ))}
    </svg>
  )
}
