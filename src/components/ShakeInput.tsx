import './ShakeInput.css'
import { useEffect, useId, useRef, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  error?: string | null
}

// A text input that shows an error message under itself, turns red, shakes
// and takes focus. Pass aria-invalid to turn it red without a message or shake.
// It shakes each time `error` changes to a message, so set it to null before
// each new attempt (with flushSync if the next error follows synchronously).
export function ShakeInput({ error, className, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const messageId = useId()

  useEffect(() => {
    const input = inputRef.current
    if (!error || !input) return
    input.focus()
    // Restart the CSS shake even if the class was only off for an instant
    input.style.animation = 'none'
    void input.offsetWidth
    input.style.animation = ''
  }, [error])

  return (
    <div className="shake-input">
      <input
        ref={inputRef}
        className={`${className ?? ''} ${error ? 'error' : ''}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        {...inputProps}
      />
      <p id={messageId} role="alert" className="message">{error}</p>
    </div>
  )
}
