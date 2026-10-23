import type { ComponentProps } from 'react'
import { SpinnerIcon } from '../icons'
import { Tooltip } from './Tooltip'

type Props = Omit<ComponentProps<'button'>, 'aria-label' | 'title'> & {
  label: string
  tooltipAlign?: 'center' | 'end'
  isLoading?: boolean
}

// An icon-only button whose label shows as a tooltip.
// While isLoading, the icon becomes a spinner and clicks are ignored.
export function IconButton({ label, tooltipAlign, isLoading = false, children, onClick, ...buttonProps }: Props) {
  return (
    <Tooltip text={label} align={tooltipAlign}>
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
        {...buttonProps}
      >
        {isLoading ? <SpinnerIcon /> : children}
      </button>
    </Tooltip>
  )
}
