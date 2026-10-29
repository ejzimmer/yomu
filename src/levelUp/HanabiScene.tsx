import './HanabiScene.css'
import { TREE_HEIGHT, TREE_WIDTH } from './buildSakuraTree'
import { FallingPetals } from './FallingPetals'
import { Fireworks } from './Fireworks'
import { SakuraTree } from './SakuraTree'
import { Stars } from './Stars'

interface Props {
  level: number
}

export function HanabiScene({ level }: Props) {
  return (
    <svg className="hanabi-scene" viewBox={`0 0 ${TREE_WIDTH} ${TREE_HEIGHT}`} aria-hidden="true">
      <Stars />
      <Fireworks />
      <ellipse className="hill" cx={TREE_WIDTH / 2} cy={TREE_HEIGHT + 40} rx={TREE_WIDTH * 0.7} ry="80" />
      <SakuraTree level={level} />
      <FallingPetals />
    </svg>
  )
}
