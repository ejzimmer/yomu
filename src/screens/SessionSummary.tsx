import { IconButton } from '../components/IconButton'
import { ArrowIcon } from '../icons'

interface Props {
  count: number
  description: string
  onExit: () => void
}

export function SessionSummary({ count, description, onExit }: Props) {
  return (
    <div className="quiz summary">
      <div className="count">{count}</div>
      <div className="meta">{description}</div>
      <IconButton className="submit" onClick={onExit} label="Done">
        <ArrowIcon />
      </IconButton>
    </div>
  )
}
