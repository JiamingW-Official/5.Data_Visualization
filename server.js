const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to get market data
app.get('/api/market-data', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'market-data.json');
    const data = await fs.readJson(dataPath);
    res.json(data);
  } catch (error) {
    console.error('Error reading market data:', error);
    res.status(500).json({ error: 'Failed to load market data' });
  }
});

// API endpoint to get historical data
app.get('/api/historical-data', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'historical-data.json');
    const data = await fs.readJson(dataPath);
    res.json(data);
  } catch (error) {
    console.error('Error reading historical data:', error);
    res.status(500).json({ error: 'Failed to load historical data' });
  }
});

// API endpoint to trigger data update (can be called by n8n webhook)
app.post('/api/update-data', async (req, res) => {
  try {
    const { fetchAllMarketData } = require('./scripts/marketDataFetcher');
    await fetchAllMarketData();
    res.json({ success: true, message: 'Market data updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Failed to update market data' });
  }
});

// Optional: Start scheduler for automated data updates
// Uncomment the following lines to enable automatic daily updates
// const { startScheduler } = require('./scripts/scheduler');
// startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}`);
});

