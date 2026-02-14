interface QueueItem {
  run: () => Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}

export class RateLimiter {
  private readonly maxConcurrent: number;
  private readonly minDelayMs: number;
  private running = 0;
  private nextStartAt = 0;
  private readonly queue: QueueItem[] = [];

  constructor(args: { maxConcurrent: number; minDelayMs: number }) {
    this.maxConcurrent = Math.max(1, args.maxConcurrent);
    this.minDelayMs = Math.max(0, args.minDelayMs);
  }

  schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        run: async () => task(),
        resolve: (value) => resolve(value as T),
        reject,
      });
      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent) {
      return;
    }

    const next = this.queue.shift();
    if (!next) {
      return;
    }

    const now = Date.now();
    const waitMs = Math.max(0, this.nextStartAt - now);

    this.running += 1;
    this.nextStartAt = Math.max(this.nextStartAt, now) + this.minDelayMs;

    setTimeout(async () => {
      try {
        const result = await next.run();
        next.resolve(result);
      } catch (error) {
        next.reject(error);
      } finally {
        this.running -= 1;
        this.processQueue();
      }
    }, waitMs);
  }
}
