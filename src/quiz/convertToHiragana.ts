import { toHiragana } from 'wanakana'

export function convertToHiragana(text: string) {
  return toHiragana(text.replaceAll(/[\s\p{P}]/gu, ''))
}
