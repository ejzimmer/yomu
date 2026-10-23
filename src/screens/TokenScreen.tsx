import { useState, type FormEvent } from 'react'
import { ApiError, WaniKaniClient } from '../api/client'
import type { User } from '../api/types'
import { ArrowIcon } from '../icons'

interface Props {
  onSignedIn: (token: string, user: User) => void
}

export function TokenScreen({ onSignedIn }: Props) {
  const [token, setToken] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState(0)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = token.trim()
    if (!value || busy) return
    setBusy(true)
    setError(null)
    try {
      const user = await new WaniKaniClient(value).getUser()
      onSignedIn(value, user.data)
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'Invalid token' : 'Could not reach WaniKani')
      setShakeKey((k) => k + 1)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="centre">
      <form className={'row' + (shakeKey ? ' shake' : '')} key={shakeKey} onSubmit={submit}>
        <label htmlFor="token" className="visually-hidden">API token</label>
        <input
          id="token"
          className={'answer' + (error ? ' error' : '')}
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="API token"
          title={error ?? 'WaniKani API token (needs assignments:start and reviews:create)'}
          aria-invalid={error ? true : undefined}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
        />
        <button className="submit" type="submit" disabled={busy || !token.trim()} title="Sign in" aria-label="Sign in">
          <ArrowIcon />
        </button>
      </form>
      <p role="alert" className="visually-hidden">{error}</p>
    </main>
  )
}
