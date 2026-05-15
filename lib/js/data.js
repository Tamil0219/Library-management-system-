// ============================================
// Smart Library Management System - Data Layer
// Uses localStorage to simulate database
// ============================================

const LibraryDB = {
    DATA_VERSION: 'v2', // Bump this when sample data structure changes

    keys: {
        books: 'lib_books',
        students: 'lib_students',
        issues: 'lib_issues',
        users: 'lib_users',
        activities: 'lib_activities',
        initialized: 'lib_initialized',
        version: 'lib_data_version'
    },

    // ---- Initialize with sample data ----
    init() {
        const currentVersion = localStorage.getItem(this.keys.version);
        // Re-initialize if never initialized OR if data version has changed
        if (localStorage.getItem(this.keys.initialized) && currentVersion === this.DATA_VERSION) return;
        // Clear old data
        Object.values(this.keys).forEach(k => localStorage.removeItem(k));
        localStorage.setItem(this.keys.users, JSON.stringify(this.sampleUsers()));
        localStorage.setItem(this.keys.books, JSON.stringify(this.sampleBooks()));
        localStorage.setItem(this.keys.students, JSON.stringify(this.sampleStudents()));
        localStorage.setItem(this.keys.issues, JSON.stringify(this.sampleIssues()));
        localStorage.setItem(this.keys.activities, JSON.stringify(this.sampleActivities()));
        localStorage.setItem(this.keys.initialized, 'true');
        localStorage.setItem(this.keys.version, this.DATA_VERSION);
    },

    // ---- Generic CRUD ----
    getAll(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    getNextId(items) {
        if (!items.length) return 1;
        return Math.max(...items.map(i => i.id)) + 1;
    },

    // ---- Books ----
    getBooks() { return this.getAll(this.keys.books); },
    addBook(book) {
        const books = this.getBooks();
        book.id = this.getNextId(books);
        book.available = book.quantity;
        book.status = 'Available';
        book.addedAt = new Date().toISOString();
        books.push(book);
        this.save(this.keys.books, books);
        this.logActivity('Book Added', `"${book.name}" added to library`);
        return book;
    },
    updateBook(id, updates) {
        const books = this.getBooks();
        const idx = books.findIndex(b => b.id === id);
        if (idx === -1) return null;
        Object.assign(books[idx], updates);
        if (books[idx].available <= 0) books[idx].status = 'Out of Stock';
        else if (books[idx].available < books[idx].quantity) books[idx].status = 'Issued';
        else books[idx].status = 'Available';
        this.save(this.keys.books, books);
        this.logActivity('Book Updated', `"${books[idx].name}" details updated`);
        return books[idx];
    },
    deleteBook(id) {
        let books = this.getBooks();
        const book = books.find(b => b.id === id);
        books = books.filter(b => b.id !== id);
        this.save(this.keys.books, books);
        if (book) this.logActivity('Book Deleted', `"${book.name}" removed from library`);
    },
    getBookById(id) {
        return this.getBooks().find(b => b.id === id) || null;
    },

    // ---- Students ----
    getStudents() { return this.getAll(this.keys.students); },
    addStudent(student) {
        const students = this.getStudents();
        student.id = this.getNextId(students);
        student.registeredAt = new Date().toISOString();
        students.push(student);
        this.save(this.keys.students, students);
        // Auto-create a login account for this student
        if (student.username && student.password) {
            this.addUser({
                username: student.username,
                password: student.password,
                fullName: student.name,
                role: 'Student',
                studentId: student.id
            });
        }
        this.logActivity('Student Added', `${student.name} registered with login: ${student.username}`);
        return student;
    },
    updateStudent(id, updates) {
        const students = this.getStudents();
        const idx = students.findIndex(s => s.id === id);
        if (idx === -1) return null;
        const oldUsername = students[idx].username;
        Object.assign(students[idx], updates);
        this.save(this.keys.students, students);
        // Update the linked user account
        if (updates.username || updates.password || updates.name) {
            const users = this.getUsers();
            const uIdx = users.findIndex(u => u.role === 'Student' && u.studentId === id);
            if (uIdx !== -1) {
                if (updates.username) users[uIdx].username = updates.username;
                if (updates.password) users[uIdx].password = updates.password;
                if (updates.name) users[uIdx].fullName = updates.name;
                this.save(this.keys.users, users);
            }
        }
        this.logActivity('Student Updated', `${students[idx].name}'s details updated`);
        return students[idx];
    },
    deleteStudent(id) {
        let students = this.getStudents();
        const student = students.find(s => s.id === id);
        students = students.filter(s => s.id !== id);
        this.save(this.keys.students, students);
        // Remove the linked user account
        let users = this.getUsers();
        users = users.filter(u => !(u.role === 'Student' && u.studentId === id));
        this.save(this.keys.users, users);
        if (student) this.logActivity('Student Deleted', `${student.name} removed`);
    },
    getStudentById(id) {
        return this.getStudents().find(s => s.id === id) || null;
    },

    // ---- Issues ----
    getIssues() { return this.getAll(this.keys.issues); },
    issueBook(studentId, bookId, issueDate, dueDate) {
        const book = this.getBookById(bookId);
        if (!book || book.available <= 0) return null;
        const issues = this.getIssues();
        const issue = {
            id: this.getNextId(issues),
            studentId, bookId, issueDate, dueDate,
            returnDate: null,
            status: 'Issued'
        };
        issues.push(issue);
        this.save(this.keys.issues, issues);
        this.updateBook(bookId, { available: book.available - 1 });
        const student = this.getStudentById(studentId);
        this.logActivity('Book Issued', `"${book.name}" issued to ${student ? student.name : 'Student #' + studentId}`);
        return issue;
    },
    returnBook(issueId) {
        const issues = this.getIssues();
        const idx = issues.findIndex(i => i.id === issueId);
        if (idx === -1) return null;
        issues[idx].returnDate = new Date().toISOString().split('T')[0];
        issues[idx].status = 'Returned';
        this.save(this.keys.issues, issues);
        const book = this.getBookById(issues[idx].bookId);
        if (book) this.updateBook(issues[idx].bookId, { available: book.available + 1 });
        const student = this.getStudentById(issues[idx].studentId);
        this.logActivity('Book Returned', `"${book ? book.name : 'Book'}" returned by ${student ? student.name : 'Student'}`);
        return issues[idx];
    },
    getActiveIssues() {
        return this.getIssues().filter(i => i.status !== 'Returned');
    },
    getOverdueIssues() {
        const today = new Date().toISOString().split('T')[0];
        return this.getIssues().filter(i => i.status !== 'Returned' && i.dueDate < today);
    },

    // ---- Users / Auth ----
    getUsers() { return this.getAll(this.keys.users); },
    addUser(user) {
        const users = this.getUsers();
        user.id = this.getNextId(users);
        users.push(user);
        this.save(this.keys.users, users);
        return user;
    },
    getUserByUsername(username) {
        return this.getUsers().find(u => u.username === username) || null;
    },
    authenticate(username, password) {
        const users = this.getUsers();
        return users.find(u => u.username === username && u.password === password) || null;
    },

    // ---- Activity Log ----
    getActivities() { return this.getAll(this.keys.activities); },
    logActivity(action, details) {
        const activities = this.getActivities();
        activities.unshift({ id: Date.now(), action, details, timestamp: new Date().toISOString() });
        if (activities.length > 50) activities.length = 50;
        this.save(this.keys.activities, activities);
    },

    // ---- Stats ----
    getStats() {
        const books = this.getBooks();
        const students = this.getStudents();
        const issues = this.getActiveIssues();
        const overdue = this.getOverdueIssues();
        return {
            totalBooks: books.reduce((sum, b) => sum + b.quantity, 0),
            issuedBooks: issues.length,
            availableBooks: books.reduce((sum, b) => sum + b.available, 0),
            totalStudents: students.length,
            overdueBooks: overdue.length,
            categories: [...new Set(books.map(b => b.category))],
            booksByCategory: books.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + b.quantity; return acc; }, {})
        };
    },

    // ---- Reset ----
    resetAll() {
        Object.values(this.keys).forEach(k => localStorage.removeItem(k));
        this.init();
    },

    // ============================================
    // Sample Data
    // ============================================
    sampleUsers() {
        return [
            { id: 1, username: 'admin', password: 'admin123', fullName: 'System Administrator', role: 'Admin' },
            { id: 2, username: 'rahul', password: 'rahul123', fullName: 'Rahul Sharma', role: 'Student', studentId: 1 },
            { id: 3, username: 'priya', password: 'priya123', fullName: 'Priya Patel', role: 'Student', studentId: 2 },
            { id: 4, username: 'amit', password: 'amit123', fullName: 'Amit Kumar', role: 'Student', studentId: 3 },
            { id: 5, username: 'sneha', password: 'sneha123', fullName: 'Sneha Reddy', role: 'Student', studentId: 4 },
            { id: 6, username: 'vikram', password: 'vikram123', fullName: 'Vikram Singh', role: 'Student', studentId: 5 },
            { id: 7, username: 'ananya', password: 'ananya123', fullName: 'Ananya Gupta', role: 'Student', studentId: 6 },
            { id: 8, username: 'karthik', password: 'karthik123', fullName: 'Karthik Nair', role: 'Student', studentId: 7 },
            { id: 9, username: 'divya', password: 'divya123', fullName: 'Divya Menon', role: 'Student', studentId: 8 },
            { id: 10, username: 'arjun', password: 'arjun123', fullName: 'Arjun Das', role: 'Student', studentId: 9 },
            { id: 11, username: 'meera', password: 'meera123', fullName: 'Meera Joshi', role: 'Student', studentId: 10 }
        ];
    },
    sampleBooks() {
        return [
            { id: 1, name: 'Introduction to Algorithms', author: 'Thomas H. Cormen', publisher: 'MIT Press', category: 'Programming', quantity: 5, available: 3, status: 'Issued', addedAt: '2026-01-15' },
            { id: 2, name: 'Database System Concepts', author: 'Abraham Silberschatz', publisher: 'McGraw Hill', category: 'Database', quantity: 4, available: 1, status: 'Issued', addedAt: '2026-01-20' },
            { id: 3, name: 'Computer Networking', author: 'James Kurose', publisher: 'Pearson', category: 'Networks', quantity: 3, available: 1, status: 'Issued', addedAt: '2026-02-01' },
            { id: 4, name: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', publisher: 'Pearson', category: 'AI/ML', quantity: 3, available: 2, status: 'Issued', addedAt: '2026-02-10' },
            { id: 5, name: 'Clean Code', author: 'Robert C. Martin', publisher: 'Prentice Hall', category: 'Programming', quantity: 4, available: 4, status: 'Available', addedAt: '2026-02-15' },
            { id: 6, name: 'Operating System Concepts', author: 'Silberschatz & Galvin', publisher: 'Wiley', category: 'Operating Systems', quantity: 5, available: 4, status: 'Issued', addedAt: '2026-02-20' },
            { id: 7, name: 'Data Structures Using C', author: 'Reema Thareja', publisher: 'Oxford Press', category: 'Programming', quantity: 6, available: 5, status: 'Issued', addedAt: '2026-03-01' },
            { id: 8, name: 'Web Technologies', author: 'Uttam K. Roy', publisher: 'Oxford Press', category: 'Web Development', quantity: 3, available: 2, status: 'Issued', addedAt: '2026-03-05' },
            { id: 9, name: 'Machine Learning', author: 'Tom Mitchell', publisher: 'McGraw Hill', category: 'AI/ML', quantity: 2, available: 1, status: 'Issued', addedAt: '2026-03-10' },
            { id: 10, name: 'Software Engineering', author: 'Ian Sommerville', publisher: 'Pearson', category: 'Software Engineering', quantity: 4, available: 3, status: 'Issued', addedAt: '2026-03-15' },
            { id: 11, name: 'Digital Logic Design', author: 'Morris Mano', publisher: 'Pearson', category: 'Electronics', quantity: 5, available: 5, status: 'Available', addedAt: '2026-03-20' },
            { id: 12, name: 'Compiler Design', author: 'Alfred V. Aho', publisher: 'Pearson', category: 'Programming', quantity: 3, available: 2, status: 'Issued', addedAt: '2026-04-01' },
            { id: 13, name: 'Python Programming', author: 'Mark Lutz', publisher: "O'Reilly", category: 'Programming', quantity: 4, available: 3, status: 'Issued', addedAt: '2026-04-05' },
            { id: 14, name: 'Java: The Complete Reference', author: 'Herbert Schildt', publisher: 'McGraw Hill', category: 'Programming', quantity: 5, available: 4, status: 'Issued', addedAt: '2026-04-10' },
            { id: 15, name: 'Discrete Mathematics', author: 'Kenneth Rosen', publisher: 'McGraw Hill', category: 'Mathematics', quantity: 4, available: 4, status: 'Available', addedAt: '2026-04-15' }
        ];
    },
    sampleStudents() {
        return [
            { id: 1, name: 'Rahul Sharma', department: 'Computer Science', email: 'rahul.sharma@college.edu', phone: '9876543210', username: 'rahul', registeredAt: '2026-01-10' },
            { id: 2, name: 'Priya Patel', department: 'Information Technology', email: 'priya.patel@college.edu', phone: '9876543211', username: 'priya', registeredAt: '2026-01-12' },
            { id: 3, name: 'Amit Kumar', department: 'Electronics', email: 'amit.kumar@college.edu', phone: '9876543212', username: 'amit', registeredAt: '2026-01-15' },
            { id: 4, name: 'Sneha Reddy', department: 'Computer Science', email: 'sneha.reddy@college.edu', phone: '9876543213', username: 'sneha', registeredAt: '2026-01-18' },
            { id: 5, name: 'Vikram Singh', department: 'Mechanical', email: 'vikram.singh@college.edu', phone: '9876543214', username: 'vikram', registeredAt: '2026-02-01' },
            { id: 6, name: 'Ananya Gupta', department: 'Computer Science', email: 'ananya.gupta@college.edu', phone: '9876543215', username: 'ananya', registeredAt: '2026-02-05' },
            { id: 7, name: 'Karthik Nair', department: 'Electrical', email: 'karthik.nair@college.edu', phone: '9876543216', username: 'karthik', registeredAt: '2026-02-10' },
            { id: 8, name: 'Divya Menon', department: 'Information Technology', email: 'divya.menon@college.edu', phone: '9876543217', username: 'divya', registeredAt: '2026-02-15' },
            { id: 9, name: 'Arjun Das', department: 'Civil', email: 'arjun.das@college.edu', phone: '9876543218', username: 'arjun', registeredAt: '2026-03-01' },
            { id: 10, name: 'Meera Joshi', department: 'Computer Science', email: 'meera.joshi@college.edu', phone: '9876543219', username: 'meera', registeredAt: '2026-03-05' }
        ];
    },
    sampleIssues() {
        return [
            { id: 1, studentId: 1, bookId: 1, issueDate: '2026-05-01', dueDate: '2026-05-15', returnDate: null, status: 'Issued' },
            { id: 2, studentId: 2, bookId: 3, issueDate: '2026-05-03', dueDate: '2026-05-17', returnDate: null, status: 'Issued' },
            { id: 3, studentId: 3, bookId: 2, issueDate: '2026-05-05', dueDate: '2026-05-19', returnDate: null, status: 'Issued' },
            { id: 4, studentId: 4, bookId: 4, issueDate: '2026-05-07', dueDate: '2026-05-21', returnDate: null, status: 'Issued' },
            { id: 5, studentId: 1, bookId: 8, issueDate: '2026-04-20', dueDate: '2026-05-04', returnDate: null, status: 'Overdue' },
            { id: 6, studentId: 5, bookId: 2, issueDate: '2026-04-25', dueDate: '2026-05-09', returnDate: null, status: 'Overdue' },
            { id: 7, studentId: 6, bookId: 1, issueDate: '2026-05-10', dueDate: '2026-05-24', returnDate: null, status: 'Issued' },
            { id: 8, studentId: 7, bookId: 6, issueDate: '2026-05-08', dueDate: '2026-05-22', returnDate: null, status: 'Issued' },
            { id: 9, studentId: 8, bookId: 2, issueDate: '2026-05-06', dueDate: '2026-05-20', returnDate: null, status: 'Issued' },
            { id: 10, studentId: 9, bookId: 7, issueDate: '2026-05-09', dueDate: '2026-05-23', returnDate: null, status: 'Issued' },
            { id: 11, studentId: 10, bookId: 10, issueDate: '2026-05-11', dueDate: '2026-05-25', returnDate: null, status: 'Issued' },
            { id: 12, studentId: 3, bookId: 12, issueDate: '2026-05-12', dueDate: '2026-05-26', returnDate: null, status: 'Issued' },
            { id: 13, studentId: 4, bookId: 9, issueDate: '2026-05-10', dueDate: '2026-05-24', returnDate: null, status: 'Issued' },
            { id: 14, studentId: 2, bookId: 13, issueDate: '2026-05-13', dueDate: '2026-05-27', returnDate: null, status: 'Issued' },
            { id: 15, studentId: 6, bookId: 14, issueDate: '2026-05-14', dueDate: '2026-05-28', returnDate: null, status: 'Issued' }
        ];
    },
    sampleActivities() {
        return [
            { id: 1, action: 'Book Issued', details: '"Introduction to Algorithms" issued to Rahul Sharma', timestamp: '2026-05-14T10:30:00' },
            { id: 2, action: 'Student Added', details: 'Meera Joshi registered', timestamp: '2026-05-13T14:20:00' },
            { id: 3, action: 'Book Added', details: '"Discrete Mathematics" added to library', timestamp: '2026-05-12T09:15:00' },
            { id: 4, action: 'Book Issued', details: '"Computer Networking" issued to Priya Patel', timestamp: '2026-05-11T11:45:00' },
            { id: 5, action: 'Book Returned', details: '"Clean Code" returned by Amit Kumar', timestamp: '2026-05-10T16:00:00' },
            { id: 6, action: 'Book Issued', details: '"Machine Learning" issued to Sneha Reddy', timestamp: '2026-05-09T10:00:00' },
            { id: 7, action: 'Student Added', details: 'Arjun Das registered', timestamp: '2026-05-08T13:30:00' },
            { id: 8, action: 'Book Updated', details: '"Web Technologies" details updated', timestamp: '2026-05-07T15:45:00' }
        ];
    }
};

// Initialize on load
LibraryDB.init();
