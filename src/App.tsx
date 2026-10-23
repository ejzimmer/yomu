import { useEffect, useState } from 'react'
import { WaniKaniClient, ApiError } from './api/client'
import type { User } from './api/types'
import { SignOutIcon } from './icons'
import { TokenScreen } from './screens/TokenScreen'
import { clearToken, loadToken, saveToken } from './token'

export default function App() {
  const [token, setToken] = useState(loadToken)
  const [user, setUser] = useState<User | null>(null)

  // Refresh the user on start when a token is already stored.
  useEffect(() => {
    if (!token || user) return
    new WaniKaniClient(token)
      .getUser()
      .then((res) => setUser(res.data))
      .catch((e) => {
        if (e instanceof ApiError && e.status === 401) signOut()
      })
  }, [token, user])

  function signIn(newToken: string, newUser: User) {
    saveToken(newToken)
    setToken(newToken)
    setUser(newUser)
  }

  function signOut() {
    clearToken()
    setToken(null)
    setUser(null)
  }

  return (
    <>
      <header className="bar">
        <div className="name" title="読む, unofficial WaniKani client">読む</div>
        {token && (
          <button className="icon-btn" onClick={signOut} title="Sign out" aria-label="Sign out">
            <SignOutIcon />
          </button>
        )}
      </header>
      {!token ? (
        <TokenScreen onSignedIn={signIn} />
      ) : user ? (
        <main className="centre">
          <div className="level" title="Level">{user.level}</div>
          <div className="meta" title="Subscription">
            {user.subscription.active ? user.subscription.type : 'free'} · max {user.subscription.max_level_granted}
          </div>
        </main>
      ) : null}
    </>
  )
}
