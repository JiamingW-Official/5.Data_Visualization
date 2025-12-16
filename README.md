# Market Sentiment Visualization Dashboard

A comprehensive market sentiment visualization tool built with Chart.js, featuring real-time data visualization for VIX, CNN Fear & Greed Index, market volatility, technical indicators, and ML-powered sentiment analysis.

## Features

- **Real-time Market Data Visualization**
  - VIX (Volatility Index) trends
  - CNN Fear & Greed Index
  - Market volatility indicators
  - Technical indicators (RSI, MACD, Bollinger Bands, Moving Averages)
  - Sentiment analysis from market news

- **Multiple Chart Types**
  - Line charts for trends
  - Bar charts for comparisons
  - Doughnut charts for distributions
  - Time-series visualizations

- **Machine Learning Sentiment Analysis**
  - Web crawling for market news
  - Natural language processing
  - Sentiment classification (positive/negative/neutral)
  - Aggregate sentiment scoring

- **Automated Data Collection**
  - n8n workflow integration
  - Scheduled data updates
  - Webhook support for external triggers

## Project Structure

```
.
├── server.js                 # Express backend server
├── package.json              # Dependencies and scripts
├── public/                   # Frontend files
│   ├── index.html           # Main HTML page
│   ├── styles.css           # Styling
│   └── app.js               # Frontend JavaScript
├── scripts/                  # Backend scripts
│   ├── fetchMarketData.js   # Data fetching logic
│   ├── sentimentAnalyzer.js # ML sentiment analysis
│   ├── trainSentimentModel.js # Model training
│   └── scheduler.js         # Cron job scheduler
├── data/                     # Data storage
│   ├── market-data.json     # Current market data
│   └── historical-data.json # Historical data
└── n8n-workflow.json        # n8n workflow configuration
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 5.Data_Visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize data files**
   The data directory and initial JSON files are already created. If needed, you can regenerate them by running:
   ```bash
   node scripts/fetchMarketData.js
   ```

4. **Train the sentiment model (optional)**
   ```bash
   npm run train-model
   ```

## Usage

### Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Manual Data Update

To manually trigger a data update:
```bash
npm run fetch-data
```

Or via API:
```bash
curl -X POST http://localhost:3000/api/update-data
```

### API Endpoints

- `GET /` - Serve the main dashboard
- `GET /api/market-data` - Get current market data
- `GET /api/historical-data` - Get historical data
- `POST /api/update-data` - Trigger data update (webhook endpoint for n8n)

## n8n Integration

1. **Install n8n** (if not already installed)
   ```bash
   npm install -g n8n
   ```

2. **Import the workflow**
   - Open n8n interface
   - Import `n8n-workflow.json`
   - Configure the workflow nodes with actual API endpoints

3. **Configure Webhooks**
   - Update the webhook URL in the workflow to point to your server
   - Set up authentication if needed

4. **Schedule Updates**
   - The workflow includes a cron trigger for hourly updates
   - Adjust the schedule as needed

## Data Sources

Currently, the project uses simulated data. To integrate real data sources:

1. **VIX Data**
   - Alpha Vantage API
   - Yahoo Finance API
   - CBOE API

2. **CNN Fear & Greed Index**
   - Web scraping from CNN website
   - Alternative APIs if available

3. **Market News**
   - Financial news APIs (NewsAPI, Alpha Vantage News)
   - RSS feeds
   - Web scraping from financial news sites

4. **Technical Indicators**
   - Stock market APIs
   - Trading platforms APIs

## Customization

### Adding New Charts

1. Add a new canvas element in `public/index.html`
2. Create a chart function in `public/app.js`
3. Call the function in `initDashboard()`

### Modifying Sentiment Analysis

Edit `scripts/sentimentAnalyzer.js` to:
- Add more sentiment words
- Adjust scoring algorithms
- Integrate additional NLP libraries

### Styling

Modify `public/styles.css` to customize the appearance of the dashboard.

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js 4.4.0
- **ML/NLP**: Natural, Compromise
- **Data Fetching**: Axios, Cheerio
- **Automation**: n8n, node-cron
- **Data Storage**: JSON files (can be migrated to database)

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real-time WebSocket updates
- [ ] More sophisticated ML models
- [ ] Additional technical indicators
- [ ] User authentication and preferences
- [ ] Export functionality (PDF, CSV)
- [ ] Mobile responsive improvements
- [ ] Dark mode support

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

