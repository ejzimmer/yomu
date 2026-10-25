import './LevelUpScreen.css'
import { BrushStroke } from '../components/BrushStroke'
import { IconButton } from '../components/IconButton'
import { ArrowIcon } from '../icons'

interface Props {
  level: number
  onDismiss: () => void
}

export function LevelUpScreen({ level, onDismiss }: Props) {
  return (
    <div className="level-up">
      <p className="congratulations" lang="ja">
        おめでとう
      </p>
      <div className="level">
        <span className="label">Level</span>
        <span className="number">{level}</span>
      </div>
      <div className="stroke">
        <BrushStroke />
      </div>
      <IconButton className="submit" onClick={onDismiss} label="Done">
        <ArrowIcon />
      </IconButton>
    </div>
  )
}
