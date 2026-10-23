import { useEffect, useRef, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  error?: string | null
}

// A text input that shows an error by turning red, shaking and taking focus.
// The shake is a CSS animation on the `error` class, so it replays each time
// the class comes back: clear `error` (null) before each new attempt.
export function ShakeInput({ error, className, title, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (error) inputRef.current?.focus()
  }, [error])

  return (
    <input
      ref={inputRef}
      className={[className, error && 'error'].filter(Boolean).join(' ')}
      title={error ?? title}
      aria-invalid={error ? true : undefined}
      {...inputProps}
    />
  )
}
