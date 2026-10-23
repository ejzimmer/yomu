import { useEffect, useRef, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  error?: string | null
}

// A text input that shows an error by turning red, shaking and taking focus.
// It shakes each time `error` changes to a new message, so clear it (null)
// before each new attempt.
export function ShakeInput({ error, className, title, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    if (!error || !input) return
    input.focus()
    input.animate(
      [0, -8, 8, -8, 8, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 350 },
    )
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
