import { StageUpIcon } from '../icons'
import type { FeedEntry } from '../review/recordCompletedItem'

interface Props {
  entries: FeedEntry[]
  onFaded: (id: number) => void
}

// Each finished item's new SRS stage, newest first. Lines fade out on their own.
export function SrsFeed({ entries, onFaded }: Props) {
  return (
    <ul className="feed" aria-label="Recent SRS changes" aria-live="polite">
      {entries.map((entry) => (
        <li key={entry.id} onAnimationEnd={() => onFaded(entry.id)}>
          <span className="characters" lang="ja">
            {entry.characters}
          </span>
          <span className={entry.isUp ? 'up' : 'down'} aria-label={entry.isUp ? 'up to' : 'down to'}>
            <StageUpIcon />
          </span>
          {entry.stageName}
        </li>
      ))}
    </ul>
  )
}
