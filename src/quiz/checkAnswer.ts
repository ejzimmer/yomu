import { toKana } from 'wanakana'
import type { Subject } from '../api/types'
import { checkMeaning, type MeaningResult } from './checkMeaning'
import { checkReading, type ReadingResult } from './checkReading'
import type { QuestionType } from './session'

export type AnswerResult = 'blank' | MeaningResult | ReadingResult

export type UnmarkableAnswer = Exclude<AnswerResult, 'correct' | 'incorrect'>

export function checkAnswer(answer: string, type: QuestionType, subject: Subject, synonyms: readonly string[]): AnswerResult {
  if (!answer.trim()) return 'blank'
  return type === 'meaning' ? checkMeaning(answer, subject, synonyms) : checkReading(answer, subject)
}

// Converts romaji to kana as it's typed, leaving a trailing "n" until the next letter decides it.
export function convertTypedKana(value: string) {
  return toKana(value, { IMEMode: true })
}
