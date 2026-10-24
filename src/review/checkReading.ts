import { isKana, isKanji, toHiragana } from 'wanakana'
import type { Subject } from '../api/types'

// "retry" is a real reading that isn't the one wanted (an on'yomi when the kun'yomi is asked for).
// "invalid" means the answer can't be judged, so the input should shake and wait.
export type ReadingResult = 'correct' | 'retry' | 'incorrect' | 'invalid'

export function checkReading(answer: string, subject: Subject): ReadingResult {
  const given = toHiragana(answer.trim(), { passRomaji: true })
  if (!given || !isKana(given)) return 'invalid'
  if (subject.characters && !matchesKanaInQuestion(given, subject.characters)) return 'invalid'

  const reading = subject.readings?.find((r) => toHiragana(r.reading) === given)
  if (!reading) return 'incorrect'
  return reading.accepted_answer ? 'correct' : 'retry'
}

// Kana shown in the question must appear in the same place in the answer:
// for 食べる, an answer has to end in べる. Each run of kanji can stand for any kana.
function matchesKanaInQuestion(answer: string, characters: string) {
  const pattern = [...characters]
    .map((character) => (isKanji(character) ? '.+' : escape(toHiragana(character))))
    .join('')
    .replaceAll(/(\.\+)+/gu, '.+')
  return new RegExp(`^${pattern}$`, 'u').test(answer)
}

function escape(text: string) {
  return text.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`)
}
