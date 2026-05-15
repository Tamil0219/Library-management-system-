// ============================================
// Authentication Module
// ============================================
(function () {
    const form = document.getElementById('loginForm');
    const errorBox = document.getElementById('loginError');
    const errorText = document.getElementById('errorText');
    const roleTabs = document.querySelectorAll('.role-tab');
    let selectedRole = 'Admin';

    // Role tab switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedRole = tab.dataset.role;
        });
    });

    // Login form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!username || !password) {
            showError('Please fill in all fields');
            return;
        }

        const user = LibraryDB.authenticate(username, password);
        if (!user) {
            showError('Invalid username or password');
            return;
        }
        if (user.role !== selectedRole) {
            showError(`This account is not registered as ${selectedRole}`);
            return;
        }

        // Store session
        sessionStorage.setItem('lib_session', JSON.stringify({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            studentId: user.studentId || null
        }));

        LibraryDB.logActivity('Login', `${user.fullName} logged in as ${user.role}`);
        window.location.href = 'dashboard.html';
    });

    function showError(msg) {
        errorText.textContent = msg;
        errorBox.classList.add('show');
        setTimeout(() => errorBox.classList.remove('show'), 4000);
    }

    // Redirect if already logged in
    if (sessionStorage.getItem('lib_session')) {
        window.location.href = 'dashboard.html';
    }
})();
