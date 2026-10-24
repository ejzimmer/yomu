import './Quiz.css'
import { useState, type ReactNode } from 'react'
import { getCharacters } from '../data/getCharacters'
import type { StudyItem } from '../data/studyItem'
import { answerCorrectly, answerWrongly, askNextQuestion, createSession, undoWrongAnswer, type SessionItem } from '../quiz/session'
import { AnswerForm } from './AnswerForm'
import { SessionStatus } from './SessionStatus'
import { SessionSummary } from './SessionSummary'

interface Props {
  queue: readonly StudyItem[]
  synonymsBySubject: ReadonlyMap<number, string[]>
  aside?: ReactNode
  onItemComplete: (item: SessionItem) => void
  completedLabel: string
  onExit: () => void
}

export function Quiz({ queue, synonymsBySubject, aside, onItemComplete, completedLabel, onExit }: Props) {
  const [session, setSession] = useState(() => createSession(queue))
  const accuracy = session.totalAnswers ? Math.round((session.correctAnswers / session.totalAnswers) * 100) : 100
  const { question } = session

  if (!question) {
    return (
      <SessionSummary count={session.completed.length} description={`${completedLabel} · ${accuracy}% correct`} onExit={onExit} />
    )
  }

  const { subject, assignment } = question.item
  const characters = getCharacters(subject.data)

  function answer(isCorrect: boolean) {
    if (!isCorrect) {
      setSession(answerWrongly(session))
      return
    }

    const answered = answerCorrectly(session)
    if (answered.completed.length > session.completed.length) onItemComplete(answered.completed.at(-1)!)
    setSession(askNextQuestion(answered))
  }

  return (
    <div className="quiz" data-type={assignment.data.subject_type}>
      <SessionStatus
        remaining={session.active.length + session.waiting.length}
        accuracy={accuracy}
        progress={session.completed.length / queue.length}
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
          synonyms={synonymsBySubject.get(subject.id) ?? []}
          isShowingAnswer={session.isShowingAnswer}
          onAnswer={answer}
          onRedo={() => setSession(undoWrongAnswer(session))}
          onNext={() => setSession(askNextQuestion(session))}
        />
        {aside}
      </div>
    </div>
  )
}
