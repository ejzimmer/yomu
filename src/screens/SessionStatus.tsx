import { BrushStroke } from '../components/BrushStroke'
import { IconButton } from '../components/IconButton'
import { ArrowIcon, CloseIcon } from '../icons'

interface Props {
  remaining: number
  accuracy: number
  progress: number
  wrapUp?: { isWrappingUp: boolean; onToggle: () => void }
  onExit: () => void
}

export function SessionStatus({ remaining, accuracy, progress, wrapUp, onExit }: Props) {
  return (
    <>
      <div className="status">
        <span>
          <span className="visually-hidden">Remaining </span>
          {remaining}
        </span>
        <span>
          <span className="visually-hidden">Correct </span>
          {accuracy}%
        </span>
        {wrapUp && (
          <IconButton className="icon-btn wrap-up" onClick={wrapUp.onToggle} label="Wrap up" aria-pressed={wrapUp.isWrappingUp}>
            <ArrowIcon />
            <span lang="ja">終わり</span>
          </IconButton>
        )}
        <IconButton className="icon-btn" onClick={onExit} label="End session" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="progress">
        <BrushStroke />
        {progress > 0 && (
          <div className="progress-fill" style={{ width: `${progress * 100}%` }}>
            <BrushStroke />
          </div>
        )}
      </div>
    </>
  )
}
