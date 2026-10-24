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

export const CloseIcon = () => (
  <svg {...common}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>
)

export const UndoIcon = () => (
  <svg {...common}><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 0 1 0 10h-3" /></svg>
)

export const StageUpIcon = () => (
  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 21V4" /><path d="M3 12l9-9 9 9" /></svg>
)

export const BackIcon = () => (
  <svg {...common}><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></svg>
)

export const SpeakerIcon = () => (
  <svg {...common}><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></svg>
)
