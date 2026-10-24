import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo } from 'react'
import { WaniKaniClient } from '../api/client'
import { db } from '../data/db'
import { useSync } from '../data/useSync'
import { DebugScreen } from './DebugScreen'

interface Props {
  token: string
  onUnauthorized: () => void
}

// Everything behind sign-in. Mounted once per token, so it syncs on app open and after sign-in.
export function HomeScreen({ token, onUnauthorized }: Props) {
  // One client per token, so every request shares the same rate limiter.
  const client = useMemo(() => new WaniKaniClient(token), [token])
  const { isSyncing, syncError, syncNow } = useSync(client, onUnauthorized)
  const user = useLiveQuery(() => db.user.get('me'))?.user

  if (!user) return null
  return <DebugScreen user={user} isSyncing={isSyncing} syncError={syncError} onSync={syncNow} />
}
