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

export const SyncIcon = () => (
  <svg {...common}><path d="M20 11a8 8 0 0 0-14.5-4.5L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16" /><path d="M20 20v-4h-4" /></svg>
)
