import './Quiz.css'
import { useState, type ReactNode } from 'react'
import type { WaniKaniClient } from '../api/client'
import type { Subject } from '../api/types'
import { SubjectCharacters } from '../components/SubjectCharacters'
import type { StudyItem } from '../data/studyItem'
import { answerCorrectly, answerWrongly, askNextQuestion, createSession, undoWrongAnswer, type SessionItem } from '../quiz/session'
import { AnswerForm } from './AnswerForm'
import { SessionStatus } from './SessionStatus'
import { SessionSummary } from './SessionSummary'

interface Props {
  queue: readonly StudyItem[]
  client: WaniKaniClient
  aside?: ReactNode
  onItemComplete: (item: SessionItem) => void
  completedLabel: string
  onExit: () => void
}

export function Quiz({ queue, client, aside, onItemComplete, completedLabel, onExit }: Props) {
  const [session, setSession] = useState(() => createSession(queue))
  const accuracy = session.totalAnswers ? Math.round((session.correctAnswers / session.totalAnswers) * 100) : 100
  const { question } = session

  if (!question) {
    return (
      <SessionSummary count={session.completed.length} description={`${completedLabel} · ${accuracy}% correct`} onExit={onExit} />
    )
  }

  const { subject, assignment } = question.item

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
          <span style={{ fontSize: getCharactersFontSize(subject.data) }}>
            <SubjectCharacters subject={subject.data} />
          </span>
        </div>
        <AnswerForm
          key={session.questionNumber}
          question={question}
          client={client}
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

function getCharactersFontSize(subject: Subject) {
  const characterCount = subject.characters === null ? 1 : [...subject.characters].length
  const widthShare = (86 / characterCount).toFixed(1)
  return `max(40px, min(150px, ${widthShare}cqw))`
}
