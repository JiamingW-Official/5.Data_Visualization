const { fetchAllMarketData } = require('./marketDataFetcher');

// Re-export for backward compatibility
async function fetchMarketData() {
  const result = await fetchAllMarketData();
  return result.current;
}

module.exports = { fetchMarketData };

/**
 * Fetch VIX data (simulated - replace with actual API)
 */
async function fetchVIX() {
  try {
    // In production, use actual VIX API (e.g., Alpha Vantage, Yahoo Finance)
    // For now, simulate with realistic values
    const vix = {
      current: 18.5 + Math.random() * 10,
      change: (Math.random() - 0.5) * 5,
      changePercent: ((Math.random() - 0.5) * 10).toFixed(2)
    };
    return vix;
  } catch (error) {
    console.error('Error fetching VIX:', error);
    return { current: 0, change: 0, changePercent: 0 };
  }
}

/**
 * Fetch CNN Fear & Greed Index (simulated - replace with actual scraping)
 */
async function fetchFearGreedIndex() {
  try {
    // In production, scrape from https://www.cnn.com/markets/fear-and-greed
    // For now, simulate with realistic values
    const index = Math.floor(Math.random() * 100);
    let classification = 'Neutral';
    if (index < 25) classification = 'Extreme Fear';
    else if (index < 45) classification = 'Fear';
    else if (index < 55) classification = 'Neutral';
    else if (index < 75) classification = 'Greed';
    else classification = 'Extreme Greed';

    return {
      value: index,
      classification: classification,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return { value: 50, classification: 'Neutral', timestamp: new Date().toISOString() };
  }
}

/**
 * Fetch market volatility indicators
 */
async function fetchVolatilityIndicators() {
  try {
    // Simulate various volatility indicators
    return {
      vix: await fetchVIX(),
      vix9d: (await fetchVIX()).current * 0.9,
      vix30d: (await fetchVIX()).current * 1.1,
      realizedVolatility: 15 + Math.random() * 10,
      impliedVolatility: 18 + Math.random() * 8
    };
  } catch (error) {
    console.error('Error fetching volatility indicators:', error);
    return {};
  }
}

/**
 * Fetch technical indicators
 */
async function fetchTechnicalIndicators() {
  try {
    // Simulate technical indicators
    const rsi = 30 + Math.random() * 40; // RSI between 30-70
    const macd = (Math.random() - 0.5) * 2;
    const bollingerUpper = 100 + Math.random() * 20;
    const bollingerLower = 80 + Math.random() * 20;
    const currentPrice = 90 + Math.random() * 20;

    return {
      rsi: parseFloat(rsi.toFixed(2)),
      macd: parseFloat(macd.toFixed(2)),
      bollingerBands: {
        upper: parseFloat(bollingerUpper.toFixed(2)),
        middle: parseFloat(((bollingerUpper + bollingerLower) / 2).toFixed(2)),
        lower: parseFloat(bollingerLower.toFixed(2)),
        current: parseFloat(currentPrice.toFixed(2))
      },
      movingAverages: {
        sma20: parseFloat((currentPrice * 0.98).toFixed(2)),
        sma50: parseFloat((currentPrice * 0.95).toFixed(2)),
        sma200: parseFloat((currentPrice * 0.90).toFixed(2))
      }
    };
  } catch (error) {
    console.error('Error fetching technical indicators:', error);
    return {};
  }
}

/**
 * Crawl web for market news and analyze sentiment
 */
async function fetchMarketSentiment() {
  try {
    // In production, crawl actual news sources
    // For now, simulate news articles
    const sampleNews = [
      "Market shows strong bullish momentum as investors remain optimistic",
      "Concerns about inflation persist despite positive economic indicators",
      "Tech stocks rally on positive earnings reports",
      "Federal Reserve signals potential rate cuts ahead",
      "Global markets show mixed signals amid geopolitical tensions"
    ];

    const articles = sampleNews.map((text, index) => ({
      title: `Market News ${index + 1}`,
      content: text,
      source: `Source ${index + 1}`,
      timestamp: new Date(Date.now() - index * 3600000).toISOString()
    }));

    // Analyze sentiment for each article
    const sentimentResults = await Promise.all(
      articles.map(async (article) => {
        const sentiment = await analyzeSentiment(article.content);
        return {
          ...article,
          sentiment: sentiment
        };
      })
    );

    // Calculate aggregate sentiment
    const avgSentiment = sentimentResults.reduce((sum, item) => sum + item.sentiment.score, 0) / sentimentResults.length;
    const positiveCount = sentimentResults.filter(item => item.sentiment.label === 'positive').length;
    const negativeCount = sentimentResults.filter(item => item.sentiment.label === 'negative').length;

    return {
      articles: sentimentResults,
      aggregate: {
        score: parseFloat(avgSentiment.toFixed(2)),
        positive: positiveCount,
        negative: negativeCount,
        neutral: sentimentResults.length - positiveCount - negativeCount,
        total: sentimentResults.length
      }
    };
  } catch (error) {
    console.error('Error fetching market sentiment:', error);
    return { articles: [], aggregate: { score: 0, positive: 0, negative: 0, neutral: 0, total: 0 } };
  }
}

/**
 * Main function to fetch all market data
 */
async function fetchMarketData() {
  console.log('Fetching market data...');
  
  const timestamp = new Date().toISOString();
  
  const marketData = {
    timestamp: timestamp,
    volatility: await fetchVolatilityIndicators(),
    fearGreedIndex: await fetchFearGreedIndex(),
    technicalIndicators: await fetchTechnicalIndicators(),
    sentiment: await fetchMarketSentiment()
  };

  // Save current market data
  await fs.writeJson(MARKET_DATA_FILE, marketData, { spaces: 2 });
  console.log('Market data saved to', MARKET_DATA_FILE);

  // Update historical data
  let historicalData = [];
  try {
    if (await fs.pathExists(HISTORICAL_DATA_FILE)) {
      historicalData = await fs.readJson(HISTORICAL_DATA_FILE);
    }
  } catch (error) {
    console.log('Creating new historical data file');
  }

  // Add new data point to historical data
  historicalData.push({
    timestamp: timestamp,
    vix: marketData.volatility.vix.current,
    fearGreed: marketData.fearGreedIndex.value,
    sentiment: marketData.sentiment.aggregate.score,
    rsi: marketData.technicalIndicators.rsi
  });

  // Keep only last 90 days of data
  if (historicalData.length > 90) {
    historicalData = historicalData.slice(-90);
  }

  await fs.writeJson(HISTORICAL_DATA_FILE, historicalData, { spaces: 2 });
  console.log('Historical data updated');

  return marketData;
}

// Run if called directly
if (require.main === module) {
  fetchMarketData()
    .then(() => {
      console.log('Data fetch completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      process.exit(1);
    });
}

module.exports = { fetchMarketData };

