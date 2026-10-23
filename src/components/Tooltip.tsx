import { useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'

export interface TooltipTriggerProps {
  label: string
  onKeyDown: (event: KeyboardEvent) => void
  onBlur: (event: FocusEvent) => void
  onMouseLeave: () => void
}

interface Props {
  text: string
  align?: 'center' | 'end'
  children: (triggerProps: TooltipTriggerProps) => ReactNode
}

// Shows `text` under the trigger on hover and keyboard focus. Escape hides it
// until the pointer or focus leaves. The tooltip is hidden from screen readers,
// so the trigger should use the `label` it's given (e.g. as its aria-label).
export function Tooltip({ text, align = 'center', children }: Props) {
  const [isDismissed, setIsDismissed] = useState(false)

  return (
    <span className={`has-tooltip tooltip-${align}`} data-dismissed={isDismissed || undefined}>
      {children({
        label: text,
        onKeyDown: (e) => {
          if (e.key === 'Escape') setIsDismissed(true)
        },
        onBlur: () => setIsDismissed(false),
        onMouseLeave: () => setIsDismissed(false),
      })}
      <span className="tooltip" aria-hidden="true">{text}</span>
    </span>
  )
}
