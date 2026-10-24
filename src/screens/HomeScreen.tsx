import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { WaniKaniClient } from '../api/client'
import { db } from '../data/db'
import { useSync } from '../data/useSync'
import { countDueReviews } from '../review/loadReviewData'
import { DebugScreen } from './DebugScreen'
import { ReviewScreen } from './ReviewScreen'
import { StartReviews } from './StartReviews'

interface Props {
  token: string
  onUnauthorized: () => void
}

// Everything behind sign-in. Mounted once per token, so it syncs on app open and after sign-in.
export function HomeScreen({ token, onUnauthorized }: Props) {
  // One client per token, so every request shares the same rate limiter.
  const client = useMemo(() => new WaniKaniClient(token), [token])
  const { isSyncing, syncError, syncNow } = useSync(client, onUnauthorized)
  const [isReviewing, setIsReviewing] = useState(false)
  const user = useLiveQuery(() => db.user.get('me'))?.user
  const dueReviews = useLiveQuery(countDueReviews)

  function finishReviews() {
    setIsReviewing(false)
    syncNow()
  }

  if (!user) return null
  if (isReviewing) return <ReviewScreen client={client} onExit={finishReviews} />
  return (
    <>
      <StartReviews count={dueReviews ?? 0} onStart={() => setIsReviewing(true)} />
      <DebugScreen user={user} isSyncing={isSyncing} syncError={syncError} onSync={syncNow} />
    </>
  )
}
