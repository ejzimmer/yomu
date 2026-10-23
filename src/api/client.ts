import type { Collection, Resource, User } from './types'

const BASE_URL = 'https://api.wanikani.com/v2'
const REVISION = '20170710'
const LIMIT_PER_MINUTE = 60
const MINUTE_MS = 60_000

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ClientOptions {
  fetch?: typeof fetch
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

interface Cached {
  etag: string | null
  lastModified: string | null
  body: unknown
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

// Thin WaniKani API v2 client: bearer auth, revision header, pagination,
// a 60/min rate limiter that also honours RateLimit-* headers and 429s,
// and conditional GETs (ETag / Last-Modified) served from an in-memory cache.
export class WaniKaniClient {
  private readonly token: string
  private readonly fetchImpl: typeof fetch
  private readonly now: () => number
  private readonly sleep: (ms: number) => Promise<void>
  private readonly sent: number[] = []
  private resetAt = 0
  private readonly cache = new Map<string, Cached>()

  constructor(token: string, options: ClientOptions = {}) {
    this.token = token
    this.fetchImpl = options.fetch ?? fetch.bind(globalThis)
    this.now = options.now ?? Date.now
    this.sleep = options.sleep ?? defaultSleep
  }

  user(): Promise<Resource<User>> {
    return this.get<Resource<User>>('/user')
  }

  async get<T>(pathOrUrl: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(pathOrUrl.startsWith('http') ? pathOrUrl : BASE_URL + pathOrUrl)
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
    return (await this.request(url.toString())) as T
  }

  // Follows pages.next_url until the collection is exhausted.
  async getAll<T>(path: string, params: Record<string, string> = {}): Promise<Resource<T>[]> {
    const items: Resource<T>[] = []
    let page = await this.get<Collection<T>>(path, params)
    items.push(...page.data)
    while (page.pages.next_url) {
      page = await this.get<Collection<T>>(page.pages.next_url)
      items.push(...page.data)
    }
    return items
  }

  private async request(url: string, attempt = 0): Promise<unknown> {
    await this.waitForSlot()

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      'Wanikani-Revision': REVISION,
    }
    const cached = this.cache.get(url)
    if (cached?.etag) headers['If-None-Match'] = cached.etag
    if (cached?.lastModified) headers['If-Modified-Since'] = cached.lastModified

    this.sent.push(this.now())
    const response = await this.fetchImpl(url, { headers })
    this.readRateLimit(response)

    if (response.status === 304 && cached) return cached.body
    if (response.status === 429 && attempt < 3) {
      await this.sleep(Math.max(this.resetAt - this.now(), 1000))
      return this.request(url, attempt + 1)
    }
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null
      throw new ApiError(response.status, body?.error ?? response.statusText)
    }

    const body: unknown = await response.json()
    const etag = response.headers.get('ETag')
    const lastModified = response.headers.get('Last-Modified')
    if (etag || lastModified) this.cache.set(url, { etag, lastModified, body })
    return body
  }

  private async waitForSlot() {
    const now = this.now()
    while (this.sent.length && now - this.sent[0] >= MINUTE_MS) this.sent.shift()

    let waitUntil = 0
    if (this.sent.length >= LIMIT_PER_MINUTE) waitUntil = this.sent[0] + MINUTE_MS
    if (this.resetAt > now) waitUntil = Math.max(waitUntil, this.resetAt)
    if (waitUntil > now) await this.sleep(waitUntil - now)
  }

  private readRateLimit(response: Response) {
    const remaining = response.headers.get('RateLimit-Remaining')
    const reset = response.headers.get('RateLimit-Reset')
    if (reset && (remaining === '0' || response.status === 429)) {
      this.resetAt = Number(reset) * 1000
    }
  }
}
