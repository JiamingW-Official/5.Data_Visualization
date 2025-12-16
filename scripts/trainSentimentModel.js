const natural = require('natural');
const fs = require('fs-extra');
const path = require('path');

/**
 * Train a simple sentiment classifier (optional enhancement)
 * This is a basic implementation - for production, consider using
 * more sophisticated ML models or pre-trained models
 */
async function trainSentimentModel() {
  console.log('Training sentiment model...');

  // Sample training data (expand with real market news data)
  const trainingData = [
    { text: 'Market shows strong bullish momentum', sentiment: 'positive' },
    { text: 'Stocks rally on positive earnings', sentiment: 'positive' },
    { text: 'Investors remain optimistic about growth', sentiment: 'positive' },
    { text: 'Market crashes amid economic concerns', sentiment: 'negative' },
    { text: 'Stocks plunge on negative news', sentiment: 'negative' },
    { text: 'Investors fear market volatility', sentiment: 'negative' },
    { text: 'Market remains stable with mixed signals', sentiment: 'neutral' },
    { text: 'Trading volume is normal today', sentiment: 'neutral' }
  ];

  // Create classifier
  const classifier = new natural.BayesClassifier();

  // Add training data
  trainingData.forEach(item => {
    classifier.addDocument(item.text, item.sentiment);
  });

  // Train the classifier
  classifier.train();

  // Save the classifier
  const modelPath = path.join(__dirname, '..', 'models', 'sentiment-classifier.json');
  await fs.ensureDir(path.dirname(modelPath));
  
  classifier.save(modelPath, (err) => {
    if (err) {
      console.error('Error saving classifier:', err);
    } else {
      console.log('Sentiment classifier trained and saved to', modelPath);
    }
  });

  // Test the classifier
  console.log('\nTesting classifier:');
  const testTexts = [
    'Market is booming with record gains',
    'Stocks are falling rapidly',
    'Market shows no significant movement'
  ];

  testTexts.forEach(text => {
    const classification = classifier.classify(text);
    console.log(`"${text}" -> ${classification}`);
  });
}

// Run if called directly
if (require.main === module) {
  trainSentimentModel()
    .then(() => {
      console.log('\nModel training completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error training model:', error);
      process.exit(1);
    });
}

module.exports = { trainSentimentModel };

