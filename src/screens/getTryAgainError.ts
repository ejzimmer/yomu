import type { InputError } from '../components/ShakeInput'
import type { UnmarkableAnswer } from '../quiz/checkAnswer'
import { findMismatchedKana } from '../quiz/findMismatchedKana'

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

export function getTryAgainError(result: UnmarkableAnswer, answer: string, characters: string | null): InputError {
  const message = TRY_AGAIN_MESSAGES[result]
  if (result !== 'kana-mismatch' || !characters) return { message, isMessageVisible: false }

  const mismatchedIndexes = findMismatchedKana(answer, characters)
  const wrongCharacterIndexes = mismatchedIndexes.length > 0 ? mismatchedIndexes : [...answer].map((_, index) => index)
  return { message, isMessageVisible: false, wrongCharacterIndexes }
}
