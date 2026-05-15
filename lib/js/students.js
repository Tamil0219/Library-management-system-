// ============================================
// Student Management Module
// ============================================

function refreshStudents() {
    const students = LibraryDB.getStudents();
    const search = document.getElementById('studentSearch').value.toLowerCase();
    const deptFilter = document.getElementById('studentDeptFilter').value;

    // Populate department filter
    const deptSelect = document.getElementById('studentDeptFilter');
    const depts = [...new Set(students.map(s => s.department))].sort();
    const currentDept = deptSelect.value;
    deptSelect.innerHTML = '<option value="">All Departments</option>' + depts.map(d => `<option ${d === currentDept ? 'selected' : ''}>${d}</option>`).join('');

    // Filter
    let filtered = students;
    if (search) filtered = filtered.filter(s => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search) || s.phone.includes(search) || (s.username && s.username.toLowerCase().includes(search)));
    if (deptFilter) filtered = filtered.filter(s => s.department === deptFilter);

    const tbody = document.getElementById('studentsTableBody');
    if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-user-graduate"></i><h4>No students found</h4><p>Try adjusting your search or filters.</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = filtered.map(s => `<tr>
        <td><strong>#${s.id}</strong></td>
        <td>${s.name}</td>
        <td>${s.department}</td>
        <td>${s.email}</td>
        <td><span class="badge badge-info"><i class="fas fa-user"></i> ${s.username || '-'}</span></td>
        <td>${s.phone || '-'}</td>
        <td><div class="action-btns">
            <button class="btn-icon" onclick="editStudent(${s.id})" title="Edit"><i class="fas fa-pen"></i></button>
            <button class="btn-icon delete" onclick="deleteStudent(${s.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </div></td>
    </tr>`).join('');
}

document.getElementById('studentSearch').addEventListener('input', refreshStudents);
document.getElementById('studentDeptFilter').addEventListener('change', refreshStudents);

document.getElementById('addStudentBtn').addEventListener('click', () => {
    document.getElementById('studentForm').reset();
    document.getElementById('studentEditId').value = '';
    document.getElementById('studentModalTitle').textContent = 'Add New Student';
    // Show password field and make credentials required for new students
    document.getElementById('studentUsername').required = true;
    document.getElementById('studentPassword').required = true;
    document.getElementById('studentPassword').placeholder = 'Login password';
    openModal('studentModal');
});

document.getElementById('studentSaveBtn').addEventListener('click', () => {
    const name = document.getElementById('studentName').value.trim();
    const department = document.getElementById('studentDepartment').value;
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const username = document.getElementById('studentUsername').value.trim();
    const password = document.getElementById('studentPassword').value.trim();
    const editId = document.getElementById('studentEditId').value;

    if (!name || !department || !email) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (!editId && (!username || !password)) {
        showToast('Username and password are required for new students', 'error');
        return;
    }

    // Check username uniqueness
    if (username) {
        const existingUser = LibraryDB.getUserByUsername(username);
        if (existingUser) {
            // If editing, allow same username for same student
            if (editId) {
                const users = LibraryDB.getUsers();
                const linkedUser = users.find(u => u.role === 'Student' && u.studentId === parseInt(editId));
                if (!linkedUser || linkedUser.username !== username) {
                    showToast('Username already taken. Please choose a different one.', 'error');
                    return;
                }
            } else {
                showToast('Username already taken. Please choose a different one.', 'error');
                return;
            }
        }
    }

    if (editId) {
        const updates = { name, department, email, phone };
        if (username) updates.username = username;
        if (password) updates.password = password;
        LibraryDB.updateStudent(parseInt(editId), updates);
        showToast('Student updated successfully!', 'success');
    } else {
        LibraryDB.addStudent({ name, department, email, phone, username, password });
        showToast('Student added with login credentials!', 'success');
    }
    closeModal('studentModal');
    refreshStudents();
});

function editStudent(id) {
    const s = LibraryDB.getStudentById(id);
    if (!s) return;
    document.getElementById('studentEditId').value = s.id;
    document.getElementById('studentName').value = s.name;
    document.getElementById('studentDepartment').value = s.department;
    document.getElementById('studentEmail').value = s.email;
    document.getElementById('studentPhone').value = s.phone || '';
    document.getElementById('studentUsername').value = s.username || '';
    document.getElementById('studentPassword').value = '';
    document.getElementById('studentPassword').placeholder = 'Leave blank to keep current';
    document.getElementById('studentUsername').required = false;
    document.getElementById('studentPassword').required = false;
    document.getElementById('studentModalTitle').textContent = 'Edit Student';
    openModal('studentModal');
}

function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student? This will also remove their login credentials.')) return;
    LibraryDB.deleteStudent(id);
    showToast('Student and login credentials deleted!', 'success');
    refreshStudents();
}
