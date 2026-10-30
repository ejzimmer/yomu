import './ShakeInput.css'
import { useId, useImperativeHandle, useRef, useState, type ComponentProps, type Ref } from 'react'

export interface ShakeInputHandle {
  focus: () => void
  setError: (message: string | null) => void
}

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  ref?: Ref<ShakeInputHandle>
}

export function ShakeInput({ className, ref, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const messageId = useId()

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setError: (message) => {
      setError(message)
      if (message) shake(inputRef.current)
    },
  }), [])

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

const SHAKE_KEYFRAMES = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(-8px)' },
  { transform: 'translateX(8px)' },
  { transform: 'translateX(0)' },
]

function shake(input: HTMLInputElement | null) {
  if (!input) return
  input.focus()
  input.animate(SHAKE_KEYFRAMES, { duration: 200 })
}
