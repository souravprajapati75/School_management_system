// services/resultService.js
const db = require('../config/db');

// Auto-compute grade from percentage
function computeGrade(marks, maxMarks) {
  const pct = (marks / maxMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  return 'F';
}

const ResultService = {

  async create(data) {
    const { student_id, subject, exam_type, marks, max_marks = 100, exam_date } = data;
    const grade = computeGrade(marks, max_marks);
    const [result] = await db.execute(
      `INSERT INTO results (student_id, subject, exam_type, marks, max_marks, grade, exam_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, subject, exam_type, marks, max_marks, grade, exam_date]
    );
    return { id: result.insertId, grade };
  },

  async getAll({ student_id, exam_type, subject } = {}) {
    let sql    = `SELECT r.*, s.name AS student_name, s.roll_no, s.class
                  FROM results r
                  JOIN students s ON s.id = r.student_id
                  WHERE 1=1`;
    const vals = [];

    if (student_id){ sql += ' AND r.student_id = ?'; vals.push(student_id); }
    if (exam_type) { sql += ' AND r.exam_type = ?';  vals.push(exam_type); }
    if (subject)   { sql += ' AND r.subject = ?';    vals.push(subject); }

    sql += ' ORDER BY r.exam_date DESC, s.roll_no ASC';
    const [rows] = await db.execute(sql, vals);
    return rows;
  },

  // Topper list for an exam type
  async getToppers(exam_type, limit = 5) {
    const [rows] = await db.execute(
      `SELECT s.name, s.roll_no, s.class,
              AVG(r.marks) AS avg_marks,
              SUM(r.marks) AS total_marks
       FROM results r
       JOIN students s ON s.id = r.student_id
       WHERE r.exam_type = ?
       GROUP BY r.student_id
       ORDER BY avg_marks DESC
       LIMIT ?`,
      [exam_type, limit]
    );
    return rows;
  },
};

module.exports = ResultService;
