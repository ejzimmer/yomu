import { WritingStrokes } from './WritingStrokes'

// 永 ("eternity"), the classic brush-practice character: its five strokes
// cover the basic stroke types. Drawn in stroke order.
const STROKES = [
  'M45 9 L55 19',
  'M33 31 H57 V86 Q57 91 51 88 L45 84',
  'M17 48 H40 L13 80',
  'M83 34 Q74 46 58 56',
  'M58 56 Q72 76 90 86',
]

export function LoadingKanji() {
  return <WritingStrokes characters={[STROKES]} characterSize={100} height={26} strokeWidth={8} cycleMs={2400} />
}
