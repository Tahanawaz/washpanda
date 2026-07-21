export function createRateLimit({ windowMs, max, message }) {
  const attempts = new Map();
  let callsSinceCleanup = 0;

  return function rateLimit(request, response, next) {
    const now = Date.now();
    const key = request.ip || request.socket.remoteAddress || "unknown";
    const current = attempts.get(key);

    callsSinceCleanup += 1;
    if (callsSinceCleanup >= 100) {
      for (const [storedKey, value] of attempts.entries()) {
        if (value.expiresAt <= now) attempts.delete(storedKey);
      }
      callsSinceCleanup = 0;
    }

    if (!current || current.expiresAt <= now) {
      attempts.set(key, { count: 1, expiresAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      response.setHeader("Retry-After", Math.max(1, Math.ceil((current.expiresAt - now) / 1000)));
      return response.status(429).json({ success: false, message });
    }

    current.count += 1;
    next();
  };
}
