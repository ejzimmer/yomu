import { describe, expect, it } from 'vitest'
import type { Subject } from '../api/types'
import { checkMeaning } from './checkMeaning'
import { checkReading } from './checkReading'

const makeSubject = (overrides: Partial<Subject>): Subject => ({
  level: 1,
  slug: '',
  characters: null,
  meanings: [],
  auxiliary_meanings: [],
  meaning_mnemonic: '',
  lesson_position: 0,
  spaced_repetition_system_id: 1,
  hidden_at: null,
  document_url: '',
  ...overrides,
})

const persimmon = makeSubject({
  characters: '柿',
  meanings: [
    { meaning: 'Persimmon', primary: true, accepted_answer: true },
    { meaning: 'Kaki', primary: false, accepted_answer: false },
  ],
  auxiliary_meanings: [
    { meaning: 'Persimmon Tree', type: 'whitelist' },
    { meaning: 'Peach', type: 'blacklist' },
  ],
})

const person = makeSubject({
  characters: '人',
  readings: [
    { reading: 'じん', primary: true, accepted_answer: true, type: 'onyomi' },
    { reading: 'にん', primary: false, accepted_answer: true, type: 'onyomi' },
    { reading: 'ひと', primary: false, accepted_answer: false, type: 'kunyomi' },
  ],
})

const toEat = makeSubject({
  characters: '食べる',
  readings: [{ reading: 'たべる', primary: true, accepted_answer: true }],
})

const tea = makeSubject({
  characters: 'お茶',
  readings: [{ reading: 'おちゃ', primary: true, accepted_answer: true }],
})

describe('checkMeaning', () => {
  it('accepts an accepted meaning, ignoring case and spacing', () => {
    expect(checkMeaning('  persimmon ', persimmon)).toBe('correct')
  })

  it('accepts whitelisted auxiliary meanings and the user’s synonyms', () => {
    expect(checkMeaning('persimmon tree', persimmon)).toBe('correct')
    expect(checkMeaning('sharon fruit', persimmon, ['Sharon fruit'])).toBe('correct')
  })

  it('rejects meanings that are listed but not accepted', () => {
    expect(checkMeaning('kaki', persimmon)).toBe('incorrect')
  })

  it('allows small typos in longer answers', () => {
    expect(checkMeaning('persimon', persimmon)).toBe('correct')
  })

  it('allows no typos in short answers', () => {
    const dog = makeSubject({ meanings: [{ meaning: 'Dog', primary: true, accepted_answer: true }] })
    expect(checkMeaning('dot', dog)).toBe('incorrect')
  })

  it('always rejects a blacklisted meaning', () => {
    expect(checkMeaning('peach', persimmon)).toBe('incorrect')
  })

  it('says an answer typed in Japanese isn’t English', () => {
    expect(checkMeaning('かき', persimmon)).toBe('not-english')
  })
})

describe('checkReading', () => {
  it('accepts an accepted reading, in hiragana or katakana', () => {
    expect(checkReading('じん', person)).toBe('correct')
    expect(checkReading('ニン', person)).toBe('correct')
  })

  it('asks again for a real reading that isn’t the one wanted', () => {
    expect(checkReading('ひと', person)).toBe('onyomi-wanted')
  })

  it('marks other kana wrong', () => {
    expect(checkReading('じつ', person)).toBe('incorrect')
  })

  it('converts romaji, and says an answer that won’t convert isn’t kana', () => {
    expect(checkReading('jin', person)).toBe('correct')
    expect(checkReading('じq', person)).toBe('not-kana')
  })

  it('treats an answer that changes the kana shown in the question as a mismatch', () => {
    expect(checkReading('たべる', toEat)).toBe('correct')
    expect(checkReading('たべれ', toEat)).toBe('kana-mismatch')
    expect(checkReading('おちゃ', tea)).toBe('correct')
    expect(checkReading('ちゃ', tea)).toBe('kana-mismatch')
  })
})
