import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { WaniKaniClient } from '../api/client'
import { db } from '../data/db'
import { useSync } from '../data/useSync'
import { DebugScreen } from './DebugScreen'
import { LessonScreen } from './LessonScreen'
import { ReviewScreen } from './ReviewScreen'
import { StudyMenu } from './StudyMenu'

interface Props {
  token: string
  onUnauthorized: () => void
}

// Everything behind sign-in. Mounted once per token, so it syncs on app open and after sign-in.
export function HomeScreen({ token, onUnauthorized }: Props) {
  // One client per token, so every request shares the same rate limiter.
  const client = useMemo(() => new WaniKaniClient(token), [token])
  const { isSyncing, syncError, syncNow } = useSync(client, onUnauthorized)
  const [activity, setActivity] = useState<'menu' | 'lessons' | 'reviews'>('menu')
  const user = useLiveQuery(() => db.user.get('me'))?.user

  function returnToMenu() {
    setActivity('menu')
    syncNow()
  }

  if (!user) return null
  if (activity === 'lessons') return <LessonScreen client={client} onExit={returnToMenu} />
  if (activity === 'reviews') return <ReviewScreen client={client} onExit={returnToMenu} />
  return (
    <>
      <StudyMenu onStartLessons={() => setActivity('lessons')} onStartReviews={() => setActivity('reviews')} />
      <DebugScreen user={user} isSyncing={isSyncing} syncError={syncError} onSync={syncNow} />
    </>
  )
}
