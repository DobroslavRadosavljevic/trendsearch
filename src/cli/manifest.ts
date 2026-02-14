import type { z } from "zod";

import type {
  EndpointDebugOptions,
  GTrendsClient,
} from "../client/public-types";

import { pickerRequestSchema, schemas, type ArticleKey } from "../schemas";

export interface BuildRequestContext {
  positionals: unknown[];
  options: Record<string, unknown>;
}

export interface EndpointCommandDefinition {
  id: string;
  path: string[];
  summary: string;
  requestSchema: z.ZodTypeAny;
  options: CliOptionDefinition[];
  args: CliArgumentDefinition[];
  buildRequest: (ctx: BuildRequestContext) => unknown;
  invoke: (
    client: GTrendsClient,
    request: unknown,
    debug: EndpointDebugOptions
  ) => Promise<unknown>;
}

export interface CliOptionDefinition {
  key: string;
  flags: string;
  description: string;
  type: "string" | "number" | "boolean" | "string-array" | "string-array-raw";
  choices?: readonly string[];
}

export interface CliArgumentDefinition {
  label: string;
  description: string;
}

export const globalOptions: CliOptionDefinition[] = [
  {
    key: "output",
    flags: "--output <mode>",
    description: "Output mode: pretty, json, or jsonl.",
    type: "string",
    choices: ["pretty", "json", "jsonl"],
  },
  {
    key: "raw",
    flags: "--raw",
    description: "Include raw upstream payload.",
    type: "boolean",
  },
  {
    key: "spinner",
    flags: "--no-spinner",
    description: "Disable the loading spinner.",
    type: "boolean",
  },
  {
    key: "hl",
    flags: "--hl <locale>",
    description: "Override language locale.",
    type: "string",
  },
  {
    key: "tz",
    flags: "--tz <minutes>",
    description: "Override timezone offset in minutes.",
    type: "number",
  },
  {
    key: "baseUrl",
    flags: "--base-url <url>",
    description: "Override Google Trends base URL.",
    type: "string",
  },
  {
    key: "timeoutMs",
    flags: "--timeout-ms <ms>",
    description: "HTTP timeout in milliseconds.",
    type: "number",
  },
  {
    key: "maxRetries",
    flags: "--max-retries <n>",
    description: "Maximum transport retries.",
    type: "number",
  },
  {
    key: "retryBaseDelayMs",
    flags: "--retry-base-delay-ms <ms>",
    description: "Retry base delay in milliseconds.",
    type: "number",
  },
  {
    key: "retryMaxDelayMs",
    flags: "--retry-max-delay-ms <ms>",
    description: "Retry max delay in milliseconds.",
    type: "number",
  },
  {
    key: "maxConcurrent",
    flags: "--max-concurrent <n>",
    description: "Maximum concurrent HTTP requests.",
    type: "number",
  },
  {
    key: "minDelayMs",
    flags: "--min-delay-ms <ms>",
    description: "Minimum delay between requests in milliseconds.",
    type: "number",
  },
  {
    key: "userAgent",
    flags: "--user-agent <ua>",
    description: "Custom user-agent header value.",
    type: "string",
  },
  {
    key: "input",
    flags: "--input <json-or-file-or->",
    description: "Use a JSON request payload string/file/stdin.",
    type: "string",
  },
];

const exploreLikeOptions: CliOptionDefinition[] = [
  {
    key: "geo",
    flags: "--geo <geo>",
    description: "Geo code (repeatable or comma-separated).",
    type: "string-array",
  },
  {
    key: "time",
    flags: "--time <range>",
    description: "Time range (for example: today 3-m).",
    type: "string",
  },
  {
    key: "category",
    flags: "--category <id>",
    description: "Category id.",
    type: "number",
  },
  {
    key: "property",
    flags: "--property <property>",
    description: "Google property filter.",
    type: "string",
    choices: ["", "images", "news", "youtube", "froogle"],
  },
];

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .flatMap((item) =>
        item
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0)
      );
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  return [];
};

const toRawStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
};

const readNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const asRequest = <T>(value: unknown): T => value as T;

