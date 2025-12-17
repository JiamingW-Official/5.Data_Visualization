# Troubleshooting: GitHub Pages Showing README Instead of Dashboard

## The Problem
Your GitHub Pages is showing the README.md file instead of your dashboard with calendar and charts.

## Solution Steps (Do These in Order)

### Step 1: Check GitHub Pages Source Setting ⚠️ MOST IMPORTANT

1. Go to: **https://github.com/JiamingW-Official/5.Data_Visualization/settings/pages**
2. Look at the **Source** section
3. **It MUST say "GitHub Actions"** - NOT "Deploy from a branch"
4. If it says "Deploy from a branch":
   - Click the dropdown
   - Select **"GitHub Actions"**
   - Click **Save**
5. If "GitHub Actions" is not an option, you need to enable it first (see below)

### Step 2: Enable GitHub Actions for Pages (If Needed)

If you don't see "GitHub Actions" as an option:

1. Go to: **https://github.com/JiamingW-Official/5.Data_Visualization/settings/pages**
2. Under **Build and deployment**:
   - Source: Select **"GitHub Actions"**
3. If you see a message about enabling it, click **"Configure"** or **"Enable"**

### Step 3: Check if Workflow Has Run

1. Go to: **https://github.com/JiamingW-Official/5.Data_Visualization/actions**
2. Look for **"Deploy to GitHub Pages"** workflow
3. Check if it has run:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed (click to see errors)
   - ⏸️ Yellow = In progress
   - ⚪ No runs = Never run

### Step 4: Run the Workflow Manually

If the workflow hasn't run or failed:

1. Go to: **https://github.com/JiamingW-Official/5.Data_Visualization/actions**
2. Click **"Deploy to GitHub Pages"** in the left sidebar
3. Click **"Run workflow"** button (top right)
4. Select branch: **main**
5. Click **"Run workflow"**
6. Wait 2-3 minutes for it to complete

### Step 5: Verify Deployment

After the workflow completes:

1. Go to: **https://JiamingW-Official.github.io/5.Data_Visualization/**
2. You should see:
   - ✅ "Market Sentiment Dashboard" header
   - ✅ Metrics cards (Sentiment, S&P 500, NASDAQ, Dow)
   - ✅ Calendar view
   - ✅ Charts

If you still see README:
- Wait 1-2 more minutes (DNS propagation)
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache

## Common Issues

### Issue: "GitHub Actions" option not available
**Solution**: Make sure you have the workflow file at `.github/workflows/deploy.yml` in your repository.

### Issue: Workflow fails with permission errors
**Solution**: 
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Save and re-run workflow

### Issue: Workflow runs but site still shows README
**Solution**:
1. Double-check Step 1 - Source MUST be "GitHub Actions"
2. Wait 5 minutes and hard refresh
3. Try incognito/private browsing mode

### Issue: Can't find the workflow
**Solution**: 
1. Make sure `.github/workflows/deploy.yml` exists in your repo
2. Push it to the main branch
3. Then go to Actions tab

## Quick Test

To verify your site is deployed correctly, try accessing:
- https://JiamingW-Official.github.io/5.Data_Visualization/index.html

If this shows your dashboard but the root URL shows README, then GitHub Pages source is definitely set wrong.

## Still Not Working?

1. Check the workflow logs in the Actions tab for errors
2. Verify all files are committed and pushed to main branch
3. Make sure `public/index.html` exists in your repository
4. Check that the workflow completed successfully (green checkmark)

