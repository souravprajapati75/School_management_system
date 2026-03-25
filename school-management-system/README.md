# 🎓 School Management System (SMS)

A production-ready School Management System built with **Node.js + Express + MySQL + Vanilla JS**.
Follows strict **MVC architecture** with clean, modular, scalable code.

---

## 📁 Project Structure

```
school-management-system/
│
├── server.js                   ← Entry point (Express app)
├── package.json
├── .env                        ← Environment variables
├── README.md
│
├── config/
│   └── db.js                   ← MySQL connection pool
│
├── routes/
│   ├── studentRoutes.js
│   ├── attendanceRoutes.js
│   ├── resultRoutes.js
│   └── feeRoutes.js
│
├── controllers/
│   ├── studentController.js    ← Request / Response handling
│   ├── attendanceController.js
│   ├── resultController.js
│   └── feeController.js
│
├── services/
│   ├── studentService.js       ← Database business logic
│   ├── attendanceService.js
│   ├── resultService.js
│   └── feeService.js
│
├── public/                     ← Static frontend (served by Express)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js              ← Centralised fetch() API helper
│       └── app.js              ← All UI/page logic
│
└── database/
    └── database.sql            ← Full DB schema + seed data
```

---

## ⚙️ Prerequisites

- **Node.js** >= 18
- **MySQL** (XAMPP / MySQL Workbench / standalone)
- **npm**

---

## 🚀 Setup Guide (Step-by-Step)

### Step 1 — Import Database (XAMPP)

1. Start **Apache** and **MySQL** in XAMPP Control Panel
2. Open **http://localhost/phpmyadmin**
3. Click **Import** → Choose file → select `database/database.sql`
4. Click **Go** — this creates `school_db` with all tables + sample data

### Step 2 — Configure Environment

Edit `.env` to match your MySQL credentials:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=          # Leave blank for XAMPP default
DB_NAME=school_db
```

### Step 3 — Install Dependencies

```bash
cd school-management-system
npm install
```

### Step 4 — Run the Server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

### Step 5 — Open in Browser

```
http://localhost:3000
```

---

## 🔌 API Reference

### Students
| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| POST   | /api/students          | Add new student      |
| GET    | /api/students          | Get all students     |
| GET    | /api/students/:id      | Get student by ID    |
| PUT    | /api/students/:id      | Update student       |
| DELETE | /api/students/:id      | Delete student       |
| GET    | /api/students/stats/count | Total count      |

### Attendance
| Method | Endpoint                        | Description          |
|--------|---------------------------------|----------------------|
| POST   | /api/attendance                 | Mark attendance      |
| GET    | /api/attendance                 | Get all records      |
| GET    | /api/attendance/today           | Today's summary      |
| GET    | /api/attendance/summary/:id     | Per-student summary  |

### Results
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/results        | Add result          |
| GET    | /api/results        | Get all results     |
| GET    | /api/results/toppers| Topper list         |

### Fees
| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| POST   | /api/fees           | Add fee record      |
| GET    | /api/fees           | Get all fees        |
| GET    | /api/fees/summary   | Fee summary stats   |
| PATCH  | /api/fees/:id/pay   | Mark fee as paid    |

---

## 📅 Sprint Plan

| Day | Module            | Tasks                                      |
|-----|-------------------|--------------------------------------------|
| 1   | Setup             | Project scaffold, DB import, server setup  |
| 2   | Students          | CRUD API + frontend form + table           |
| 3   | Attendance        | Mark/view attendance + today stats         |
| 4   | Results           | Add results + auto grading + filter        |
| 5   | Fees              | Fee tracking + mark paid + summary         |
| 6   | Frontend UI       | Dashboard, polish, responsive layout       |
| 7   | Testing + Bugs    | End-to-end testing, edge cases, cleanup    |

---

## 🏗️ Architecture (MVC)

```
Browser (fetch)
      │
      ▼
  Express Router        ← routes/*.js
      │
      ▼
  Controller            ← controllers/*.js  (req/res, validation)
      │
      ▼
  Service               ← services/*.js     (SQL queries, business logic)
      │
      ▼
  MySQL Pool            ← config/db.js
```

---

## ✨ Features

- ✅ Full CRUD for Students
- ✅ Attendance marking with upsert (no duplicates per day)
- ✅ Exam results with automatic grade calculation
- ✅ Fee management with Paid/Pending/Overdue tracking
- ✅ Dashboard with live stats
- ✅ Filter/search on all tables
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Input validation (frontend + backend)
- ✅ Foreign key constraints with CASCADE delete
- ✅ MySQL connection pooling

