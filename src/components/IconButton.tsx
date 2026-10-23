import { useState, type ComponentProps } from 'react'
import { SpinnerIcon } from '../icons'

type Props = Omit<ComponentProps<'button'>, 'aria-label' | 'title'> & {
  label: string
  tooltipAlign?: 'center' | 'end'
  isLoading?: boolean
}

// An icon-only button whose label shows as a tooltip on hover and keyboard
// focus. Escape hides the tooltip until the pointer or focus leaves.
// While isLoading, the icon becomes a spinner and clicks are ignored.
export function IconButton({
  label,
  tooltipAlign = 'center',
  isLoading = false,
  children,
  onClick,
  onKeyDown,
  onBlur,
  ...buttonProps
}: Props) {
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false)

  return (
    <span
      className={`has-tooltip tooltip-${tooltipAlign}`}
      data-dismissed={isTooltipDismissed || undefined}
      onMouseLeave={() => setIsTooltipDismissed(false)}
    >
      <button
        aria-label={label}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading || undefined}
        onClick={(e) => {
          if (isLoading) {
            e.preventDefault()
            return
          }
          onClick?.(e)
        }}
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
        {isLoading ? <SpinnerIcon /> : children}
      </button>
      <span className="tooltip" aria-hidden="true">{label}</span>
    </span>
  )
}
