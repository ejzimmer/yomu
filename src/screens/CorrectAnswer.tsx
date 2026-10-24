import type { Subject } from '../api/types'
import { MarkedUpText } from '../components/MarkedUpText'
import type { QuestionType } from '../quiz/session'

interface Props {
  subject: Subject
  type: QuestionType
}

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
      {mnemonic && <MarkedUpText text={mnemonic} />}
    </div>
  )
}
