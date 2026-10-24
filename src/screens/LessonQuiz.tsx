import type { WaniKaniClient } from '../api/client'
import type { LessonData } from '../lessons/loadLessonData'
import { startAssignment } from '../lessons/startAssignment'
import { Quiz } from './Quiz'
import { SessionSummary } from './SessionSummary'

interface Props {
  data: LessonData
  client: WaniKaniClient
  onExit: () => void
}

export function LessonQuiz({ data, client, onExit }: Props) {
  return (
    <Quiz
      queue={data.batch}
      synonymsBySubject={data.synonymsBySubject}
      onItemComplete={(item) => void startAssignment(client, item.assignment.id)}
      renderSummary={(completed) => <SessionSummary count={completed} description="learned" onExit={onExit} />}
      onExit={onExit}
    />
  )
}
