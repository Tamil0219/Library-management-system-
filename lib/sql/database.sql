-- ============================================
-- Smart Library Management System
-- Database Schema for MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    User_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Full_Name VARCHAR(100),
    Role ENUM('Admin', 'Student') NOT NULL DEFAULT 'Student',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
    Book_ID INT AUTO_INCREMENT PRIMARY KEY,
    Book_Name VARCHAR(200) NOT NULL,
    Author VARCHAR(150) NOT NULL,
    Publisher VARCHAR(150),
    Category VARCHAR(100),
    Quantity INT NOT NULL DEFAULT 1,
    Available INT NOT NULL DEFAULT 1,
    Status ENUM('Available', 'Issued', 'Out of Stock') DEFAULT 'Available',
    Added_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students Table
CREATE TABLE IF NOT EXISTS students (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_Name VARCHAR(100) NOT NULL,
    Department VARCHAR(100),
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(15),
    Registered_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue Books Table
CREATE TABLE IF NOT EXISTS issue_books (
    Issue_ID INT AUTO_INCREMENT PRIMARY KEY,
    Student_ID INT NOT NULL,
    Book_ID INT NOT NULL,
    Issue_Date DATE NOT NULL,
    Due_Date DATE NOT NULL,
    Return_Date DATE DEFAULT NULL,
    Status ENUM('Issued', 'Returned', 'Overdue') DEFAULT 'Issued',
    FOREIGN KEY (Student_ID) REFERENCES students(Student_ID) ON DELETE CASCADE,
    FOREIGN KEY (Book_ID) REFERENCES books(Book_ID) ON DELETE CASCADE
);

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
    Log_ID INT AUTO_INCREMENT PRIMARY KEY,
    Action VARCHAR(255) NOT NULL,
    Details VARCHAR(500),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Sample Data
-- ============================================

INSERT INTO users (Username, Password, Full_Name, Role) VALUES
('admin', 'admin123', 'System Administrator', 'Admin'),
('student', 'student123', 'Demo Student', 'Student');

INSERT INTO books (Book_Name, Author, Publisher, Category, Quantity, Available) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 'MIT Press', 'Programming', 5, 3),
('Database System Concepts', 'Abraham Silberschatz', 'McGraw Hill', 'Database', 4, 2),
('Computer Networking', 'James Kurose', 'Pearson', 'Networks', 3, 1),
('Artificial Intelligence', 'Stuart Russell', 'Pearson', 'AI/ML', 3, 3),
('Clean Code', 'Robert C. Martin', 'Prentice Hall', 'Programming', 4, 4),
('Operating System Concepts', 'Silberschatz & Galvin', 'Wiley', 'Operating Systems', 5, 4),
('Data Structures Using C', 'Reema Thareja', 'Oxford Press', 'Programming', 6, 5),
('Web Technologies', 'Uttam K. Roy', 'Oxford Press', 'Web Development', 3, 2),
('Machine Learning', 'Tom Mitchell', 'McGraw Hill', 'AI/ML', 2, 1),
('Software Engineering', 'Ian Sommerville', 'Pearson', 'Software Engineering', 4, 3),
('Digital Logic Design', 'Morris Mano', 'Pearson', 'Electronics', 5, 5),
('Compiler Design', 'Alfred V. Aho', 'Pearson', 'Programming', 3, 2),
('Python Programming', 'Mark Lutz', 'O Reilly', 'Programming', 4, 3),
('Java: The Complete Reference', 'Herbert Schildt', 'McGraw Hill', 'Programming', 5, 4),
('Discrete Mathematics', 'Kenneth Rosen', 'McGraw Hill', 'Mathematics', 4, 4);

INSERT INTO students (Student_Name, Department, Email, Phone) VALUES
('Rahul Sharma', 'Computer Science', 'rahul.sharma@college.edu', '9876543210'),
('Priya Patel', 'Information Technology', 'priya.patel@college.edu', '9876543211'),
('Amit Kumar', 'Electronics', 'amit.kumar@college.edu', '9876543212'),
('Sneha Reddy', 'Computer Science', 'sneha.reddy@college.edu', '9876543213'),
('Vikram Singh', 'Mechanical', 'vikram.singh@college.edu', '9876543214'),
('Ananya Gupta', 'Computer Science', 'ananya.gupta@college.edu', '9876543215'),
('Karthik Nair', 'Electrical', 'karthik.nair@college.edu', '9876543216'),
('Divya Menon', 'Information Technology', 'divya.menon@college.edu', '9876543217'),
('Arjun Das', 'Civil', 'arjun.das@college.edu', '9876543218'),
('Meera Joshi', 'Computer Science', 'meera.joshi@college.edu', '9876543219');

INSERT INTO issue_books (Student_ID, Book_ID, Issue_Date, Due_Date, Status) VALUES
(1, 1, '2026-05-01', '2026-05-15', 'Issued'),
(2, 3, '2026-05-03', '2026-05-17', 'Issued'),
(3, 2, '2026-05-05', '2026-05-19', 'Issued'),
(4, 9, '2026-05-07', '2026-05-21', 'Issued'),
(1, 8, '2026-04-20', '2026-05-04', 'Overdue'),
(5, 2, '2026-04-25', '2026-05-09', 'Overdue');
