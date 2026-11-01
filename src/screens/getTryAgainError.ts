import type { InputError } from '../components/ShakeInput'
import type { UnmarkableAnswer } from '../quiz/checkAnswer'
import { findMismatchedKana } from '../quiz/findMismatchedKana'
import { findNonKana } from '../quiz/findNonKana'

const TRY_AGAIN_MESSAGES: Record<UnmarkableAnswer, string> = {
  blank: 'Type an answer',
  'not-english': 'Answer in English',
  'not-kana': 'Kana only',
  'kana-mismatch': 'Keep the kana from the question',
  'onyomi-wanted': 'On’yomi wanted',
  'kunyomi-wanted': 'Kun’yomi wanted',
  'reading-given': 'Meaning wanted, not reading',
  'meaning-given': 'Reading wanted, not meaning',
  'radical-meaning-given': 'That’s the radical meaning',
  'kanji-meaning-given': 'That’s the kanji meaning',
  'kanji-reading-given': 'That’s the kanji reading',
  'vocabulary-meaning-given': 'That’s the vocabulary meaning',
  'vocabulary-reading-given': 'That’s the vocabulary reading',
}

const VISIBLE_MESSAGES: ReadonlySet<UnmarkableAnswer> = new Set([
  'radical-meaning-given',
  'kanji-meaning-given',
  'kanji-reading-given',
  'vocabulary-meaning-given',
  'vocabulary-reading-given',
])

export function getTryAgainError(result: UnmarkableAnswer, answer: string, characters: string | null): InputError {
  return {
    message: TRY_AGAIN_MESSAGES[result],
    isMessageVisible: VISIBLE_MESSAGES.has(result),
    wrongCharacterIndexes: findWrongCharacters(result, answer, characters),
  }
}

function findWrongCharacters(result: UnmarkableAnswer, answer: string, characters: string | null) {
  if (result === 'not-kana') return findNonKana(answer)
  if (result !== 'kana-mismatch' || !characters) return

  const mismatchedIndexes = findMismatchedKana(answer, characters)
  return mismatchedIndexes.length > 0 ? mismatchedIndexes : [...answer].map((_, index) => index)
}
