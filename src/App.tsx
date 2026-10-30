import './App.css'
import { useCallback, useLayoutEffect, useState } from 'react'
import type { User } from './api/types'
import { FontStyleSwitch } from './components/FontStyleSwitch'
import { IconButton } from './components/IconButton'
import { clearDatabase, db } from './data/db'
import { applyFontStyle, type FontStyle, getFontStyle, saveFontStyle } from './fontStyle'
import { SignOutIcon } from './icons'
import { HomeScreen } from './screens/HomeScreen'
import { TokenScreen } from './screens/TokenScreen'
import { clearToken, getToken, saveToken } from './token'

export default function App() {
  const [token, setToken] = useState(getToken)
  const [fontStyle, setFontStyle] = useState(getFontStyle)

  useLayoutEffect(() => applyFontStyle(fontStyle), [fontStyle])

  function changeFontStyle(newFontStyle: FontStyle) {
    saveFontStyle(newFontStyle)
    setFontStyle(newFontStyle)
  }

  const signOut = useCallback(() => {
    clearToken()
    setToken(null)
    void clearDatabase()
  }, [])

  async function signIn(newToken: string, newUser: User) {
    saveToken(newToken)
    await db.user.put({ id: 'me', user: newUser, syncedAt: Temporal.Now.instant().toString() })
    setToken(newToken)
  }

  return (
    <>
      <header className="bar">
        <div className="name">読む</div>
        <div className="actions">
          <FontStyleSwitch fontStyle={fontStyle} onChange={changeFontStyle} />
          {token && (
            <IconButton className="icon-btn" onClick={signOut} label="Sign out" tooltipAlign="end">
              <SignOutIcon />
            </IconButton>
          )}
        </div>
      </header>
      <main className="centre">
        {token === null ? (
          <TokenScreen onSignedIn={signIn} />
        ) : (
          <HomeScreen key={token} token={token} onUnauthorized={signOut} />
        )}
      </main>
    </>
  )
}
