import { BrushStroke } from '../components/BrushStroke'
import { IconButton } from '../components/IconButton'
import { CloseIcon } from '../icons'

interface Props {
  remaining: number
  accuracy: number
  progress: number
  onExit: () => void
}

export function SessionStatus({ remaining, accuracy, progress, onExit }: Props) {
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
        <IconButton className="icon-btn" onClick={onExit} label="End session" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="progress">
        <BrushStroke />
        <div className="progress-fill" style={{ width: `${progress * 100}%` }}>
          <BrushStroke />
        </div>
      </div>
    </>
  )
}