const readString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const withGeo = (values: string[]): string | string[] | undefined => {
  if (values.length === 0) {
    return undefined;
  }

  if (values.length === 1) {
    return values[0];
  }

  return values;
};

const parseArticleKey = (value: string): ArticleKey => {
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.length === 3 &&
      typeof parsed[0] === "number" &&
      typeof parsed[1] === "string" &&
      typeof parsed[2] === "string"
    ) {
      return [parsed[0], parsed[1], parsed[2]];
    }

    throw new Error(`Invalid article key JSON: ${value}`);
  }

  const parts = trimmed.split(",").map((part) => part.trim());
  if (parts.length !== 3) {
    throw new Error(`Invalid article key: ${value}`);
  }

  const index = Number(parts[0]);
  if (!Number.isFinite(index)) {
    throw new TypeError(`Invalid article key index: ${parts[0]}`);
  }

  return [index, parts[1] ?? "", parts[2] ?? ""];
};

const buildExploreLikeRequest = (ctx: BuildRequestContext): unknown => {
  const keywords = toStringArray(ctx.positionals[0]);
  return {
    keywords,
    geo: withGeo(toStringArray(ctx.options.geo)),
    time: readString(ctx.options.time),
    category: readNumber(ctx.options.category),
    property: readString(ctx.options.property),
  };
};

