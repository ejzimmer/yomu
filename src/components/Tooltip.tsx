import { useState, type ReactNode } from 'react'

interface Props {
  text: string
  align?: 'center' | 'end'
  children: ReactNode
}

// Shows `text` under its children on hover and keyboard focus. Escape hides it
// until the pointer or focus leaves. The tooltip is hidden from screen readers,
// so the wrapped element must expose the same text itself (e.g. aria-label).
export function Tooltip({ text, align = 'center', children }: Props) {
  const [isDismissed, setIsDismissed] = useState(false)

  return (
    <span
      className={`has-tooltip tooltip-${align}`}
      data-dismissed={isDismissed || undefined}
      onKeyDown={(e) => {
        if (e.key === 'Escape') setIsDismissed(true)
      }}
      onBlur={() => setIsDismissed(false)}
      onMouseLeave={() => setIsDismissed(false)}
    >
      {children}
      <span className="tooltip" aria-hidden="true">{text}</span>
    </span>
  )
}
