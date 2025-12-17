# GitHub Pages Deployment Guide

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

## Automatic Deployment

The project includes two GitHub Actions workflows:

### 1. Deploy to GitHub Pages (`deploy.yml`)
- **Triggers**: 
  - On push to `main` branch
  - Manual trigger via workflow_dispatch
  - Daily at 6 PM UTC on weekdays (after market close)
- **What it does**:
  - Fetches latest market data
  - Builds the static site
  - Deploys to GitHub Pages

### 2. Update Market Data (`update-data.yml`)
- **Triggers**:
  - Manual trigger via workflow_dispatch
  - Daily at 6:30 PM UTC on weekdays
- **What it does**:
  - Fetches latest market data
  - Commits and pushes data updates to repository

## Initial Setup

### Step 1: Enable GitHub Pages

1. Go to your repository: https://github.com/JiamingW-Official/5.Data_Visualization
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - **Source**: GitHub Actions
4. Save

### Step 2: First Deployment

1. Push your code to the `main` branch:
   ```bash
   git add .
   git commit -m "Initial commit for GitHub Pages"
   git push origin main
   ```

2. The GitHub Action will automatically:
   - Install dependencies
   - Fetch market data
   - Build the site
   - Deploy to GitHub Pages

3. Your site will be available at:
   ```
   https://JiamingW-Official.github.io/5.Data_Visualization/
   ```

## Manual Deployment

To manually trigger a deployment:

1. Go to **Actions** tab in your repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**
4. Select branch (usually `main`)
5. Click **Run workflow**

## Updating Data Manually

To manually update market data:

1. Go to **Actions** tab
2. Select **Update Market Data** workflow
3. Click **Run workflow**
4. This will fetch latest data and commit it

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Fetch data
npm run fetch-data

# Test with local server (optional)
npm start
# Visit http://localhost:3000
```

## Troubleshooting

### Site not loading
- Check **Actions** tab for failed workflows
- Verify GitHub Pages is enabled in Settings
- Check that `data/` folder contains JSON files

### Data not updating
- Check workflow logs in **Actions** tab
- Verify `npm run fetch-data` works locally
- Check that Yahoo Finance API is accessible

### Build failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check workflow logs for specific errors

## File Structure for GitHub Pages

```
/
├── public/          # Frontend files (served as root)
│   ├── index.html
│   ├── app.js
│   ├── calendar.js
│   └── styles.css
├── data/           # Data files (accessible at /data/)
│   ├── market-data.json
│   └── historical-data.json
└── scripts/        # Build scripts (not deployed)
```

## Notes

- The site works as a **static site** - no backend server needed
- All data is pre-fetched and stored in JSON files
- GitHub Actions automatically updates data daily
- The site is accessible at: `https://JiamingW-Official.github.io/5.Data_Visualization/`

