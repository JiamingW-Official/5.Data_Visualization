# Quick Start Guide

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Fetch Historical Market Data** (This will take a few minutes)
   ```bash
   npm run fetch-data
   ```
   
   This command will:
   - Fetch all trading days for S&P 500, NASDAQ, and Dow Jones since January 3, 2022
   - Calculate the Market Sentiment Index for each trading day
   - Save the data to `data/market-data.json` and `data/historical-data.json`

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Open Your Browser**
   Navigate to `http://localhost:3000`

## What You'll See

- **Market Sentiment Index**: A custom algorithm-based sentiment score (-100 to +100)
- **S&P 500, NASDAQ, Dow Jones**: Current values and daily changes
- **Historical Charts**: All trading days since 2022 showing:
  - Market indices comparison (normalized percentage change)
  - Market Sentiment Index trend
  - Individual index trends
  - Daily changes comparison

## Data Updates

To update the data with the latest trading day:
```bash
npm run fetch-data
```

Or set up automated updates using n8n or cron jobs to call:
```bash
curl -X POST http://localhost:3000/api/update-data
```

## Market Sentiment Index Algorithm

The custom sentiment index is calculated using:
- **Daily change** (30% weight): Today's price movement
- **Weekly trend** (25% weight): 5-day trend
- **Monthly trend** (20% weight): 20-day trend
- **Volume analysis** (15% weight): Volume compared to recent average
- **Volatility** (10% weight): Recent price volatility

The final score is aggregated from all three indices (S&P 500: 40%, NASDAQ: 35%, Dow: 25%).

## Troubleshooting

**No data showing?**
- Make sure you ran `npm run fetch-data` first
- Check that `data/historical-data.json` exists and has data
- Check browser console for errors

**Yahoo Finance API errors?**
- The API may rate limit if too many requests
- Wait a few minutes and try again
- Check your internet connection

**Charts not displaying?**
- Ensure you have an internet connection (Chart.js loads from CDN)
- Check browser console for JavaScript errors
- Try refreshing the page



