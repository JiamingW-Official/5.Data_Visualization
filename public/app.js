// Chart instances
let charts = {};
let historicalDataCache = [];
let marketDataCache = null;

// Register Chart.js plugins (with fallback if not loaded)
try {
    if (typeof ChartZoom !== 'undefined') {
        Chart.register(ChartZoom);
    }
} catch (e) {
    console.warn('Chart.js zoom plugin may not be loaded:', e);
}

// Color schemes
const colors = {
    primary: '#3498db',
    secondary: '#2ecc71',
    danger: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
    sp500: '#3498db',
    nasdaq: '#2ecc71',
    dow: '#e74c3c',
    sentiment: '#9b59b6',
    neutral: '#95a5a6'
};

// Common chart options
const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    },
    interaction: {
        mode: 'index',
        intersect: false
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            onClick: function(e, legendItem) {
                const index = legendItem.datasetIndex;
                const chart = this.chart;
                const meta = chart.getDatasetMeta(index);
                meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                chart.update();
            },
            labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                    size: 12,
                    weight: '500'
                }
            }
        },
        tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 10,
            titleFont: {
                size: 13,
                weight: '600'
            },
            bodyFont: {
                size: 12
            },
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 6,
            displayColors: true,
            padding: 10,
            titleMarginBottom: 6,
            callbacks: {
                title: function(context) {
                    if (context[0] && context[0].parsed && context[0].parsed.x) {
                        const date = new Date(context[0].parsed.x);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                    return '';
                },
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += formatTooltipValue(context.parsed.y, context.dataset.label);
                    }
                    return label;
                }
            }
        },
        zoom: typeof ChartZoom !== 'undefined' ? {
            zoom: {
                wheel: {
                    enabled: true,
                    speed: 0.1
                },
                pinch: {
                    enabled: true
                },
                mode: 'x',
                onZoomComplete: function({chart}) {
                    console.log('Zoom completed');
                }
            },
            pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'ctrl'
            },
            limits: {
                x: {min: 'original', max: 'original'}
            }
        } : {}
    },
    onHover: (event, activeElements) => {
        event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
    },
    onClick: (event, activeElements) => {
        if (activeElements.length > 0) {
            const chart = activeElements[0].chart;
            const dataIndex = activeElements[0].index;
            const datasetIndex = activeElements[0].datasetIndex;
            console.log('Clicked:', chart.data.datasets[datasetIndex].label, 'at index', dataIndex);
        }
    }
};

/**
 * Format tooltip values
 */
