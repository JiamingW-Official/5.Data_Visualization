# Market Sentiment Visualization Dashboard

A comprehensive market sentiment visualization tool built with Chart.js, featuring real-time data visualization for S&P 500, NASDAQ, Dow Jones, market sentiment analysis, and an interactive calendar view.

🌐 **Live Site**: [View on GitHub Pages](https://JiamingW-Official.github.io/5.Data_Visualization/)

## Features

- **Market Sentiment Calendar**
  - Interactive calendar view showing sentiment for each trading day
  - Color-coded days (Green = Bullish, Red = Bearish, Gray = Neutral)
  - Click any day to see detailed metrics, headline, and summary
  - Algorithm-generated daily headlines and summaries

- **Real-time Market Data Visualization**
  - S&P 500, NASDAQ, and Dow Jones trends since 2022
  - Custom Market Sentiment Index calculation
  - Daily performance comparisons
  - Historical data visualization

- **Multiple Chart Types**
  - Interactive line charts with zoom and pan
  - Bar charts for daily comparisons
  - Time-series visualizations
  - Clickable legends to show/hide datasets

- **Custom Sentiment Algorithm**
  - Calculates sentiment from price movements, trends, volume, and volatility
  - Generates daily headlines based on market performance
  - Creates detailed summaries explaining market sentiment

- **GitHub Pages Ready**
  - Fully static site - no backend required
  - Automatic daily data updates via GitHub Actions
  - Pre-fetched data stored in JSON files

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

## Quick Start

### For GitHub Pages (Recommended)

The site is automatically deployed to GitHub Pages. Just:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Select "GitHub Actions"
   
2. **Push to main branch** - The workflow will automatically:
   - Fetch market data
   - Build the site
   - Deploy to GitHub Pages

3. **View your site** at: `https://JiamingW-Official.github.io/5.Data_Visualization/`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### For Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/JiamingW-Official/5.Data_Visualization.git
   cd 5.Data_Visualization
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Fetch market data**
   ```bash
   npm run fetch-data
   ```

4. **Start local server (optional)**
   ```bash
   npm start
   # Visit http://localhost:3000
   ```

   Or simply open `public/index.html` in your browser (for static testing)

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

