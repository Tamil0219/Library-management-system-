// ============================================
// Core App Module - Navigation, Theme, Utilities
// ============================================

// Session guard
const session = JSON.parse(sessionStorage.getItem('lib_session'));
if (!session) window.location.href = 'index.html';

// ---- UI References ----
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const globalSearch = document.getElementById('globalSearch');
const notifBadge = document.getElementById('notifBadge');

// ---- Role-based access ----
const isAdmin = session && session.role === 'Admin';
const isStudent = session && session.role === 'Student';
let currentStudentId = null;

if (session) {
    document.body.classList.add('role-' + session.role.toLowerCase());
    document.getElementById('sidebarUserName').textContent = session.fullName;
    document.getElementById('sidebarUserRole').textContent = session.role;
    document.getElementById('userAvatarSidebar').textContent = session.fullName.charAt(0).toUpperCase();

    // For students, link to their student record
    if (isStudent) {
        // Primary: use studentId stored in session at login
        if (session.studentId) {
            currentStudentId = session.studentId;
        } else {
            // Fallback 1: look up from user account
            const user = LibraryDB.getUserByUsername(session.username);
            if (user && user.studentId) {
                currentStudentId = user.studentId;
            } else {
                // Fallback 2: match by name
                const students = LibraryDB.getStudents();
                const match = students.find(s => s.name === session.fullName);
                if (match) currentStudentId = match.id;
            }
        }
    }
}

// ---- Sidebar Toggle ----
sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
});

// Close mobile sidebar on outside click
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open') &&
        !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('mobile-open');
    }
});

// ---- Navigation ----
const navLinks = document.querySelectorAll('.sidebar-menu a');
const sections = document.querySelectorAll('.content-section');

function showSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));
    const sec = document.getElementById('sec-' + sectionId);
    const link = document.querySelector(`[data-section="${sectionId}"]`);
    if (sec) sec.classList.add('active');
    if (link) link.classList.add('active');
    if (window.innerWidth <= 768) sidebar.classList.remove('mobile-open');

    // Trigger section refresh
    if (sectionId === 'dashboard' && typeof refreshDashboard === 'function') refreshDashboard();
    if (sectionId === 'books' && typeof refreshBooks === 'function') refreshBooks();
    if (sectionId === 'students' && typeof refreshStudents === 'function') refreshStudents();
    if (sectionId === 'issue' && typeof refreshIssue === 'function') refreshIssue();
    if (sectionId === 'returns' && typeof refreshReturns === 'function') refreshReturns();
    if (sectionId === 'mybooks') refreshMyBooks();
    if (sectionId === 'profile') refreshProfile();
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// ---- Theme Toggle ----
function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    themeToggle.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('lib_theme', dark ? 'dark' : 'light');
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
    // Rebuild charts on theme change
    if (typeof refreshDashboard === 'function') refreshDashboard();
});

// Load saved theme
setTheme(localStorage.getItem('lib_theme') === 'dark');

// ---- Logout ----
logoutBtn.addEventListener('click', () => {
    LibraryDB.logActivity('Logout', `${session.fullName} logged out`);
    sessionStorage.removeItem('lib_session');
    window.location.href = 'index.html';
});

// ---- Global Search ----
globalSearch.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) return;
    // Find matching section
    const books = LibraryDB.getBooks().filter(b => b.name.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    const students = LibraryDB.getStudents().filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    if (books.length > 0) {
        showSection('books');
        document.getElementById('bookSearch').value = q;
        document.getElementById('bookSearch').dispatchEvent(new Event('input'));
    } else if (students.length > 0) {
        showSection('students');
        document.getElementById('studentSearch').value = q;
        document.getElementById('studentSearch').dispatchEvent(new Event('input'));
    }
});

// ---- Notification Badge ----
function updateNotifBadge() {
    const overdue = LibraryDB.getOverdueIssues().length;
    notifBadge.textContent = overdue;
    notifBadge.style.display = overdue > 0 ? 'flex' : 'none';
}
updateNotifBadge();

document.getElementById('notifBtn').addEventListener('click', () => {
    const overdue = LibraryDB.getOverdueIssues().length;
    if (overdue > 0) {
        showToast(`${overdue} overdue book(s) need attention!`, 'warning');
        showSection('returns');
    } else {
        showToast('No pending notifications', 'info');
    }
});

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    const icons = { success: 'check-circle', error: 'times-circle', info: 'info-circle', warning: 'exclamation-triangle' };
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ---- Modal Helpers ----
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
});

// ---- Utility: Format Date ----
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

// ---- Status Badge HTML ----
function statusBadge(status) {
    const cls = { 'Available': 'badge-available', 'Issued': 'badge-issued', 'Overdue': 'badge-overdue', 'Returned': 'badge-returned', 'Out of Stock': 'badge-outofstock' };
    return `<span class="badge ${cls[status] || 'badge-issued'}">${status}</span>`;
}

// ============================================
// Student-Only Sections
// ============================================

function refreshMyBooks() {
    if (!currentStudentId) return;
    const sid = parseInt(currentStudentId);
    // Always read fresh from localStorage
    const allIssues = JSON.parse(localStorage.getItem('lib_issues')) || [];
    const issues = allIssues.filter(i => parseInt(i.studentId) === sid);
    const active = issues.filter(i => i.status !== 'Returned');
    const overdue = active.filter(i => new Date(i.dueDate) < new Date());
    const returned = issues.filter(i => i.status === 'Returned');

    document.getElementById('myIssuedCount').textContent = active.length;
    document.getElementById('myOverdueCount').textContent = overdue.length;
    document.getElementById('myReturnedCount').textContent = returned.length;

    const tbody = document.getElementById('myBooksTableBody');
    if (!active.length) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><i class="fas fa-bookmark"></i><h4>No books borrowed</h4><p>You have no issued books right now.</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = active.map(i => {
        const book = LibraryDB.getBookById(i.bookId);
        const isOverdue = new Date(i.dueDate) < new Date();
        const status = isOverdue ? 'Overdue' : 'Issued';
        return `<tr>
            <td>${book ? book.name : 'Unknown'}</td>
            <td>${book ? book.author : '-'}</td>
            <td>${formatDate(i.issueDate)}</td>
            <td>${formatDate(i.dueDate)}</td>
            <td>${statusBadge(status)}</td>
        </tr>`;
    }).join('');
}

function refreshProfile() {
    if (!currentStudentId) return;
    const student = LibraryDB.getStudentById(currentStudentId);
    if (!student) return;
    document.getElementById('profileAvatar').textContent = student.name.charAt(0).toUpperCase();
    document.getElementById('profileName').textContent = student.name;
    document.getElementById('profileDept').textContent = student.department;
    document.getElementById('profileEmail').textContent = student.email;
    document.getElementById('profilePhone').textContent = student.phone || '-';
    document.getElementById('profileId').textContent = '#' + student.id;
    document.getElementById('profileDate').textContent = formatDate(student.registeredAt);
}

// Init on load
showSection('dashboard');