function formatTooltipValue(value, label) {
    if (label && label.includes('Change') || label && label.includes('%')) {
        return value.toFixed(2) + '%';
    }
    if (value >= 1000) {
        return value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
    return value.toFixed(2);
}

/**
 * Fetch market data from API or static file
 */
async function fetchMarketData() {
    try {
        // Try API first (for local development)
        try {
            const response = await fetch('/api/market-data');
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (e) {
            // Fall through to static file
        }
        
        // Fallback to static file (for GitHub Pages)
        const response = await fetch('data/market-data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching market data:', error);
        return null;
    }
}

/**
 * Fetch historical data from API or static file
 */
async function fetchHistoricalData() {
    try {
        // Try API first (for local development)
        try {
            const response = await fetch('/api/historical-data');
            if (response.ok) {
                const data = await response.json();
                return data;
            }
        } catch (e) {
            // Fall through to static file
        }
        
        // Fallback to static file (for GitHub Pages)
        const response = await fetch('data/historical-data.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return [];
    }
}

/**
 * Format large numbers
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

/**
 * Update key metrics display
 */
function updateMetrics(data) {
    // Market Sentiment Index
    const sentimentValue = document.getElementById('sentimentValue');
    const sentimentLabel = document.getElementById('sentimentLabel');
    if (data.sentiment) {
        const score = data.sentiment.score;
        sentimentValue.textContent = score.toFixed(1);
        sentimentLabel.textContent = data.sentiment.label;
        sentimentValue.style.color = score > 20 ? colors.secondary : score < -20 ? colors.danger : colors.neutral;
    }

    // S&P 500
    const sp500Value = document.getElementById('sp500Value');
    const sp500Change = document.getElementById('sp500Change');
    if (data.indices && data.indices.sp500) {
        sp500Value.textContent = formatNumber(data.indices.sp500.current);
        const change = data.indices.sp500.changePercent;
        sp500Change.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        sp500Change.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // NASDAQ
    const nasdaqValue = document.getElementById('nasdaqValue');
    const nasdaqChange = document.getElementById('nasdaqChange');
    if (data.indices && data.indices.nasdaq) {
        nasdaqValue.textContent = formatNumber(data.indices.nasdaq.current);
        const change = data.indices.nasdaq.changePercent;
        nasdaqChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        nasdaqChange.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // Dow Jones
    const dowValue = document.getElementById('dowValue');
    const dowChange = document.getElementById('dowChange');
    if (data.indices && data.indices.dow) {
        dowValue.textContent = formatNumber(data.indices.dow.current);
        const change = data.indices.dow.changePercent;
        dowChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
        dowChange.className = `metric-change ${change >= 0 ? 'positive' : 'negative'}`;
    }

    // Last update time
    const lastUpdate = document.getElementById('lastUpdate');
    if (data.timestamp) {
        const date = new Date(data.timestamp);
        lastUpdate.textContent = `Last updated: ${date.toLocaleString()}`;
    }
}

/**
 * Create Market Indices Comparison Chart
 */
function createIndicesChart(historicalData) {
    const ctx = document.getElementById('indicesChart').getContext('2d');
    
    if (charts.indices) {
        charts.indices.destroy();
    }

    // Normalize data to percentage change from first value for comparison
    const firstSp500 = historicalData[0]?.sp500 || 1;
    const firstNasdaq = historicalData[0]?.nasdaq || 1;
    const firstDow = historicalData[0]?.dow || 1;

    const sp500Data = historicalData.map(d => ({
        x: new Date(d.date),
        y: parseFloat(((d.sp500 / firstSp500 - 1) * 100).toFixed(2))
    }));

    const nasdaqData = historicalData.map(d => ({
        x: new Date(d.date),
        y: parseFloat(((d.nasdaq / firstNasdaq - 1) * 100).toFixed(2))
    }));

    const dowData = historicalData.map(d => ({
        x: new Date(d.date),
        y: parseFloat(((d.dow / firstDow - 1) * 100).toFixed(2))
    }));

    charts.indices = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: 'S&P 500',
                    data: sp500Data,
                    borderColor: colors.sp500,
                    backgroundColor: 'rgba(52, 152, 219, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'NASDAQ',
                    data: nasdaqData,
                    borderColor: colors.nasdaq,
                    backgroundColor: 'rgba(46, 204, 113, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                },
                {
                    label: 'Dow Jones',
                    data: dowData,
                    borderColor: colors.dow,
                    backgroundColor: 'rgba(231, 76, 60, 0.05)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            ...commonChartOptions,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 11 }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Change (%)',
                        font: { size: 11 }
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Create Sentiment Trend Chart
 */
function createSentimentTrendChart(historicalData) {
    const ctx = document.getElementById('sentimentTrendChart').getContext('2d');
    
    if (charts.sentimentTrend) {
        charts.sentimentTrend.destroy();
    }

    const sentimentData = historicalData.map(d => ({
        x: new Date(d.date),
        y: d.sentiment
    }));

    charts.sentimentTrend = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Sentiment Score',
                data: sentimentData,
                borderColor: colors.sentiment,
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.2,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        },
        options: {
            ...commonChartOptions,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 12, weight: 'bold' }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    beginAtZero: false,
                    min: -100,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Score',
                        font: { size: 11 }
                    },
                    grid: {
                        color: function(context) {
                            if (context.tick.value === 0) {
                                return 'rgba(0, 0, 0, 0.2)';
                            }
                            return 'rgba(0, 0, 0, 0.05)';
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return value;
                        }
                    }
                }
            },
            plugins: {
                ...commonChartOptions.plugins
            }
        }
    });
}

