import './LessonPages.css'
import { useState } from 'react'
import { IconButton } from '../components/IconButton'
import { ArrowIcon, BackIcon, CloseIcon } from '../icons'
import type { LessonData } from '../lessons/loadLessonData'
import { LessonPage } from './LessonPage'
import { LessonTabs } from './LessonTabs'

interface Props {
  data: LessonData
  onStartQuiz: () => void
  onExit: () => void
}

export function LessonPages({ data, onStartQuiz, onExit }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentItem = data.batch[currentIndex]
  const isLastPage = currentIndex === data.batch.length - 1

  return (
    <div className="lesson" data-type={currentItem.assignment.data.subject_type}>
      <div className="lesson-bar">
        <LessonTabs items={data.batch} currentIndex={currentIndex} onSelect={setCurrentIndex} />
        <IconButton className="icon-btn" onClick={onExit} label="End lessons" tooltipAlign="end">
          <CloseIcon />
        </IconButton>
      </div>

      <LessonPage
        subject={currentItem.subject.data}
        subjectsById={data.subjectsById}
        voiceActorId={data.voiceActorId}
      />

      <nav className="lesson-nav">
        <IconButton className="back" disabled={currentIndex === 0} onClick={() => setCurrentIndex(currentIndex - 1)} label="Previous">
          <BackIcon />
        </IconButton>
        <IconButton
          className="next"
          onClick={isLastPage ? onStartQuiz : () => setCurrentIndex(currentIndex + 1)}
          label={isLastPage ? 'Start quiz' : 'Next'}
        >
          <ArrowIcon />
        </IconButton>
      </nav>
    </div>
  )
}
