import './ShakeInput.css'
import { useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, type ComponentProps } from 'react'

type Props = ComponentProps<'input'> & {
  error?: string | null
}

export function ShakeInput({ error, className, ref, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => inputRef.current!, [])
  const messageId = useId()
  const latestError = useRef(error)

  useLayoutEffect(() => {
    latestError.current = error
  }, [error])

  useEffect(() => {
    if (error) shake(inputRef.current)
  }, [error])

  useEffect(() => {
    const form = inputRef.current?.form
    if (!form) return

    function shakeIfErrorRepeated() {
      const errorAtSubmit = latestError.current
      requestAnimationFrame(() => {
        if (errorAtSubmit && latestError.current === errorAtSubmit) shake(inputRef.current)
      })
    }

    form.addEventListener('submit', shakeIfErrorRepeated)
    return () => form.removeEventListener('submit', shakeIfErrorRepeated)
  }, [])

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

function shake(input: HTMLInputElement | null) {
  if (!input) return
  input.focus()
  // Reading offsetWidth forces a reflow, so clearing and restoring the animation restarts it
  input.style.animation = 'none'
  void input.offsetWidth
  input.style.animation = ''
}
