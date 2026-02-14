import type {
  CategoryPickerResponse,
  DailyTrendsResponse,
  ExploreWidget,
  GeoPickerResponse,
  GeoMapData,
  InterestOverTimePoint,
  RelatedQueryItem,
  RelatedTopicItem,
  Topic,
  TrendingArticleItem,
  TrendingNowItem,
} from "../schemas";

export interface RetryConfig {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

export interface RateLimitConfig {
  maxConcurrent?: number;
  minDelayMs?: number;
}

export interface CookieStore {
  getCookieHeader(url: string): Promise<string | undefined>;
  setCookieHeaders(url: string, setCookieHeaders: string[]): Promise<void>;
}

export interface ProxyHookInput {
  url: string;
  init: RequestInit;
}

export interface ProxyHookOutput {
  url?: string;
  init?: RequestInit;
}

export type ProxyHook = (
  input: ProxyHookInput
) => ProxyHookOutput | Promise<ProxyHookOutput>;

export interface CreateClientConfig {
  fetch?: typeof globalThis.fetch;
  timeoutMs?: number;
  baseUrl?: string;
  hl?: string;
  tz?: number;
  retries?: RetryConfig;
  rateLimit?: RateLimitConfig;
  userAgent?: string;
  cookieStore?: CookieStore;
  proxyHook?: ProxyHook;
}

export interface EndpointDebugOptions {
  debugRawResponse?: boolean;
}

export interface EndpointOutput<TData, TRaw = unknown> {
  data: TData;
  raw?: TRaw;
}

export interface GTrendsClient {
  autocomplete: (
    input: { keyword: string; hl?: string; tz?: number },
    options?: EndpointDebugOptions
  ) => Promise<EndpointOutput<{ topics: Topic[] }>>;
  explore: (
    input: {
      keywords: string[];
      geo?: string | string[];
      time?: string;
      category?: number;
      property?: "" | "images" | "news" | "youtube" | "froogle";
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<
    EndpointOutput<{
      widgets: ExploreWidget[];
      comparisonItem: { keyword: string; geo?: string; time: string }[];
    }>
  >;
  interestOverTime: (
    input: {
      keywords: string[];
      geo?: string | string[];
      time?: string;
      category?: number;
      property?: "" | "images" | "news" | "youtube" | "froogle";
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<EndpointOutput<{ timeline: InterestOverTimePoint[] }>>;
  interestByRegion: (
    input: {
      keywords: string[];
      geo?: string | string[];
      time?: string;
      category?: number;
      property?: "" | "images" | "news" | "youtube" | "froogle";
      resolution?: "COUNTRY" | "REGION" | "CITY" | "DMA";
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<EndpointOutput<{ regions: GeoMapData[] }>>;
  relatedQueries: (
    input: {
      keywords: string[];
      geo?: string | string[];
      time?: string;
      category?: number;
      property?: "" | "images" | "news" | "youtube" | "froogle";
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<
    EndpointOutput<{ top: RelatedQueryItem[]; rising: RelatedQueryItem[] }>
  >;
  relatedTopics: (
    input: {
      keywords: string[];
      geo?: string | string[];
      time?: string;
      category?: number;
      property?: "" | "images" | "news" | "youtube" | "froogle";
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<
    EndpointOutput<{ top: RelatedTopicItem[]; rising: RelatedTopicItem[] }>
  >;
  dailyTrends: (
    input: {
      geo: string;
      category?: string | number;
      date?: string | Date;
      ns?: number;
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<
    EndpointOutput<{
      days: DailyTrendsResponse["default"]["trendingSearchesDays"];
      trends: DailyTrendsResponse["default"]["trendingSearchesDays"][number]["trendingSearches"];
    }>
  >;
  realTimeTrends: (
    input: {
      geo: string;
      category?: string | number;
      fi?: number;
      fs?: number;
      ri?: number;
      rs?: number;
      sort?: number;
      hl?: string;
      tz?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<
    EndpointOutput<{
      stories: Record<string, unknown>[];
    }>
  >;
  trendingNow: (
    input: { geo?: string; language?: string; hours?: 4 | 24 | 48 | 168 },
    options?: EndpointDebugOptions
  ) => Promise<EndpointOutput<{ items: TrendingNowItem[] }>>;
  trendingArticles: (
    input: {
      articleKeys: [number, string, string][];
      articleCount?: number;
    },
    options?: EndpointDebugOptions
  ) => Promise<EndpointOutput<{ articles: TrendingArticleItem[] }>>;
  experimental: {
    trendingNow: (
      input: { geo?: string; language?: string; hours?: 4 | 24 | 48 | 168 },
      options?: EndpointDebugOptions
    ) => Promise<EndpointOutput<{ items: TrendingNowItem[] }>>;
    trendingArticles: (
      input: {
        articleKeys: [number, string, string][];
        articleCount?: number;
      },
      options?: EndpointDebugOptions
    ) => Promise<EndpointOutput<{ articles: TrendingArticleItem[] }>>;
    geoPicker: (
      input?: { hl?: string },
      options?: EndpointDebugOptions
    ) => Promise<EndpointOutput<{ items: GeoPickerResponse }>>;
    categoryPicker: (
      input?: { hl?: string },
      options?: EndpointDebugOptions
    ) => Promise<EndpointOutput<{ items: CategoryPickerResponse }>>;
  };
}

export interface RequestConfig {
  endpoint: string;
  path: string;
  method?: "GET" | "POST";
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  body?: string;
  stripGooglePrefix?: boolean;
}
