import type { StudyItem } from './studyItem'

export function preloadStudyFont(items: readonly StudyItem[]) {
  const rootStyle = getComputedStyle(document.documentElement)
  const family = rootStyle.getPropertyValue('--display')
  const weight = rootStyle.getPropertyValue('--display-weight')
  // Google Fonts splits Japanese fonts into many unicode-range files, and the browser only fetches the
  // ones covering text it is drawing. Loading them up front stops each new kanji flashing in a fallback font.
  void document.fonts.load(`${weight} 1em ${family}`, getStudyText(items))
}

function getStudyText(items: readonly StudyItem[]) {
  return items
    .flatMap(({ subject }) => [subject.data.characters ?? '', ...(subject.data.readings ?? []).map(({ reading }) => reading)])
    .join('')
}
