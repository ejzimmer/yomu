import { useState, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'button'>, 'aria-label' | 'title'> & {
  label: string
  tooltipAlign?: 'center' | 'end'
}

// An icon-only button whose label shows as a tooltip on hover and keyboard
// focus. Escape hides the tooltip until the pointer or focus leaves.
export function IconButton({ label, tooltipAlign = 'center', children, onKeyDown, onBlur, ...buttonProps }: Props) {
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false)

  return (
    <span
      className={`has-tooltip tooltip-${tooltipAlign}`}
      data-dismissed={isTooltipDismissed || undefined}
      onMouseLeave={() => setIsTooltipDismissed(false)}
    >
      <button
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsTooltipDismissed(true)
          onKeyDown?.(e)
        }}
        onBlur={(e) => {
          setIsTooltipDismissed(false)
          onBlur?.(e)
        }}
        {...buttonProps}
      >
        {children}
      </button>
      <span className="tooltip" aria-hidden="true">{label}</span>
    </span>
  )
}