export const endpointManifest: EndpointCommandDefinition[] = [
  {
    id: "autocomplete",
    path: ["autocomplete"],
    summary: "Autocomplete topics by keyword.",
    requestSchema: schemas.autocompleteRequestSchema,
    options: [],
    args: [{ label: "[keyword]", description: "Keyword to autocomplete." }],
    buildRequest: (ctx) => ({
      keyword: readString(ctx.positionals[0]),
    }),
    invoke: (client, request, debug) =>
      client.autocomplete(
        asRequest<Parameters<GTrendsClient["autocomplete"]>[0]>(request),
        debug
      ),
  },
  {
    id: "explore",
    path: ["explore"],
    summary: "Fetch explore widgets.",
    requestSchema: schemas.exploreRequestSchema,
    options: exploreLikeOptions,
    args: [{ label: "[keywords...]", description: "Keyword list." }],
    buildRequest: buildExploreLikeRequest,
    invoke: (client, request, debug) =>
      client.explore(
        asRequest<Parameters<GTrendsClient["explore"]>[0]>(request),
        debug
      ),
  },
  {
    id: "interestOverTime",
    path: ["interest-over-time"],
    summary: "Fetch interest over time.",
    requestSchema: schemas.interestOverTimeRequestSchema,
    options: exploreLikeOptions,
    args: [{ label: "[keywords...]", description: "Keyword list." }],
    buildRequest: buildExploreLikeRequest,
    invoke: (client, request, debug) =>
      client.interestOverTime(
        asRequest<Parameters<GTrendsClient["interestOverTime"]>[0]>(request),
        debug
      ),
  },
  {
    id: "interestByRegion",
    path: ["interest-by-region"],
    summary: "Fetch interest by region.",
    requestSchema: schemas.interestByRegionRequestSchema,
    options: [
      ...exploreLikeOptions,
      {
        key: "resolution",
        flags: "--resolution <resolution>",
        description: "Geo resolution (COUNTRY, REGION, CITY, DMA).",
        type: "string",
        choices: ["COUNTRY", "REGION", "CITY", "DMA"],
      },
    ],
    args: [{ label: "[keywords...]", description: "Keyword list." }],
    buildRequest: (ctx) => ({
      ...(buildExploreLikeRequest(ctx) as Record<string, unknown>),
      resolution: readString(ctx.options.resolution),
    }),
    invoke: (client, request, debug) =>
      client.interestByRegion(
        asRequest<Parameters<GTrendsClient["interestByRegion"]>[0]>(request),
        debug
      ),
  },
  {
    id: "relatedQueries",
    path: ["related-queries"],
    summary: "Fetch related queries.",
    requestSchema: schemas.relatedQueriesRequestSchema,
    options: exploreLikeOptions,
    args: [{ label: "[keywords...]", description: "Keyword list." }],
    buildRequest: buildExploreLikeRequest,
    invoke: (client, request, debug) =>
      client.relatedQueries(
        asRequest<Parameters<GTrendsClient["relatedQueries"]>[0]>(request),
        debug
      ),
  },
  {
    id: "relatedTopics",
    path: ["related-topics"],
    summary: "Fetch related topics.",
    requestSchema: schemas.relatedTopicsRequestSchema,
    options: exploreLikeOptions,
    args: [{ label: "[keywords...]", description: "Keyword list." }],
    buildRequest: buildExploreLikeRequest,
    invoke: (client, request, debug) =>
      client.relatedTopics(
        asRequest<Parameters<GTrendsClient["relatedTopics"]>[0]>(request),
        debug
      ),
  },
  {
    id: "dailyTrends",
    path: ["daily-trends"],
    summary: "Fetch daily trends (legacy-compatible endpoint).",
    requestSchema: schemas.dailyTrendsRequestSchema,
    options: [
      {
        key: "geo",
        flags: "--geo <geo>",
        description: "Geo code.",
        type: "string",
      },
      {
        key: "category",
        flags: "--category <category>",
        description: "Category id or name.",
        type: "string",
      },
      {
        key: "date",
        flags: "--date <iso-date>",
        description: "ISO date.",
        type: "string",
      },
      {
        key: "ns",
        flags: "--ns <ns>",
        description: "Namespace id.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      geo: readString(ctx.options.geo),
      category: readString(ctx.options.category),
      date: readString(ctx.options.date),
      ns: readNumber(ctx.options.ns),
    }),
    invoke: (client, request, debug) =>
      client.dailyTrends(
        asRequest<Parameters<GTrendsClient["dailyTrends"]>[0]>(request),
        debug
      ),
  },
  {
    id: "realTimeTrends",
    path: ["real-time-trends"],
    summary: "Fetch realtime trends (legacy-compatible endpoint).",
    requestSchema: schemas.realTimeTrendsRequestSchema,
    options: [
      {
        key: "geo",
        flags: "--geo <geo>",
        description: "Geo code.",
        type: "string",
      },
      {
        key: "category",
        flags: "--category <category>",
        description: "Category id or name.",
        type: "string",
      },
      {
        key: "fi",
        flags: "--fi <number>",
        description: "FI parameter.",
        type: "number",
      },
      {
        key: "fs",
        flags: "--fs <number>",
        description: "FS parameter.",
        type: "number",
      },
      {
        key: "ri",
        flags: "--ri <number>",
        description: "RI parameter.",
        type: "number",
      },
      {
        key: "rs",
        flags: "--rs <number>",
        description: "RS parameter.",
        type: "number",
      },
      {
        key: "sort",
        flags: "--sort <number>",
        description: "Sort mode.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      geo: readString(ctx.options.geo),
      category: readString(ctx.options.category),
      fi: readNumber(ctx.options.fi),
      fs: readNumber(ctx.options.fs),
      ri: readNumber(ctx.options.ri),
      rs: readNumber(ctx.options.rs),
      sort: readNumber(ctx.options.sort),
    }),
    invoke: (client, request, debug) =>
      client.realTimeTrends(
        asRequest<Parameters<GTrendsClient["realTimeTrends"]>[0]>(request),
        debug
      ),
  },
  {
    id: "trendingNow",
    path: ["trending-now"],
    summary: "Fetch trending now topics.",
    requestSchema: schemas.trendingNowRequestSchema,
    options: [
      {
        key: "geo",
        flags: "--geo <geo>",
        description: "Geo code.",
        type: "string",
      },
      {
        key: "language",
        flags: "--language <language>",
        description: "Language code.",
        type: "string",
      },
      {
        key: "hours",
        flags: "--hours <hours>",
        description: "Window in hours.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      geo: readString(ctx.options.geo),
      language: readString(ctx.options.language),
      hours: readNumber(ctx.options.hours),
    }),
    invoke: (client, request, debug) =>
      client.trendingNow(
        asRequest<Parameters<GTrendsClient["trendingNow"]>[0]>(request),
        debug
      ),
  },
  {
    id: "trendingArticles",
    path: ["trending-articles"],
    summary: "Fetch trending articles from article keys.",
    requestSchema: schemas.trendingArticlesRequestSchema,
    options: [
      {
        key: "articleKey",
        flags: "--article-key <key>",
        description: "Article key tuple (repeatable).",
        type: "string-array-raw",
      },
      {
        key: "articleCount",
        flags: "--article-count <count>",
        description: "Maximum article count.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      articleKeys: toRawStringArray(ctx.options.articleKey).map(
        parseArticleKey
      ),
      articleCount: readNumber(ctx.options.articleCount),
    }),
    invoke: (client, request, debug) =>
      client.trendingArticles(
        asRequest<Parameters<GTrendsClient["trendingArticles"]>[0]>(request),
        debug
      ),
  },
  {
    id: "experimental.trendingNow",
    path: ["experimental", "trending-now"],
    summary: "Fetch experimental trending now topics.",
    requestSchema: schemas.trendingNowRequestSchema,
    options: [
      {
        key: "geo",
        flags: "--geo <geo>",
        description: "Geo code.",
        type: "string",
      },
      {
        key: "language",
        flags: "--language <language>",
        description: "Language code.",
        type: "string",
      },
      {
        key: "hours",
        flags: "--hours <hours>",
        description: "Window in hours.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      geo: readString(ctx.options.geo),
      language: readString(ctx.options.language),
      hours: readNumber(ctx.options.hours),
    }),
    invoke: (client, request, debug) =>
      client.experimental.trendingNow(
        asRequest<Parameters<GTrendsClient["experimental"]["trendingNow"]>[0]>(
          request
        ),
        debug
      ),
  },
  {
    id: "experimental.trendingArticles",
    path: ["experimental", "trending-articles"],
    summary: "Fetch experimental trending articles.",
    requestSchema: schemas.trendingArticlesRequestSchema,
    options: [
      {
        key: "articleKey",
        flags: "--article-key <key>",
        description: "Article key tuple (repeatable).",
        type: "string-array-raw",
      },
      {
        key: "articleCount",
        flags: "--article-count <count>",
        description: "Maximum article count.",
        type: "number",
      },
    ],
    args: [],
    buildRequest: (ctx) => ({
      articleKeys: toRawStringArray(ctx.options.articleKey).map(
        parseArticleKey
      ),
      articleCount: readNumber(ctx.options.articleCount),
    }),
    invoke: (client, request, debug) =>
      client.experimental.trendingArticles(
        asRequest<
          Parameters<GTrendsClient["experimental"]["trendingArticles"]>[0]
        >(request),
        debug
      ),
  },
  {
    id: "experimental.geoPicker",
    path: ["experimental", "geo-picker"],
    summary: "Fetch experimental geo picker.",
    requestSchema: pickerRequestSchema,
    options: [],
    args: [],
    buildRequest: () => ({}),
    invoke: (client, request, debug) =>
      client.experimental.geoPicker(
        asRequest<Parameters<GTrendsClient["experimental"]["geoPicker"]>[0]>(
          request
        ),
        debug
      ),
  },
  {
    id: "experimental.categoryPicker",
    path: ["experimental", "category-picker"],
    summary: "Fetch experimental category picker.",
    requestSchema: pickerRequestSchema,
    options: [],
    args: [],
    buildRequest: () => ({}),
    invoke: (client, request, debug) =>
      client.experimental.categoryPicker(
        asRequest<
          Parameters<GTrendsClient["experimental"]["categoryPicker"]>[0]
        >(request),
        debug
      ),
  },
];

export const platformCommandPaths: string[][] = [
  ["config", "get"],
  ["config", "set"],
  ["config", "unset"],
  ["config", "list"],
  ["config", "reset"],
  ["wizard"],
  ["completion"],
  ["__complete"],
];

export const commandPathsForCompletion = (): string[][] => [
  ...endpointManifest.map((item) => item.path),
  ...platformCommandPaths,
];

export const findEndpointDefinitionByPath = (
  path: string[]
): EndpointCommandDefinition | undefined =>
  endpointManifest.find(
    (item) =>
      item.path.length === path.length &&
      item.path.every((segment, index) => segment === path[index])
  );
