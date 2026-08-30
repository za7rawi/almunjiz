interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

interface RequestEntry {
  count: number;
  expiresAt: number;
}

class RateLimiter {
  private windowMs: number;
  private max: number;
  private store = new Map<string, RequestEntry>();

  constructor(windowMs: number, max: number) {
    this.windowMs = windowMs;
    this.max = max;
  }

  check(key: string): RateLimitResult {
    this.cleanup();
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.expiresAt) {
      this.store.set(key, { count: 1, expiresAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1, resetMs: this.windowMs };
    }

    if (entry.count >= this.max) {
      return {
        allowed: false,
        remaining: 0,
        resetMs: entry.expiresAt - now,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: this.max - entry.count,
      resetMs: entry.expiresAt - now,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  destroy() {
    this.store.clear();
  }
}

function createRateLimiter(windowMs: number, max: number) {
  const limiter = new RateLimiter(windowMs, max);
  return (key: string) => limiter.check(key);
}

const authLimiter = createRateLimiter(15 * 60 * 1000, 5);
const otpLimiter = createRateLimiter(10 * 60 * 1000, 3);
const apiLimiter = createRateLimiter(60 * 1000, 60);
const uploadLimiter = createRateLimiter(60 * 1000, 10);
const contactLimiter = createRateLimiter(10 * 60 * 1000, 5);
const trackLimiter = createRateLimiter(60 * 1000, 30);
const couponLimiter = createRateLimiter(60 * 1000, 10);

class WebhookEventStore {
  private store = new Map<string, number>();
  private readonly maxAgeMs = 5 * 60 * 1000;

  seen(eventId: string): boolean {
    this.cleanup();
    if (this.store.has(eventId)) return true;
    this.store.set(eventId, Date.now());
    return false;
  }

  private cleanup() {
    const now = Date.now();
    for (const [id, ts] of this.store) {
      if (now - ts > this.maxAgeMs) this.store.delete(id);
    }
  }
}

const webhookEvents = new WebhookEventStore();

export {
  RateLimiter,
  createRateLimiter,
  authLimiter,
  otpLimiter,
  apiLimiter,
  uploadLimiter,
  contactLimiter,
  trackLimiter,
  couponLimiter,
  webhookEvents,
};
export type { RateLimitResult };
