// services/studentService.js  –  All DB logic for students
const db = require('../config/db');

const StudentService = {

  // ── Create ──────────────────────────────────────────────
  async create(data) {
    const { name, roll_no, class: cls, section, gender, dob, email, phone, address } = data;
    const [result] = await db.execute(
      `INSERT INTO students (name, roll_no, class, section, gender, dob, email, phone, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, roll_no, cls, section, gender, dob, email || null, phone || null, address || null]
    );
    return { id: result.insertId, ...data };
  },

  // ── Get all (with optional filters) ────────────────────
  async getAll({ class: cls, section, search } = {}) {
    let sql    = 'SELECT * FROM students WHERE 1=1';
    const vals = [];

    if (cls)    { sql += ' AND class = ?';               vals.push(cls); }
    if (section){ sql += ' AND section = ?';             vals.push(section); }
    if (search) { sql += ' AND (name LIKE ? OR roll_no LIKE ?)';
                  vals.push(`%${search}%`, `%${search}%`); }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, vals);
    return rows;
  },

  // ── Get by ID ───────────────────────────────────────────
  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // ── Update ──────────────────────────────────────────────
  async update(id, data) {
    const { name, roll_no, class: cls, section, gender, dob, email, phone, address } = data;
    const [result] = await db.execute(
      `UPDATE students SET name=?, roll_no=?, class=?, section=?, gender=?, dob=?,
       email=?, phone=?, address=? WHERE id=?`,
      [name, roll_no, cls, section, gender, dob, email || null, phone || null, address || null, id]
    );
    return result.affectedRows > 0;
  },

  // ── Delete ──────────────────────────────────────────────
  async delete(id) {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  // ── Count ───────────────────────────────────────────────
  async count() {
    const [rows] = await db.execute('SELECT COUNT(*) AS total FROM students');
    return rows[0].total;
  },
};

module.exports = StudentService;
