import { useImperativeHandle, useRef, type ComponentProps, type Ref } from 'react'

export interface ShakeInputHandle {
  shake: () => void
  focus: () => void
}

type Props = Omit<ComponentProps<'input'>, 'ref'> & {
  ref?: Ref<ShakeInputHandle>
}

// A text input that can shake itself, used to reject an answer without a message.
export function ShakeInput({ ref, ...inputProps }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(ref, () => ({
    shake() {
      inputRef.current?.animate(
        [0, -8, 8, -8, 8, 0].map((x) => ({ transform: `translateX(${x}px)` })),
        { duration: 350 },
      )
    },
    focus() {
      inputRef.current?.focus()
    },
  }))

  return <input ref={inputRef} {...inputProps} />
}
