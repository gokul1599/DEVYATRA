/**
 * Best-effort sliding-window rate limiter. In-memory only: on serverless hosts
 * this resets per instance, which is acceptable because Google caching absorbs
 * most repeated traffic. Kept honest in the admin UI as such.
 */

interface Bucket {
  windowStart: number;
  hits: number;
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, maxPerMinute: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    buckets.set(key, { windowStart: now, hits: 1 });
    return { ok: true, limit: maxPerMinute, remaining: maxPerMinute - 1, retryAfterSeconds: 0 };
  }
  bucket.hits += 1;
  const remaining = Math.max(0, maxPerMinute - bucket.hits);
  if (bucket.hits > maxPerMinute) {
    return { ok: false, limit: maxPerMinute, remaining: 0, retryAfterSeconds: Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000) };
  }
  return { ok: true, limit: maxPerMinute, remaining, retryAfterSeconds: 0 };
}

export { buckets as _buckets };