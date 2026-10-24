import { useCallback, useEffect, useId, useState, type FormEvent, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { IconButton } from '../components/IconButton'
import { ShakeInput } from '../components/ShakeInput'
import { ArrowIcon, UndoIcon } from '../icons'
import { checkAnswer, convertTypedKana } from '../review/checkAnswer'
import type { Question } from '../review/session'
import { CorrectAnswer } from './CorrectAnswer'

interface Props {
  question: Question
  synonyms: readonly string[]
  isShowingAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
  onRedo: () => void
  onNext: () => void
}

// The answer box for one question. Remount it (with a new key) for each new question.
export function AnswerForm({ question, synonyms, isShowingAnswer, onAnswer, onRedo, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const { type, item } = question

  // Keeps typing in the answer box, so Enter and Backspace work without reaching for the mouse.
  const focusInput = useCallback(() => {
    document.querySelector<HTMLInputElement>(`[id="${inputId}"]`)?.focus()
  }, [inputId])

  useEffect(focusInput, [focusInput])

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isShowingAnswer) {
      onNext()
      return
    }
    flushSync(() => setError(null))
    const result = checkAnswer(answer, type, item.subject.data, synonyms)
    if ('error' in result) {
      setError(result.error)
      return
    }
    flushSync(() => onAnswer(result.isCorrect))
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
