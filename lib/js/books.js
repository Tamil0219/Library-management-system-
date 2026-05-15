// ============================================
// Book Management Module
// ============================================

function refreshBooks() {
    const books = LibraryDB.getBooks();
    const search = document.getElementById('bookSearch').value.toLowerCase();
    const catFilter = document.getElementById('bookCategoryFilter').value;
    const statusFilter = document.getElementById('bookStatusFilter').value;

    // Populate category filter
    const catSelect = document.getElementById('bookCategoryFilter');
    const cats = [...new Set(books.map(b => b.category))].sort();
    const currentCat = catSelect.value;
    catSelect.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option ${c === currentCat ? 'selected' : ''}>${c}</option>`).join('');

    // Filter
    let filtered = books;
    if (search) filtered = filtered.filter(b => b.name.toLowerCase().includes(search) || b.author.toLowerCase().includes(search) || b.publisher.toLowerCase().includes(search));
    if (catFilter) filtered = filtered.filter(b => b.category === catFilter);
    if (statusFilter) filtered = filtered.filter(b => b.status === statusFilter);

    const tbody = document.getElementById('booksTableBody');
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><i class="fas fa-book"></i><h4>No books found</h4><p>Try adjusting your search or filters.</p></div></td></tr>';
        return;
    }
    const showActions = typeof isAdmin !== 'undefined' && isAdmin;
    tbody.innerHTML = filtered.map(b => `<tr>
        <td><strong>#${b.id}</strong></td>
        <td>${b.name}</td>
        <td>${b.author}</td>
        <td>${b.publisher || '-'}</td>
        <td>${b.category}</td>
        <td>${b.quantity}</td>
        <td>${b.available}</td>
        <td>${statusBadge(b.status)}</td>
        ${showActions ? `<td><div class="action-btns">
            <button class="btn-icon" onclick="editBook(${b.id})" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-icon delete" onclick="deleteBook(${b.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div></td>` : '<td>-</td>'}
    </tr>`).join('');
}

// Event Listeners
document.getElementById('bookSearch').addEventListener('input', refreshBooks);
document.getElementById('bookCategoryFilter').addEventListener('change', refreshBooks);
document.getElementById('bookStatusFilter').addEventListener('change', refreshBooks);

document.getElementById('addBookBtn').addEventListener('click', () => {
    document.getElementById('bookForm').reset();
    document.getElementById('bookEditId').value = '';
    document.getElementById('bookModalTitle').textContent = 'Add New Book';
    openModal('bookModal');
});

document.getElementById('bookSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('bookName').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const publisher = document.getElementById('bookPublisher').value.trim();
    const category = document.getElementById('bookCategory').value;
    const quantity = parseInt(document.getElementById('bookQuantity').value);
    const editId = document.getElementById('bookEditId').value;

    if (!name || !author || !category || !quantity) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (editId) {
        LibraryDB.updateBook(parseInt(editId), { name, author, publisher, category, quantity });
        showToast('Book updated successfully!', 'success');
    } else {
        LibraryDB.addBook({ name, author, publisher, category, quantity });
        showToast('Book added successfully!', 'success');
    }

    closeModal('bookModal');
    refreshBooks();
});

function editBook(id) {
    const book = LibraryDB.getBookById(id);
    if (!book) return;
    document.getElementById('bookEditId').value = book.id;
    document.getElementById('bookName').value = book.name;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookPublisher').value = book.publisher || '';
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookQuantity').value = book.quantity;
    document.getElementById('bookModalTitle').textContent = 'Edit Book';
    openModal('bookModal');
}

function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    LibraryDB.deleteBook(id);
    showToast('Book deleted successfully!', 'success');
    refreshBooks();
}
