// ============================================
// STEP 1: Initialize Variables
// ============================================
// Store all chart instances so we can update them later
let charts = {};

// Define colors for each market index
const colors = {
    sp500: '#3498db',    // Blue for S&P 500
    nasdaq: '#2ecc71',   // Green for NASDAQ
    dow: '#e74c3c',      // Red for Dow Jones
    sentiment: '#9b59b6' // Purple for sentiment
};

// ============================================
// STEP 2: Fetch Data from API or JSON Files
// ============================================
async function fetchData() {
    // Get the current website path (needed for GitHub Pages subdirectory)
    // Example: if URL is "github.com/user/repo/page", basePath = "/user/repo"
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    
    // Try to get data, if it fails, return empty data
    try {
        // Create two empty variables to store data
        let marketData, historicalData;
        
        // First, try to get data from API (works when running local server)
        try {
            // Get current market data from API endpoint
            marketData = await (await fetch('/api/market-data')).json();
            // Get historical market data from API endpoint
            historicalData = await (await fetch('/api/historical-data')).json();
        } catch {
            // If API doesn't work (like on GitHub Pages), get data from JSON files
            // Get current market data from JSON file
            marketData = await (await fetch(`${basePath}/data/market-data.json`)).json();
            // Get historical market data from JSON file
            historicalData = await (await fetch(`${basePath}/data/historical-data.json`)).json();
        }
        
        // Return both data objects together
        return { marketData, historicalData };
    } catch (error) {
        // If everything fails, print error and return empty data
        console.error('Error loading data:', error);
        return { marketData: null, historicalData: [] };
    }
}

// ============================================
// STEP 3: Helper Functions
// ============================================

// Format large numbers to make them easier to read
// Example: 1500000 becomes "1.50M", 5000 becomes "5.00K"
function formatNum(num) {
    // If number is 1 million or more, divide by 1 million and add "M"
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    // If number is 1 thousand or more, divide by 1 thousand and add "K"
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    // Otherwise, just show 2 decimal places
    return num.toFixed(2);
}

