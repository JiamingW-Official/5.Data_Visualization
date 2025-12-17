const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { generateDailySummary, generateHeadline } = require('./generateDailySummaries');

// Configuration
const DATA_DIR = path.join(__dirname, '..', 'data');
const MARKET_DATA_FILE = path.join(DATA_DIR, 'market-data.json');
const HISTORICAL_DATA_FILE = path.join(DATA_DIR, 'historical-data.json');

// Market indices symbols
const INDICES = {
  SP500: '^GSPC',    // S&P 500
  NASDAQ: '^IXIC',   // NASDAQ Composite
  DOW: '^DJI'        // Dow Jones Industrial Average
};

// Start date: First trading day of 2022 (January 3, 2022 was a Monday)
const START_DATE = new Date('2022-01-03');
const END_DATE = new Date();

/**
 * Check if a date is a trading day (Monday-Friday)
 */
function isTradingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
}

/**
 * Get all trading days between start and end date
 */
function getTradingDays(startDate, endDate) {
  const tradingDays = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (isTradingDay(current)) {
      tradingDays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return tradingDays;
}

/**
 * Fetch historical data from Yahoo Finance
 */
async function fetchYahooFinanceData(symbol, startDate, endDate) {
  try {
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    
    // Use the v8 API endpoint which is more reliable
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const params = {
      period1: startTimestamp,
      period2: endTimestamp,
      interval: '1d',
      events: 'history'
    };

    // Add headers to avoid 401 errors
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://finance.yahoo.com/'
    };

    try {
      const response = await axios.get(url, { params, headers, timeout: 60000 });
      
      // Check if we got chart data
      if (response.data && response.data.chart && response.data.chart.result) {
        const result = response.data.chart.result[0];
        if (result && result.timestamp && result.indicators && result.indicators.quote) {
          const timestamps = result.timestamp;
          const quotes = result.indicators.quote[0];
          const data = [];

          for (let i = 0; i < timestamps.length; i++) {
            if (quotes.close[i] === null || quotes.close[i] === undefined) continue;
            
            const date = new Date(timestamps[i] * 1000);
            const close = quotes.close[i];
            const open = quotes.open[i] || close;
            const high = quotes.high[i] || close;
            const low = quotes.low[i] || close;
            const volume = quotes.volume[i] || 0;

            if (!isNaN(close) && close > 0 && isTradingDay(date)) {
              data.push({
                date: date.toISOString().split('T')[0],
                timestamp: date.toISOString(),
                open: open,
                high: high,
                low: low,
                close: close,
                volume: volume
              });
            }
          }

          if (data.length > 0) {
            return data.sort((a, b) => new Date(a.date) - new Date(b.date));
          }
        }
      }
    } catch (chartError) {
      console.log(`Chart API failed for ${symbol}, trying CSV method...`);
    }

    // Fallback to CSV download method
    try {
      const csvUrl = `https://query1.finance.yahoo.com/v7/finance/download/${symbol}`;
      const csvResponse = await axios.get(csvUrl, { 
        params: {
          period1: startTimestamp,
          period2: endTimestamp,
          interval: '1d',
          events: 'history'
        },
        headers,
        timeout: 60000 
      });
      
      // Parse CSV data
      const lines = csvResponse.data.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        console.warn(`No CSV data returned for ${symbol}`);
        return [];
      }

      const data = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parsing - Yahoo Finance format: Date,Open,High,Low,Close,Adj Close,Volume
        const values = lines[i].split(',');
        if (values.length < 6) continue;

        // Parse date (format: YYYY-MM-DD)
        const dateStr = values[0].trim();
        let date = new Date(dateStr);
        
        if (isNaN(date.getTime())) {
          // Try alternative date parsing
          date = new Date(dateStr.replace(/-/g, '/'));
          if (isNaN(date.getTime())) continue;
        }

        const open = parseFloat(values[1]);
        const high = parseFloat(values[2]);
        const low = parseFloat(values[3]);
        const close = parseFloat(values[4]);
        const volume = parseFloat(values[6]) || 0;

        if (!isNaN(close) && close > 0 && isTradingDay(date)) {
          data.push({
            date: date.toISOString().split('T')[0],
            timestamp: date.toISOString(),
            open: open || close,
            high: high || close,
            low: low || close,
            close: close,
            volume: volume
          });
        }
      }

      return data.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (csvError) {
      console.error(`CSV method also failed for ${symbol}`);
      throw csvError;
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return [];
  }
}

/**
 * Calculate daily percentage change
 * This calculates how much the price changed from previous day to current day
 */
