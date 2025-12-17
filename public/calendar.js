// Simple calendar
let calendarData = [];

function initCalendar(data) {
    calendarData = data;
    renderCalendar();
}

function renderCalendar(year = null, month = null) {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth();
    
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">‹</button>
            <h3>${monthNames[m]} ${y}</h3>
            <button onclick="changeMonth(1)">›</button>
        </div>
        <div class="calendar-grid">
            <div class="weekday">Sun</div><div class="weekday">Mon</div><div class="weekday">Tue</div>
            <div class="weekday">Wed</div><div class="weekday">Thu</div><div class="weekday">Fri</div><div class="weekday">Sat</div>
    `;
    
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="day empty"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = calendarData.find(d => d.date === dateStr);
        
        let cls = 'day';
        let sentiment = '';
        
        if (dayData) {
            cls += ' has-data';
            const s = dayData.sentiment || 0;
            if (s > 20) cls += ' bullish';
            else if (s < -20) cls += ' bearish';
            else cls += ' neutral';
            sentiment = s.toFixed(0);
        }
        
        html += `
            <div class="${cls}" ${dayData ? `onclick="showDay('${dateStr}')"` : ''}>
                <div class="day-num">${day}</div>
                ${sentiment ? `<div class="day-sentiment">${sentiment}</div>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    window.currentYear = y;
    window.currentMonth = m;
}

function changeMonth(dir) {
    if (!window.currentYear) {
        const now = new Date();
        window.currentYear = now.getFullYear();
        window.currentMonth = now.getMonth();
    }
    
    window.currentMonth += dir;
    if (window.currentMonth < 0) {
        window.currentMonth = 11;
        window.currentYear--;
    } else if (window.currentMonth > 11) {
        window.currentMonth = 0;
        window.currentYear++;
    }
    
    renderCalendar(window.currentYear, window.currentMonth);
}

function showDay(dateStr) {
    const dayData = calendarData.find(d => d.date === dateStr);
    if (!dayData) return;
    
    const modal = document.getElementById('dayDetailsModal');
    const content = document.getElementById('dayDetailsContent');
    if (!modal || !content) return;
    
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const s = dayData.sentiment;
    const cls = s > 20 ? 'bullish' : s < -20 ? 'bearish' : 'neutral';
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>${formatted}</h2>
            <button onclick="closeDay()">×</button>
        </div>
        <div class="modal-body">
            <div class="day-metrics">
                <div class="metric">
                    <label>Sentiment</label>
                    <div class="value ${cls}">${s.toFixed(1)} <span>${dayData.sentimentLabel || 'Neutral'}</span></div>
                </div>
                <div class="metric">
                    <label>S&P 500</label>
                    <div class="value">${dayData.sp500.toLocaleString()} <span class="change ${dayData.changes?.sp500 >= 0 ? 'pos' : 'neg'}">${dayData.changes?.sp500 >= 0 ? '+' : ''}${dayData.changes?.sp500?.toFixed(2)}%</span></div>
                </div>
                <div class="metric">
                    <label>NASDAQ</label>
                    <div class="value">${dayData.nasdaq.toLocaleString()} <span class="change ${dayData.changes?.nasdaq >= 0 ? 'pos' : 'neg'}">${dayData.changes?.nasdaq >= 0 ? '+' : ''}${dayData.changes?.nasdaq?.toFixed(2)}%</span></div>
                </div>
                <div class="metric">
                    <label>Dow Jones</label>
                    <div class="value">${dayData.dow.toLocaleString()} <span class="change ${dayData.changes?.dow >= 0 ? 'pos' : 'neg'}">${dayData.changes?.dow >= 0 ? '+' : ''}${dayData.changes?.dow?.toFixed(2)}%</span></div>
                </div>
            </div>
            <div class="day-headline">
                <h3>${dayData.headline || 'Market Update'}</h3>
            </div>
            <div class="day-summary">
                <p>${dayData.summary || 'No summary available.'}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeDay() {
    const modal = document.getElementById('dayDetailsModal');
    if (modal) modal.style.display = 'none';
}

window.changeMonth = changeMonth;
window.showDay = showDay;
window.closeDay = closeDay;
window.initCalendar = initCalendar;
