const cron = require('node-cron');
const { fetchMarketData } = require('./fetchMarketData');

/**
 * Schedule daily data updates
 * Runs every day at 9:00 AM (market open time)
 */
function startScheduler() {
  console.log('Starting data scheduler...');

  // Schedule daily update at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running scheduled data update...');
    try {
      await fetchMarketData();
      console.log('Scheduled update completed successfully');
    } catch (error) {
      console.error('Error in scheduled update:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  // Also run every hour during market hours (9 AM - 4 PM EST)
  cron.schedule('0 9-16 * * 1-5', async () => {
    console.log('Running hourly data update...');
    try {
      await fetchMarketData();
      console.log('Hourly update completed successfully');
    } catch (error) {
      console.error('Error in hourly update:', error);
    }
  }, {
    scheduled: true,
    timezone: 'America/New_York'
  });

  console.log('Scheduler started. Updates will run daily at 9:00 AM and hourly during market hours.');
}

module.exports = { startScheduler };

