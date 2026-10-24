import { describe, expect, it } from 'vitest'
import type { Subject } from '../api/types'
import { checkAnswer } from './checkAnswer'

const person = {
  characters: '人',
  meanings: [{ meaning: 'Person', primary: true, accepted_answer: true }],
  auxiliary_meanings: [],
  readings: [
    { reading: 'じん', primary: true, accepted_answer: true, type: 'onyomi' },
    { reading: 'ひと', primary: false, accepted_answer: false, type: 'kunyomi' },
  ],
} as unknown as Subject

describe('checkAnswer', () => {
  it('marks answers right or wrong', () => {
    expect(checkAnswer('person', 'meaning', person, [])).toBe('correct')
    expect(checkAnswer('dog', 'meaning', person, [])).toBe('incorrect')
    expect(checkAnswer('jin', 'reading', person, [])).toBe('correct')
    expect(checkAnswer('nin', 'reading', person, [])).toBe('incorrect')
  })

  it('says why an answer can’t be marked', () => {
    expect(checkAnswer(' ', 'meaning', person, [])).toBe('blank')
    expect(checkAnswer('ひと', 'meaning', person, [])).toBe('not-english')
    expect(checkAnswer('jix', 'reading', person, [])).toBe('not-kana')
    expect(checkAnswer('hito', 'reading', person, [])).toBe('onyomi-wanted')
  })
})
