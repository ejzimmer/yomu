import { useCallback, useEffect, useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import { ApiError } from '../api/errors'
import { sync } from './sync'

// Syncs once when mounted, and again whenever syncNow is called.
export function useSync(client: WaniKaniClient, onUnauthorized: () => void) {
  const [isSyncing, setIsSyncing] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)

  const runSync = useCallback(
    () =>
      sync(client)
        .then(() => setSyncError(null))
        .catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 401) onUnauthorized()
          else setSyncError('Sync failed. Showing what was already saved.')
        })
        .finally(() => setIsSyncing(false)),
    [client, onUnauthorized],
  )

  useEffect(() => {
    void runSync()
  }, [runSync])

  function syncNow() {
    setIsSyncing(true)
    void runSync()
  }

  return { isSyncing, syncError, syncNow }
}
