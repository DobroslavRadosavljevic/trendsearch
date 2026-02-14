import pRetry from "p-retry";

export interface RetryDecision {
  retryable: boolean;
  reason?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const runWithRetry = async <T>(args: {
  task: () => Promise<T>;
  policy: RetryPolicy;
  shouldRetry: (error: unknown) => RetryDecision;
}): Promise<T> => {
  const { task, policy, shouldRetry } = args;

  const retries = Math.max(0, policy.maxRetries);
  const minTimeout = Math.max(0, policy.baseDelayMs);
  const maxTimeout = Math.max(minTimeout, policy.maxDelayMs);

  return pRetry(task, {
    retries,
    minTimeout,
    maxTimeout,
    factor: 2,
    randomize: true,
    shouldRetry: ({ error }) => shouldRetry(error).retryable,
  });
};
