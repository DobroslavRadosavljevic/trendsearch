import type { CliConfigStore } from "../../src/cli/config";
import type { CliIo, WritableLike } from "../../src/cli/output";
import type { GTrendsClient } from "../../src/client/public-types";

export interface MemoryWritable extends WritableLike {
  read: () => string;
  clear: () => void;
}

export const createMemoryWritable = (isTTY = false): MemoryWritable => {
  let buffer = "";

  return {
    isTTY,
    write(chunk: string) {
      buffer += chunk;
      return true;
    },
    read() {
      return buffer;
    },
    clear() {
      buffer = "";
    },
  };
};

export const createMemoryIo = (args?: {
  stdoutIsTTY?: boolean;
  stderrIsTTY?: boolean;
}): {
  io: CliIo;
  stdout: MemoryWritable;
  stderr: MemoryWritable;
} => {
  const stdout = createMemoryWritable(args?.stdoutIsTTY ?? false);
  const stderr = createMemoryWritable(args?.stderrIsTTY ?? false);

  return {
    io: {
      stdout,
      stderr,
    },
    stdout,
    stderr,
  };
};

export const createMemoryStore = (
  initial: Record<string, unknown> = {}
): CliConfigStore => {
  const store = new Map<string, unknown>(Object.entries(initial));

  return {
    all: () => Object.fromEntries(store.entries()),
    get: (key) => store.get(key),
    set: (key, value) => {
      store.set(key, value);
    },
    delete: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

export const createMockClient = (args: {
  onCall: (name: string, input: unknown) => Promise<unknown>;
}): GTrendsClient => {
  const call =
    (name: string) =>
    async (input: unknown): Promise<unknown> =>
      args.onCall(name, input);

  return {
    autocomplete: call("autocomplete") as GTrendsClient["autocomplete"],
    explore: call("explore") as GTrendsClient["explore"],
    interestOverTime: call(
      "interestOverTime"
    ) as GTrendsClient["interestOverTime"],
    interestByRegion: call(
      "interestByRegion"
    ) as GTrendsClient["interestByRegion"],
    relatedQueries: call("relatedQueries") as GTrendsClient["relatedQueries"],
    relatedTopics: call("relatedTopics") as GTrendsClient["relatedTopics"],
    dailyTrends: call("dailyTrends") as GTrendsClient["dailyTrends"],
    realTimeTrends: call("realTimeTrends") as GTrendsClient["realTimeTrends"],
    trendingNow: call("trendingNow") as GTrendsClient["trendingNow"],
    trendingArticles: call(
      "trendingArticles"
    ) as GTrendsClient["trendingArticles"],
    experimental: {
      trendingNow: call(
        "experimental.trendingNow"
      ) as GTrendsClient["experimental"]["trendingNow"],
      trendingArticles: call(
        "experimental.trendingArticles"
      ) as GTrendsClient["experimental"]["trendingArticles"],
      geoPicker: call(
        "experimental.geoPicker"
      ) as GTrendsClient["experimental"]["geoPicker"],
      categoryPicker: call(
        "experimental.categoryPicker"
      ) as GTrendsClient["experimental"]["categoryPicker"],
    },
  };
};
