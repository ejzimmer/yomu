import { ApiError } from './errors'
import type { Collection, Resource, User } from './types'

const BASE_URL = 'https://api.wanikani.com/v2'
const REVISION = '20170710'
const LIMIT_PER_MINUTE = 60
const ONE_MINUTE = Temporal.Duration.from({ minutes: 1 })
const MIN_RETRY_WAIT = Temporal.Duration.from({ seconds: 1 })

export interface ClientOptions {
  fetch?: typeof fetch
}

type WriteMethod = 'POST' | 'PUT'

interface RequestOptions {
  method?: WriteMethod
  body?: string
  headers?: Record<string, string>
}

interface Cached {
  etag: string | null
  lastModified: string | null
  body: unknown
}

const getLater = (a: Temporal.Instant, b: Temporal.Instant) => (Temporal.Instant.compare(a, b) >= 0 ? a : b)

function sleepUntil(instant: Temporal.Instant) {
  const ms = Temporal.Now.instant().until(instant).total('milliseconds')
  return new Promise<void>((resolve) => {
    setTimeout(resolve, Math.max(ms, 0))
  })
}

// Thin WaniKani API v2 client: bearer auth, revision header, pagination,
// a 60/min rate limiter that also honours RateLimit-* headers and 429s,
// and conditional GETs (ETag / Last-Modified) served from an in-memory cache.
export class WaniKaniClient {
  private readonly token: string
  private readonly makeHttpRequest: typeof fetch
  private readonly recentRequestTimes: Temporal.Instant[] = []
  private rateLimitResetsAt: Temporal.Instant | null = null
  private readonly cache = new Map<string, Cached>()

  constructor(token: string, options: ClientOptions = {}) {
    this.token = token
    this.makeHttpRequest = options.fetch ?? fetch.bind(globalThis)
  }

  getUser(): Promise<Resource<User>> {
    return this.get<Resource<User>>('/user')
  }

  async get<T>(pathOrUrl: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(pathOrUrl.startsWith('http') ? pathOrUrl : BASE_URL + pathOrUrl)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    return (await this.sendWithRetry(url.toString())) as T
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.sendJson<T>('POST', path, body)
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.sendJson<T>('PUT', path, body)
  }

  // Follows pages.next_url until the collection is exhausted.
  async getAll<T>(path: string, params: Record<string, string> = {}): Promise<Resource<T>[]> {
    const items: Resource<T>[] = []
    let page = await this.get<Collection<T>>(path, params)
    items.push(...page.data)
    while (page.pages.next_url) {
      // Each page's URL comes from the previous page, so these can't run in parallel.
      // oxlint-disable-next-line no-await-in-loop
      page = await this.get<Collection<T>>(page.pages.next_url)
      items.push(...page.data)
    }
    return items
  }

  private async sendJson<T>(method: WriteMethod, path: string, body: unknown): Promise<T> {
    const init: RequestOptions = { method, body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
    return (await this.sendWithRetry(BASE_URL + path, init)) as T
  }

  private async sendWithRetry(url: string, init: RequestOptions = {}, attempt = 0): Promise<unknown> {
    await this.waitForSlot()

    const isRead = !init.method
    const headers: Record<string, string> = {
      ...init.headers,
      Authorization: `Bearer ${this.token}`,
      'Wanikani-Revision': REVISION,
    }
    const cached = isRead ? this.cache.get(url) : undefined
    if (cached?.etag) headers['If-None-Match'] = cached.etag
    if (cached?.lastModified) headers['If-Modified-Since'] = cached.lastModified

    this.recentRequestTimes.push(Temporal.Now.instant())
    const response = await this.makeHttpRequest(url, { ...init, headers })
    this.readRateLimit(response)

    if (response.status === 304 && cached) return cached.body
    if (response.status === 429 && attempt < 3) {
      const earliestRetry = Temporal.Now.instant().add(MIN_RETRY_WAIT)
      await sleepUntil(this.rateLimitResetsAt ? getLater(this.rateLimitResetsAt, earliestRetry) : earliestRetry)
      return this.sendWithRetry(url, init, attempt + 1)
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      throw new ApiError(response.status, body?.error ?? response.statusText)
    }

    const body: unknown = await response.json()
    const etag = response.headers.get('ETag')
    const lastModified = response.headers.get('Last-Modified')
    if (isRead && (etag || lastModified)) this.cache.set(url, { etag, lastModified, body })
    return body
  }

  private async waitForSlot() {
    const windowStart = Temporal.Now.instant().subtract(ONE_MINUTE)
    while (this.recentRequestTimes.length > 0 && Temporal.Instant.compare(this.recentRequestTimes[0], windowStart) <= 0) {
      this.recentRequestTimes.shift()
    }

    let waitUntil = this.rateLimitResetsAt
    if (this.recentRequestTimes.length >= LIMIT_PER_MINUTE) {
      const slotFreesAt = this.recentRequestTimes[0].add(ONE_MINUTE)
      waitUntil = waitUntil ? getLater(waitUntil, slotFreesAt) : slotFreesAt
    }
    if (waitUntil && Temporal.Instant.compare(waitUntil, Temporal.Now.instant()) > 0) await sleepUntil(waitUntil)
  }

  private readRateLimit(response: Response) {
    const remaining = response.headers.get('RateLimit-Remaining')
    const reset = response.headers.get('RateLimit-Reset')
    if (reset && (remaining === '0' || response.status === 429)) {
      // The header is in epoch seconds
      this.rateLimitResetsAt = Temporal.Instant.fromEpochMilliseconds(Number(reset) * 1000)
    }
  }
}
