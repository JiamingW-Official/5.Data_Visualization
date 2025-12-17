/**
 * Generate daily market sentiment summary
 */
function generateDailySummary(sentimentScore, sp500Change, nasdaqChange, dowChange, date) {
  // Get the absolute value of sentiment (ignore positive/negative, just get magnitude)
  // Example: -25 becomes 25, +30 stays 30
  const absScore = Math.abs(sentimentScore);
  // Check if sentiment is positive (above zero) or negative (below zero)
  const isPositive = sentimentScore > 0;
  
  // Determine how strong the sentiment is
  let strength = 'moderate';  // Default strength
  // Very strong sentiment (score > 50 or < -50)
  if (absScore > 50) strength = 'strong';
  // Moderate sentiment (score between 20-50 or -20 to -50)
  else if (absScore > 20) strength = 'moderate';
  // Mild sentiment (score between -20 and +20)
  else strength = 'mild';
  
  // Calculate average change across all three indices
  // Add all three changes together and divide by 3
  const avgChange = (sp500Change + nasdaqChange + dowChange) / 3;
  // Check if average is positive (market going up) or negative (market going down)
  const isBullish = avgChange > 0;
  
  // Start with empty summary text
  let summary = '';
  
  // Generate summary text based on different combinations of sentiment and market direction
  
  // Case 1: Positive sentiment AND market going up
  if (isPositive && isBullish) {
    // Very strong positive sentiment
    if (strength === 'strong') {
      summary = `Strong bullish momentum with all major indices advancing. Market sentiment reflects significant optimism.`;
    }
    // Moderate positive sentiment
    else if (strength === 'moderate') {
      summary = `Positive market sentiment with gains across major indices. Investors show cautious optimism.`;
    }
    // Mild positive sentiment
    else {
      summary = `Mildly positive sentiment with modest gains. Market shows steady upward trend.`;
    }
  }
  // Case 2: Positive sentiment BUT market going down (mixed signals)
  else if (isPositive && !isBullish) {
    summary = `Mixed signals: positive sentiment despite mixed index performance. Market shows resilience.`;
  }
  // Case 3: Negative sentiment AND market going down
  else if (!isPositive && !isBullish) {
    // Very strong negative sentiment
    if (strength === 'strong') {
      summary = `Strong bearish sentiment with declines across major indices. Market shows significant concern.`;
    }
    // Moderate negative sentiment
    else if (strength === 'moderate') {
      summary = `Negative sentiment with losses in major indices. Investors show caution.`;
    }
    // Mild negative sentiment
    else {
      summary = `Mildly negative sentiment with modest declines. Market shows slight weakness.`;
    }
  }
  // Case 4: Negative sentiment BUT market going up (mixed signals)
  else {
    summary = `Mixed market signals: negative sentiment despite some index gains. Uncertainty prevails.`;
  }
  
  // Find which index performed best (highest change) and worst (lowest change)
  const bestPerformer = Math.max(sp500Change, nasdaqChange, dowChange);
  const worstPerformer = Math.min(sp500Change, nasdaqChange, dowChange);
  
  // If the best or worst performer changed by more than 1%, add that info to summary
  if (Math.abs(bestPerformer) > 1 || Math.abs(worstPerformer) > 1) {
    // Figure out which index had the best performance
    let indexName = '';
    if (bestPerformer === sp500Change) indexName = 'S&P 500';
    else if (bestPerformer === nasdaqChange) indexName = 'NASDAQ';
    else indexName = 'Dow Jones';
    
    // Add text like "S&P 500 led with +2.5% change."
    // Add + sign if positive, no sign if negative
    summary += ` ${indexName} led with ${bestPerformer > 0 ? '+' : ''}${bestPerformer.toFixed(2)}% change.`;
  }
  
  // Remove any extra spaces at start/end and return the summary
  return summary.trim();
}

/**
 * Generate headline based on market performance
 * Creates a short headline describing the day's market movement
 */
function generateHeadline(sentimentScore, sp500Change, nasdaqChange, dowChange, date) {
  // Calculate average change across all three indices
  // Add all three changes and divide by 3
  const avgChange = (sp500Change + nasdaqChange + dowChange) / 3;
  // Get absolute value (ignore positive/negative, just get magnitude)
  // Example: -2.5 becomes 2.5, +1.2 stays 1.2
  const absChange = Math.abs(avgChange);
  
  // If change is very small (less than 0.3%), market is basically flat
  if (absChange < 0.3) {
    return 'Markets Trade Flat Amid Mixed Signals';
  }
  
  // Generate headline based on how much the market moved
  // Check from biggest moves to smallest moves
  
  // Very large positive move (more than +1.5%)
  if (avgChange > 1.5) {
    return 'Major Indices Surge on Strong Market Sentiment';
  }
  // Large positive move (between +0.5% and +1.5%)
  else if (avgChange > 0.5) {
    return 'Markets Advance on Positive Trading Day';
  }
  // Small positive move (between 0% and +0.5%)
  else if (avgChange > 0) {
    return 'Markets Edge Higher in Cautious Trading';
  }
  // Small negative move (between 0% and -0.5%)
  else if (avgChange > -0.5) {
    return 'Markets Dip Slightly in Quiet Session';
  }
  // Large negative move (between -0.5% and -1.5%)
  else if (avgChange > -1.5) {
    return 'Markets Decline on Negative Sentiment';
  }
  // Very large negative move (more than -1.5%)
  else {
    return 'Major Indices Fall Sharply Amid Concerns';
  }
}

module.exports = { generateDailySummary, generateHeadline };



