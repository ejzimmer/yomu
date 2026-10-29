import './LevelUpScreen.css'
import { IconButton } from '../components/IconButton'
import { useKeyboardShortcut } from '../components/useKeyboardShortcut'
import { ArrowIcon } from '../icons'
import { LAST_LEVEL } from '../levelUp/countBlossoms'
import { HanabiScene } from '../levelUp/HanabiScene'

interface Props {
  level: number
  onDismiss: () => void
}

export function LevelUpScreen({ level, onDismiss }: Props) {
  useKeyboardShortcut('Enter', onDismiss)

  return (
    <div className="level-up">
      <div className="scene">
        <HanabiScene level={level} />
        <p className="congratulations" lang="ja">
          おめでとう
        </p>
      </div>
      <div className="details">
        <div className="level">
          <span className="label">Level</span>
          <span className="number">{level}</span>
        </div>
        <p className="progress">
          {Math.round((level / LAST_LEVEL) * 100)}% of the way to level {LAST_LEVEL}
        </p>
        <IconButton className="submit" onClick={onDismiss} label="Done" aria-keyshortcuts="Enter">
          <ArrowIcon />
        </IconButton>
      </div>
    </div>
  )
}
