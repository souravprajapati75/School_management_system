// services/attendanceService.js
const db = require('../config/db');

const AttendanceService = {

  async mark(data) {
    const { student_id, date, status, remarks } = data;
    // Upsert: replace if same student + date already exists
    const [result] = await db.execute(
      `INSERT INTO attendance (student_id, date, status, remarks)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks)`,
      [student_id, date, status, remarks || null]
    );
    return { id: result.insertId || null, student_id, date, status };
  },

  async getAll({ student_id, date, status } = {}) {
    let sql    = `SELECT a.*, s.name AS student_name, s.roll_no, s.class, s.section
                  FROM attendance a
                  JOIN students s ON s.id = a.student_id
                  WHERE 1=1`;
    const vals = [];

    if (student_id){ sql += ' AND a.student_id = ?'; vals.push(student_id); }
    if (date)      { sql += ' AND a.date = ?';        vals.push(date); }
    if (status)    { sql += ' AND a.status = ?';      vals.push(status); }

    sql += ' ORDER BY a.date DESC, s.roll_no ASC';
    const [rows] = await db.execute(sql, vals);
    return rows;
  },

  // Attendance summary per student
  async getSummary(student_id) {
    const [rows] = await db.execute(
      `SELECT
         status,
         COUNT(*) AS count
       FROM attendance
       WHERE student_id = ?
       GROUP BY status`,
      [student_id]
    );
    return rows;
  },

  async getTodayCount() {
    const [rows] = await db.execute(
      `SELECT
         COUNT(*) AS total,
         SUM(status='Present') AS present,
         SUM(status='Absent')  AS absent,
         SUM(status='Late')    AS late
       FROM attendance
       WHERE date = CURDATE()`
    );
    return rows[0];
  },
};

module.exports = AttendanceService;
