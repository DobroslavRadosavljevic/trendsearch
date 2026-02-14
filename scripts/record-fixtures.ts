import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { EndpointUnavailableError, createClient } from "../src";

const root = resolve(import.meta.dir, "..");
const fixturesRoot = join(root, "tests", "fixtures", "raw");
const throttleMs = 1000;

const pause = async (): Promise<void> => {
  await Bun.sleep(throttleMs);
};

const writeJson = async (
  relativePath: string,
  data: unknown
): Promise<void> => {
  const filepath = join(fixturesRoot, relativePath);
  await mkdir(dirname(filepath), { recursive: true });
  await Bun.write(filepath, `${JSON.stringify(data, null, 2)}\n`);
};

const writeText = async (relativePath: string, data: string): Promise<void> => {
  const filepath = join(fixturesRoot, relativePath);
  await mkdir(dirname(filepath), { recursive: true });
  await Bun.write(filepath, data);
};

const fetchRpcText = async (args: {
  rpcId: "i0OFE" | "w4opAf";
  payload: string;
}): Promise<string> => {
  const fReq = JSON.stringify([[[args.rpcId, args.payload, null, "generic"]]]);

  const response = await fetch(
    "https://trends.google.com/_/TrendsUi/data/batchexecute",
    {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({ "f.req": fReq }).toString(),
    }
  );

  return response.text();
};

const main = async (): Promise<void> => {
  const client = createClient({
    rateLimit: { maxConcurrent: 1, minDelayMs: throttleMs },
    retries: { maxRetries: 2, baseDelayMs: 750, maxDelayMs: 4000 },
  });

  const autocomplete = await client.autocomplete(
    { keyword: "typescript" },
    { debugRawResponse: true }
  );
  await writeJson("autocomplete/ok.json", autocomplete.raw);
  await pause();

  const explore = await client.explore(
    { keywords: ["typescript"], geo: "US" },
    { debugRawResponse: true }
  );
  await writeJson("explore/ok.json", explore.raw);
  await pause();

  const interestOverTime = await client.interestOverTime(
    { keywords: ["typescript"], geo: "US" },
    { debugRawResponse: true }
  );
  await writeJson("interest-over-time/ok.json", interestOverTime.raw);
  await pause();

  const interestByRegion = await client.interestByRegion(
    { keywords: ["typescript"], geo: "US" },
    { debugRawResponse: true }
  );
  await writeJson("interest-by-region/ok.json", interestByRegion.raw);
  await pause();

  const relatedQueries = await client.relatedQueries(
    { keywords: ["typescript"], geo: "US" },
    { debugRawResponse: true }
  );
  await writeJson("related-queries/ok.json", relatedQueries.raw);
  await pause();

  const relatedTopics = await client.relatedTopics(
    { keywords: ["typescript"], geo: "US" },
    { debugRawResponse: true }
  );
  await writeJson("related-topics/ok.json", relatedTopics.raw);
  await pause();

  try {
    const dailyTrends = await client.dailyTrends(
      { geo: "US" },
      { debugRawResponse: true }
    );
    await writeJson("daily-trends/ok.json", dailyTrends.raw);
    await pause();
  } catch (error) {
    if (error instanceof EndpointUnavailableError) {
      console.warn("Skipping daily-trends fixture: endpoint unavailable.");
    } else {
      throw error;
    }
  }

  try {
    const realTimeTrends = await client.realTimeTrends(
      { geo: "US" },
      { debugRawResponse: true }
    );
    await writeJson("real-time-trends/ok.json", realTimeTrends.raw);
    await pause();
  } catch (error) {
    if (error instanceof EndpointUnavailableError) {
      console.warn("Skipping real-time-trends fixture: endpoint unavailable.");
    } else {
      throw error;
    }
  }

  const geoPicker = await client.experimental.geoPicker(
    {},
    { debugRawResponse: true }
  );
  await writeJson("geo-picker/ok.json", geoPicker.raw);
  await pause();

  const categoryPicker = await client.experimental.categoryPicker(
    {},
    { debugRawResponse: true }
  );
  await writeJson("category-picker/ok.json", categoryPicker.raw);
  await pause();

  const trendingNowText = await fetchRpcText({
    rpcId: "i0OFE",
    payload: '[null,null,"US",0,"en",24,1]',
  });
  await writeText("trending-now/ok.txt", trendingNowText);
  await pause();

  const trendingNow = await client.trendingNow(
    { geo: "US", language: "en", hours: 24 },
    { debugRawResponse: true }
  );
  const articleKeys = trendingNow.data.items[0]?.articleKeys ?? [];
  if (articleKeys.length > 0) {
    const serializedKeys = articleKeys
      .slice(0, 1)
      .map((key) => `[${key[0]},"${key[1]}","${key[2]}"]`)
      .join(",");

    const trendingArticlesText = await fetchRpcText({
      rpcId: "w4opAf",
      payload: `[[${serializedKeys}],2]`,
    });
    await writeText("trending-articles/ok.txt", trendingArticlesText);
  }

  console.log("Fixture recording completed.");
};

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