// ============================================
// STEP 4: Update Metrics Display Cards
// ============================================
function updateMetrics(data) {
    // If no data provided, stop here
    if (!data) return;
    
    // Get the sentiment information from data
    const s = data.sentiment;
    // If sentiment exists, update the display
    if (s) {
        // Show sentiment score with 1 decimal place (e.g., "5.2")
        document.getElementById('sentimentValue').textContent = s.score.toFixed(1);
        // Show sentiment label (e.g., "Bullish", "Neutral", "Bearish")
        document.getElementById('sentimentLabel').textContent = s.label;
        // Change text color: green if very positive (>20), red if very negative (<-20), gray otherwise
        document.getElementById('sentimentValue').style.color = s.score > 20 ? '#2ecc71' : s.score < -20 ? '#e74c3c' : '#7f8c8d';
    }
    
    // Get all three market indices data (S&P 500, NASDAQ, Dow Jones)
    const idx = data.indices || {};
    // Loop through each index name
    ['sp500', 'nasdaq', 'dow'].forEach(name => {
        // Get the data for this specific index
        const i = idx[name];
        // If data exists for this index, update its display
        if (i) {
            // Show the current price value (formatted nicely)
            document.getElementById(`${name}Value`).textContent = formatNum(i.current);
            // Get the change percentage element
            const change = document.getElementById(`${name}Change`);
            // Show change percentage with + sign if positive, no sign if negative
            change.textContent = `${i.changePercent >= 0 ? '+' : ''}${i.changePercent.toFixed(2)}%`;
            // Add CSS class: "positive" if up, "negative" if down (for color styling)
            change.className = `metric-change ${i.changePercent >= 0 ? 'positive' : 'negative'}`;
        }
    });
    
    // Update the "last updated" time at the top
    if (data.timestamp) {
        // Convert timestamp to readable date/time string
        document.getElementById('lastUpdate').textContent = `Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
}

// ============================================
// STEP 5: Create Chart Function (Simplified)
// ============================================
// This function creates any Chart.js chart (line or bar chart)
function createChart(id, type, data, options = {}) {
    // Find the HTML canvas element by its ID
    // Get the 2D drawing context (needed to draw on canvas)
    const ctx = document.getElementById(id).getContext('2d');
    
    // If a chart already exists with this ID, destroy it first
    // This prevents creating duplicate charts
    if (charts[id]) charts[id].destroy();
    
    // Create a new chart and save it in our charts object
    charts[id] = new Chart(ctx, {
        type: type,        // Chart type: 'line' for line chart, 'bar' for bar chart
        data: data,        // The data to display (includes datasets and labels)
        options: {
            responsive: true,              // Chart will resize when window size changes
            maintainAspectRatio: false,    // Don't keep fixed width/height ratio (allows custom sizing)
            plugins: {
                // Show the legend (color labels) only if it's a line chart with multiple lines
                legend: { 
                    display: type === 'line' && data.datasets.length > 1 
                },
                // Style the tooltip (the box that appears when you hover over data)
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',  // Dark semi-transparent background
                    padding: 10,                         // Space inside tooltip
                    titleFont: { size: 12, weight: 'bold' },  // Title text: 12px, bold
                    bodyFont: { size: 11 }              // Body text: 11px
                }
            },
            // Add any extra options that were passed to this function
            ...options
        }
    });
}

// ============================================
// STEP 6: Create Market Indices Comparison Chart
// ============================================
function createIndicesChart(historicalData) {
    // If no historical data, stop here
    if (!historicalData.length) return;
    
    // Get the first day's data (we'll use this as the starting point for comparison)
    const first = historicalData[0];
    
    // Prepare data for all three indices (S&P 500, NASDAQ, Dow Jones)
    const datasets = [
        {
            label: 'S&P 500',  // Name shown in legend
            // Convert each day's data to chart format
            data: historicalData.map(d => ({ 
                x: new Date(d.date),  // X-axis: the date
                // Y-axis: calculate percentage change from first day
                // Formula: (current price / first day price - 1) * 100
                // Example: if first day was 4000 and today is 4500, result is +12.5%
                y: parseFloat(((d.sp500 / first.sp500 - 1) * 100).toFixed(2))
            })),
            borderColor: colors.sp500,  // Line color: blue
            borderWidth: 2,              // Line thickness: 2 pixels
            fill: false,                  // Don't fill area under line
            pointRadius: 0,              // Don't show dots on the line
            pointHoverRadius: 0          // Don't show dots when hovering
        },
        {
            label: 'NASDAQ',  // Name shown in legend
            // Same process for NASDAQ
            data: historicalData.map(d => ({ 
                x: new Date(d.date),  // X-axis: the date
                // Calculate percentage change from first day for NASDAQ
                y: parseFloat(((d.nasdaq / first.nasdaq - 1) * 100).toFixed(2))
            })),
            borderColor: colors.nasdaq,  // Line color: green
            borderWidth: 2,               // Line thickness: 2 pixels
            fill: false,                   // Don't fill area under line
            pointRadius: 0,               // Don't show dots on the line
            pointHoverRadius: 0           // Don't show dots when hovering
        },
        {
            label: 'Dow Jones',  // Name shown in legend
            // Same process for Dow Jones
            data: historicalData.map(d => ({ 
                x: new Date(d.date),  // X-axis: the date
                // Calculate percentage change from first day for Dow Jones
                y: parseFloat(((d.dow / first.dow - 1) * 100).toFixed(2))
            })),
            borderColor: colors.dow,  // Line color: red
            borderWidth: 2,            // Line thickness: 2 pixels
            fill: false,               // Don't fill area under line
            pointRadius: 0,           // Don't show dots on the line
            pointHoverRadius: 0        // Don't show dots when hovering
        }
    ];
    
    // Create the chart with these settings
    createChart('indicesChart', 'line', { datasets }, {
        scales: {
            x: { 
                type: 'time',           // X-axis shows dates (time scale)
                time: { unit: 'month' } // Group dates by month for display
            },
            y: { 
                title: { display: true, text: 'Change (%)' },  // Y-axis label: "Change (%)"
                ticks: { callback: v => v + '%' }  // Add % symbol to all Y-axis numbers
            }
        }
    });
}

// ============================================
// STEP 7: Create Sentiment Trend Chart
// ============================================
function createSentimentChart(historicalData) {
    // If no historical data, stop here
    if (!historicalData.length) return;
    
    // Convert historical data to chart format
    // For each day, create an object with date (x) and sentiment score (y)
    const sentimentData = historicalData.map(d => ({ 
        x: new Date(d.date),  // X-axis: the date
        y: d.sentiment        // Y-axis: the sentiment score (-100 to +100)
    }));
    
    // Create the sentiment trend chart
    createChart('sentimentTrendChart', 'line', {
        datasets: [{
            label: 'Sentiment',  // Name for this line (not shown since legend is hidden)
            data: sentimentData, // The data points to plot
            borderColor: colors.sentiment,  // Line color: purple
            backgroundColor: 'rgba(155, 89, 182, 0.1)',  // Light purple fill color (10% opacity)
            borderWidth: 2,       // Line thickness: 2 pixels
            fill: true,           // Fill the area under the line with light purple
            pointRadius: 0,       // Don't show dots on the line
            pointHoverRadius: 0   // Don't show dots when hovering
        }]
    }, {
        scales: {
            x: { 
                type: 'time',           // X-axis shows dates
                time: { unit: 'month' } // Group dates by month
            },
            y: { 
                title: { display: true, text: 'Score' },  // Y-axis label: "Score"
                min: -100,  // Minimum Y value: -100 (very bearish)
                max: 100   // Maximum Y value: +100 (very bullish)
            }
        },
        plugins: { 
            legend: { display: false }  // Don't show legend (only one line, so not needed)
        }
    });
}

// ============================================
// STEP 8: Create Daily Changes Bar Chart
// ============================================
function createDailyChart(data) {
    // If data doesn't have indices information, stop here
    // The ?. means "if data exists, check indices, otherwise return undefined"
    if (!data?.indices) return;
    
    // Get the indices data (S&P 500, NASDAQ, Dow Jones)
    const idx = data.indices;
    
    // Create an array with the change percentages for all three indices
    // Use || 0 to default to 0 if the value doesn't exist
    const changes = [
        idx.sp500?.changePercent || 0,  // S&P 500 change (or 0 if missing)
        idx.nasdaq?.changePercent || 0, // NASDAQ change (or 0 if missing)
        idx.dow?.changePercent || 0     // Dow Jones change (or 0 if missing)
    ];
    
    // Decide bar colors: green if positive (up), red if negative (down)
    // Loop through each change value and assign a color
    const barColors = changes.map(change => 
        change >= 0 ? '#2ecc71' : '#e74c3c'  // Green (#2ecc71) for up, Red (#e74c3c) for down
    );
    
    // Create the bar chart
    createChart('dailyChangesChart', 'bar', {
        labels: ['S&P 500', 'NASDAQ', 'Dow Jones'],  // Labels for each bar
        datasets: [{
            label: 'Change (%)',  // Name for this dataset (not shown since legend is hidden)
            data: changes,          // The values for each bar
            backgroundColor: barColors  // Color for each bar (green or red)
        }]
    }, {
        scales: {
            y: { 
                // Add % symbol to all Y-axis numbers (e.g., "1.5" becomes "1.5%")
                ticks: { callback: v => v + '%' }
            }
        },
        plugins: { 
            legend: { display: false }  // Don't show legend (only one dataset)
        }
    });
}

// ============================================
// STEP 9: Create Individual Index Charts
// ============================================
function createIndexChart(id, name, color, historicalData) {
    // If no historical data, stop here
    if (!historicalData.length) return;
    
    // Convert the display name to the data property name
    // Example: "S&P 500" becomes "sp500", "NASDAQ" becomes "nasdaq", "Dow Jones" becomes "dowjones"
    const prop = name === 'S&P 500' ? 'sp500' : name.toLowerCase().replace(' ', '');
    
    // Convert historical data to chart format
    // For each day, create an object with date (x) and price (y)
    const priceData = historicalData.map(d => ({ 
        x: new Date(d.date),  // X-axis: the date
        y: d[prop]            // Y-axis: the price for this index (sp500, nasdaq, or dow)
    }));
    
    // Create the line chart for this individual index
    createChart(id, 'line', {
        datasets: [{
            label: name,              // Name for this line (not shown since legend is hidden)
            data: priceData,          // The data points to plot
            borderColor: color,       // Line color (passed as parameter)
            backgroundColor: color + '20',  // Fill color: add "20" to color code for transparency
            // Example: "#3498db" becomes "#3498db20" (20% opacity blue)
            borderWidth: 2,           // Line thickness: 2 pixels
            fill: true,               // Fill the area under the line
            pointRadius: 0,           // Don't show dots on the line
            pointHoverRadius: 0       // Don't show dots when hovering
        }]
    }, {
        scales: {
            x: { 
                type: 'time',           // X-axis shows dates
                time: { unit: 'month' }  // Group dates by month
            },
            y: { 
                title: { display: true, text: 'Price' }  // Y-axis label: "Price"
            }
        },
        plugins: { 
            legend: { display: false }  // Don't show legend (only one line)
        }
    });
}

// ============================================
// STEP 10: Initialize Dashboard
// ============================================
async function init() {
    // Get both current market data and historical data
    // await means "wait for this to finish before continuing"
    const { marketData, historicalData } = await fetchData();
    
    // Check if we actually got data
    // If no current data OR no historical data, show error message and stop
    if (!marketData || !historicalData.length) {
        document.getElementById('lastUpdate').textContent = 'No data available';
        return;  // Stop here, don't continue
    }
    
    // Update the metric cards at the top (sentiment, S&P 500, NASDAQ, Dow values)
    updateMetrics(marketData);
    
    // Create all the charts on the page
    createIndicesChart(historicalData);           // Chart comparing all three indices
    createSentimentChart(historicalData);         // Chart showing sentiment over time
    createDailyChart(marketData);                 // Bar chart showing today's changes
    // Create individual charts for each index
    createIndexChart('sp500Chart', 'S&P 500', colors.sp500, historicalData);
    createIndexChart('nasdaqChart', 'NASDAQ', colors.nasdaq, historicalData);
    createIndexChart('dowChart', 'Dow Jones', colors.dow, historicalData);
    
    // Initialize the calendar view (if the calendar.js file is loaded)
    // typeof checks if the function exists before calling it
    if (typeof initCalendar === 'function') {
        initCalendar(historicalData);
    }
}

// ============================================
// STEP 11: Refresh Data Function
// ============================================
async function refreshData() {
    // Find the refresh button on the page
    const btn = document.getElementById('refreshBtn');
    // Disable the button so user can't click it multiple times
    btn.disabled = true;
    // Change button text to show it's loading
    btn.textContent = 'Loading...';
    // Re-run the init function to get fresh data and update everything
    // await means "wait for this to finish"
    await init();
    // Re-enable the button
    btn.disabled = false;
    // Change button text back to "Refresh"
    btn.textContent = 'Refresh';
}

// ============================================
// STEP 12: Make Functions Available Globally
// ============================================
// Make refreshData available globally so HTML can call it with onclick="refreshData()"
window.refreshData = refreshData;

// ============================================
// STEP 13: Start Dashboard When Page Loads
// ============================================
// When the HTML page finishes loading, automatically run the init function
// This starts the dashboard and loads all the data and charts
document.addEventListener('DOMContentLoaded', init);
