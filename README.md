# gtrends 📈

Modern Google Trends SDK for Node.js and Bun, built with native `fetch`, strict Zod validation, and a production-friendly client API.

## ✨ Highlights

- 🔒 Strict schema validation by default (Zod-backed)
- 🧠 Full TypeScript-first API and exported inferred types
- ⚡ Native `fetch` transport (Node 20+ and Bun)
- 🧱 ESM-only package contract
- 🛡️ Built-in retry/backoff + rate limiting
- 🍪 Optional cookie persistence support
- 🌐 Stable Google Trends API endpoints + experimental RPC/picker endpoints
- 🧪 Deterministic fixture contracts + optional live endpoint tests

## 📦 Install

```bash
bun add gtrends
# or
npm install gtrends
```

## ✅ Runtime Contract

- 🟢 Node.js `>=20`
- 🟢 Bun `>=1.3.9`
- 🟢 ESM-only package
- 🔴 CommonJS `require("gtrends")` is intentionally unsupported

If you are in a CJS project, use dynamic import:

```js
const gtrends = await import("gtrends");
```

## 🚀 Quick Start

```ts
import { interestOverTime } from "gtrends";

const result = await interestOverTime({
  keywords: ["typescript"],
  geo: "US",
  time: "today 3-m",
});

console.log(result.data.timeline.length);
```

## 🧭 API Surface

### Stable Endpoints

- `autocomplete`
- `explore`
- `interestOverTime`
- `interestByRegion`
- `relatedQueries`
- `relatedTopics`
- `trendingNow`
- `trendingArticles`
- `dailyTrends` (legacy compatibility)
- `realTimeTrends` (legacy compatibility)

### Experimental Endpoints

- `experimental.trendingNow`
- `experimental.trendingArticles`
- `experimental.geoPicker`
- `experimental.categoryPicker`

⚠️ Experimental endpoints are semver-minor unstable because Google can change internal RPC payloads.

ℹ️ `dailyTrends` and `realTimeTrends` are kept for compatibility and may throw `EndpointUnavailableError` if Google retires those legacy routes.

## 🧰 Client Configuration

Use `createClient` when you want shared runtime defaults and transport controls:

```ts
import { MemoryCookieStore, createClient } from "gtrends";

const client = createClient({
  timeoutMs: 15_000,
  baseUrl: "https://trends.google.com",
  hl: "en-US",
  tz: 240,
  retries: {
    maxRetries: 3,
    baseDelayMs: 500,
    maxDelayMs: 8_000,
  },
  rateLimit: {
    maxConcurrent: 1,
    minDelayMs: 1_000,
  },
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
  cookieStore: new MemoryCookieStore(),
  proxyHook: async ({ url, init }) => ({ url, init }),
});
```

### Default Client Values

- `timeoutMs`: `15000`
- `baseUrl`: `https://trends.google.com`
- `hl`: `en-US`
- `tz`: host timezone offset (`new Date().getTimezoneOffset()`)
- `retries.maxRetries`: `3`
- `retries.baseDelayMs`: `500`
- `retries.maxDelayMs`: `8000`
- `rateLimit.maxConcurrent`: `1`
- `rateLimit.minDelayMs`: `1000`

## 🧪 Request/Response Pattern

All endpoint calls return:

```ts
{
  data: ..., // normalized typed payload
  raw?: ...  // included only when debugRawResponse=true
}
```

Enable raw payload diagnostics per request:

```ts
const result = await client.explore(
  { keywords: ["typescript"], geo: "US" },
  { debugRawResponse: true }
);

console.log(result.raw);
```

## 📚 Endpoint Usage

### `autocomplete`

```ts
import { autocomplete } from "gtrends";

const result = await autocomplete({ keyword: "typescri" });
console.log(result.data.topics);
```

Input:

- `keyword` (required)
- `hl`, `tz` (optional)

Output:

- `data.topics`: topic list (`mid`, `title`, `type`)

### `explore`

```ts
import { explore } from "gtrends";

const result = await explore({
  keywords: ["typescript", "javascript"],
  geo: "US",
  time: "today 12-m",
  category: 0,
  property: "",
});

console.log(result.data.widgets);
```

Input:

- `keywords` (required, array)
- `geo` (string or string[])
- `time`, `category`, `property`, `hl`, `tz`

Output:

- `data.widgets`: exploration widgets
- `data.comparisonItem`: normalized comparison items used in `req`

### `interestOverTime`

```ts
import { interestOverTime } from "gtrends";

const result = await interestOverTime({
  keywords: ["typescript"],
  geo: "US",
  time: "today 3-m",
});

console.log(result.data.timeline);
```

Output:

- `data.timeline`: timeline points (`time`, `value`, `formattedTime`, `isPartial`, ...)

### `interestByRegion`

```ts
import { interestByRegion } from "gtrends";

const result = await interestByRegion({
  keywords: ["typescript"],
  geo: "US",
  resolution: "REGION",
});

console.log(result.data.regions);
```

