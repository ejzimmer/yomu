import { useRef, useState, type FormEvent } from 'react'
import { ApiError, WaniKaniClient } from '../api/client'
import type { User } from '../api/types'
import { ShakeInput, type ShakeInputHandle } from '../components/ShakeInput'
import { ArrowIcon } from '../icons'

interface Props {
  onSignedIn: (token: string, user: User) => void
}

export function TokenScreen({ onSignedIn }: Props) {
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const tokenInputRef = useRef<ShakeInputHandle>(null)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const value = token.trim()
    if (!value || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const user = await new WaniKaniClient(value).getUser()
      onSignedIn(value, user.data)
    } catch (e) {
      setError(e instanceof ApiError && e.status === 401 ? 'Invalid token' : 'Could not reach WaniKani')
      tokenInputRef.current?.shake()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="centre">
      <form className="row" onSubmit={submit}>
        <ShakeInput
          ref={tokenInputRef}
          id="token"
          aria-label="API token"
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
        <button className="submit" type="submit" disabled={isLoading || !token.trim()} title="Sign in" aria-label="Sign in">
          <ArrowIcon />
        </button>
      </form>
      <p role="alert" className="visually-hidden">{error}</p>
    </main>
  )
}