function calculateChange(current, previous) {
  // If there's no previous value or it's zero, return 0 (can't calculate)
  if (!previous || previous === 0) return 0;
  // Formula: ((new price - old price) / old price) * 100
  // Example: if price went from 100 to 105, result is ((105-100)/100)*100 = 5%
  return ((current - previous) / previous) * 100;
}

/**
 * Calculate custom Market Sentiment Index
 * Based on: price movements, volume, volatility, and trend strength
 */
function calculateSentimentIndex(marketData) {
  if (!marketData || marketData.length === 0) {
    return { score: 0, label: 'Neutral', factors: {} };
  }

  // Get the most recent day's data (last item in array)
  const latest = marketData[marketData.length - 1];
  // Get yesterday's data (second to last item), or use latest if only one day exists
  const previous = marketData.length > 1 ? marketData[marketData.length - 2] : latest;
  // Get data from 5 trading days ago (about 1 week), or use latest if not enough data
  const weekAgo = marketData.length > 5 ? marketData[marketData.length - 6] : latest;
  // Get data from 20 trading days ago (about 1 month), or use latest if not enough data
  const monthAgo = marketData.length > 20 ? marketData[marketData.length - 21] : latest;

  // Factor 1: Daily change (weight: 30% - most important)
  // Calculate how much price changed from yesterday to today
  const dailyChange = calculateChange(latest.close, previous.close);
  // Multiply by 10 to scale it, then limit to -100 to +100 range
  // Example: 1% change becomes 10 points, 5% change becomes 50 points
  const dailyChangeScore = Math.max(-100, Math.min(100, dailyChange * 10));

  // Factor 2: Weekly trend (weight: 25% - second most important)
  // Calculate how much price changed over the past week
  const weeklyChange = calculateChange(latest.close, weekAgo.close);
  // Multiply by 5 to scale it, then limit to -100 to +100 range
  const weeklyTrendScore = Math.max(-100, Math.min(100, weeklyChange * 5));

  // Factor 3: Monthly trend (weight: 20% - third most important)
  // Calculate how much price changed over the past month
  const monthlyChange = calculateChange(latest.close, monthAgo.close);
  // Multiply by 3 to scale it, then limit to -100 to +100 range
  const monthlyTrendScore = Math.max(-100, Math.min(100, monthlyChange * 3));

  // Factor 4: Volume analysis (weight: 15%)
  // Get volumes from last 20 trading days
  const recentVolumes = marketData.slice(-20).map(d => d.volume);
  // Calculate average volume over those 20 days
  const avgVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
  // Compare today's volume to average (ratio: 1.0 = average, 1.5 = 50% above average)
  const volumeRatio = avgVolume > 0 ? (latest.volume / avgVolume) : 1;
  // Convert ratio to score: 1.0 = 0 points, 1.5 = 50 points, 0.5 = -50 points
  // Limit to -50 to +50 range
  const volumeScore = Math.max(-50, Math.min(50, (volumeRatio - 1) * 100));

  // Factor 5: Volatility (weight: 10% - least important)
  // Calculate how much prices changed each day over last 20 days
  const recentChanges = marketData.slice(-20).map((d, i) => {
    // Skip first day (no previous day to compare)
    if (i === 0) return 0;
    // Calculate absolute change (always positive) from previous day
    return Math.abs(calculateChange(d.close, marketData[i - 1].close));
  });
  // Calculate average daily volatility (how much prices swing)
  const avgVolatility = recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length;
  // Lower volatility = higher score (stable market is good)
  // Formula: 50 - (volatility * 10), limited to -50 to +50 range
  // Example: 0% volatility = 50 points, 5% volatility = 0 points
  const volatilityScore = Math.max(-50, Math.min(50, 50 - (avgVolatility * 10)));

  // Combine all factors with their weights (percentages)
  // Multiply each score by its weight and add them together
  const sentimentScore = (
    dailyChangeScore * 0.30 +    // 30% weight
    weeklyTrendScore * 0.25 +    // 25% weight
    monthlyTrendScore * 0.20 +   // 20% weight
    volumeScore * 0.15 +         // 15% weight
    volatilityScore * 0.10        // 10% weight
  );

  // Make sure final score is between -100 and +100
  // Math.max(-100, ...) ensures it's not less than -100
  // Math.min(..., 100) ensures it's not more than +100
  const normalizedScore = Math.max(-100, Math.min(100, sentimentScore));

  // Decide what label to give this sentiment score
  let label = 'Neutral';  // Default label
  // Very positive sentiment
  if (normalizedScore > 50) label = 'Very Bullish';
  // Positive sentiment
  else if (normalizedScore > 20) label = 'Bullish';
  // Neutral sentiment (between -20 and +20)
  else if (normalizedScore > -20) label = 'Neutral';
  // Negative sentiment
  else if (normalizedScore > -50) label = 'Bearish';
  // Very negative sentiment
  else label = 'Very Bearish';

  return {
    score: parseFloat(normalizedScore.toFixed(2)),
    label: label,
    factors: {
      dailyChange: parseFloat(dailyChange.toFixed(2)),
      weeklyTrend: parseFloat(weeklyChange.toFixed(2)),
      monthlyTrend: parseFloat(monthlyChange.toFixed(2)),
      volumeRatio: parseFloat(volumeRatio.toFixed(2)),
      volatility: parseFloat(avgVolatility.toFixed(2))
    }
  };
}

