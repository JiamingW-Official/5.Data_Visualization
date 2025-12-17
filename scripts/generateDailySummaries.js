/**
 * Generate daily market sentiment summary
 */
function generateDailySummary(sentimentScore, sp500Change, nasdaqChange, dowChange, date) {
  const absScore = Math.abs(sentimentScore);
  const isPositive = sentimentScore > 0;
  
  // Determine sentiment strength
  let strength = 'moderate';
  if (absScore > 50) strength = 'strong';
  else if (absScore > 20) strength = 'moderate';
  else strength = 'mild';
  
  // Determine market direction
  const avgChange = (sp500Change + nasdaqChange + dowChange) / 3;
  const isBullish = avgChange > 0;
  
  // Generate summary based on sentiment and changes
  let summary = '';
  
  if (isPositive && isBullish) {
    if (strength === 'strong') {
      summary = `Strong bullish momentum with all major indices advancing. Market sentiment reflects significant optimism.`;
    } else if (strength === 'moderate') {
      summary = `Positive market sentiment with gains across major indices. Investors show cautious optimism.`;
    } else {
      summary = `Mildly positive sentiment with modest gains. Market shows steady upward trend.`;
    }
  } else if (isPositive && !isBullish) {
    summary = `Mixed signals: positive sentiment despite mixed index performance. Market shows resilience.`;
  } else if (!isPositive && !isBullish) {
    if (strength === 'strong') {
      summary = `Strong bearish sentiment with declines across major indices. Market shows significant concern.`;
    } else if (strength === 'moderate') {
      summary = `Negative sentiment with losses in major indices. Investors show caution.`;
    } else {
      summary = `Mildly negative sentiment with modest declines. Market shows slight weakness.`;
    }
  } else {
    summary = `Mixed market signals: negative sentiment despite some index gains. Uncertainty prevails.`;
  }
  
  // Add specific index performance
  const bestPerformer = Math.max(sp500Change, nasdaqChange, dowChange);
  const worstPerformer = Math.min(sp500Change, nasdaqChange, dowChange);
  
  if (Math.abs(bestPerformer) > 1 || Math.abs(worstPerformer) > 1) {
    let indexName = '';
    if (bestPerformer === sp500Change) indexName = 'S&P 500';
    else if (bestPerformer === nasdaqChange) indexName = 'NASDAQ';
    else indexName = 'Dow Jones';
    
    summary += ` ${indexName} led with ${bestPerformer > 0 ? '+' : ''}${bestPerformer.toFixed(2)}% change.`;
  }
  
  return summary.trim();
}

/**
 * Generate headline based on market performance
 */
function generateHeadline(sentimentScore, sp500Change, nasdaqChange, dowChange, date) {
  const avgChange = (sp500Change + nasdaqChange + dowChange) / 3;
  const absChange = Math.abs(avgChange);
  
  if (absChange < 0.3) {
    return 'Markets Trade Flat Amid Mixed Signals';
  }
  
  if (avgChange > 1.5) {
    return 'Major Indices Surge on Strong Market Sentiment';
  } else if (avgChange > 0.5) {
    return 'Markets Advance on Positive Trading Day';
  } else if (avgChange > 0) {
    return 'Markets Edge Higher in Cautious Trading';
  } else if (avgChange > -0.5) {
    return 'Markets Dip Slightly in Quiet Session';
  } else if (avgChange > -1.5) {
    return 'Markets Decline on Negative Sentiment';
  } else {
    return 'Major Indices Fall Sharply Amid Concerns';
  }
}

module.exports = { generateDailySummary, generateHeadline };



