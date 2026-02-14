# gtrends

Google Trends API fetching library for Node.js and Bun.

## ✨ Features

- 📊 Fetch Google Trends data programmatically
- ⚡ ESM-only, TypeScript-first
- 🐰 Works with Bun and Node.js 20+
- 📦 Zero dependencies (fetch-based)

## 📋 Prerequisites

- Bun `1.3.9+` or Node.js `20+`

## 🚀 Quick Start

```bash
bun add gtrends
# or
npm install gtrends
```

```ts
import { getTrends } from "gtrends";

const trends = await getTrends({ keyword: "typescript" });
```

## 📦 Runtime Contract

- ESM-only package
- Node.js `>=20`
- No CommonJS `require()` support—use dynamic `import()` for CJS consumers

## 🛠️ Scripts (for contributors)

| Command             | Description         |
| ------------------- | ------------------- |
| `bun run dev`       | Build in watch mode |
| `bun run build`     | Build package       |
| `bun run test`      | Run tests           |
| `bun run check:all` | Full quality gate   |

## 📄 License

MIT
