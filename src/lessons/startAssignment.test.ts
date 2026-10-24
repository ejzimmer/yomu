import { beforeEach, describe, expect, it } from 'vitest'
import { WaniKaniClient } from '../api/client'
import { clearDatabase, db } from '../data/db'
import { startAssignment } from './startAssignment'

describe('startAssignment', () => {
  beforeEach(() => clearDatabase())

  it('starts the assignment on WaniKani and stores what comes back', async () => {
    const requests: { url: string; method?: string }[] = []
    const fetch = (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), method: init?.method })
      return Promise.resolve(Response.json({ id: 7, data_updated_at: null, data: { started_at: '2026-10-24T00:00:00Z' } }))
    }
    const client = new WaniKaniClient('t', { fetch: fetch as typeof globalThis.fetch })

    await startAssignment(client, 7)

    expect(requests).toEqual([{ url: 'https://api.wanikani.com/v2/assignments/7/start', method: 'PUT' }])
    expect((await db.assignments.get(7))?.data).toEqual({ started_at: '2026-10-24T00:00:00Z' })
  })
})
