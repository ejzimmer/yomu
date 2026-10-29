import './App.css'
import { useCallback, useLayoutEffect, useState } from 'react'
import type { User } from './api/types'
import { IconButton } from './components/IconButton'
import { clearDatabase, db } from './data/db'
import { applyFontStyle, getFontStyle, saveFontStyle } from './fontStyle'
import { SignOutIcon } from './icons'
import { HomeScreen } from './screens/HomeScreen'
import { TokenScreen } from './screens/TokenScreen'
import { clearToken, getToken, saveToken } from './token'

export default function App() {
  const [token, setToken] = useState(getToken)
  const [fontStyle, setFontStyle] = useState(getFontStyle)
  const otherFontStyle = fontStyle === 'fancy' ? 'plain' : 'fancy'

  useLayoutEffect(() => applyFontStyle(fontStyle), [fontStyle])

  function switchFontStyle() {
    saveFontStyle(otherFontStyle)
    setFontStyle(otherFontStyle)
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
          <IconButton
            className={`icon-btn font-style ${otherFontStyle}`}
            onClick={switchFontStyle}
            label={otherFontStyle === 'plain' ? 'Plain font' : 'Fancy font'}
            tooltipAlign="end"
          >
            字
          </IconButton>
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
