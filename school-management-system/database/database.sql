-- ============================================================
-- SCHOOL MANAGEMENT SYSTEM - DATABASE SETUP
-- Database: school_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS school_db;
USE school_db;

-- TABLE: students
CREATE TABLE IF NOT EXISTS students (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL,
    roll_no     VARCHAR(20)         NOT NULL UNIQUE,
    class       VARCHAR(20)         NOT NULL,
    section     VARCHAR(5)          NOT NULL,
    gender      ENUM('Male','Female','Other') NOT NULL,
    dob         DATE                NOT NULL,
    email       VARCHAR(150)        UNIQUE,
    phone       VARCHAR(15),
    address     TEXT,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: attendance
CREATE TABLE IF NOT EXISTS attendance (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT                 NOT NULL,
    date        DATE                NOT NULL,
    status      ENUM('Present','Absent','Late') NOT NULL,
    remarks     VARCHAR(255),
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_date (student_id, date)
);

-- TABLE: results
CREATE TABLE IF NOT EXISTS results (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT                 NOT NULL,
    subject     VARCHAR(100)        NOT NULL,
    exam_type   ENUM('Unit Test','Mid Term','Final') NOT NULL,
    marks       DECIMAL(5,2)        NOT NULL,
    max_marks   DECIMAL(5,2)        NOT NULL DEFAULT 100,
    grade       VARCHAR(5),
    exam_date   DATE                NOT NULL,
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_results_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE
);

-- TABLE: fees
CREATE TABLE IF NOT EXISTS fees (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    student_id      INT                 NOT NULL,
    fee_type        ENUM('Tuition','Transport','Library','Lab','Sports','Other') NOT NULL,
    amount          DECIMAL(10,2)       NOT NULL,
    due_date        DATE                NOT NULL,
    paid_date       DATE,
    status          ENUM('Paid','Pending','Overdue') NOT NULL DEFAULT 'Pending',
    payment_mode    ENUM('Cash','Online','Cheque','DD') DEFAULT 'Cash',
    remarks         VARCHAR(255),
    created_at      TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fees_student FOREIGN KEY (student_id)
        REFERENCES students(id) ON DELETE CASCADE
);

-- SAMPLE SEED DATA
INSERT INTO students (name, roll_no, class, section, gender, dob, email, phone) VALUES
('Aarav Sharma', 'R001', '10', 'A', 'Male',   '2009-04-15', 'aarav@example.com', '9876543210'),
('Priya Patel',  'R002', '10', 'A', 'Female', '2009-07-22', 'priya@example.com', '9876543211'),
('Rohit Verma',  'R003', '10', 'B', 'Male',   '2009-01-10', 'rohit@example.com', '9876543212'),
('Sneha Gupta',  'R004', '9',  'A', 'Female', '2010-03-05', 'sneha@example.com', '9876543213'),
('Karan Singh',  'R005', '9',  'B', 'Male',   '2010-08-18', 'karan@example.com', '9876543214');

INSERT INTO attendance (student_id, date, status) VALUES
(1, CURDATE(), 'Present'),
(2, CURDATE(), 'Present'),
(3, CURDATE(), 'Absent'),
(4, CURDATE(), 'Late'),
(5, CURDATE(), 'Present');

INSERT INTO results (student_id, subject, exam_type, marks, max_marks, grade, exam_date) VALUES
(1, 'Mathematics', 'Mid Term', 87.5, 100, 'A',  '2024-09-15'),
(1, 'Science',     'Mid Term', 92.0, 100, 'A+', '2024-09-16'),
(2, 'Mathematics', 'Mid Term', 78.0, 100, 'B+', '2024-09-15'),
(3, 'Science',     'Mid Term', 65.5, 100, 'C+', '2024-09-16'),
(4, 'English',     'Unit Test',88.0, 100, 'A',  '2024-09-17');

INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, payment_mode) VALUES
(1, 'Tuition',   5000.00, '2024-10-01', '2024-09-28', 'Paid',    'Online'),
(2, 'Tuition',   5000.00, '2024-10-01', NULL,          'Pending', NULL),
(3, 'Transport', 1500.00, '2024-10-01', NULL,          'Overdue', NULL),
(4, 'Tuition',   5000.00, '2024-10-01', '2024-09-30', 'Paid',    'Cash'),
(5, 'Library',    500.00, '2024-10-01', NULL,          'Pending', NULL);
