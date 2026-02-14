import { describe, expect, it } from "bun:test";

import { categoryPickerEndpoint } from "../../src/endpoints/experimental/category-picker";
import { geoPickerEndpoint } from "../../src/endpoints/experimental/geo-picker";
import { experimentalTrendingArticlesEndpoint } from "../../src/endpoints/experimental/trending-articles";
import { experimentalTrendingNowEndpoint } from "../../src/endpoints/experimental/trending-now";
import { SchemaValidationError } from "../../src/errors";
import { createMockContext, fixtureJson, fixtureText } from "../helpers";

describe("experimental endpoint contracts", () => {
  it("parses trendingNow rpc payload", async () => {
    const ctx = createMockContext({
      textByEndpoint: {
        "experimental.trendingNow": await fixtureText("trending-now", "ok.txt"),
      },
    });

    const result = await experimentalTrendingNowEndpoint(ctx, {
      geo: "US",
      language: "en",
      hours: 24,
    });

    expect(result.data.items.length).toBeGreaterThan(0);
    expect(result.data.items[0]?.keyword).toBe("typescript");
  });

  it("parses trendingArticles rpc payload", async () => {
    const ctx = createMockContext({
      textByEndpoint: {
        "experimental.trendingArticles": await fixtureText(
          "trending-articles",
          "ok.txt"
        ),
      },
    });

    const result = await experimentalTrendingArticlesEndpoint(ctx, {
      articleKeys: [[1, "en", "US"]],
      articleCount: 2,
    });

    expect(result.data.articles.length).toBe(2);
  });

  it("parses geo picker data", async () => {
    const ctx = createMockContext({
      jsonByEndpoint: {
        "experimental.geoPicker": await fixtureJson("geo-picker", "ok.json"),
      },
    });

    const result = await geoPickerEndpoint(ctx);
    expect(result.data.items.children?.length).toBeGreaterThan(0);
  });

  it("parses category picker data", async () => {
    const ctx = createMockContext({
      jsonByEndpoint: {
        "experimental.categoryPicker": await fixtureJson(
          "category-picker",
          "ok.json"
        ),
      },
    });

    const result = await categoryPickerEndpoint(ctx);
    expect(result.data.items.children?.length).toBeGreaterThan(0);
  });

  it("throws schema validation error for malformed trendingNow payload", async () => {
    const malformedText =
      ')]}\'\n[["wrb.fr","i0OFE","[[\\"kw\\",null,null,[1700000000],null,null,\\"oops\\",null,1,[],null,[]]]"]]';

    const ctx = createMockContext({
      textByEndpoint: {
        "experimental.trendingNow": malformedText,
      },
    });

    await expect(
      experimentalTrendingNowEndpoint(ctx, {
        geo: "US",
        language: "en",
        hours: 24,
      })
    ).rejects.toBeInstanceOf(SchemaValidationError);
  });

  it("throws schema validation error for malformed trendingArticles payload", async () => {
    const malformedText =
      ')]}\'\n[["wrb.fr","w4opAf","[[\\"headline\\",\\"https://example.com\\",123]]"]]';

    const ctx = createMockContext({
      textByEndpoint: {
        "experimental.trendingArticles": malformedText,
      },
    });

    await expect(
      experimentalTrendingArticlesEndpoint(ctx, {
        articleKeys: [[1, "en", "US"]],
        articleCount: 1,
      })
    ).rejects.toBeInstanceOf(SchemaValidationError);
  });
});
