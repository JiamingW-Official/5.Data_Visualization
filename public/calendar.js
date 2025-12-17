// Calendar view for market sentiment
let calendarData = [];

/**
 * Initialize calendar view
 */
function initCalendar(historicalData) {
    calendarData = historicalData;
    renderCalendar();
}

/**
 * Render calendar for current month/year
 */
function renderCalendar(year = null, month = null) {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentMonth = month || now.getMonth();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const calendarContainer = document.getElementById('calendarContainer');
    if (!calendarContainer) return;
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" onclick="changeMonth(-1)">‹</button>
            <h3>${monthNames[currentMonth]} ${currentYear}</h3>
            <button class="calendar-nav-btn" onclick="changeMonth(1)">›</button>
        </div>
        <div class="calendar-grid">
            <div class="calendar-weekday">Sun</div>
            <div class="calendar-weekday">Mon</div>
            <div class="calendar-weekday">Tue</div>
            <div class="calendar-weekday">Wed</div>
            <div class="calendar-weekday">Thu</div>
            <div class="calendar-weekday">Fri</div>
            <div class="calendar-weekday">Sat</div>
    `;
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = calendarData.find(d => d.date === dateStr);
        
        let sentimentClass = 'neutral';
        let sentimentValue = '';
        let sentimentLabel = '';
        
        if (dayData) {
            const sentiment = dayData.sentiment || 0;
            if (sentiment > 20) {
                sentimentClass = 'bullish';
                sentimentLabel = 'Bullish';
            } else if (sentiment < -20) {
                sentimentClass = 'bearish';
                sentimentLabel = 'Bearish';
            } else {
                sentimentLabel = 'Neutral';
            }
            sentimentValue = sentiment.toFixed(0);
        }
        
        const isWeekend = (startingDayOfWeek + day - 1) % 7 === 0 || 
                         (startingDayOfWeek + day - 1) % 7 === 6;
        
        html += `
            <div class="calendar-day ${sentimentClass} ${isWeekend ? 'weekend' : ''} ${dayData ? 'has-data' : ''}" 
                 ${dayData ? `onclick="showDayDetails('${dateStr}')"` : ''}
                 ${dayData ? `title="${dayData.headline || ''}"` : ''}>
                <div class="day-number">${day}</div>
                ${dayData ? `<div class="day-sentiment">${sentimentValue}</div>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    calendarContainer.innerHTML = html;
    
    // Store current view
    window.currentCalendarYear = currentYear;
    window.currentCalendarMonth = currentMonth;
}

/**
 * Change month
 */
function changeMonth(direction) {
    if (!window.currentCalendarYear) {
        const now = new Date();
        window.currentCalendarYear = now.getFullYear();
        window.currentCalendarMonth = now.getMonth();
    }
    
    window.currentCalendarMonth += direction;
    
    if (window.currentCalendarMonth < 0) {
        window.currentCalendarMonth = 11;
        window.currentCalendarYear--;
    } else if (window.currentCalendarMonth > 11) {
        window.currentCalendarMonth = 0;
        window.currentCalendarYear++;
    }
    
    renderCalendar(window.currentCalendarYear, window.currentCalendarMonth);
}

/**
 * Show day details
 */
function showDayDetails(dateStr) {
    const dayData = calendarData.find(d => d.date === dateStr);
    if (!dayData) return;
    
    const modal = document.getElementById('dayDetailsModal');
    const modalContent = document.getElementById('dayDetailsContent');
    
    if (!modal || !modalContent) return;
    
    const date = new Date(dateStr);
    const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const sentimentClass = dayData.sentiment > 20 ? 'bullish' : 
                          dayData.sentiment < -20 ? 'bearish' : 'neutral';
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${formattedDate}</h2>
            <button class="modal-close" onclick="closeDayDetails()">×</button>
        </div>
        <div class="modal-body">
            <div class="day-metrics">
                <div class="day-metric">
                    <label>Market Sentiment</label>
                    <div class="metric-value ${sentimentClass}">
                        ${dayData.sentiment.toFixed(1)} 
                        <span class="metric-label">${dayData.sentimentLabel || 'Neutral'}</span>
                    </div>
                </div>
                <div class="day-metric">
                    <label>S&P 500</label>
                    <div class="metric-value">
                        ${dayData.sp500.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        <span class="metric-change ${dayData.changes?.sp500 >= 0 ? 'positive' : 'negative'}">
                            ${dayData.changes?.sp500 >= 0 ? '+' : ''}${dayData.changes?.sp500?.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <div class="day-metric">
                    <label>NASDAQ</label>
                    <div class="metric-value">
                        ${dayData.nasdaq.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        <span class="metric-change ${dayData.changes?.nasdaq >= 0 ? 'positive' : 'negative'}">
                            ${dayData.changes?.nasdaq >= 0 ? '+' : ''}${dayData.changes?.nasdaq?.toFixed(2)}%
                        </span>
                    </div>
                </div>
                <div class="day-metric">
                    <label>Dow Jones</label>
                    <div class="metric-value">
                        ${dayData.dow.toLocaleString('en-US', {maximumFractionDigits: 0})}
                        <span class="metric-change ${dayData.changes?.dow >= 0 ? 'positive' : 'negative'}">
                            ${dayData.changes?.dow >= 0 ? '+' : ''}${dayData.changes?.dow?.toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>
            <div class="day-headline">
                <h3>${dayData.headline || 'Market Update'}</h3>
            </div>
            <div class="day-summary">
                <p>${dayData.summary || 'No summary available for this day.'}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

/**
 * Close day details modal
 */
function closeDayDetails() {
    const modal = document.getElementById('dayDetailsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions globally available
window.changeMonth = changeMonth;
window.showDayDetails = showDayDetails;
window.closeDayDetails = closeDayDetails;
window.initCalendar = initCalendar;



