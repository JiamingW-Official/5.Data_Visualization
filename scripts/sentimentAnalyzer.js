const natural = require('natural');
const compromise = require('compromise');

// Initialize sentiment analyzer
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer('English', stemmer, 'afinn');

// Sentiment lexicon (can be expanded)
const positiveWords = [
  'bullish', 'rally', 'surge', 'gain', 'profit', 'growth', 'optimistic',
  'positive', 'strong', 'upward', 'momentum', 'breakthrough', 'success',
  'boom', 'expansion', 'recovery', 'rebound', 'soar', 'climb', 'advance'
];

const negativeWords = [
  'bearish', 'crash', 'plunge', 'loss', 'decline', 'pessimistic', 'negative',
  'weak', 'downward', 'recession', 'crisis', 'fear', 'uncertainty', 'volatility',
  'drop', 'fall', 'slump', 'collapse', 'panic', 'concern', 'risk', 'threat'
];

/**
 * Analyze sentiment of text using multiple methods
 */
function analyzeSentiment(text) {
  if (!text || typeof text !== 'string') {
    return { label: 'neutral', score: 0, confidence: 0 };
  }

  // Method 1: Natural library AFINN-based analysis
  const tokens = natural.WordTokenizer().tokenize(text.toLowerCase());
  const afinnScore = analyzer.getSentiment(tokens);

  // Method 2: Custom lexicon-based analysis
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\w*\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });

  // Method 3: NLP analysis using compromise
  const doc = compromise(text);
  const sentiment = doc.sentiment();

  // Combine scores (normalize to -1 to 1 range)
  const lexiconScore = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
  const compromiseScore = sentiment.score || 0;
  
  // Weighted combination
  const combinedScore = (afinnScore * 0.4) + (lexiconScore * 0.3) + (compromiseScore * 0.3);
  
  // Normalize to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, combinedScore));

  // Determine label
  let label = 'neutral';
  if (normalizedScore > 0.1) label = 'positive';
  else if (normalizedScore < -0.1) label = 'negative';

  // Calculate confidence
  const confidence = Math.abs(normalizedScore);

  return {
    label: label,
    score: normalizedScore,
    confidence: parseFloat(confidence.toFixed(2)),
    breakdown: {
      afinn: parseFloat(afinnScore.toFixed(2)),
      lexicon: parseFloat(lexiconScore.toFixed(2)),
      nlp: parseFloat(compromiseScore.toFixed(2))
    }
  };
}

/**
 * Analyze sentiment for multiple texts
 */
function analyzeBatchSentiment(texts) {
  return texts.map(text => analyzeSentiment(text));
}

/**
 * Get aggregate sentiment from multiple analyses
 */
function aggregateSentiment(analyses) {
  if (!analyses || analyses.length === 0) {
    return { label: 'neutral', score: 0, confidence: 0 };
  }

  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  const positiveCount = analyses.filter(a => a.label === 'positive').length;
  const negativeCount = analyses.filter(a => a.label === 'negative').length;
  const neutralCount = analyses.filter(a => a.label === 'neutral').length;

  let label = 'neutral';
  if (avgScore > 0.1) label = 'positive';
  else if (avgScore < -0.1) label = 'negative';

  return {
    label: label,
    score: parseFloat(avgScore.toFixed(2)),
    confidence: parseFloat((Math.abs(avgScore)).toFixed(2)),
    distribution: {
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
      total: analyses.length
    }
  };
}

module.exports = {
  analyzeSentiment,
  analyzeBatchSentiment,
  aggregateSentiment
};

