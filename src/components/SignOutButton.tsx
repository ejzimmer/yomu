import './SignOutButton.css'
import { useEffect, useRef, useState } from 'react'
import { CloseIcon, SignOutIcon } from '../icons'
import { IconButton } from './IconButton'
import { useKeyboardShortcut } from './useKeyboardShortcut'

interface Props {
  onSignOut: () => void
}

export function SignOutButton({ onSignOut }: Props) {
  const [isConfirming, setIsConfirming] = useState(false)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useKeyboardShortcut('Escape', () => setIsConfirming(false), isConfirming)
  useEffect(() => {
    if (isConfirming) cancelButton.current?.focus()
  }, [isConfirming])

  if (!isConfirming) {
    return (
      <IconButton className="icon-btn" onClick={() => setIsConfirming(true)} label="Sign out" tooltipAlign="end">
        <SignOutIcon />
      </IconButton>
    )
  }

  return (
    <fieldset className="sign-out-confirm">
      <legend className="visually-hidden">Sign out?</legend>
      <IconButton ref={cancelButton} className="icon-btn" onClick={() => setIsConfirming(false)} label="Stay signed in">
        <CloseIcon />
      </IconButton>
      <IconButton className="icon-btn confirm" onClick={onSignOut} label="Sign out" tooltipAlign="end">
        <SignOutIcon />
      </IconButton>
    </fieldset>
  )
}
