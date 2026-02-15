# Changelog

## 0.2.0

### Minor Changes

- 90f338e: Add a first-class `trendsearch` CLI that wraps all stable and experimental endpoints, with JSON/JSONL/pretty output modes, persistent CLI config commands, interactive wizard flow, and shell completion generation.
- 30e9322: Implement trendsearch v1 SDK architecture with strict Zod validation, modern `createClient` API, full stable Google Trends endpoint coverage, experimental batchexecute + picker endpoints, deterministic fixture-based contracts, live smoke tests, and migration/docs updates.
- 30e9322: Stabilize live endpoint support and API surface:
  - Add stable root `trendingNow` and `trendingArticles` methods (with experimental aliases preserved).
  - Add `EndpointUnavailableError` for legacy `dailyTrends`/`realTimeTrends` when upstream routes return `404/410`.
  - Fix picker paths to `/trends/api/explore/pickers/*`.
  - Broaden related topic value typing to `number | string`.
  - Improve RPC schema-validation consistency and expand live/contract coverage.

- 05c9b24: Add a new experimental endpoint family for undocumented Google Trends routes:
  - `experimental.topCharts`
  - `experimental.interestOverTimeMultirange`
  - CSV variants: `interestOverTimeCsv`, `interestOverTimeMultirangeCsv`, `interestByRegionCsv`, `relatedQueriesCsv`, `relatedTopicsCsv`
  - `experimental.hotTrendsLegacy`

  Also harden transport behavior by auto-populating `accept-language` from `hl` when missing and improving `401/429` diagnostics, with expanded CLI/docs/test coverage.

- 0931687: Initial trendsearch package: Google Trends API fetching library for Node.js and Bun.
  Introduces `getTrends(options)` placeholder API.

### Patch Changes

- b115b04: Upgrade internal resilience primitives to use `p-queue` and `p-retry` while
  keeping the public API and CLI configuration surface unchanged.

All notable changes to this project will be documented in this file.

This project uses [Changesets](https://github.com/changesets/changesets) to
manage versioning and changelog entries.

## [0.0.1] - 2026-02-14

### Added

- Initial `trendsearch` release.
- ESM-only TypeScript package starter with Bun-first tooling.