/**
 * Aggregate sentiment from all three indices
 */
function aggregateMarketSentiment(sp500Data, nasdaqData, dowData) {
  // Check if we have any data
  if ((!sp500Data || sp500Data.length === 0) && 
      (!nasdaqData || nasdaqData.length === 0) && 
      (!dowData || dowData.length === 0)) {
    return {
      score: 0,
      label: 'Neutral',
      indices: {
        sp500: { score: 0, label: 'Neutral', current: 0, change: 0 },
        nasdaq: { score: 0, label: 'Neutral', current: 0, change: 0 },
        dow: { score: 0, label: 'Neutral', current: 0, change: 0 }
      }
    };
  }

  const sp500Sentiment = calculateSentimentIndex(sp500Data);
  const nasdaqSentiment = calculateSentimentIndex(nasdaqData);
  const dowSentiment = calculateSentimentIndex(dowData);

  // Calculate weights based on available data
  let totalWeight = 0;
  let aggregateScore = 0;
  
  if (sp500Data && sp500Data.length > 0) {
    aggregateScore += sp500Sentiment.score * 0.40;
    totalWeight += 0.40;
  }
  if (nasdaqData && nasdaqData.length > 0) {
    aggregateScore += nasdaqSentiment.score * 0.35;
    totalWeight += 0.35;
  }
  if (dowData && dowData.length > 0) {
    aggregateScore += dowSentiment.score * 0.25;
    totalWeight += 0.25;
  }

  // Normalize if weights don't add up to 1
  if (totalWeight > 0) {
    aggregateScore = aggregateScore / totalWeight;
  }

  // Determine aggregate label
  let label = 'Neutral';
  if (aggregateScore > 50) label = 'Very Bullish';
  else if (aggregateScore > 20) label = 'Bullish';
  else if (aggregateScore > -20) label = 'Neutral';
  else if (aggregateScore > -50) label = 'Bearish';
  else label = 'Very Bearish';

  return {
    score: parseFloat(aggregateScore.toFixed(2)),
    label: label,
    indices: {
      sp500: {
        score: sp500Sentiment.score,
        label: sp500Sentiment.label,
        current: sp500Data && sp500Data.length > 0 ? sp500Data[sp500Data.length - 1]?.close || 0 : 0,
        change: sp500Sentiment.factors?.dailyChange || 0
      },
      nasdaq: {
        score: nasdaqSentiment.score,
        label: nasdaqSentiment.label,
        current: nasdaqData && nasdaqData.length > 0 ? nasdaqData[nasdaqData.length - 1]?.close || 0 : 0,
        change: nasdaqSentiment.factors?.dailyChange || 0
      },
      dow: {
        score: dowSentiment.score,
        label: dowSentiment.label,
        current: dowData && dowData.length > 0 ? dowData[dowData.length - 1]?.close || 0 : 0,
        change: dowSentiment.factors?.dailyChange || 0
      }
    }
  };
}

/**
 * Main function to fetch all market data
 */
