# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate Initial Data**
   ```bash
   node scripts/fetchMarketData.js
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## Detailed Setup

### Step 1: Install Node.js Dependencies

Make sure you have Node.js (v14 or higher) installed, then run:
```bash
npm install
```

This will install all required packages:
- Express (web server)
- Chart.js dependencies
- Natural language processing libraries
- Data fetching utilities

### Step 2: Initialize Data

Run the data fetching script to create initial data files:
```bash
npm run fetch-data
```

This will create:
- `data/market-data.json` - Current market data
- `data/historical-data.json` - Historical data points

### Step 3: (Optional) Train Sentiment Model

Train the ML sentiment analysis model:
```bash
npm run train-model
```

This creates a trained classifier in `models/sentiment-classifier.json`.

### Step 4: Start the Server

Start the Express server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Step 5: Configure n8n (Optional)

1. Install n8n globally:
   ```bash
   npm install -g n8n
   ```

2. Start n8n:
   ```bash
   n8n start
   ```

3. Import the workflow:
   - Open `http://localhost:5678` in your browser
   - Click "Workflows" → "Import from File"
   - Select `n8n-workflow.json`
   - Configure the nodes with actual API endpoints
   - Activate the workflow

## Integrating Real Data Sources

### VIX Data

Replace the simulated VIX data in `scripts/fetchMarketData.js` with real API calls:

**Option 1: Alpha Vantage**
```javascript
const response = await axios.get('https://www.alphavantage.co/query', {
  params: {
    function: 'VIX',
    apikey: 'YOUR_API_KEY'
  }
});
```

**Option 2: Yahoo Finance**
```javascript
const response = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5EVIX');
```

### CNN Fear & Greed Index

Add web scraping for CNN Fear & Greed Index:

```javascript
const cheerio = require('cheerio');
const response = await axios.get('https://www.cnn.com/markets/fear-and-greed');
const $ = cheerio.load(response.data);
// Extract the index value from the page
```

### Market News

Integrate with news APIs:

**Option 1: NewsAPI**
```javascript
const response = await axios.get('https://newsapi.org/v2/everything', {
  params: {
    q: 'stock market',
    apiKey: 'YOUR_API_KEY',
    sortBy: 'publishedAt'
  }
});
```

**Option 2: Alpha Vantage News**
```javascript
const response = await axios.get('https://www.alphavantage.co/query', {
  params: {
    function: 'NEWS_SENTIMENT',
    apikey: 'YOUR_API_KEY',
    topics: 'financial_markets'
  }
});
```

## Environment Variables

Create a `.env` file for API keys:

```env
ALPHA_VANTAGE_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
PORT=3000
```

Then install `dotenv` and load it in `server.js`:
```bash
npm install dotenv
```

```javascript
require('dotenv').config();
```

## Automated Updates

### Option 1: Using node-cron (Built-in)

Uncomment the scheduler in `server.js`:
```javascript
const { startScheduler } = require('./scripts/scheduler');
startScheduler();
```

### Option 2: Using n8n

1. Set up the n8n workflow as described above
2. Configure the cron trigger for your desired schedule
3. The workflow will call `/api/update-data` endpoint

### Option 3: System Cron (Linux/Mac)

Add to crontab:
```bash
0 9 * * * cd /path/to/project && node scripts/fetchMarketData.js
```

## Troubleshooting

### Port Already in Use
Change the port in `server.js` or set `PORT` environment variable:
```bash
PORT=3001 npm start
```

### Missing Data Files
Run the fetch script:
```bash
npm run fetch-data
```

### Chart.js Not Loading
Check browser console for CDN errors. The project uses CDN links - ensure internet connection.

### Sentiment Analysis Errors
Make sure `natural` and `compromise` packages are installed:
```bash
npm install natural compromise
```

## Next Steps

1. Replace simulated data with real API integrations
2. Set up database for historical data storage
3. Configure n8n workflows for automation
4. Customize charts and styling
5. Add more technical indicators
6. Implement WebSocket for real-time updates

