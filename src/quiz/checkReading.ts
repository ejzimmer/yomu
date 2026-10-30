import { isKana, isKanji, toHiragana, toKana } from 'wanakana'
import type { Subject } from '../api/types'

export type ReadingResult = 'correct' | 'incorrect' | 'not-kana' | 'kana-mismatch' | 'onyomi-wanted' | 'kunyomi-wanted' | 'meaning-given'

export function checkReading(answer: string, subject: Subject): ReadingResult {
  const given = toHiragana(toKana(answer.trim()))
  if (!isKana(given)) return 'not-kana'

  const reading = subject.readings?.find((r) => toHiragana(r.reading) === given)
  if (!reading && isMeaningInKana(given, subject)) return 'meaning-given'
  if (subject.characters && !matchesKanaInQuestion(given, subject.characters)) return 'kana-mismatch'
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

// The reading box turns romaji into kana as it's typed, so a meaning typed there arrives as kana: "one" becomes おね.
function isMeaningInKana(answer: string, subject: Subject) {
  return [
    ...subject.meanings.filter((m) => m.accepted_answer).map((m) => m.meaning),
    ...subject.auxiliary_meanings.filter((m) => m.type === 'whitelist').map((m) => m.meaning),
  ].some((meaning) => toHiragana(toKana(meaning.toLowerCase().replaceAll(/[^a-z]/gu, ''))) === answer)
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
