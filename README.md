# 📦 npm-ts-start

A production-grade starter for building and publishing TypeScript npm packages.

## ✨ What You Get

- 🔷 **TypeScript-first package setup** with strict defaults
- 📦 **ESM-only package contract** (`exports`, types, and Node 20+ baseline)
- ⚡ **Fast builds** with `tsdown`
- 🧪 **Runtime tests** with Bun test runner
- 🎨 **Lint + format** with Ultracite (`oxlint` + `oxfmt`)
- 🧰 **Package contract checks** with `publint` + `@arethetypeswrong/cli`
- 🔒 **Supply-chain aware publishing** with npm trusted publishing + provenance
- 🚀 **Automated releases** with Changesets + GitHub Actions
- 🧯 **Publish safety switch** via `NPM_PUBLISH_ENABLED`
- 🐶 **Git hooks + Conventional Commits** via Husky + commitlint
- 🤖 **Dependency maintenance** with Dependabot + weekly audit workflow

## 🧱 Tech Stack

- Runtime + package manager: **Bun**
- Language: **TypeScript**
- Bundler: **tsdown**
- Tests: **bun:test**
- Lint/format: **Ultracite**
- Release/versioning: **Changesets**
- CI/CD: **GitHub Actions**
- Registry: **npm**

## 📚 Read These First

- `GETTING_STARTED.md` -> full beginner flow (template -> first publish)
- `CONTRIBUTING.md` -> contributor workflow
- `MAINTAINERS.md` -> owner/maintainer runbook
- `.changeset/README.md` -> changeset conventions

## 📋 Prerequisites

- Bun `1.3.9+`
- Node.js `20+` for runtime compatibility
- Node.js `22+` in release CI for trusted publishing requirements

## 🚀 Quick Start

1. Use this repository as a GitHub template.
2. Clone your new repository:

```bash
git clone https://github.com/<your-user-or-org>/<your-repo>.git
cd <your-repo>
```

3. Install dependencies:

```bash
bun install
```

4. Update `package.json` metadata:
   - `name`
   - `description`
   - `author`
   - `homepage`
   - `bugs.url`
   - `repository.url`

5. Run full checks:

```bash
bun run check:all
```

6. Start coding in `src/index.ts`.

## 📦 Runtime Contract

- ✅ ESM-only package
- ✅ Node.js `>=20`
- ❌ CommonJS `require()` support (intentionally disabled)

CommonJS consumers should use dynamic import:

```js
(async () => {
  const { fn } = await import("your-package-name");
  console.log(fn());
})();
```

## 🛠️ Scripts

| Command                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `bun run dev`              | Build in watch mode                                    |
| `bun run build`            | Build package into `dist/`                             |
| `bun run test`             | Run runtime tests                                      |
| `bun run lint`             | Run lint and formatting checks                         |
| `bun run format`           | Apply lint/format fixes                                |
| `bun run typecheck`        | TypeScript type check (no emit)                        |
| `bun run check:pack`       | Validate packed output (`npm pack --dry-run`)          |
| `bun run check:package`    | Run package contract checks                            |
| `bun run test:consumer`    | Smoke-test packed artifact in temp consumer project    |
| `bun run check:all`        | Full quality gate                                      |
| `bun run changeset`        | Add release intent for releasable changes              |
| `bun run release:status`   | Show pending release plan                              |
| `bun run version-packages` | Apply version + changelog updates from changesets      |
| `bun run release`          | Publish with Changesets                                |
| `bun run release:ci`       | CI publish path, guarded by `NPM_PUBLISH_ENABLED=true` |

## 🌿 Branch + PR Workflow

Always work on branches, not directly on `main`.

1. Sync local `main`:

```bash
git checkout main
git pull --rebase origin main
```

2. Create a feature branch:

```bash
git checkout -b feat/<short-name>
```

3. Make changes.
4. If package behavior/API/metadata changed, add changeset:

```bash
bun run changeset
```

5. Run checks:

```bash
bun run check:all
```

6. Commit + push branch.
7. Open PR to `main`.

CI enforces changesets for package-impacting paths.

## 🚢 Release Flow

1. PR with changeset merges to `main`.
2. `release.yml` runs `changesets/action`.
3. A release PR is created/updated.
4. Merge release PR.
5. Publish happens only when `NPM_PUBLISH_ENABLED=true`.

## 🔐 Trusted Publishing Setup (npm)

1. Sign in at [npmjs.com](https://www.npmjs.com).
2. Open package settings.
3. Go to **Publishing access**.
4. Click **Add trusted publisher**.
5. Select **GitHub Actions**.
6. Configure:
   - repository owner
   - repository name
   - workflow file: `release.yml`

Then set GitHub repository variable:

- `NPM_PUBLISH_ENABLED=true` to allow real publishing
- leave unset/false to block publishing safely

## 🔄 CI/CD Overview

### `ci.yml`

- `quality`: full gate on Node 20
- `compat`: Node 20/22/24 matrix
- `changeset-required`: PR release-intent guard

### `release.yml`

- runs on push to `main` + manual dispatch
- runs quality checks
- uses trusted publishing + provenance
- publishes only when `NPM_PUBLISH_ENABLED=true`

### `security-audit.yml`

- weekly `bun audit --production`
- `bun outdated` summary output

## 🗂️ Project Structure

```txt
├── src/
│   └── index.ts
├── tests/
│   └── index.test.ts
├── scripts/
│   └── consumer-smoke.ts
├── dist/                           # generated
├── .changeset/
│   ├── config.json
│   └── README.md
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── release.yml
│   │   └── security-audit.yml
│   └── ISSUE_TEMPLATE/
├── GETTING_STARTED.md
├── MAINTAINERS.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── tsconfig.json
├── tsconfig.typecheck.json
├── tsdown.config.ts
└── package.json
```

## 📄 License

MIT
