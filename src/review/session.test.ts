import { describe, expect, it } from 'vitest'
import type { Assignment, Resource, Subject } from '../api/types'
import type { ReviewItem } from './buildReviewQueue'
import { answerCorrectly, answerWrongly, moveOn, startSession, undoWrongAnswer, type ReviewSession } from './session'

const makeItem = (id: number, hasReading = true): ReviewItem => ({
  assignment: { id, data: { subject_id: id } } as Resource<Assignment>,
  subject: { id, data: { readings: hasReading ? [{ reading: 'a' }] : [] } } as unknown as Resource<Subject>,
})

const first = () => 0

function answerEverything(session: ReviewSession) {
  let current = session
  while (current.question) current = answerCorrectly(current, first)
  return current
}

describe('review session', () => {
  it('asks meaning and reading for items with readings, and only meaning otherwise', () => {
    const session = startSession([makeItem(1), makeItem(2, false)], first)
    const asked: string[] = []
    let current = session
    while (current.question) {
      asked.push(`${current.question.item.assignment.id}:${current.question.type}`)
      current = answerCorrectly(current, first)
    }
    expect(asked.toSorted()).toEqual(['1:meaning', '1:reading', '2:meaning'])
    expect(current.completed.map((item) => item.assignment.id).toSorted()).toEqual([1, 2])
  })

  it('completes an item only once both questions are right', () => {
    let session = startSession([makeItem(1)], first)
    session = answerCorrectly(session, first)
    expect(session.completed).toEqual([])
    session = answerCorrectly(session, first)
    expect(session.completed).toHaveLength(1)
    expect(session.question).toBeNull()
  })

  it('counts wrong answers and asks the question again later', () => {
    let session = startSession([makeItem(1)], first)
    session = answerWrongly(session)
    expect(session.isShowingAnswer).toBe(true)
    session = moveOn(session, first)
    session = answerEverything(session)

    const [item] = session.completed
    expect(item.incorrectMeaningAnswers + item.incorrectReadingAnswers).toBe(1)
    expect(session.correctAnswers).toBe(2)
    expect(session.totalAnswers).toBe(3)
  })

  it('forgets a wrong answer marked as a typo and asks the same question again', () => {
    let session = startSession([makeItem(1)], first)
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
    const session = startSession(Array.from({ length: 12 }, (_, i) => makeItem(i + 1, false)), first)
    expect(session.active).toHaveLength(10)
    expect(session.waiting).toHaveLength(2)
    const next = answerCorrectly(session, first)
    expect(next.active).toHaveLength(10)
    expect(next.waiting).toHaveLength(1)
    expect(answerEverything(next).completed).toHaveLength(12)
  })

  it('doesn’t ask the same question twice in a row when there’s a choice', () => {
    let session = startSession([makeItem(1, false), makeItem(2, false)], first)
    const askedFirst = session.question!.item.assignment.id
    session = moveOn(answerWrongly(session), first)
    expect(session.question!.item.assignment.id).not.toBe(askedFirst)
  })
})
