import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import type { WaniKaniClient } from '../api/client'
import { IconButton } from '../components/IconButton'
import { ShakeInput, type ShakeInputHandle } from '../components/ShakeInput'
import { ArrowIcon, UndoIcon } from '../icons'
import { checkAnswer, convertTypedKana, type UnmarkableAnswer } from '../quiz/checkAnswer'
import type { Question } from '../quiz/session'
import { useSynonyms } from '../synonyms/useSynonyms'
import { CorrectAnswer } from './CorrectAnswer'

const TRY_AGAIN_MESSAGES: Record<UnmarkableAnswer, string> = {
  blank: 'Type an answer',
  'not-english': 'Answer in English',
  'not-kana': 'Kana only',
  'kana-mismatch': 'Keep the kana from the question',
  'onyomi-wanted': 'On’yomi wanted',
  'kunyomi-wanted': 'Kun’yomi wanted',
  'reading-given': 'Meaning wanted, not reading',
  'meaning-given': 'Reading wanted, not meaning',
}

interface Props {
  question: Question
  client: WaniKaniClient
  isShowingAnswer: boolean
  onAnswer: (isCorrect: boolean) => void
  onRedo: () => void
  onNext: () => void
}

export function AnswerForm({ question, client, isShowingAnswer, onAnswer, onRedo, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const inputId = useId()
  const inputRef = useRef<ShakeInputHandle>(null)
  const { type, item } = question
  const synonyms = useSynonyms(item.subject.id)

  function focusInput() {
    inputRef.current?.focus()
  }

  function submit(event: FormEvent) {
    event.preventDefault()

    if (isShowingAnswer) {
      onNext()
      return
    }

    const result = checkAnswer(answer, type, item.subject.data, synonyms)

    if (result !== 'correct' && result !== 'incorrect') {
      inputRef.current?.setError(TRY_AGAIN_MESSAGES[result])
      return
    }

    inputRef.current?.setError(null)
    flushSync(() => onAnswer(result === 'correct'))
    focusInput()
  }

  function redo() {
    flushSync(onRedo)
    focusInput()
  }

  function redoOnBackspace(event: KeyboardEvent<HTMLInputElement>) {
    if (isShowingAnswer && event.key === 'Backspace') {
      event.preventDefault()
      redo()
    }
  }

  return (
    <div className="answer">
      <form onSubmit={submit}>
        <label htmlFor={inputId}>{type === 'meaning' ? 'Meaning' : 'Reading'}</label>
        <div className="answer-row">
          <ShakeInput
            ref={inputRef}
            id={inputId}
            // The user is answering a question they just asked for, so jumping straight to the box is expected here.
            // oxlint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            lang={type === 'reading' ? 'ja' : 'en'}
            aria-invalid={isShowingAnswer || undefined}
            readOnly={isShowingAnswer}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={answer}
            onChange={(e) => setAnswer(type === 'reading' ? convertTypedKana(e.target.value) : e.target.value)}
            onKeyDown={redoOnBackspace}
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
      </form>
      {isShowingAnswer && <CorrectAnswer subject={item.subject} type={type} client={client} />}
    </div>
  )
}
