# Fix: GitHub Pages Showing README Instead of Dashboard

If your GitHub Pages is showing the README.md file instead of your dashboard, follow these steps:

## Quick Fix

### Step 1: Check GitHub Pages Settings

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/settings/pages
2. Under **Source**, make sure it says:
   - **Source**: `GitHub Actions` (NOT "Deploy from a branch")
3. If it's set to "Deploy from a branch", change it to "GitHub Actions" and save

### Step 2: Trigger the Workflow

1. Go to: https://github.com/JiamingW-Official/5.Data_Visualization/actions
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** button
4. Select branch: `main`
5. Click **Run workflow**

### Step 3: Wait for Deployment

- Wait 2-3 minutes for the workflow to complete
- Check the workflow logs to ensure it succeeded
- Your site should now show the dashboard at: https://JiamingW-Official.github.io/5.Data_Visualization/

## Why This Happens

GitHub Pages has two modes:
1. **Deploy from a branch** - Serves files from a branch (shows README.md by default)
2. **GitHub Actions** - Uses the workflow to build and deploy (serves your index.html)

If it's set to "Deploy from a branch", it will show the README.md file instead of your dashboard.

## Verify It's Working

After the workflow completes:
1. Visit: https://JiamingW-Official.github.io/5.Data_Visualization/
2. You should see:
   - Market Sentiment Dashboard header
   - Metrics cards (Sentiment, S&P 500, NASDAQ, Dow)
   - Calendar view
   - Charts

If you still see the README, the workflow may have failed. Check the Actions tab for errors.

## Manual Fix (If Workflow Fails)

If the workflow keeps failing, you can manually set it up:

1. Create a `gh-pages` branch
2. Copy all files from `public/` and `data/` to the root of `gh-pages` branch
3. Set GitHub Pages source to `gh-pages` branch
4. This is a temporary workaround - the workflow method is preferred

