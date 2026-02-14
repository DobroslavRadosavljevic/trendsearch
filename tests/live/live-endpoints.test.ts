import { describe, expect, it } from "bun:test";

import {
  EndpointUnavailableError,
  RateLimitError,
  createClient,
} from "../../src";

const runLive = process.env.GTRENDS_LIVE === "1";
const describeLive = runLive ? describe : describe.skip;

const expectDefined = <T>(value: T | undefined, message: string): T => {
  if (value === undefined) {
    throw new Error(message);
  }
  return value;
};

const withRateLimitRetry = async <T>(
  task: () => Promise<T>,
  attempts = 4
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (!(error instanceof RateLimitError) || attempt === attempts - 1) {
        throw error;
      }
      await Bun.sleep(2500 * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
};

describeLive("live endpoints", () => {
  const client = createClient({
    rateLimit: {
      maxConcurrent: 1,
      minDelayMs: 1000,
    },
    retries: {
      maxRetries: 2,
      baseDelayMs: 750,
      maxDelayMs: 4000,
    },
  });

  it("covers stable + experimental endpoint matrix", async () => {
    const autocomplete = await withRateLimitRetry(() =>
      client.autocomplete({ keyword: "typescript" })
    );
    expect(autocomplete.data.topics.length).toBeGreaterThan(0);

    const explore = await withRateLimitRetry(() =>
      client.explore({
        keywords: ["typescript"],
        geo: "US",
        time: "today 3-m",
      })
    );
    expect(explore.data.widgets.length).toBeGreaterThan(0);

    const interestOverTime = await withRateLimitRetry(() =>
      client.interestOverTime({
        keywords: ["typescript"],
        geo: "US",
        time: "today 3-m",
      })
    );
    expect(interestOverTime.data.timeline.length).toBeGreaterThan(0);

    const byRegion = await withRateLimitRetry(() =>
      client.interestByRegion({
        keywords: ["typescript"],
        geo: "US",
        resolution: "REGION",
      })
    );
    expect(byRegion.data.regions.length).toBeGreaterThan(0);

    const relatedQueries = await withRateLimitRetry(() =>
      client.relatedQueries({
        keywords: ["typescript"],
        geo: "US",
        time: "today 3-m",
      })
    );
    expect(relatedQueries.data.top.length).toBeGreaterThan(0);
    expect(relatedQueries.data.rising.length).toBeGreaterThan(0);

    const relatedTopics = await withRateLimitRetry(() =>
      client.relatedTopics({
        keywords: ["typescript"],
        geo: "US",
        time: "today 3-m",
      })
    );
    expect(relatedTopics.data.top.length).toBeGreaterThan(0);
    expect(relatedTopics.data.rising.length).toBeGreaterThan(0);

    const trendingNow = await withRateLimitRetry(() =>
      client.trendingNow({
        geo: "US",
        language: "en",
        hours: 24,
      })
    );
    expect(trendingNow.data.items.length).toBeGreaterThan(0);

    const [stableFirstItem] = trendingNow.data.items;
    const stableItem = expectDefined(
      stableFirstItem,
      "Expected stable trendingNow to return at least one item."
    );
    expect(stableItem.articleKeys.length).toBeGreaterThan(0);

    const trendingArticles = await withRateLimitRetry(() =>
      client.trendingArticles({
        articleKeys: stableItem.articleKeys.slice(0, 1),
        articleCount: 2,
      })
    );
    expect(trendingArticles.data.articles.length).toBeGreaterThan(0);

    const aliasNow = await withRateLimitRetry(() =>
      client.experimental.trendingNow({
        geo: "US",
        language: "en",
        hours: 24,
      })
    );
    expect(aliasNow.data.items.length).toBeGreaterThan(0);

    const [experimentalFirstItem] = aliasNow.data.items;
    const experimentalItem = expectDefined(
      experimentalFirstItem,
      "Expected experimental trendingNow to return at least one item."
    );
    expect(experimentalItem.articleKeys.length).toBeGreaterThan(0);

    const aliasArticles = await withRateLimitRetry(() =>
      client.experimental.trendingArticles({
        articleKeys: experimentalItem.articleKeys.slice(0, 1),
        articleCount: 2,
      })
    );
    expect(aliasArticles.data.articles.length).toBeGreaterThan(0);

    const geoPicker = await withRateLimitRetry(() =>
      client.experimental.geoPicker({ hl: "en-US" })
    );
    const geoChildren = expectDefined(
      geoPicker.data.items.children,
      "Expected geo picker children."
    );
    expect(geoChildren.length).toBeGreaterThan(0);

    const categoryPicker = await withRateLimitRetry(() =>
      client.experimental.categoryPicker({
        hl: "en-US",
      })
    );
    const categoryChildren = expectDefined(
      categoryPicker.data.items.children,
      "Expected category picker children."
    );
    expect(categoryChildren.length).toBeGreaterThan(0);

    try {
      const daily = await withRateLimitRetry(() =>
        client.dailyTrends({ geo: "US" })
      );
      expect(daily.data.days.length).toBeGreaterThan(0);
      expect(daily.data.trends.length).toBeGreaterThan(0);
    } catch (error) {
      expect(error).toBeInstanceOf(EndpointUnavailableError);
    }

    try {
      const realtime = await withRateLimitRetry(() =>
        client.realTimeTrends({ geo: "US" })
      );
      expect(realtime.data.stories.length).toBeGreaterThan(0);
    } catch (error) {
      expect(error).toBeInstanceOf(EndpointUnavailableError);
    }
  }, 180_000);
});
