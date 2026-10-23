import { describe, expect, it } from 'vitest'
import { ApiError, WaniKaniClient } from './client'

type Reply = { status?: number; body?: unknown; headers?: Record<string, string> }

function fakeFetch(replies: Reply[]) {
  const calls: { url: string; headers: Record<string, string> }[] = []
  const impl = async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), headers: (init?.headers ?? {}) as Record<string, string> })
    const r = replies.shift() ?? { status: 500 }
    return new Response(r.status === 304 ? null : JSON.stringify(r.body ?? {}), {
      status: r.status ?? 200,
      headers: r.headers,
    })
  }
  return { impl: impl as typeof fetch, calls }
}

function clock() {
  let t = 1_000_000
  const sleeps: number[] = []
  return {
    now: () => t,
    sleep: async (ms: number) => { sleeps.push(ms); t += ms },
    advance: (ms: number) => { t += ms },
    sleeps,
  }
}

const page = (ids: number[], next: string | null) => ({
  object: 'collection', url: '', total_count: 3, data_updated_at: null,
  pages: { next_url: next, previous_url: null, per_page: 2 },
  data: ids.map((id) => ({ id, object: 'subject', url: '', data_updated_at: null, data: {} })),
})

describe('WaniKaniClient', () => {
  it('sends auth and revision headers', async () => {
    const f = fakeFetch([{ body: { data: { level: 5 } } }])
    const res = await new WaniKaniClient('tok', { fetch: f.impl }).user()
    expect(res.data.level).toBe(5)
    expect(f.calls[0].url).toBe('https://api.wanikani.com/v2/user')
    expect(f.calls[0].headers.Authorization).toBe('Bearer tok')
    expect(f.calls[0].headers['Wanikani-Revision']).toBe('20170710')
  })

  it('follows pagination', async () => {
    const f = fakeFetch([
      { body: page([1, 2], 'https://api.wanikani.com/v2/subjects?page_after_id=2') },
      { body: page([3], null) },
    ])
    const items = await new WaniKaniClient('t', { fetch: f.impl }).getAll('/subjects', { levels: '1' })
    expect(items.map((i) => i.id)).toEqual([1, 2, 3])
    expect(f.calls[0].url).toBe('https://api.wanikani.com/v2/subjects?levels=1')
    expect(f.calls[1].url).toContain('page_after_id=2')
  })

  it('serves a 304 from the cache', async () => {
    const f = fakeFetch([
      { body: { data: { level: 7 } }, headers: { ETag: 'W/"abc"' } },
      { status: 304 },
    ])
    const client = new WaniKaniClient('t', { fetch: f.impl })
    await client.user()
    const again = await client.user()
    expect(f.calls[1].headers['If-None-Match']).toBe('W/"abc"')
    expect(again.data.level).toBe(7)
  })

  it('throws ApiError with the API message', async () => {
    const f = fakeFetch([{ status: 401, body: { error: 'Unauthorized', code: 401 } }])
    const err = await new WaniKaniClient('bad', { fetch: f.impl }).user().catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(401)
    expect(err.message).toBe('Unauthorized')
  })

  it('waits for the reset time after a 429 and retries', async () => {
    const c = clock()
    const reset = String((c.now() + 5000) / 1000)
    const f = fakeFetch([
      { status: 429, headers: { 'RateLimit-Remaining': '0', 'RateLimit-Reset': reset } },
      { body: { data: { level: 2 } } },
    ])
    const res = await new WaniKaniClient('t', { fetch: f.impl, now: c.now, sleep: c.sleep }).user()
    expect(res.data.level).toBe(2)
    expect(c.sleeps).toEqual([5000])
  })

  it('never sends more than 60 requests in a minute', async () => {
    const c = clock()
    const f = fakeFetch(Array.from({ length: 61 }, () => ({ body: {} })))
    const client = new WaniKaniClient('t', { fetch: f.impl, now: c.now, sleep: c.sleep })
    for (let i = 0; i < 60; i++) { await client.get('/user'); c.advance(100) }
    expect(c.sleeps).toEqual([])
    await client.get('/user')
    expect(c.sleeps).toEqual([60_000 - 6000])
  })
})
