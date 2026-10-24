import { beforeEach, describe, expect, it } from 'vitest'
import { WaniKaniClient } from '../api/client'
import { clearDatabase, db } from '../data/db'
import { queueReview, sendPendingReviews } from './sendReviews'

const review = { assignmentId: 7, incorrectMeaningAnswers: 1, incorrectReadingAnswers: 0 }

// Each request gets the next response in the list.
function makeClient(...responses: (() => Response | Promise<Response>)[]) {
  const sentBodies: unknown[] = []
  const fetch = (_url: string | URL | Request, init?: RequestInit) => {
    sentBodies.push(JSON.parse(String(init?.body)))
    return Promise.resolve(responses.shift()!())
  }
  return { client: new WaniKaniClient('t', { fetch: fetch as typeof globalThis.fetch }), sentBodies }
}

const updatedResources = () =>
  Response.json(
    {
      resources_updated: {
        assignment: { id: 7, data_updated_at: null, data: { srs_stage: 4 } },
        review_statistic: { id: 70, data_updated_at: null, data: { subject_id: 1 } },
      },
    },
    { status: 201 },
  )

describe('sending reviews', () => {
  beforeEach(() => clearDatabase())

  it('sends a review and stores the updated assignment', async () => {
    const { client, sentBodies } = makeClient(updatedResources)
    await queueReview(client, review)

    expect(sentBodies).toEqual([{ review: { assignment_id: 7, incorrect_meaning_answers: 1, incorrect_reading_answers: 0 } }])
    expect((await db.assignments.get(7))?.data).toEqual({ srs_stage: 4 })
    expect(await db.pendingReviews.count()).toBe(0)
  })

  it('keeps the review when WaniKani can’t be reached, and sends it later', async () => {
    const { client } = makeClient(() => Promise.reject(new TypeError('offline')), updatedResources)
    await queueReview(client, review)
    expect(await db.pendingReviews.count()).toBe(1)

    await sendPendingReviews(client)
    expect(await db.pendingReviews.count()).toBe(0)
  })

  it('drops a review WaniKani rejects for good', async () => {
    const { client } = makeClient(() => Response.json({ error: 'not available' }, { status: 422 }))
    await queueReview(client, review)
    expect(await db.pendingReviews.count()).toBe(0)
  })
})
