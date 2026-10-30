import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Assignment, Resource, Subject } from '../api/types'
import type { StudyItem } from '../data/studyItem'
import { answerCorrectly, answerWrongly, askNextQuestion, createSession, undoWrongAnswer, type QuizSession } from './session'

const makeItem = (id: number, hasReading = true): StudyItem => ({
  assignment: { id, data: { subject_id: id } } as Resource<Assignment>,
  subject: { id, data: { readings: hasReading ? [{ reading: 'a' }] : [] } } as unknown as Resource<Subject>,
})

function answerEverything(session: QuizSession) {
  let current = session
  while (current.question) current = askNextQuestion(answerCorrectly(current))
  return current
}

describe('review session', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
  })

  it('asks meaning and reading for items with readings, and only meaning otherwise', () => {
    const session = createSession([makeItem(1), makeItem(2, false)])
    const asked: string[] = []
    let current = session
    while (current.question) {
      asked.push(`${current.question.item.assignment.id}:${current.question.type}`)
      current = askNextQuestion(answerCorrectly(current))
    }
    expect(asked.toSorted()).toEqual(['1:meaning', '1:reading', '2:meaning'])
    expect(current.completed.map((item) => item.assignment.id).toSorted()).toEqual([1, 2])
  })

  it('completes an item only once both questions are right', () => {
    let session = createSession([makeItem(1)])
    session = askNextQuestion(answerCorrectly(session))
    expect(session.completed).toEqual([])
    session = askNextQuestion(answerCorrectly(session))
    expect(session.completed).toHaveLength(1)
    expect(session.question).toBeNull()
  })

  it('records a correct answer without moving to the next question', () => {
    const session = createSession([makeItem(1), makeItem(2)])
    const answered = answerCorrectly(session)
    expect(answered.question?.item.assignment.id).toBe(session.question?.item.assignment.id)
    expect(answered.question?.type).toBe(session.question?.type)
    expect(answered.questionNumber).toBe(session.questionNumber)
    expect(answered.correctAnswers).toBe(1)
  })

  it('counts wrong answers and asks the question again later', () => {
    let session = createSession([makeItem(1)])
    session = answerWrongly(session)
    expect(session.isShowingAnswer).toBe(true)
    session = askNextQuestion(session)
    session = answerEverything(session)

    const [item] = session.completed
    expect(item.incorrectMeaningAnswers + item.incorrectReadingAnswers).toBe(1)
    expect(session.correctAnswers).toBe(2)
    expect(session.totalAnswers).toBe(3)
  })

  it('forgets a wrong answer marked as a typo and asks the same question again', () => {
    let session = createSession([makeItem(1)])
    const question = session.question!
    session = undoWrongAnswer(answerWrongly(session))

    expect(session.isShowingAnswer).toBe(false)
    expect(session.question?.type).toBe(question.type)
    expect(session.question?.item.assignment.id).toBe(1)
    session = answerEverything(session)
    expect(session.completed[0].incorrectMeaningAnswers + session.completed[0].incorrectReadingAnswers).toBe(0)
    expect(session.totalAnswers).toBe(2)
  })

  it('keeps ten items in play and tops up as items complete', () => {
    const session = createSession(Array.from({ length: 12 }, (_, i) => makeItem(i + 1, false)))
    expect(session.active).toHaveLength(10)
    expect(session.waiting).toHaveLength(2)
    const next = askNextQuestion(answerCorrectly(session))
    expect(next.active).toHaveLength(10)
    expect(next.waiting).toHaveLength(1)
    expect(answerEverything(next).completed).toHaveLength(12)
  })

  it('doesn’t ask the same question twice in a row when there’s a choice', () => {
    let session = createSession([makeItem(1, false), makeItem(2, false)])
    const askedFirst = session.question!.item.assignment.id
    session = askNextQuestion(answerWrongly(session))
    expect(session.question!.item.assignment.id).not.toBe(askedFirst)
  })

  it('asks about several other items before coming back to the same item', () => {
    let session = createSession(Array.from({ length: 10 }, (_, i) => makeItem(i + 1)))
    const askedIds: number[] = []
    for (let i = 0; i < 6; i++) {
      askedIds.push(session.question!.item.assignment.id)
      session = askNextQuestion(answerCorrectly(session))
    }
    expect(new Set(askedIds).size).toBe(6)
  })

  it('still finishes when only one item is left', () => {
    const session = createSession([makeItem(1)])
    expect(answerEverything(session).completed).toHaveLength(1)
  })
})
