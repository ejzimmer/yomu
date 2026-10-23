import { useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { ApiError, WaniKaniClient } from '../api/client'
import type { User } from '../api/types'
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
    <>
      <form className="row" onSubmit={submit}>
        <ShakeInput
          id="token"
          aria-label="API token"
          error={error}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="API token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
        />
        <button className="submit" type="submit" disabled={isLoading} title="Sign in" aria-label="Sign in">
          <ArrowIcon />
        </button>
      </form>
      <p role="alert" className="message">{error}</p>
    </>
  )
}
