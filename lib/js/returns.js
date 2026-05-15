// ============================================
// Return Book Module
// ============================================

function refreshReturns() {
    const search = document.getElementById('returnSearch').value.toLowerCase();
    let issues = LibraryDB.getIssues().filter(i => i.status !== 'Returned');

    // Mark overdue
    const today = new Date().toISOString().split('T')[0];
    issues.forEach(i => { if (i.dueDate < today && i.status !== 'Returned') i.status = 'Overdue'; });

    // Search filter
    if (search) {
        issues = issues.filter(i => {
            const student = LibraryDB.getStudentById(i.studentId);
            const book = LibraryDB.getBookById(i.bookId);
            return (student && student.name.toLowerCase().includes(search)) ||
                   (book && book.name.toLowerCase().includes(search));
        });
    }

    const tbody = document.getElementById('returnTableBody');
    if (!issues.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-undo-alt"></i><h4>No books to return</h4><p>All books have been returned.</p></div></td></tr>';
        return;
    }

    tbody.innerHTML = issues.map(i => {
        const student = LibraryDB.getStudentById(i.studentId);
        const book = LibraryDB.getBookById(i.bookId);
        const isOverdue = new Date(i.dueDate) < new Date();
        const status = isOverdue ? 'Overdue' : 'Issued';
        const daysOverdue = isOverdue ? Math.ceil((Date.now() - new Date(i.dueDate).getTime()) / 86400000) : 0;
        return `<tr>
            <td><strong>#${i.id}</strong></td>
            <td>${student ? student.name : 'Unknown'}</td>
            <td>${book ? book.name : 'Unknown'}</td>
            <td>${formatDate(i.issueDate)}</td>
            <td>${formatDate(i.dueDate)} ${isOverdue ? `<br><small style="color:var(--danger)">${daysOverdue} days overdue</small>` : ''}</td>
            <td>${statusBadge(status)}</td>
            <td><button class="btn btn-sm btn-success" data-return-id="${i.id}"><i class="fas fa-check"></i> Return</button></td>
        </tr>`;
    }).join('');

    // Attach click handlers using event delegation
    tbody.querySelectorAll('[data-return-id]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const issueId = parseInt(this.getAttribute('data-return-id'));
            processReturn(issueId);
        });
    });
}

function processReturn(issueId) {
    try {
        const result = LibraryDB.returnBook(issueId);
        if (result) {
            showToast('Book returned successfully!', 'success');
            refreshReturns();
            if (typeof updateNotifBadge === 'function') updateNotifBadge();
        } else {
            showToast('Failed to process return. Issue not found.', 'error');
        }
    } catch (err) {
        console.error('Return error:', err);
        showToast('Error: ' + err.message, 'error');
    }
}

document.getElementById('returnSearch').addEventListener('input', refreshReturns);
