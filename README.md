# 📚 Smart Library Management System

A modern, full-featured library management system built with **HTML**, **CSS**, and **JavaScript**. Features role-based access control, real-time dashboard analytics, and a premium glassmorphism UI design.

> College Mini Project — Frontend-only with localStorage as simulated database.

---

## ✨ Features

### 🔐 Authentication & Roles
- **Admin** — Full system access: manage books, students, issues, returns, and reports
- **Student** — View-only access: browse books, view issued books, and personal profile
- Role-based login with animated glassmorphism login page
- Student credentials auto-created when admin registers a student

### 📊 Admin Dashboard
- Animated stat cards (Total Books, Issued, Available, Students)
- Interactive **Doughnut Chart** — Books by category
- Interactive **Line Chart** — Monthly activity trends
- Recent activity feed with color-coded events
- Overdue notification badge

### 📖 Book Management
- Add, edit, and delete books with full details
- Search by name or author
- Filter by category and availability status
- Real-time stock tracking

### 👨‍🎓 Student Management
- Add, edit, and delete student records
- **Auto-create login credentials** (username & password) for each student
- Username uniqueness validation
- Search by name, email, or username
- Filter by department

### 📋 Issue & Return Books
- Issue books to registered students with date validation
- One-click book return with instant feedback
- Overdue detection with day count
- Auto-update book availability on issue/return

### 📈 Reports
- **Issued Books Report** — All currently issued books
- **Available Books Report** — Books in stock
- **Overdue Books Report** — Books past due date
- **Student Activity Report** — Borrowing history per student
- Print support for all reports

### 🎓 Student Portal
- **My Books** — View currently borrowed books with status
- **My Profile** — Personal information display
- Browse available books (read-only)

### 🎨 Design & UX
- Premium dark/light theme toggle
- Glassmorphism login with floating animations
- Smooth micro-animations and hover effects
- Fully responsive (desktop, tablet, mobile)
- Google Fonts (Inter) typography
- Toast notifications for all actions
- Collapsible sidebar navigation

---

## 🛠️ Tech Stack

| Layer     | Technology                     |
|-----------|-------------------------------|
| Structure | HTML5 (Semantic)              |
| Styling   | CSS3 (Custom Properties, Grid, Flexbox) |
| Logic     | Vanilla JavaScript (ES6+)     |
| Charts    | Chart.js 4.4                  |
| Icons     | Font Awesome 6.5              |
| Fonts     | Google Fonts (Inter)          |
| Storage   | localStorage (simulated DB)   |

---

## 📂 Project Structure

```
lib/
├── index.html          # Login page
├── dashboard.html      # Main dashboard (all sections)
├── css/
│   └── style.css       # Complete stylesheet
├── js/
│   ├── data.js         # Data layer (localStorage CRUD)
│   ├── auth.js         # Authentication module
│   ├── app.js          # Core app (navigation, theme, utilities)
│   ├── dashboard.js    # Dashboard stats & charts
│   ├── books.js        # Book management
│   ├── students.js     # Student management
│   ├── issue.js        # Book issuing
│   ├── returns.js      # Book returns
│   └── reports.js      # Report generation
├── sql/
│   └── database.sql    # SQL schema reference
└── README.md
```

---

## 🚀 How to Run

1. Open a terminal in the project folder:
   ```bash
   cd e:\lib
   python -m http.server 8080
   ```
2. Open Chrome and go to: **http://localhost:8080**
3. Login with the credentials below.

---

## 👤 Default Login Credentials

### Admin
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |

### Students
| Username | Password    | Student Name   | Department           |
|----------|-------------|----------------|----------------------|
| rahul    | rahul123    | Rahul Sharma   | Computer Science     |
| priya    | priya123    | Priya Patel    | Information Technology|
| amit     | amit123     | Amit Kumar     | Electronics          |
| sneha    | sneha123    | Sneha Reddy    | Computer Science     |
| vikram   | vikram123   | Vikram Singh   | Mechanical           |
| ananya   | ananya123   | Ananya Gupta   | Computer Science     |
| karthik  | karthik123  | Karthik Nair   | Electrical           |
| divya    | divya123    | Divya Menon    | Information Technology|
| arjun    | arjun123    | Arjun Das      | Civil                |
| meera    | meera123    | Meera Joshi    | Computer Science     |

> New student credentials are automatically created when an admin adds a student.

---

## 📜 License

This project is created for educational purposes — College Mini Project.
