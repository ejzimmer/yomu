import { IconButton } from '../components/IconButton'
import { ArrowIcon } from '../icons'

interface Props {
  reviewed: number
  accuracy: number
  onExit: () => void
}

export function SessionSummary({ reviewed, accuracy, onExit }: Props) {
  return (
    <div className="review summary">
      <div className="level">{reviewed}</div>
      <div className="meta">{reviewed === 0 ? 'No reviews due' : `reviewed · ${accuracy}% correct`}</div>
      <IconButton className="submit" onClick={onExit} label="Done">
        <ArrowIcon />
      </IconButton>
    </div>
  )
}
