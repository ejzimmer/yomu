import { useState } from 'react'
import type { WaniKaniClient } from '../api/client'
import { IconButton } from '../components/IconButton'
import { CloseIcon } from '../icons'
import type { ReviewData } from '../review/loadReviewData'
import { recordCompletedItem, type FeedEntry } from '../review/recordCompletedItem'
import { answerCorrectly, answerWrongly, moveOn, startSession, undoWrongAnswer } from '../review/session'
import { AnswerForm } from './AnswerForm'
import { SessionSummary } from './SessionSummary'
import { SrsFeed } from './SrsFeed'

interface Props {
  data: ReviewData
  client: WaniKaniClient
  onExit: () => void
}

export function ReviewSessionView({ data, client, onExit }: Props) {
  const [session, setSession] = useState(() => startSession(data.queue))
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
      const entry = recordCompletedItem(client, next.completed.at(-1)!, data.srsSystems)
      if (entry) setFeed((entries) => [entry, ...entries])
    }
    setSession(next)
  }

  return (
    <div className="review" data-type={assignment.data.subject_type}>
      <div className="status">
        <span className="counts">
          <span aria-label="Remaining">{session.active.length + session.waiting.length}</span>
          <span aria-label="Correct">{accuracy}%</span>
        </span>
        <IconButton className="icon-btn" onClick={onExit} label="End session" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>
      <div className="progress" aria-hidden="true">
        <div style={{ width: `${(session.completed.length / total) * 100}%` }} />
      </div>

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
