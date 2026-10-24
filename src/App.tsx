import './App.css'
import { useEffect, useState } from 'react'
import { WaniKaniClient } from './api/client'
import { ApiError } from './api/errors'
import type { User } from './api/types'
import { IconButton } from './components/IconButton'
import { SignOutIcon } from './icons'
import { TokenScreen } from './screens/TokenScreen'
import { clearToken, getToken, saveToken } from './token'

export default function App() {
  const [token, setToken] = useState(getToken)
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
        <div className="name">読む</div>
        {token && (
          <IconButton className="icon-btn" onClick={signOut} label="Sign out" tooltipAlign="end">
            <SignOutIcon />
          </IconButton>
        )}
      </header>
      <main className="centre">
        {token === null ? (
          <TokenScreen onSignedIn={signIn} />
        ) : user ? (
          <>
            <div className="level">{user.level}</div>
            <div className="meta">
              {user.subscription.active ? user.subscription.type : 'free'} · max {user.subscription.max_level_granted}
            </div>
          </>
        ) : null}
      </main>
    </>
  )
}
