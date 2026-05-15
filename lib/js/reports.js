// ============================================
// Reports Module
// ============================================

document.querySelectorAll('.report-card').forEach(card => {
    card.addEventListener('click', () => {
        const type = card.dataset.report;
        generateReport(type);
    });
});

document.getElementById('reportPrintBtn').addEventListener('click', () => {
    const content = document.getElementById('reportOutput').innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Library Report</title>
        <style>body{font-family:Inter,sans-serif;padding:32px;color:#1e293b}
        table{width:100%;border-collapse:collapse;margin-top:16px}
        th,td{border:1px solid #e2e8f0;padding:10px 14px;text-align:left;font-size:13px}
        th{background:#f1f5f9;font-weight:600;text-transform:uppercase;font-size:11px;letter-spacing:.5px}
        h2{color:#1e1b4b;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:16px}
        .badge{padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600}
        .badge-overdue{background:#fee2e2;color:#dc2626}.badge-issued{background:#dbeafe;color:#2563eb}
        .badge-available{background:#d1fae5;color:#059669}
        @media print{body{padding:16px}}</style>
    </head><body>${content}</body></html>`);
    win.document.close();
    win.print();
});

function generateReport(type) {
    const output = document.getElementById('reportOutput');
    const titleEl = document.getElementById('reportTitle');
    const contentEl = document.getElementById('reportContent');
    output.style.display = 'block';

    switch (type) {
        case 'issued': renderIssuedReport(titleEl, contentEl); break;
        case 'available': renderAvailableReport(titleEl, contentEl); break;
        case 'overdue': renderOverdueReport(titleEl, contentEl); break;
        case 'student': renderStudentReport(titleEl, contentEl); break;
    }

    output.scrollIntoView({ behavior: 'smooth' });
}

function renderIssuedReport(titleEl, contentEl) {
    titleEl.textContent = 'Issued Books Report';
    const issues = LibraryDB.getActiveIssues();
    if (!issues.length) { contentEl.innerHTML = '<p>No books currently issued.</p>'; return; }
    let html = `<p>Generated on ${formatDate(new Date().toISOString())} — ${issues.length} book(s) currently issued</p>`;
    html += '<table class="data-table"><thead><tr><th>Issue ID</th><th>Student</th><th>Book</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead><tbody>';
    issues.forEach(i => {
        const student = LibraryDB.getStudentById(i.studentId);
        const book = LibraryDB.getBookById(i.bookId);
        const isOverdue = new Date(i.dueDate) < new Date();
        html += `<tr><td>#${i.id}</td><td>${student ? student.name : '-'}</td><td>${book ? book.name : '-'}</td>
            <td>${formatDate(i.issueDate)}</td><td>${formatDate(i.dueDate)}</td>
            <td>${statusBadge(isOverdue ? 'Overdue' : 'Issued')}</td></tr>`;
    });
    html += '</tbody></table>';
    contentEl.innerHTML = html;
}

function renderAvailableReport(titleEl, contentEl) {
    titleEl.textContent = 'Available Books Report';
    const books = LibraryDB.getBooks().filter(b => b.available > 0);
    if (!books.length) { contentEl.innerHTML = '<p>No books available.</p>'; return; }
    let html = `<p>Generated on ${formatDate(new Date().toISOString())} — ${books.length} book(s) available</p>`;
    html += '<table class="data-table"><thead><tr><th>ID</th><th>Book Name</th><th>Author</th><th>Category</th><th>Total</th><th>Available</th><th>Status</th></tr></thead><tbody>';
    books.forEach(b => {
        html += `<tr><td>#${b.id}</td><td>${b.name}</td><td>${b.author}</td><td>${b.category}</td>
            <td>${b.quantity}</td><td>${b.available}</td><td>${statusBadge(b.status)}</td></tr>`;
    });
    html += '</tbody></table>';
    contentEl.innerHTML = html;
}

function renderOverdueReport(titleEl, contentEl) {
    titleEl.textContent = 'Overdue Books Report';
    const overdue = LibraryDB.getOverdueIssues();
    if (!overdue.length) { contentEl.innerHTML = '<p>No overdue books. Everything is on track! 🎉</p>'; return; }
    let html = `<p>Generated on ${formatDate(new Date().toISOString())} — ${overdue.length} overdue book(s)</p>`;
    html += '<table class="data-table"><thead><tr><th>Issue ID</th><th>Student</th><th>Book</th><th>Due Date</th><th>Days Overdue</th></tr></thead><tbody>';
    overdue.forEach(i => {
        const student = LibraryDB.getStudentById(i.studentId);
        const book = LibraryDB.getBookById(i.bookId);
        const days = Math.ceil((Date.now() - new Date(i.dueDate).getTime()) / 86400000);
        html += `<tr><td>#${i.id}</td><td>${student ? student.name : '-'}</td><td>${book ? book.name : '-'}</td>
            <td>${formatDate(i.dueDate)}</td><td><span class="badge badge-overdue">${days} days</span></td></tr>`;
    });
    html += '</tbody></table>';
    contentEl.innerHTML = html;
}

function renderStudentReport(titleEl, contentEl) {
    titleEl.textContent = 'Student Activity Report';
    const students = LibraryDB.getStudents();
    const issues = LibraryDB.getIssues();
    let html = `<p>Generated on ${formatDate(new Date().toISOString())} — ${students.length} registered student(s)</p>`;
    html += '<table class="data-table"><thead><tr><th>Student</th><th>Department</th><th>Total Borrowed</th><th>Currently Issued</th><th>Overdue</th></tr></thead><tbody>';
    students.forEach(s => {
        const myIssues = issues.filter(i => i.studentId === s.id);
        const active = myIssues.filter(i => i.status !== 'Returned').length;
        const overdue = myIssues.filter(i => i.status !== 'Returned' && new Date(i.dueDate) < new Date()).length;
        html += `<tr><td>${s.name}</td><td>${s.department}</td><td>${myIssues.length}</td>
            <td>${active}</td><td>${overdue > 0 ? `<span class="badge badge-overdue">${overdue}</span>` : '<span class="badge badge-available">0</span>'}</td></tr>`;
    });
    html += '</tbody></table>';
    contentEl.innerHTML = html;
}
