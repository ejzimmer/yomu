import { isKana, isKanji, toHiragana, toKana } from 'wanakana'
import type { Subject } from '../api/types'

export type ReadingResult = 'correct' | 'incorrect' | 'not-kana' | 'kana-mismatch' | 'onyomi-wanted' | 'kunyomi-wanted'

export function checkReading(answer: string, subject: Subject): ReadingResult {
  const given = toHiragana(toKana(answer.trim()))
  if (!isKana(given)) return 'not-kana'
  if (subject.characters && !matchesKanaInQuestion(given, subject.characters)) return 'kana-mismatch'

  const reading = subject.readings?.find((r) => toHiragana(r.reading) === given)
  if (!reading) return 'incorrect'
  if (reading.accepted_answer) return 'correct'
  return getWantedReadingType(subject) ?? 'incorrect'
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

function getWantedReadingType(subject: Subject) {
  const wanted = subject.readings?.find((reading) => reading.accepted_answer)?.type
  if (wanted === 'onyomi') return 'onyomi-wanted'
  if (wanted === 'kunyomi') return 'kunyomi-wanted'
  return null
}
