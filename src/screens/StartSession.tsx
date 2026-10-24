import './StartSession.css'
import { IconButton } from '../components/IconButton'
import { ArrowIcon } from '../icons'

interface Props {
  count: number
  noun: 'reviews' | 'lessons'
  onStart: () => void
}

export function StartSession({ count, noun, onStart }: Props) {
  return (
    <div className="start-session">
      <span className="count">{count}</span>
      <span className="label">{noun}</span>
      {count > 0 && (
        <IconButton className="submit" onClick={onStart} label={`Start ${noun}`}>
          <ArrowIcon />
        </IconButton>
      )}
    </div>
  )
}
