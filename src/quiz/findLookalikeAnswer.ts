import type { Resource, Subject } from '../api/types'
import { checkMeaning } from './checkMeaning'
import { checkReading } from './checkReading'
import type { QuestionType } from './session'

export type LookalikeAnswer =
  | 'radical-meaning-given'
  | 'kanji-meaning-given'
  | 'kanji-reading-given'
  | 'vocabulary-meaning-given'
  | 'vocabulary-reading-given'

export function findLookalikeAnswer(answer: string, type: QuestionType, lookalikes: readonly Resource<Subject>[]): LookalikeAnswer | null {
  const answered = lookalikes.find(({ data }) =>
    type === 'meaning' ? checkMeaning(answer, data) === 'correct' : checkReading(answer, data) === 'correct',
  )
  return answered ? getLookalikeAnswer(answered.object, type) : null
}

function getLookalikeAnswer(object: string, type: QuestionType): LookalikeAnswer | null {
  if (object === 'radical' && type === 'meaning') return 'radical-meaning-given'
  if (object === 'kanji') return `kanji-${type}-given`
  if (object === 'vocabulary') return `vocabulary-${type}-given`
  return null
}
