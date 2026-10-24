import { isKana, toKana } from 'wanakana'
import type { Subject } from '../api/types'
import { checkMeaning } from './checkMeaning'
import { checkReading } from './checkReading'
import type { QuestionType } from './session'

export type AnswerResult = { error: string } | { isCorrect: boolean }

// Judges a typed answer. An error means the answer can't be judged yet:
// the input should shake and show it, and nothing is counted.
export function checkAnswer(answer: string, type: QuestionType, subject: Subject, synonyms: readonly string[]): AnswerResult {
  if (!answer.trim()) return { error: 'Type an answer' }

  if (type === 'meaning') {
    const result = checkMeaning(answer, subject, synonyms)
    if (result === 'invalid') return { error: 'Answer in English' }
    return { isCorrect: result !== 'incorrect' }
  }

  const kana = toKana(answer.trim())
  const result = checkReading(kana, subject)
  if (result === 'invalid') return { error: isKana(kana) ? 'Keep the kana from the question' : 'Kana only' }
  if (result === 'retry') return { error: getWantedReadingType(subject) }
  return { isCorrect: result === 'correct' }
}

// Converts romaji to kana as it's typed, leaving a trailing "n" until the next letter decides it.
export function convertTypedKana(value: string) {
  return toKana(value, { IMEMode: true })
}

function getWantedReadingType(subject: Subject) {
  const wanted = subject.readings?.find((reading) => reading.accepted_answer)?.type
  if (wanted === 'onyomi') return 'On’yomi wanted'
  if (wanted === 'kunyomi') return 'Kun’yomi wanted'
  return 'Another reading wanted'
}
