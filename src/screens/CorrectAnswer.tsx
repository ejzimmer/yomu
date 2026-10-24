import type { Subject } from '../api/types'
import type { QuestionType } from '../review/session'

interface Props {
  subject: Subject
  type: QuestionType
}

// Shown straight after a wrong answer: the accepted answers and the mnemonic.
export function CorrectAnswer({ subject, type }: Props) {
  const answers =
    type === 'meaning'
      ? subject.meanings.filter((m) => m.accepted_answer).map((m) => m.meaning)
      : (subject.readings ?? []).filter((r) => r.accepted_answer).map((r) => r.reading)
  const mnemonic = type === 'meaning' ? subject.meaning_mnemonic : subject.reading_mnemonic

  return (
    <div className="reveal">
      <div className="correct" lang={type === 'reading' ? 'ja' : 'en'}>
        {answers.join(', ')}
      </div>
      {mnemonic && <p className="mnemonic">{stripMarkup(mnemonic)}</p>}
    </div>
  )
}

// WaniKani marks up mnemonics with tags like <kanji>…</kanji>.
function stripMarkup(text: string) {
  return text.replaceAll(/<[^>]+>/gu, '')
}
