import { describe, expect, it } from "bun:test";

import { runCli } from "../../src/cli/main";
import { createMemoryIo, createMemoryStore, createMockClient } from "./helpers";

const scenarios: {
  args: string[];
  expectedMethod: string;
}[] = [
  {
    args: ["autocomplete", "typescript"],
    expectedMethod: "autocomplete",
  },
  {
    args: ["explore", "typescript", "--geo", "US"],
    expectedMethod: "explore",
  },
  {
    args: ["interest-over-time", "typescript", "--geo", "US"],
    expectedMethod: "interestOverTime",
  },
  {
    args: [
      "interest-by-region",
      "typescript",
      "--geo",
      "US",
      "--resolution",
      "REGION",
    ],
    expectedMethod: "interestByRegion",
  },
  {
    args: ["related-queries", "typescript", "--geo", "US"],
    expectedMethod: "relatedQueries",
  },
  {
    args: ["related-topics", "typescript", "--geo", "US"],
    expectedMethod: "relatedTopics",
  },
  {
    args: ["daily-trends", "--geo", "US"],
    expectedMethod: "dailyTrends",
  },
  {
    args: ["real-time-trends", "--geo", "US"],
    expectedMethod: "realTimeTrends",
  },
  {
    args: ["trending-now", "--geo", "US"],
    expectedMethod: "trendingNow",
  },
  {
    args: ["trending-articles", "--article-key", "1,en,US"],
    expectedMethod: "trendingArticles",
  },
  {
    args: ["experimental", "trending-now", "--geo", "US"],
    expectedMethod: "experimental.trendingNow",
  },
  {
    args: ["experimental", "trending-articles", "--article-key", "1,en,US"],
    expectedMethod: "experimental.trendingArticles",
  },
  {
    args: ["experimental", "geo-picker"],
    expectedMethod: "experimental.geoPicker",
  },
  {
    args: ["experimental", "category-picker"],
    expectedMethod: "experimental.categoryPicker",
  },
];

describe("cli command mapping", () => {
  it("routes every command to the expected client method", async () => {
    for (const scenario of scenarios) {
      let calledMethod = "";
      let calledInput: unknown;

      const { io, stdout } = createMemoryIo();
      const store = createMemoryStore();
      const client = createMockClient({
        onCall: async (method, input) => {
          calledMethod = method;
          calledInput = input;
          return {
            data: {
              method,
            },
          };
        },
      });

      const exitCode = await runCli({
        argv: [
          "node",
          "gtrends",
          ...scenario.args,
          "--output",
          "json",
          "--no-spinner",
        ],
        io,
        env: {},
        configStore: store,
        createClient: () => client,
      });

      expect(exitCode).toBe(0);
      expect(calledMethod).toBe(scenario.expectedMethod);
      expect(calledInput).toBeDefined();

      const payload = JSON.parse(stdout.read()) as {
        ok: boolean;
        endpoint: string;
      };

      expect(payload.ok).toBe(true);
      expect(payload.endpoint).toBe(scenario.expectedMethod);
    }
  });
});