/**
 * Create S&P 500 Chart
 */
function createSP500Chart(historicalData) {
    const ctx = document.getElementById('sp500Chart').getContext('2d');
    
    if (charts.sp500) {
        charts.sp500.destroy();
    }

    const sp500Data = historicalData.map(d => ({
        x: new Date(d.date),
        y: d.sp500
    }));

    charts.sp500 = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'S&P 500',
                data: sp500Data,
                borderColor: colors.sp500,
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Create NASDAQ Chart
 */
function createNASDAQChart(historicalData) {
    const ctx = document.getElementById('nasdaqChart').getContext('2d');
    
    if (charts.nasdaq) {
        charts.nasdaq.destroy();
    }

    const nasdaqData = historicalData.map(d => ({
        x: new Date(d.date),
        y: d.nasdaq
    }));

    charts.nasdaq = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'NASDAQ',
                data: nasdaqData,
                borderColor: colors.nasdaq,
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Create Dow Jones Chart
 */
function createDowChart(historicalData) {
    const ctx = document.getElementById('dowChart').getContext('2d');
    
    if (charts.dow) {
        charts.dow.destroy();
    }

    const dowData = historicalData.map(d => ({
        x: new Date(d.date),
        y: d.dow
    }));

    charts.dow = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Dow Jones',
                data: dowData,
                borderColor: colors.dow,
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.1,
                pointRadius: 0,
                pointHoverRadius: 5
            }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMM yyyy'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price',
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Create Daily Changes Comparison Chart
 */
function createDailyChangesChart(data) {
    const ctx = document.getElementById('dailyChangesChart').getContext('2d');
    
    if (charts.dailyChanges) {
        charts.dailyChanges.destroy();
    }

    if (!data.indices) return;

    charts.dailyChanges = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['S&P 500', 'NASDAQ', 'Dow Jones'],
            datasets: [{
                label: 'Daily Change (%)',
                data: [
                    data.indices.sp500?.changePercent || 0,
                    data.indices.nasdaq?.changePercent || 0,
                    data.indices.dow?.changePercent || 0
                ],
                backgroundColor: function(context) {
                    const value = context.parsed.y;
                    return value >= 0 ? colors.secondary : colors.danger;
                },
                borderColor: function(context) {
                    const value = context.parsed.y;
                    return value >= 0 ? colors.secondary : colors.danger;
                },
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            ...commonChartOptions,
            plugins: {
                ...commonChartOptions.plugins,
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Change (%)',
                        font: { size: 11 }
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}



/**
 * Refresh data
 */
async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.textContent = 'Refreshing...';
    
    await initDashboard();
    
    btn.disabled = false;
    btn.textContent = 'Refresh Data';
}

/**
 * Initialize dashboard
 */
async function initDashboard() {
    console.log('Initializing dashboard...');

    // Fetch data
    const marketData = await fetchMarketData();
    const historicalData = await fetchHistoricalData();

    if (!marketData) {
        console.error('Failed to load market data');
        document.getElementById('lastUpdate').textContent = 'Error loading data';
        return;
    }

    if (!historicalData || historicalData.length === 0) {
        console.error('No historical data available');
        document.getElementById('lastUpdate').textContent = 'No historical data available. Please run: npm run fetch-data';
        return;
    }

    // Cache data
    historicalDataCache = historicalData;
    marketDataCache = marketData;

    // Update metrics
    updateMetrics(marketData);

    // Create charts
    createIndicesChart(historicalData);
    createSentimentTrendChart(historicalData);
    createDailyChangesChart(marketData);
    createSP500Chart(historicalData);
    createNASDAQChart(historicalData);
    createDowChart(historicalData);
    
    // Initialize calendar
    if (typeof initCalendar === 'function') {
        initCalendar(historicalData);
    }

    console.log('Dashboard initialized');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);

// Auto-refresh every 5 minutes
setInterval(async () => {
    console.log('Auto-refreshing data...');
    await initDashboard();
}, 5 * 60 * 1000);

// Make functions globally available
window.refreshData = refreshData;
