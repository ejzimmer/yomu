import './ShakeInput.css'
import { useId, useImperativeHandle, useRef, type ComponentProps, type Ref } from 'react'

export interface ShakeInputHandle {
  focus: () => void
  shake: () => void
}

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  ref?: Ref<ShakeInputHandle>
  error?: string | null
}

export function ShakeInput({ error, className, ref, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const messageId = useId()

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    shake: () => {
      const input = inputRef.current
      if (!input) return
      input.focus()
      // Reading offsetWidth forces a reflow, so clearing and restoring the animation restarts it
      input.style.animation = 'none'
      void input.offsetWidth
      input.style.animation = ''
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
