// ============================================
// Issue Book Module
// ============================================

function refreshIssue() {
    // Populate student dropdown
    const studentSelect = document.getElementById('issueStudent');
    const students = LibraryDB.getStudents();
    studentSelect.innerHTML = '<option value="">Select Student</option>' + students.map(s => `<option value="${s.id}">${s.name} (${s.department})</option>`).join('');

    // Populate book dropdown (only available books)
    const bookSelect = document.getElementById('issueBook');
    const books = LibraryDB.getBooks().filter(b => b.available > 0);
    bookSelect.innerHTML = '<option value="">Select Book</option>' + books.map(b => `<option value="${b.id}">${b.name} by ${b.author} (${b.available} available)</option>`).join('');

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    document.getElementById('issueDate').value = today;
    document.getElementById('issueDueDate').value = dueDate;

    // Render issued books table
    renderIssuedTable();
}

function renderIssuedTable() {
    const issues = LibraryDB.getActiveIssues();
    const tbody = document.getElementById('issuedTableBody');

    if (!issues.length) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><i class="fas fa-hand-holding"></i><h4>No books currently issued</h4></div></td></tr>';
        return;
    }

    tbody.innerHTML = issues.map(i => {
        const student = LibraryDB.getStudentById(i.studentId);
        const book = LibraryDB.getBookById(i.bookId);
        const isOverdue = new Date(i.dueDate) < new Date() && i.status !== 'Returned';
        const status = isOverdue ? 'Overdue' : i.status;
        return `<tr>
            <td><strong>#${i.id}</strong></td>
            <td>${student ? student.name : 'Unknown'}</td>
            <td>${book ? book.name : 'Unknown'}</td>
            <td>${formatDate(i.issueDate)}</td>
            <td>${formatDate(i.dueDate)}</td>
            <td>${statusBadge(status)}</td>
        </tr>`;
    }).join('');
}

document.getElementById('issueForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('issueStudent').value);
    const bookId = parseInt(document.getElementById('issueBook').value);
    const issueDate = document.getElementById('issueDate').value;
    const dueDate = document.getElementById('issueDueDate').value;

    if (!studentId || !bookId || !issueDate || !dueDate) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    if (new Date(dueDate) <= new Date(issueDate)) {
        showToast('Due date must be after issue date', 'error');
        return;
    }

    const result = LibraryDB.issueBook(studentId, bookId, issueDate, dueDate);
    if (result) {
        showToast('Book issued successfully!', 'success');
        document.getElementById('issueForm').reset();
        refreshIssue();
    } else {
        showToast('Failed to issue book. Book may not be available.', 'error');
    }
});
