// ============================================
// STEP 1: Initialize Calendar Data
// ============================================
let calendarData = [];

// ============================================
// STEP 2: Initialize Calendar with Data
// ============================================
function initCalendar(data) {
    // Save the historical data in a global variable so other functions can use it
    calendarData = data;
    // Call renderCalendar to actually draw the calendar on the page
    renderCalendar();
}

// ============================================
// STEP 3: Render Calendar for Specific Month
// ============================================
function renderCalendar(year = null, month = null) {
    // Get today's date
    const now = new Date();
    // Use provided year, or use current year if not provided
    const y = year || now.getFullYear();
    // Use provided month, or use current month if not provided
    // Note: getMonth() returns 0-11 (0 = January, 11 = December)
    const m = month || now.getMonth();
    
    // Calculate what day of the week the 1st of the month falls on
    // getDay() returns 0-6 (0 = Sunday, 6 = Saturday)
    const firstDay = new Date(y, m, 1).getDay();
    // Calculate how many days are in this month
    // new Date(y, m+1, 0) gives the last day of month m
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    // Array of month names for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Find the HTML element where we'll put the calendar
    const container = document.getElementById('calendarContainer');
    // If the element doesn't exist, stop here
    if (!container) return;
    
    // Start building the HTML for the calendar
    // Create header with previous/next month buttons and month/year title
    let html = `
        <div class="calendar-header">
            <button onclick="changeMonth(-1)">‹</button>  <!-- Previous month button -->
            <h3>${monthNames[m]} ${y}</h3>                <!-- Month and year title -->
            <button onclick="changeMonth(1)">›</button>   <!-- Next month button -->
        </div>
        <div class="calendar-grid">
            <!-- Weekday labels -->
            <div class="weekday">Sun</div><div class="weekday">Mon</div>
            <div class="weekday">Tue</div><div class="weekday">Wed</div>
            <div class="weekday">Thu</div><div class="weekday">Fri</div>
            <div class="weekday">Sat</div>
    `;
    
    // Add empty cells for days before the month starts
    // Example: If month starts on Wednesday (3), add 3 empty cells for Sun, Mon, Tue
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="day empty"></div>';
    }
    
    // Loop through each day of the month (1 to daysInMonth)
    for (let day = 1; day <= daysInMonth; day++) {
        // Format date as YYYY-MM-DD (e.g., "2022-01-15")
        // padStart(2, '0') adds a leading zero if needed (e.g., "01" instead of "1")
        const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // Look for market data for this specific date
        const dayData = calendarData.find(d => d.date === dateStr);
        
        // Start with base CSS class
        let cls = 'day';
        // Variable to store sentiment score for display
        let sentiment = '';
        
        // If we found data for this day
        if (dayData) {
            cls += ' has-data';  // Add class to make it clickable
            // Get sentiment score, default to 0 if missing
            const s = dayData.sentiment || 0;
            // Add color class based on sentiment:
            // > 20 = bullish (green), < -20 = bearish (red), else = neutral (gray)
            if (s > 20) cls += ' bullish';
            else if (s < -20) cls += ' bearish';
            else cls += ' neutral';
            // Format sentiment as whole number (no decimals)
            sentiment = s.toFixed(0);
        }
        
        // Build the HTML for this day cell
        html += `
            <div class="${cls}" ${dayData ? `onclick="showDay('${dateStr}')"` : ''}>
                <div class="day-num">${day}</div>  <!-- Day number (1-31) -->
                ${sentiment ? `<div class="day-sentiment">${sentiment}</div>` : ''}  <!-- Sentiment score if available -->
            </div>
        `;
    }
    
    // Close the calendar grid div
    html += '</div>';
    // Put all the HTML into the page
    container.innerHTML = html;
    
    // Remember which month/year we're showing (for navigation buttons)
    window.currentYear = y;
    window.currentMonth = m;
}

// ============================================
// STEP 4: Change Month (Previous/Next)
// ============================================
function changeMonth(dir) {
    // dir is -1 for previous month, +1 for next month
    // If we don't know what month we're currently showing, use today's date
    if (!window.currentYear) {
        const now = new Date();
        window.currentYear = now.getFullYear();  // Current year (e.g., 2024)
        window.currentMonth = now.getMonth();    // Current month (0-11)
    }
    
    // Move to previous or next month
    // dir = -1 means go back one month, dir = +1 means go forward one month
    window.currentMonth += dir;
    
    // Handle when month goes below 0 (January) or above 11 (December)
    if (window.currentMonth < 0) {
        // If we went before January, go to December of previous year
        window.currentMonth = 11;  // December (month 11)
        window.currentYear--;      // Go back one year
    } else if (window.currentMonth > 11) {
        // If we went after December, go to January of next year
        window.currentMonth = 0;   // January (month 0)
        window.currentYear++;      // Go forward one year
    }
    
    // Re-draw the calendar with the new month/year
    renderCalendar(window.currentYear, window.currentMonth);
}

