import { useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import type { ReviewData } from '../review/loadReviewData'
import { getFeedEntry, type FeedEntry } from '../review/getFeedEntry'
import { queueReview, sendPendingReviews } from '../review/sendReviews'
import { answerCorrectly, answerWrongly, moveOn, createSession, undoWrongAnswer } from '../review/session'
import { AnswerForm } from './AnswerForm'
import { SessionStatus } from './SessionStatus'
import { SessionSummary } from './SessionSummary'
import { SrsFeed } from './SrsFeed'

interface Props {
  data: ReviewData
  client: WaniKaniClient
  onExit: () => void
}

export function ReviewSessionView({ data, client, onExit }: Props) {
  const [session, setSession] = useState(() => createSession(data.queue))
  const [feed, setFeed] = useState<FeedEntry[]>([])
  const total = data.queue.length
  const accuracy = session.totalAnswers ? Math.round((session.correctAnswers / session.totalAnswers) * 100) : 100
  const { question } = session

  if (!question) return <SessionSummary reviewed={session.completed.length} accuracy={accuracy} onExit={onExit} />

  const { subject, assignment } = question.item
  const characters = subject.data.characters ?? subject.data.slug

  function answer(isCorrect: boolean) {
    if (!isCorrect) {
      setSession(answerWrongly(session))
      return
    }
    const next = answerCorrectly(session)
    if (next.completed.length > session.completed.length) {
      const item = next.completed.at(-1)!
      void queueReview({
        assignmentId: item.assignment.id,
        incorrectMeaningAnswers: item.incorrectMeaningAnswers,
        incorrectReadingAnswers: item.incorrectReadingAnswers,
      }).then(() => sendPendingReviews(client))
      const entry = getFeedEntry(item, data.srsSystems)
      if (entry) setFeed((entries) => [entry, ...entries])
    }
    setSession(next)
  }

  return (
    <div className="review" data-type={assignment.data.subject_type}>
      <SessionStatus
        remaining={session.active.length + session.waiting.length}
        accuracy={accuracy}
        progress={session.completed.length / total}
        onExit={onExit}
      />

      <div className="layout">
        <div className="item" lang="ja">
          <span style={{ fontSize: `max(40px, min(150px, ${(86 / [...characters].length).toFixed(1)}cqw))` }}>
            {characters}
          </span>
        </div>
        <AnswerForm
          key={session.questionNumber}
          question={question}
          synonyms={data.synonymsBySubject.get(subject.id) ?? []}
          isShowingAnswer={session.isShowingAnswer}
          onAnswer={answer}
          onRedo={() => setSession(undoWrongAnswer(session))}
          onNext={() => setSession(moveOn(session))}
        />
        <SrsFeed entries={feed} onFaded={(id) => setFeed((entries) => entries.filter((entry) => entry.id !== id))} />
      </div>
    </div>
  )
}
