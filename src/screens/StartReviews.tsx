import './StartReviews.css'
import { IconButton } from '../components/IconButton'
import { ArrowIcon } from '../icons'

interface Props {
  count: number
  onStart: () => void
}

export function StartReviews({ count, onStart }: Props) {
  return (
    <div className="start-reviews">
      <span className="count">{count}</span>
      <span className="label">reviews</span>
      {count > 0 && (
        <IconButton className="submit" onClick={onStart} label="Start reviews">
          <ArrowIcon />
        </IconButton>
      )}
    </div>
  )
}
