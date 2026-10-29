import './BrushStroke.css'
import { useId } from 'react'

export function BrushStroke() {
  const filterId = `roughen-${useId().replaceAll(/[^\w-]/gu, '')}`

  return (
    <span className="brush-stroke" aria-hidden="true">
      <svg className="body" viewBox="0 0 1000 40" preserveAspectRatio="none">
        <path fill="currentColor" d="M0,11 C250,11 520,13 760,17 C880,19 960,21 1000,22 C960,23 880,25 760,27 C520,30 250,31 0,31 Z" />
      </svg>
      <svg className="head" viewBox="0 0 60 40">
        <defs>
          <filter id={filterId} x="-5%" y="-20%" width="110%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves={2} seed={4} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={1.6} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path
          filter={`url(#${filterId})`}
          fill="currentColor"
          d="M60,21 C46,28 32,37 17,36 C6,35 1,27 3,18 C5,9 13,3 25,4 C37,5 46,14 60,21 Z"
        />
      </svg>
    </span>
  )
}
