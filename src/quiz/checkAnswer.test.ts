import { describe, expect, it } from 'vitest'
import type { Resource, Subject } from '../api/types'
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

  describe('when the answer belongs to a lookalike subject', () => {
    const mountain = {
      characters: '山',
      meanings: [{ meaning: 'Mountain', primary: true, accepted_answer: true }],
      auxiliary_meanings: [],
      readings: [
        { reading: 'さん', primary: true, accepted_answer: true, type: 'onyomi' },
        { reading: 'やま', primary: false, accepted_answer: false, type: 'kunyomi' },
      ],
    } as unknown as Subject

    const makeLookalike = (object: string, data: Partial<Subject>) =>
      ({ id: 2, object, url: '', data_updated_at: null, data: { ...mountain, ...data } }) as Resource<Subject>

    const mountainVocabulary = makeLookalike('vocabulary', {
      readings: [{ reading: 'やま', primary: true, accepted_answer: true }],
    } as Partial<Subject>)
    const mountainRadical = makeLookalike('radical', {
      meanings: [{ meaning: 'Peak', primary: true, accepted_answer: true }],
      readings: undefined,
    })
    const mountainKanji = makeLookalike('kanji', {})

    it('says which subject the answer was for', () => {
      expect(checkAnswer('peak', 'meaning', mountain, [], [mountainRadical])).toBe('radical-meaning-given')
      expect(checkAnswer('yama', 'reading', mountain, [], [mountainVocabulary])).toBe('vocabulary-reading-given')
      expect(checkAnswer('san', 'reading', mountainVocabulary.data, [], [mountainKanji])).toBe('kanji-reading-given')
    })

    it('marks answers that are right for this subject too as correct', () => {
      expect(checkAnswer('mountain', 'meaning', mountainVocabulary.data, [], [mountainKanji])).toBe('correct')
    })

    it('marks answers that fit no subject as incorrect', () => {
      expect(checkAnswer('river', 'meaning', mountain, [], [mountainRadical, mountainVocabulary])).toBe('incorrect')
    })
  })
})
