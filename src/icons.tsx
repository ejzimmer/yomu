const common = {
  width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
} as const

export const ArrowIcon = () => (
  <svg {...common}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
)

export const SignOutIcon = () => (
  <svg {...common}><path d="M15 4h4v16h-4" /><path d="M10 17l-5-5 5-5" /><path d="M5 12h11" /></svg>
)

export const SpinnerIcon = () => (
  <svg {...common} className="spinner"><path d="M12 3a9 9 0 1 1-9 9" /></svg>
)