// ============================================
// STEP 5: Show Day Details Modal
// ============================================
function showDay(dateStr) {
    // dateStr is the date clicked, format: "2022-01-15"
    // Find the market data for this specific date
    const dayData = calendarData.find(d => d.date === dateStr);
    // If no data found for this date, stop here
    if (!dayData) return;
    
    // Get the modal (popup window) element
    const modal = document.getElementById('dayDetailsModal');
    // Get the content area inside the modal
    const content = document.getElementById('dayDetailsContent');
    // If modal or content doesn't exist, stop here
    if (!modal || !content) return;
    
    // Convert date string to a Date object
    const date = new Date(dateStr);
    // Format date as a nice readable string
    // Example: "Monday, January 15, 2024"
    const formatted = date.toLocaleDateString('en-US', { 
        weekday: 'long',   // Full weekday name (Monday, Tuesday, etc.)
        year: 'numeric',   // Full year (2024)
        month: 'long',     // Full month name (January, February, etc.)
        day: 'numeric'     // Day number (1-31)
    });
    
    // Get sentiment score
    const s = dayData.sentiment;
    // Decide CSS class for color: bullish (green), bearish (red), or neutral (gray)
    const cls = s > 20 ? 'bullish' : s < -20 ? 'bearish' : 'neutral';
    
    // Build the HTML content for the modal
    content.innerHTML = `
        <div class="modal-header">
            <h2>${formatted}</h2>  <!-- Date title -->
            <button onclick="closeDay()">×</button>  <!-- Close button -->
        </div>
        <div class="modal-body">
            <div class="day-metrics">
                <!-- Sentiment metric -->
                <div class="metric">
                    <label>Sentiment</label>
                    <div class="value ${cls}">${s.toFixed(1)} <span>${dayData.sentimentLabel || 'Neutral'}</span></div>
                </div>
                <!-- S&P 500 metric -->
                <div class="metric">
                    <label>S&P 500</label>
                    <div class="value">${dayData.sp500.toLocaleString()} <span class="change ${dayData.changes?.sp500 >= 0 ? 'pos' : 'neg'}">${dayData.changes?.sp500 >= 0 ? '+' : ''}${dayData.changes?.sp500?.toFixed(2)}%</span></div>
                </div>
                <!-- NASDAQ metric -->
                <div class="metric">
                    <label>NASDAQ</label>
                    <div class="value">${dayData.nasdaq.toLocaleString()} <span class="change ${dayData.changes?.nasdaq >= 0 ? 'pos' : 'neg'}">${dayData.changes?.nasdaq >= 0 ? '+' : ''}${dayData.changes?.nasdaq?.toFixed(2)}%</span></div>
                </div>
                <!-- Dow Jones metric -->
                <div class="metric">
                    <label>Dow Jones</label>
                    <div class="value">${dayData.dow.toLocaleString()} <span class="change ${dayData.changes?.dow >= 0 ? 'pos' : 'neg'}">${dayData.changes?.dow >= 0 ? '+' : ''}${dayData.changes?.dow?.toFixed(2)}%</span></div>
                </div>
            </div>
            <!-- Daily headline -->
            <div class="day-headline">
                <h3>${dayData.headline || 'Market Update'}</h3>
            </div>
            <!-- Daily summary -->
            <div class="day-summary">
                <p>${dayData.summary || 'No summary available.'}</p>
            </div>
        </div>
    `;
    
    // Make the modal visible by changing display style to "flex"
    modal.style.display = 'flex';
}

// ============================================
// STEP 6: Close Day Details Modal
// ============================================
function closeDay() {
    // Find the modal element
    const modal = document.getElementById('dayDetailsModal');
    // If modal exists, hide it by setting display to "none"
    if (modal) modal.style.display = 'none';
}

// ============================================
// STEP 7: Make Functions Available Globally
// ============================================
window.changeMonth = changeMonth;
window.showDay = showDay;
window.closeDay = closeDay;
window.initCalendar = initCalendar;
