import { useEffect, useRef, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  error?: string | null
}

// A text input that shows an error by turning red, shaking and taking focus.
// It shakes each time `error` changes to a message, so set it to null before
// each new attempt (with flushSync if the next error follows synchronously).
export function ShakeInput({ error, className, title, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

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
    <input
      ref={inputRef}
      className={`${className ?? ''} ${error ? 'error' : ''}`}
      title={error ?? title}
      aria-invalid={error ? true : undefined}
      {...inputProps}
    />
  )
}
