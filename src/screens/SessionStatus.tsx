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
        <span className="counts">
          <span aria-label="Remaining">{remaining}</span>
          <span aria-label="Correct">{accuracy}%</span>
        </span>
        <IconButton className="icon-btn" onClick={onExit} label="End session" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${progress * 100}%` }} />
      </div>
    </>
  )
}
