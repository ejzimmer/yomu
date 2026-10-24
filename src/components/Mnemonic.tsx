import './Mnemonic.css'
import { splitMarkup } from '../data/splitMarkup'

interface Props {
  text: string
}

export function Mnemonic({ text }: Props) {
  return (
    <p className="mnemonic">
      {splitMarkup(text).map((part) =>
        part.tag ? (
          <mark key={part.start} className={part.tag} lang={part.tag === 'ja' ? 'ja' : undefined}>
            {part.text}
          </mark>
        ) : (
          part.text
        ),
      )}
    </p>
  )
}
