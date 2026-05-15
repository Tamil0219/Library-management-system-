// ============================================
// Dashboard Module - Stats & Charts
// ============================================

let categoryChartInstance = null;
let activityChartInstance = null;

function refreshDashboard() {
    const stats = LibraryDB.getStats();

    // Animate counters
    animateCounter('statTotalBooks', stats.totalBooks);
    animateCounter('statIssuedBooks', stats.issuedBooks);
    animateCounter('statAvailableBooks', stats.availableBooks);
    animateCounter('statTotalStudents', stats.totalStudents);

    // Render charts
    renderCategoryChart(stats.booksByCategory);
    renderActivityChart();

    // Recent activities
    renderRecentActivities();

    // Update notification badge
    if (typeof updateNotifBadge === 'function') updateNotifBadge();
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 30);
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    if (categoryChartInstance) categoryChartInstance.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: textColor, padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } }
            },
            cutout: '65%'
        }
    });
}

function renderActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    if (activityChartInstance) activityChartInstance.destroy();

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148,163,184,.1)' : 'rgba(0,0,0,.06)';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const issued = [8, 12, 15, 10, 18, 14];
    const returned = [5, 9, 12, 8, 13, 10];

    activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: 'Issued', data: issued, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 },
                { label: 'Returned', data: returned, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { labels: { color: textColor, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } } } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor } },
                y: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true }
            }
        }
    });
}

function renderRecentActivities() {
    const container = document.getElementById('recentActivities');
    const activities = LibraryDB.getActivities().slice(0, 10);
    if (!activities.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-clock"></i><h4>No recent activity</h4></div>';
        return;
    }
    container.innerHTML = activities.map(a => {
        const dotClass = a.action.toLowerCase().includes('issue') ? 'issued' :
            a.action.toLowerCase().includes('return') ? 'returned' :
            a.action.toLowerCase().includes('add') ? 'added' :
            a.action.toLowerCase().includes('delete') ? 'deleted' : '';
        return `<div class="activity-item">
            <div class="activity-dot ${dotClass}"></div>
            <div><div class="activity-text"><strong>${a.action}</strong> — ${a.details}</div>
            <div class="activity-time">${timeAgo(a.timestamp)}</div></div>
        </div>`;
    }).join('');
}
