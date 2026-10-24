export type MarkupTag = 'radical' | 'kanji' | 'vocabulary' | 'reading' | 'meaning' | 'ja'

export interface MarkupPart {
  start: number
  text: string
  tag: MarkupTag | null
}

const TAGGED = /<(radical|kanji|vocabulary|reading|meaning|ja)>(.*?)<\/\1>/gu

// WaniKani marks up mnemonics and hints with tags like <kanji>…</kanji>.
export function splitMarkup(text: string): MarkupPart[] {
  const parts: MarkupPart[] = []
  let end = 0
  for (const match of text.matchAll(TAGGED)) {
    if (match.index > end) parts.push(makePlainPart(end, text.slice(end, match.index)))
    parts.push({ start: match.index, text: stripTags(match[2]), tag: match[1] as MarkupTag })
    end = match.index + match[0].length
  }
  if (end < text.length) parts.push(makePlainPart(end, text.slice(end)))
  return parts
}

function makePlainPart(start: number, text: string): MarkupPart {
  return { start, text: stripTags(text), tag: null }
}

function stripTags(text: string) {
  return text.replaceAll(/<[^>]+>/gu, '')
}
