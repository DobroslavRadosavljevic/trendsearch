# Getting Started: gtrends Package

This guide is for setting up and publishing the gtrends (Google Trends API) package.
Follow it top to bottom.

## 1. Create Your Own Repository

1. On GitHub, click **Use this template**.
2. Create a new repository under your account/org.
3. Clone your new repo locally:

```bash
git clone https://github.com/DobroslavRadosavljevic/gtrends.git
cd gtrends
```

## 2. Install and Personalize

1. Install dependencies:

```bash
bun install
```

2. Edit `package.json`:
   - `name`
   - `description`
   - `author`
   - `homepage`
   - `bugs.url`
   - `repository.url`

3. Run the full local check once:

```bash
bun run check:all
```

## 3. Configure npm Trusted Publishing (npm Website)

Do this before expecting automated publish to work.

1. Sign in at [npmjs.com](https://www.npmjs.com).
2. Open your package settings.
3. Go to **Publishing access**.
4. Click **Add trusted publisher**.
5. Choose **GitHub Actions**.
6. Fill in:
   - **Repository owner**: your GitHub user/org
   - **Repository name**: your repo name
   - **Workflow file**: `release.yml`
7. Save.

Notes:

- The release workflow already has the required GitHub permission
  (`id-token: write`) configured.
- No long-lived npm token is needed when trusted publishing is set up correctly.

## 4. Enable or Keep Publish Disabled (Safety Switch)

This template includes a publish guard.

1. In GitHub repo settings, open **Secrets and variables** -> **Actions** ->
   **Variables**.
2. Create repository variable `NPM_PUBLISH_ENABLED`.
3. Set it to:
   - `false` or leave unset while setting up and testing.
   - `true` when you are ready for real npm publishes.

## 5. Daily Development Workflow (Always Use Branches)

Do not work directly on `main`.

1. Pull latest `main`:

```bash
git checkout main
git pull --rebase origin main
```

2. Create a branch:

```bash
git checkout -b feat/<short-name>
```

3. Make your code changes in `src/` and tests in `tests/`.
4. If the change affects package behavior/API/metadata, add a changeset:

```bash
bun run changeset
```

5. Run checks:

```bash
bun run check:all
```

6. Commit and push branch:

```bash
git add .
git commit -m "feat: your change"
git push -u origin feat/<short-name>
```

7. Open a Pull Request to `main`.

## 6. How Release Actually Happens

After PR merge to `main`:

1. `release.yml` runs.
2. Changesets checks for pending changesets.
3. If there are changesets, it opens or updates a **Version Packages** PR.
4. You merge that release PR.
5. If `NPM_PUBLISH_ENABLED=true`, publish runs automatically to npm.

If `NPM_PUBLISH_ENABLED` is not `true`, publish is skipped safely.

## 7. First Publish Checklist

1. `NPM_PUBLISH_ENABLED=true` is set.
2. npm trusted publisher is configured for this repo + `release.yml`.
3. A PR with a changeset has been merged to `main`.
4. The generated release PR is merged.
5. Verify on npm that the new version is live.

## 8. Troubleshooting Quick Answers

### \"Missing changeset\" in CI

Your PR touched package-impacting files and needs `bun run changeset`.

### Release PR not created

No releasable changeset has landed on `main` yet.

### Publish failed with auth/provenance error

Trusted publisher config on npm likely does not match this repo/workflow.
Recheck npm package settings -> Publishing access.