async function fetchAllMarketData() {
  console.log('Fetching market data from Yahoo Finance...');
  console.log(`Date range: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
  console.log('Note: This may take a few minutes on first run as it fetches all trading days since 2022...');

  try {
    // Fetch data for all three indices
    console.log('Fetching S&P 500 data...');
    const sp500Data = await fetchYahooFinanceData(INDICES.SP500, START_DATE, END_DATE);
    console.log(`Fetched ${sp500Data.length} trading days for S&P 500`);

    console.log('Fetching NASDAQ data...');
    const nasdaqData = await fetchYahooFinanceData(INDICES.NASDAQ, START_DATE, END_DATE);
    console.log(`Fetched ${nasdaqData.length} trading days for NASDAQ`);

    console.log('Fetching Dow Jones data...');
    const dowData = await fetchYahooFinanceData(INDICES.DOW, START_DATE, END_DATE);
    console.log(`Fetched ${dowData.length} trading days for Dow Jones`);

    // Calculate sentiment
    console.log('Calculating market sentiment...');
    const marketSentiment = aggregateMarketSentiment(sp500Data, nasdaqData, dowData);

    // Check if we have any data
    if (sp500Data.length === 0 && nasdaqData.length === 0 && dowData.length === 0) {
      throw new Error('No market data was fetched. Please check your internet connection and try again.');
    }

    // Prepare current market data
    const latestDate = (sp500Data.length > 0 ? sp500Data[sp500Data.length - 1]?.date : 
                        nasdaqData.length > 0 ? nasdaqData[nasdaqData.length - 1]?.date :
                        dowData.length > 0 ? dowData[dowData.length - 1]?.date : 
                        new Date().toISOString().split('T')[0]);
    
    const currentData = {
      timestamp: new Date().toISOString(),
      date: latestDate,
      sentiment: marketSentiment,
      indices: {
        sp500: {
          current: marketSentiment.indices.sp500.current,
          change: marketSentiment.indices.sp500.change || 0,
          changePercent: parseFloat((marketSentiment.indices.sp500.change || 0).toFixed(2))
        },
        nasdaq: {
          current: marketSentiment.indices.nasdaq.current,
          change: marketSentiment.indices.nasdaq.change || 0,
          changePercent: parseFloat((marketSentiment.indices.nasdaq.change || 0).toFixed(2))
        },
        dow: {
          current: marketSentiment.indices.dow.current,
          change: marketSentiment.indices.dow.change || 0,
          changePercent: parseFloat((marketSentiment.indices.dow.change || 0).toFixed(2))
        }
      }
    };

    // Save current market data
    await fs.writeJson(MARKET_DATA_FILE, currentData, { spaces: 2 });
    console.log('Current market data saved');

    // Prepare historical data (simplified for Chart.js)
    const historicalData = [];
    const maxLength = Math.max(sp500Data.length, nasdaqData.length, dowData.length);

    for (let i = 0; i < maxLength; i++) {
      const date = sp500Data[i]?.date || nasdaqData[i]?.date || dowData[i]?.date;
      if (!date) continue;

      // Calculate sentiment for this day using data up to this point
      const sp500Slice = sp500Data.slice(0, i + 1);
      const nasdaqSlice = nasdaqData.slice(0, i + 1);
      const dowSlice = dowData.slice(0, i + 1);
      
      if (sp500Slice.length > 0 && nasdaqSlice.length > 0 && dowSlice.length > 0) {
        const daySentiment = aggregateMarketSentiment(sp500Slice, nasdaqSlice, dowSlice);
        
        // Calculate daily changes
        const prevSp500 = i > 0 ? sp500Data[i - 1]?.close : sp500Data[i]?.close;
        const prevNasdaq = i > 0 ? nasdaqData[i - 1]?.close : nasdaqData[i]?.close;
        const prevDow = i > 0 ? dowData[i - 1]?.close : dowData[i]?.close;
        
        const sp500Change = prevSp500 ? ((sp500Data[i]?.close - prevSp500) / prevSp500) * 100 : 0;
        const nasdaqChange = prevNasdaq ? ((nasdaqData[i]?.close - prevNasdaq) / prevNasdaq) * 100 : 0;
        const dowChange = prevDow ? ((dowData[i]?.close - prevDow) / prevDow) * 100 : 0;
        
        // Generate headline and summary
        const headline = generateHeadline(daySentiment.score, sp500Change, nasdaqChange, dowChange, date);
        const summary = generateDailySummary(daySentiment.score, sp500Change, nasdaqChange, dowChange, date);
        
        historicalData.push({
          date: date,
          timestamp: new Date(date).toISOString(),
          sp500: sp500Data[i]?.close || 0,
          nasdaq: nasdaqData[i]?.close || 0,
          dow: dowData[i]?.close || 0,
          sentiment: parseFloat(daySentiment.score.toFixed(2)),
          sentimentLabel: daySentiment.label,
          changes: {
            sp500: parseFloat(sp500Change.toFixed(2)),
            nasdaq: parseFloat(nasdaqChange.toFixed(2)),
            dow: parseFloat(dowChange.toFixed(2))
          },
          headline: headline,
          summary: summary
        });
      }
    }

    // Save historical data
    await fs.writeJson(HISTORICAL_DATA_FILE, historicalData, { spaces: 2 });
    console.log(`Historical data saved (${historicalData.length} trading days)`);

    return {
      current: currentData,
      historical: historicalData
    };

  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  fetchAllMarketData()
    .then(() => {
      console.log('Market data fetch completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllMarketData, calculateSentimentIndex };

