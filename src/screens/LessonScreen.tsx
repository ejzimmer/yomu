import { useEffect, useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import { LoadingKanji } from '../components/LoadingKanji'
import { loadLessonData, type LessonData } from '../lessons/loadLessonData'
import { LessonPages } from './LessonPages'
import { LessonQuiz } from './LessonQuiz'
import { SessionSummary } from './SessionSummary'

interface Props {
  client: WaniKaniClient
  onExit: () => void
}

export function LessonScreen({ client, onExit }: Props) {
  const [data, setData] = useState<LessonData | null>(null)
  const [isQuizzing, setIsQuizzing] = useState(false)

  useEffect(() => {
    void loadLessonData().then(setData)
  }, [])

  if (!data) return <LoadingKanji />
  if (data.batch.length === 0) return <SessionSummary count={0} description="No lessons available" onExit={onExit} />
  if (isQuizzing) return <LessonQuiz data={data} client={client} onExit={onExit} />
  return <LessonPages data={data} onStartQuiz={() => setIsQuizzing(true)} onExit={onExit} />
}
