import './TokenScreen.css'
import { useRef, useState, type FormEvent } from 'react'
import { WaniKaniClient } from '../api/client'
import { ApiError } from '../api/errors'
import type { User } from '../api/types'
import { IconButton } from '../components/IconButton'
import { ShakeInput, type ShakeInputHandle } from '../components/ShakeInput'
import { ArrowIcon } from '../icons'

interface Props {
  onSignedIn: (token: string, user: User) => void
}

export function TokenScreen({ onSignedIn }: Props) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<ShakeInputHandle>(null)

  function showError(message: string) {
    setError(message)
    inputRef.current?.shake()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (isLoading) return

    const value = token.trim()
    if (!value) {
      showError('Enter your API token')
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const user = await new WaniKaniClient(value).getUser()
      onSignedIn(value, user.data)
    } catch (e) {
      showError(e instanceof ApiError && e.status === 401 ? 'Invalid token' : 'Could not reach WaniKani')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="field" onSubmit={submit}>
      <label htmlFor="token">API token</label>
      <div className="row">
        <ShakeInput
          ref={inputRef}
          id="token"
          error={error}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <IconButton className="submit" type="submit" isLoading={isLoading} label="Sign in">
          <ArrowIcon />
        </IconButton>
      </div>
    </form>
  )
}
