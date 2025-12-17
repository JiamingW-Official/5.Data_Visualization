# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated deployment and data updates.

## Workflows

### `deploy.yml`
Automatically deploys the site to GitHub Pages when:
- Code is pushed to `main` branch
- Manually triggered via workflow_dispatch
- Daily at 6 PM UTC on weekdays (after market close)

**What it does:**
1. Installs Node.js and dependencies
2. Fetches latest market data
3. Builds static site files
4. Deploys to GitHub Pages

### `update-data.yml`
Updates market data and commits changes when:
- Manually triggered via workflow_dispatch
- Daily at 6:30 PM UTC on weekdays

**What it does:**
1. Fetches latest market data from Yahoo Finance
2. Commits updated data files
3. Pushes changes to repository

## Manual Triggers

To manually trigger a workflow:
1. Go to **Actions** tab in GitHub
2. Select the workflow you want to run
3. Click **Run workflow**
4. Select branch and click **Run workflow**

## Permissions

These workflows require:
- `contents: read/write` - To read code and commit data updates
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For GitHub Pages deployment

These are automatically granted when workflows are run from the repository.

