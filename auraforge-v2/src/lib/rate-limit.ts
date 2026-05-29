// Edge-safe in-memory rate limiter
// Note: resets on serverless cold starts — use Upstash Redis for persistent rate limiting

interface Entry { count: number; resetAt: number }

const store = new Map<string, Entry>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  identifier: string,
  limit = 10,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    store.set(identifier, { count: 1, resetAt })
    return { success: true, remaining: limit - 1, resetAt }
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count += 1
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}

// Cleanup stale entries every 5 min
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    // Use Array.from to avoid MapIterator TypeScript issues
    Array.from(store.keys()).forEach(key => {
      const v = store.get(key)
      if (v && now > v.resetAt) store.delete(key)
    })
  }, 300_000)
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}
