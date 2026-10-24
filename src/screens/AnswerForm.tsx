import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { IconButton } from '../components/IconButton'
import { ShakeInput } from '../components/ShakeInput'
import { ArrowIcon, UndoIcon } from '../icons'
import { checkAnswer, convertTypedKana, type UnmarkableAnswer } from '../review/checkAnswer'
import type { Question } from '../review/session'
import { CorrectAnswer } from './CorrectAnswer'

const TRY_AGAIN_MESSAGES: Record<UnmarkableAnswer, string> = {
  blank: 'Type an answer',
  'not-english': 'Answer in English',
  'not-kana': 'Kana only',
  'kana-mismatch': 'Keep the kana from the question',
  'onyomi-wanted': 'On’yomi wanted',
  'kunyomi-wanted': 'Kun’yomi wanted',
}

interface Props {
  question: Question
  synonyms: readonly string[]
  isShowingAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
  onRedo: () => void
  onNext: () => void
}

export function AnswerForm({ question, synonyms, isShowingAnswer, onAnswer, onRedo, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const { type, item } = question

  const inputRef = useRef<HTMLInputElement>(null)

  function focusInput() {
    inputRef.current?.focus()
  }

  useEffect(() => inputRef.current?.focus(), [])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isShowingAnswer) {
      onNext()
      return
    }
    flushSync(() => setError(null))
    const result = checkAnswer(answer, type, item.subject.data, synonyms)
    if (result !== 'correct' && result !== 'incorrect') {
      setError(TRY_AGAIN_MESSAGES[result])
      return
    }
    flushSync(() => onAnswer(result === 'correct'))
    focusInput()
  }

  function redo() {
    flushSync(onRedo)
    focusInput()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isShowingAnswer && event.key === 'Backspace') {
      event.preventDefault()
      redo()
    }
  }

  return (
    <form className="answer" onSubmit={submit}>
      <label htmlFor={inputId}>{type === 'meaning' ? 'Meaning' : 'Reading'}</label>
      <div className="answer-row">
        <ShakeInput
          ref={inputRef}
          id={inputId}
          lang={type === 'reading' ? 'ja' : 'en'}
          error={error}
          aria-invalid={isShowingAnswer || undefined}
          readOnly={isShowingAnswer}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          value={answer}
          onChange={(e) => setAnswer(type === 'reading' ? convertTypedKana(e.target.value) : e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {isShowingAnswer && (
          <IconButton className="icon-btn typo" type="button" onClick={redo} label="Typo, redo">
            <UndoIcon />
          </IconButton>
        )}
        <IconButton className="submit" type="submit" label={isShowingAnswer ? 'Next' : 'Submit'}>
          <ArrowIcon />
        </IconButton>
      </div>
      {isShowingAnswer && <CorrectAnswer subject={item.subject.data} type={type} />}
    </form>
  )
}
