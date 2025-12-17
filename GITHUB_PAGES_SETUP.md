# GitHub Pages Setup Guide

This project is designed to work as a static site on GitHub Pages. All data is pre-fetched and stored in JSON files.

## Setup Steps

### 1. Fetch Market Data Locally

Before deploying, you need to fetch the market data:

```bash
npm install
npm run fetch-data
```

This will create/update:
- `data/market-data.json` - Current market data
- `data/historical-data.json` - All historical data with headlines and summaries

### 2. Deploy to GitHub Pages

#### Option A: Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Fetch market data
        run: npm run fetch-data
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          exclude_assets: 'node_modules,scripts,.git'
```

#### Option B: Manual Deployment

1. Build the data files locally:
   ```bash
   npm run fetch-data
   ```

2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Update market data"
   git push
   ```

3. Enable GitHub Pages:
   - Go to repository Settings > Pages
   - Select source branch (usually `main`)
   - Select `/ (root)` as folder
   - Save

### 3. Update Data Regularly

To keep data fresh, you can:

1. **Manual Update**: Run `npm run fetch-data` locally and push
2. **Automated Update**: Set up GitHub Actions to run daily (see below)

### 4. Automated Daily Updates (Optional)

Create `.github/workflows/update-data.yml`:

```yaml
name: Update Market Data

on:
  schedule:
    - cron: '0 18 * * 1-5'  # 6 PM UTC on weekdays (market close time)
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Fetch market data
        run: npm run fetch-data
      
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/
          git diff --staged --quiet || (git commit -m "Update market data [skip ci]" && git push)
```

## File Structure for GitHub Pages

```
/
├── public/
│   ├── index.html
│   ├── app.js
│   ├── calendar.js
│   └── styles.css
├── data/
│   ├── market-data.json
│   └── historical-data.json
└── README.md
```

## Important Notes

1. **No Backend Required**: All data is static JSON files
2. **Data Size**: Historical data since 2022 is ~800KB, which is acceptable for GitHub Pages
3. **CORS**: GitHub Pages serves files with proper CORS headers
4. **Update Frequency**: Data should be updated daily after market close

## Troubleshooting

- **Data not loading**: Check browser console for CORS errors
- **Calendar not showing**: Ensure `historical-data.json` exists and has data
- **Charts not rendering**: Check that Chart.js CDN is accessible



