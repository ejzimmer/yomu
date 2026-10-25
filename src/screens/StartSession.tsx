import './StartSession.css'
import { IconButton } from '../components/IconButton'
import { useKeyboardShortcut } from '../components/useKeyboardShortcut'
import { ArrowIcon } from '../icons'

interface Props {
  count: number
  noun: 'reviews' | 'lessons'
  shortcutKey: string
  onStart: () => void
}

export function StartSession({ count, noun, shortcutKey, onStart }: Props) {
  useKeyboardShortcut(shortcutKey, onStart, count > 0)

  return (
    <div className="start-session">
      <span className="count">{count}</span>
      <span className="label">{noun}</span>
      {count > 0 && (
        <IconButton className="submit" onClick={onStart} label={`Start ${noun}`} aria-keyshortcuts={shortcutKey}>
          <ArrowIcon />
        </IconButton>
      )}
    </div>
  )
}
