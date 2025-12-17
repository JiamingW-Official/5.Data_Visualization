// ============================================
// STEP 1: Initialize Calendar Data
// ============================================
let calendarData = [];

// ============================================
// STEP 2: Initialize Calendar with Data
// ============================================
function initCalendar(data) {
    calendarData = data;  // Store data
    renderCalendar();      // Render the calendar
}

// ============================================
// STEP 3: Render Calendar for Specific Month
// ============================================
function renderCalendar(year = null, month = null) {
    // Step 3.1: Get current date or use provided date
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth();
    
    // Step 3.2: Calculate calendar layout
    const firstDay = new Date(y, m, 1).getDay();  // Day of week for 1st of month
    const daysInMonth = new Date(y, m + 1, 0).getDate();  // Total days in month
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Step 3.3: Get calendar container element
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    
    // Step 3.4: Build calendar HTML - Header with navigation
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">‹</button>
            <h3>${monthNames[m]} ${y}</h3>
            <button onclick="changeMonth(1)">›</button>
        </div>
        <div class="calendar-grid">
            <div class="weekday">Sun</div><div class="weekday">Mon</div>
            <div class="weekday">Tue</div><div class="weekday">Wed</div>
            <div class="weekday">Thu</div><div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
    `;
    
    // Step 3.5: Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="day empty"></div>';
    }
    
    // Step 3.6: Add each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        // Format date string (YYYY-MM-DD)
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Step 3.7: Find data for this day
        const dayData = calendarData.find(d => d.date === dateStr);
        
        // Step 3.8: Determine styling based on sentiment
        let cls = 'day';
        let sentiment = '';
        
        if (dayData) {
            cls += ' has-data';  // Mark as clickable
            const s = dayData.sentiment || 0;
            // Color code: bullish (green), bearish (red), neutral (gray)
            if (s > 20) cls += ' bullish';
            else if (s < -20) cls += ' bearish';
            else cls += ' neutral';
            sentiment = s.toFixed(0);  // Display sentiment score
        }
        
        // Step 3.9: Build day cell HTML
        html += `
            <div class="${cls}" ${dayData ? `onclick="showDay('${dateStr}')"` : ''}>
                <div class="day-num">${day}</div>
                ${sentiment ? `<div class="day-sentiment">${sentiment}</div>` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
    
    // Step 3.10: Store current view for navigation
    window.currentYear = y;
    window.currentMonth = m;
}

// ============================================
// STEP 4: Change Month (Previous/Next)
// ============================================
function changeMonth(dir) {
    // Step 4.1: Get current view or default to today
    if (!window.currentYear) {
        const now = new Date();
        window.currentYear = now.getFullYear();
        window.currentMonth = now.getMonth();
    }
    
    // Step 4.2: Adjust month
    window.currentMonth += dir;
    
    // Step 4.3: Handle year rollover
    if (window.currentMonth < 0) {
        window.currentMonth = 11;
        window.currentYear--;
    } else if (window.currentMonth > 11) {
        window.currentMonth = 0;
        window.currentYear++;
    }
    
    // Step 4.4: Re-render calendar
    renderCalendar(window.currentYear, window.currentMonth);
}

// ============================================
// STEP 5: Show Day Details Modal
// ============================================
function showDay(dateStr) {
    // Step 5.1: Find data for selected day
    const dayData = calendarData.find(d => d.date === dateStr);
    if (!dayData) return;
    
    // Step 5.2: Get modal elements
    const modal = document.getElementById('dayDetailsModal');
    const content = document.getElementById('dayDetailsContent');
    if (!modal || !content) return;
    
    // Step 5.3: Format date nicely
    const date = new Date(dateStr);
    const formatted = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Step 5.4: Determine sentiment class for styling
    const s = dayData.sentiment;
    const cls = s > 20 ? 'bullish' : s < -20 ? 'bearish' : 'neutral';
    
    // Step 5.5: Build modal content HTML
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
    
    // Step 5.6: Show modal
    modal.style.display = 'flex';
}

// ============================================
// STEP 6: Close Day Details Modal
// ============================================
function closeDay() {
    const modal = document.getElementById('dayDetailsModal');
    if (modal) modal.style.display = 'none';
}

// ============================================
// STEP 7: Make Functions Available Globally
// ============================================
window.changeMonth = changeMonth;
window.showDay = showDay;
window.closeDay = closeDay;
window.initCalendar = initCalendar;
