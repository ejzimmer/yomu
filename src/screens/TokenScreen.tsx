import './TokenScreen.css'
import { useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { WaniKaniClient } from '../api/client'
import { ApiError } from '../api/errors'
import type { User } from '../api/types'
import { IconButton } from '../components/IconButton'
import { ShakeInput } from '../components/ShakeInput'
import { ArrowIcon } from '../icons'

interface Props {
  onSignedIn: (token: string, user: User) => void
}

export function TokenScreen({ onSignedIn }: Props) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (isLoading) return
    flushSync(() => setError(null))
    const value = token.trim()
    if (!value) {
      setError('Enter your API token')
      return
    }
    setIsLoading(true)
    try {
      const user = await new WaniKaniClient(value).getUser()
      onSignedIn(value, user.data)
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'Invalid token' : 'Could not reach WaniKani')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="field" onSubmit={submit}>
      <label htmlFor="token">API token</label>
      <div className="row">
        <ShakeInput
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
