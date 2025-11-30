export type RetryOptions = {
  retries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  shouldRetry?: (error: unknown, attempt: number) => boolean
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    retries = 3,
    baseDelayMs = 200,
    maxDelayMs = 2000,
    shouldRetry = (error) => {
      const msg = (error as Error)?.message || ""
      return /network|fetch|timeout|ECONN|ENET|Failed to fetch/i.test(msg)
    },
  } = options

  let lastError: unknown = null
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e
      if (attempt === retries || !shouldRetry(e, attempt)) break
      const jitter = Math.random() * 0.25 + 0.75
      const delay = Math.min(maxDelayMs, Math.floor(baseDelayMs * 2 ** attempt * jitter))
      await new Promise((res) => setTimeout(res, delay))
    }
  }
  throw lastError as Error
}

