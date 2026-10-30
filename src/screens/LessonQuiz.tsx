import type { WaniKaniClient } from '../api/client'
import type { LessonData } from '../lessons/loadLessonData'
import { queueLessonStart, sendPendingLessonStarts } from '../lessons/sendLessonStarts'
import { Quiz } from './Quiz'

interface Props {
  data: LessonData
  client: WaniKaniClient
  onExit: () => void
}

export function LessonQuiz({ data, client, onExit }: Props) {
  return (
    <Quiz
      queue={data.batch}
      client={client}
      onItemComplete={(item) => void queueLessonStart(item.assignment.id).then(() => sendPendingLessonStarts(client))}
      completedLabel="learned"
      onExit={onExit}
    />
  )
}
