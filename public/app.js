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
    // Calculate base path for GitHub Pages (handles subdirectory)
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    
    try {
        let marketData, historicalData;
        
        // Try to fetch from API first (for local development)
        try {
            marketData = await (await fetch('/api/market-data')).json();
            historicalData = await (await fetch('/api/historical-data')).json();
        } catch {
            // If API fails, fetch from static JSON files (for GitHub Pages)
            marketData = await (await fetch(`${basePath}/data/market-data.json`)).json();
            historicalData = await (await fetch(`${basePath}/data/historical-data.json`)).json();
        }
        
        return { marketData, historicalData };
    } catch (error) {
        console.error('Error loading data:', error);
        return { marketData: null, historicalData: [] };
    }
}

// ============================================
// STEP 3: Helper Functions
// ============================================

// Format large numbers (e.g., 1500000 -> "1.50M")
function formatNum(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
}

// ============================================
// STEP 4: Update Metrics Display Cards
// ============================================
function updateMetrics(data) {
    if (!data) return;
    
    // Update Market Sentiment Index
    const s = data.sentiment;
    if (s) {
        document.getElementById('sentimentValue').textContent = s.score.toFixed(1);
        document.getElementById('sentimentLabel').textContent = s.label;
        // Color code: green if positive, red if negative, gray if neutral
        document.getElementById('sentimentValue').style.color = s.score > 20 ? '#2ecc71' : s.score < -20 ? '#e74c3c' : '#7f8c8d';
    }
    
    // Update S&P 500, NASDAQ, and Dow Jones metrics
    const idx = data.indices || {};
    ['sp500', 'nasdaq', 'dow'].forEach(name => {
        const i = idx[name];
        if (i) {
            // Display current value
            document.getElementById(`${name}Value`).textContent = formatNum(i.current);
            // Display change percentage with color
            const change = document.getElementById(`${name}Change`);
            change.textContent = `${i.changePercent >= 0 ? '+' : ''}${i.changePercent.toFixed(2)}%`;
            change.className = `metric-change ${i.changePercent >= 0 ? 'positive' : 'negative'}`;
        }
    });
    
    // Update last update timestamp
    if (data.timestamp) {
        document.getElementById('lastUpdate').textContent = `Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
}

// ============================================
// STEP 5: Create Chart Function (Simplified)
// ============================================
// This is the main function that creates any Chart.js chart
function createChart(id, type, data, options = {}) {
    // Get the canvas element
    const ctx = document.getElementById(id).getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts[id]) charts[id].destroy();
    
    // Create new chart with simplified options
    charts[id] = new Chart(ctx, {
        type: type,        // 'line' or 'bar'
        data: data,        // Chart data (datasets, labels)
        options: {
            responsive: true,              // Make chart responsive
            maintainAspectRatio: false,    // Allow custom height
            plugins: {
                // Show legend only for line charts with multiple datasets
                legend: { 
                    display: type === 'line' && data.datasets.length > 1 
                },
                // Simple tooltip styling
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 10,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 }
                }
            },
            // Merge with custom options passed in
            ...options
        }
    });
}

// ============================================
// STEP 6: Create Market Indices Comparison Chart
// ============================================
function createIndicesChart(historicalData) {
    if (!historicalData.length) return;
    
    // Step 6.1: Get first day's values to calculate percentage change
    const first = historicalData[0];
    
    // Step 6.2: Prepare data for each index (normalized to percentage change)
    const datasets = [
        {
            label: 'S&P 500',
            data: historicalData.map(d => ({ 
                x: new Date(d.date), 
                y: parseFloat(((d.sp500 / first.sp500 - 1) * 100).toFixed(2))
            })),
            borderColor: colors.sp500,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,        // No dots - pure line
            pointHoverRadius: 0    // No dots on hover
        },
        {
            label: 'NASDAQ',
            data: historicalData.map(d => ({ 
                x: new Date(d.date), 
                y: parseFloat(((d.nasdaq / first.nasdaq - 1) * 100).toFixed(2))
            })),
            borderColor: colors.nasdaq,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,        // No dots - pure line
            pointHoverRadius: 0   // No dots on hover
        },
        {
            label: 'Dow Jones',
            data: historicalData.map(d => ({ 
                x: new Date(d.date), 
                y: parseFloat(((d.dow / first.dow - 1) * 100).toFixed(2))
            })),
            borderColor: colors.dow,
            borderWidth: 2,
            fill: false,
            pointRadius: 0,        // No dots - pure line
            pointHoverRadius: 0    // No dots on hover
        }
    ];
    
    // Step 6.3: Create the chart with time-based x-axis
    createChart('indicesChart', 'line', { datasets }, {
        scales: {
            x: { 
                type: 'time',           // Use time scale for dates
                time: { unit: 'month' } // Group by month
            },
            y: { 
                title: { display: true, text: 'Change (%)' },
                ticks: { callback: v => v + '%' }  // Add % to y-axis labels
            }
        }
    });
}

// ============================================
// STEP 7: Create Sentiment Trend Chart
// ============================================
function createSentimentChart(historicalData) {
    if (!historicalData.length) return;
    
    // Step 7.1: Prepare sentiment data
    const sentimentData = historicalData.map(d => ({ 
        x: new Date(d.date), 
        y: d.sentiment 
    }));
    
    // Step 7.2: Create chart with filled area
    createChart('sentimentTrendChart', 'line', {
        datasets: [{
            label: 'Sentiment',
            data: sentimentData,
            borderColor: colors.sentiment,
            backgroundColor: 'rgba(155, 89, 182, 0.1)',  // Light purple fill
            borderWidth: 2,
            fill: true,              // Fill area under line
            pointRadius: 0,          // No dots - pure line
            pointHoverRadius: 0      // No dots on hover
        }]
    }, {
        scales: {
            x: { 
                type: 'time', 
                time: { unit: 'month' } 
            },
            y: { 
                title: { display: true, text: 'Score' },
                min: -100,  // Sentiment range: -100 to +100
                max: 100
            }
        },
        plugins: { 
            legend: { display: false }  // Hide legend (only one line)
        }
    });
}

// ============================================
// STEP 8: Create Daily Changes Bar Chart
// ============================================
function createDailyChart(data) {
    if (!data?.indices) return;
    
    const idx = data.indices;
    
    // Step 8.1: Prepare bar chart data
    const changes = [
        idx.sp500?.changePercent || 0,
        idx.nasdaq?.changePercent || 0,
        idx.dow?.changePercent || 0
    ];
    
    // Step 8.2: Color bars: green for positive (up), red for negative (down)
    const barColors = changes.map(change => 
        change >= 0 ? '#2ecc71' : '#e74c3c'  // Green for up, red for down
    );
    
    createChart('dailyChangesChart', 'bar', {
        labels: ['S&P 500', 'NASDAQ', 'Dow Jones'],
        datasets: [{
            label: 'Change (%)',
            data: changes,
            backgroundColor: barColors
        }]
    }, {
        scales: {
            y: { 
                ticks: { callback: v => v + '%' }  // Add % to y-axis
            }
        },
        plugins: { 
            legend: { display: false }  // Hide legend
        }
    });
}

// ============================================
// STEP 9: Create Individual Index Charts
// ============================================
function createIndexChart(id, name, color, historicalData) {
    if (!historicalData.length) return;
    
    // Step 9.1: Map chart name to data property
    const prop = name === 'S&P 500' ? 'sp500' : name.toLowerCase().replace(' ', '');
    
    // Step 9.2: Prepare price data
    const priceData = historicalData.map(d => ({ 
        x: new Date(d.date), 
        y: d[prop] 
    }));
    
    // Step 9.3: Create chart with filled area
    createChart(id, 'line', {
        datasets: [{
            label: name,
            data: priceData,
            borderColor: color,
            backgroundColor: color + '20',  // Light transparent fill
            borderWidth: 2,
            fill: true,                     // Fill area under line
            pointRadius: 0,                 // No dots - pure line
            pointHoverRadius: 0            // No dots on hover
        }]
    }, {
        scales: {
            x: { 
                type: 'time', 
                time: { unit: 'month' } 
            },
            y: { 
                title: { display: true, text: 'Price' } 
            }
        },
        plugins: { 
            legend: { display: false }  // Hide legend
        }
    });
}

// ============================================
// STEP 10: Initialize Dashboard
// ============================================
async function init() {
    // Step 10.1: Fetch all data
    const { marketData, historicalData } = await fetchData();
    
    // Step 10.2: Check if data is available
    if (!marketData || !historicalData.length) {
        document.getElementById('lastUpdate').textContent = 'No data available';
        return;
    }
    
    // Step 10.3: Update metric cards
    updateMetrics(marketData);
    
    // Step 10.4: Create all charts
    createIndicesChart(historicalData);           // Market comparison
    createSentimentChart(historicalData);         // Sentiment trend
    createDailyChart(marketData);                 // Today's changes
    createIndexChart('sp500Chart', 'S&P 500', colors.sp500, historicalData);
    createIndexChart('nasdaqChart', 'NASDAQ', colors.nasdaq, historicalData);
    createIndexChart('dowChart', 'Dow Jones', colors.dow, historicalData);
    
    // Step 10.5: Initialize calendar if available
    if (typeof initCalendar === 'function') {
        initCalendar(historicalData);
    }
}

// ============================================
// STEP 11: Refresh Data Function
// ============================================
async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.textContent = 'Loading...';
    await init();  // Re-initialize everything
    btn.disabled = false;
    btn.textContent = 'Refresh';
}

// ============================================
// STEP 12: Make Functions Available Globally
// ============================================
window.refreshData = refreshData;

// ============================================
// STEP 13: Start Dashboard When Page Loads
// ============================================
document.addEventListener('DOMContentLoaded', init);