Output:

- `data.regions`: geo map entries (`geoCode`, `geoName`, `value`, ...)

### `relatedQueries`

```ts
import { relatedQueries } from "gtrends";

const result = await relatedQueries({
  keywords: ["typescript"],
  geo: "US",
});

console.log(result.data.top);
console.log(result.data.rising);
```

Output:

- `data.top`
- `data.rising`
- `value` can be `number | string` (`"Breakout"`-style upstream values are preserved)

### `relatedTopics`

```ts
import { relatedTopics } from "gtrends";

const result = await relatedTopics({
  keywords: ["typescript"],
  geo: "US",
});

console.log(result.data.top);
console.log(result.data.rising);
```

Output:

- `data.top`
- `data.rising`

### `dailyTrends`

```ts
import { dailyTrends } from "gtrends";

const result = await dailyTrends({
  geo: "US",
  category: "all",
});

console.log(result.data.days);
console.log(result.data.trends);
```

Input:

- `geo` (required)
- `category`, `date`, `ns`, `hl`, `tz`

Output:

- `data.days`: day-grouped payload
- `data.trends`: flattened trend list

### `realTimeTrends`

```ts
import { realTimeTrends } from "gtrends";

const result = await realTimeTrends({
  geo: "US",
  category: "all",
});

console.log(result.data.stories);
```

Input:

- `geo` (required)
- `category`, `fi`, `fs`, `ri`, `rs`, `sort`, `hl`, `tz`

Output:

- `data.stories`: story summaries

### `trendingNow`

```ts
import { trendingNow } from "gtrends";

const result = await trendingNow({
  geo: "US",
  language: "en",
  hours: 24,
});

console.log(result.data.items[0]?.articleKeys);
```

### `trendingArticles`

```ts
import { trendingArticles } from "gtrends";

const result = await trendingArticles({
  articleKeys: [[1, "en", "US"]],
  articleCount: 5,
});

console.log(result.data.articles);
```

## 🧪 Experimental Endpoint Usage

`experimental.trendingNow` and `experimental.trendingArticles` are aliases of the stable root methods and remain available for backward compatibility.

### `experimental.geoPicker`

```ts
import { experimental } from "gtrends";

const result = await experimental.geoPicker({ hl: "en-US" });
console.log(result.data.items);
```

### `experimental.categoryPicker`

```ts
import { experimental } from "gtrends";

const result = await experimental.categoryPicker({ hl: "en-US" });
console.log(result.data.items);
```

## 🧾 Schemas and Types

All request/response schemas and inferred types are exported:

```ts
import {
  schemas,
  type InterestOverTimeRequest,
  type InterestOverTimeResponse,
} from "gtrends";

const req: InterestOverTimeRequest = {
  keywords: ["typescript"],
};

const parsed = schemas.interestOverTimeResponseSchema.parse(rawPayload);
```

`schemas` includes stable + experimental schema exports, plus `z`.

## 🚨 Errors

Typed errors:

- `GTrendsError`
- `TransportError`
- `RateLimitError`
- `SchemaValidationError`
- `EndpointUnavailableError`
- `UnexpectedResponseError`

Example:

```ts
import {
  EndpointUnavailableError,
  RateLimitError,
  SchemaValidationError,
} from "gtrends";

try {
  await interestOverTime({ keywords: ["typescript"] });
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error("Rate limited:", error.status);
  }

  if (error instanceof SchemaValidationError) {
    console.error("Schema drift:", error.issues);
  }

  if (error instanceof EndpointUnavailableError) {
    console.error("Legacy endpoint unavailable:", error.replacements);
  }
}
```

## 🧪 Testing and Quality Gates

Run tests:

```bash
bun run test:unit
bun run test:contracts
bun run test:all
GTRENDS_LIVE=1 bun run test:live
```

Package checks:

```bash
bun run build
bun run check:package
bun run check:pack
bun run test:consumer
```

Full local gate:

```bash
bun run check:all
```

## 📼 Fixture Workflow

Record/update fixtures from live endpoints:

```bash
bun run fixtures:record
```

Fixtures are stored under:

- `tests/fixtures/raw/*`

Contract tests use those fixtures for deterministic CI.

## 🤖 CI Notes

- `CI` workflow runs deterministic tests and package quality checks.
- `Live Endpoints` workflow (`.github/workflows/live-endpoints.yml`) runs nightly + manual and executes `test:live`.

## 🔁 Migration

Migrating from `google-trends-api`?

👉 See `MIGRATION.md` for method mapping and before/after examples.

## 🛠️ Development Scripts

- `bun run dev` - watch build
- `bun run build` - build dist
- `bun run typecheck` - TypeScript checks
- `bun run lint` - format/lint checks
- `bun run format` - format/fix
- `bun run changeset` - add release note

## 📄 License

MIT
