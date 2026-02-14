export interface RetryDecision {
  retryable: boolean;
  reason?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const computeDelay = (attempt: number, policy: RetryPolicy): number => {
  const exp = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
  const jitter = Math.floor(Math.random() * Math.max(1, exp * 0.2));
  return Math.min(policy.maxDelayMs, exp + jitter);
};

export const runWithRetry = async <T>(args: {
  task: () => Promise<T>;
  policy: RetryPolicy;
  shouldRetry: (error: unknown) => RetryDecision;
}): Promise<T> => {
  const { task, policy, shouldRetry } = args;

  let attempt = 0;
  for (;;) {
    try {
      return await task();
    } catch (error) {
      const decision = shouldRetry(error);
      if (!decision.retryable || attempt >= policy.maxRetries) {
        throw error;
      }

      const delay = computeDelay(attempt, policy);
      attempt += 1;
      await sleep(delay);
    }
  }
};
