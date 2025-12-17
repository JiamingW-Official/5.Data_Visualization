// Simple chart instances
let charts = {};

// Colors
const colors = {
    sp500: '#3498db',
    nasdaq: '#2ecc71',
    dow: '#e74c3c',
    sentiment: '#9b59b6'
};

// Fetch data
async function fetchData() {
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    
    try {
        // Try API first, then static file
        let marketData, historicalData;
        
        try {
            marketData = await (await fetch('/api/market-data')).json();
            historicalData = await (await fetch('/api/historical-data')).json();
        } catch {
            marketData = await (await fetch(`${basePath}/data/market-data.json`)).json();
            historicalData = await (await fetch(`${basePath}/data/historical-data.json`)).json();
        }
        
        return { marketData, historicalData };
    } catch (error) {
        console.error('Error loading data:', error);
        return { marketData: null, historicalData: [] };
    }
}

// Format numbers
function formatNum(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
}

// Update metrics
function updateMetrics(data) {
    if (!data) return;
    
    // Sentiment
    const s = data.sentiment;
    if (s) {
        document.getElementById('sentimentValue').textContent = s.score.toFixed(1);
        document.getElementById('sentimentLabel').textContent = s.label;
        document.getElementById('sentimentValue').style.color = s.score > 20 ? '#2ecc71' : s.score < -20 ? '#e74c3c' : '#7f8c8d';
    }
    
    // Indices
    const idx = data.indices || {};
    ['sp500', 'nasdaq', 'dow'].forEach(name => {
        const i = idx[name];
        if (i) {
            document.getElementById(`${name}Value`).textContent = formatNum(i.current);
            const change = document.getElementById(`${name}Change`);
            change.textContent = `${i.changePercent >= 0 ? '+' : ''}${i.changePercent.toFixed(2)}%`;
            change.className = `metric-change ${i.changePercent >= 0 ? 'positive' : 'negative'}`;
        }
    });
    
    // Last update
    if (data.timestamp) {
        document.getElementById('lastUpdate').textContent = `Updated: ${new Date(data.timestamp).toLocaleString()}`;
    }
}

// Create simple chart
function createChart(id, type, data, options = {}) {
    const ctx = document.getElementById(id).getContext('2d');
    if (charts[id]) charts[id].destroy();
    
    charts[id] = new Chart(ctx, {
        type,
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: type === 'line' && data.datasets.length > 1 },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 10,
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 11 }
                }
            },
            ...options
        }
    });
}

// Create indices comparison chart
function createIndicesChart(historicalData) {
    if (!historicalData.length) return;
    
    const first = historicalData[0];
    const datasets = [
        {
            label: 'S&P 500',
            data: historicalData.map(d => ({ x: new Date(d.date), y: ((d.sp500 / first.sp500 - 1) * 100).toFixed(2) })),
            borderColor: colors.sp500,
            borderWidth: 2,
            fill: false
        },
        {
            label: 'NASDAQ',
            data: historicalData.map(d => ({ x: new Date(d.date), y: ((d.nasdaq / first.nasdaq - 1) * 100).toFixed(2) })),
            borderColor: colors.nasdaq,
            borderWidth: 2,
            fill: false
        },
        {
            label: 'Dow Jones',
            data: historicalData.map(d => ({ x: new Date(d.date), y: ((d.dow / first.dow - 1) * 100).toFixed(2) })),
            borderColor: colors.dow,
            borderWidth: 2,
            fill: false
        }
    ];
    
    createChart('indicesChart', 'line', { datasets }, {
        scales: {
            x: { type: 'time', time: { unit: 'month' } },
            y: { title: { display: true, text: 'Change (%)' }, ticks: { callback: v => v + '%' } }
        }
    });
}

// Create sentiment chart
function createSentimentChart(historicalData) {
    if (!historicalData.length) return;
    
    createChart('sentimentTrendChart', 'line', {
        datasets: [{
            label: 'Sentiment',
            data: historicalData.map(d => ({ x: new Date(d.date), y: d.sentiment })),
            borderColor: colors.sentiment,
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            borderWidth: 2,
            fill: true
        }]
    }, {
        scales: {
            x: { type: 'time', time: { unit: 'month' } },
            y: { title: { display: true, text: 'Score' }, min: -100, max: 100 }
        },
        plugins: { legend: { display: false } }
    });
}

// Create daily changes chart
function createDailyChart(data) {
    if (!data?.indices) return;
    
    const idx = data.indices;
    createChart('dailyChangesChart', 'bar', {
        labels: ['S&P 500', 'NASDAQ', 'Dow Jones'],
        datasets: [{
            label: 'Change (%)',
            data: [idx.sp500?.changePercent || 0, idx.nasdaq?.changePercent || 0, idx.dow?.changePercent || 0],
            backgroundColor: [colors.sp500, colors.nasdaq, colors.dow]
        }]
    }, {
        scales: {
            y: { ticks: { callback: v => v + '%' } }
        },
        plugins: { legend: { display: false } }
    });
}

// Create individual index charts
function createIndexChart(id, name, color, historicalData) {
    if (!historicalData.length) return;
    
    const prop = name === 'S&P 500' ? 'sp500' : name.toLowerCase().replace(' ', '');
    
    createChart(id, 'line', {
        datasets: [{
            label: name,
            data: historicalData.map(d => ({ x: new Date(d.date), y: d[prop] })),
            borderColor: color,
            backgroundColor: color + '20',
            borderWidth: 2,
            fill: true
        }]
    }, {
        scales: {
            x: { type: 'time', time: { unit: 'month' } },
            y: { title: { display: true, text: 'Price' } }
        },
        plugins: { legend: { display: false } }
    });
}

// Initialize
async function init() {
    const { marketData, historicalData } = await fetchData();
    
    if (!marketData || !historicalData.length) {
        document.getElementById('lastUpdate').textContent = 'No data available';
        return;
    }
    
    updateMetrics(marketData);
    
    createIndicesChart(historicalData);
    createSentimentChart(historicalData);
    createDailyChart(marketData);
    createIndexChart('sp500Chart', 'S&P 500', colors.sp500, historicalData);
    createIndexChart('nasdaqChart', 'NASDAQ', colors.nasdaq, historicalData);
    createIndexChart('dowChart', 'Dow Jones', colors.dow, historicalData);
    
    if (typeof initCalendar === 'function') {
        initCalendar(historicalData);
    }
}

// Refresh
async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.disabled = true;
    btn.textContent = 'Loading...';
    await init();
    btn.disabled = false;
    btn.textContent = 'Refresh';
}

// Make global
window.refreshData = refreshData;

// Start
document.addEventListener('DOMContentLoaded', init);
