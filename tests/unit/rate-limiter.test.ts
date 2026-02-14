import { describe, expect, it } from "bun:test";

import { RateLimiter } from "../../src/core/resilience/rate-limiter";

describe("RateLimiter", () => {
  it("limits concurrent tasks", async () => {
    const limiter = new RateLimiter({ maxConcurrent: 1, minDelayMs: 0 });
    const order: number[] = [];

    await Promise.all([
      limiter.schedule(async () => {
        order.push(1);
        await Bun.sleep(10);
        order.push(2);
      }),
      limiter.schedule(async () => {
        order.push(3);
      }),
    ]);

    expect(order).toEqual([1, 2, 3]);
  });
});
