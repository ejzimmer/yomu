import './LessonPages.css'
import { useState } from 'react'
import { IconButton } from '../components/IconButton'
import { ArrowIcon, BackIcon, CloseIcon } from '../icons'
import type { LessonData } from '../lessons/loadLessonData'
import { LessonPage } from './LessonPage'

interface Props {
  data: LessonData
  onStartQuiz: () => void
  onExit: () => void
}

export function LessonPages({ data, onStartQuiz, onExit }: Props) {
  const [index, setIndex] = useState(0)
  const item = data.batch[index]
  const isLast = index === data.batch.length - 1

  return (
    <div className="lesson" data-type={item.assignment.data.subject_type}>
      <div className="lesson-bar">
        <ol className="pages" aria-label="Lessons in this batch">
          {data.batch.map((other, i) => (
            <li key={other.assignment.id}>
              <button
                type="button"
                lang="ja"
                data-type={other.assignment.data.subject_type}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => setIndex(i)}
              >
                {other.subject.data.characters ?? other.subject.data.slug}
              </button>
            </li>
          ))}
        </ol>
        <IconButton className="icon-btn" onClick={onExit} label="End lessons" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>

      <LessonPage
        key={item.assignment.id}
        subject={item.subject.data}
        subjectsById={data.subjectsById}
        voiceActorId={data.voiceActorId}
      />

      <nav className="lesson-nav">
        <IconButton className="back" disabled={index === 0} onClick={() => setIndex(index - 1)} label="Previous">
          <BackIcon />
        </IconButton>
        <IconButton
          className="next"
          onClick={isLast ? onStartQuiz : () => setIndex(index + 1)}
          label={isLast ? 'Start quiz' : 'Next'}
        >
          <ArrowIcon />
        </IconButton>
      </nav>
    </div>
  )
}
