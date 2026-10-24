import { isKana, toKana } from 'wanakana'
import type { Subject } from '../api/types'
import { checkMeaning } from './checkMeaning'
import { checkReading } from './checkReading'
import type { QuestionType } from './session'

// Besides right and wrong, an answer can be one that shouldn't be marked at all
// (blank, the wrong script, a different kind of reading). Those aren't counted;
// the user is asked to try again.
export type AnswerResult = 'correct' | 'incorrect' | UnmarkableAnswer

export type UnmarkableAnswer =
  | 'blank'
  | 'not-english'
  | 'not-kana'
  | 'kana-mismatch'
  | 'onyomi-wanted'
  | 'kunyomi-wanted'
  | 'other-reading-wanted'

export function checkAnswer(answer: string, type: QuestionType, subject: Subject, synonyms: readonly string[]): AnswerResult {
  if (!answer.trim()) return 'blank'

  if (type === 'meaning') {
    const result = checkMeaning(answer, subject, synonyms)
    if (result === 'invalid') return 'not-english'
    return result === 'incorrect' ? 'incorrect' : 'correct'
  }

  const kana = toKana(answer.trim())
  const result = checkReading(kana, subject)
  if (result === 'invalid') return isKana(kana) ? 'kana-mismatch' : 'not-kana'
  if (result === 'retry') return getWantedReadingType(subject)
  return result
}

// Converts romaji to kana as it's typed, leaving a trailing "n" until the next letter decides it.
export function convertTypedKana(value: string) {
  return toKana(value, { IMEMode: true })
}

function getWantedReadingType(subject: Subject): UnmarkableAnswer {
  const wanted = subject.readings?.find((reading) => reading.accepted_answer)?.type
  if (wanted === 'onyomi') return 'onyomi-wanted'
  if (wanted === 'kunyomi') return 'kunyomi-wanted'
  return 'other-reading-wanted'
}
