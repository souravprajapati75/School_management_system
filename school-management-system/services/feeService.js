// services/feeService.js
const db = require('../config/db');

const FeeService = {

  async create(data) {
    const { student_id, fee_type, amount, due_date, paid_date, status = 'Pending', payment_mode, remarks } = data;
    const [result] = await db.execute(
      `INSERT INTO fees (student_id, fee_type, amount, due_date, paid_date, status, payment_mode, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, fee_type, amount, due_date, paid_date || null,
       status, payment_mode || null, remarks || null]
    );
    return { id: result.insertId };
  },

  async getAll({ student_id, status, fee_type } = {}) {
    let sql    = `SELECT f.*, s.name AS student_name, s.roll_no, s.class
                  FROM fees f
                  JOIN students s ON s.id = f.student_id
                  WHERE 1=1`;
    const vals = [];

    if (student_id){ sql += ' AND f.student_id = ?'; vals.push(student_id); }
    if (status)    { sql += ' AND f.status = ?';     vals.push(status); }
    if (fee_type)  { sql += ' AND f.fee_type = ?';   vals.push(fee_type); }

    sql += ' ORDER BY f.created_at DESC';
    const [rows] = await db.execute(sql, vals);
    return rows;
  },

  // Update fee payment status
  async markPaid(id, payment_mode) {
    const [result] = await db.execute(
      `UPDATE fees SET status='Paid', paid_date=CURDATE(), payment_mode=? WHERE id=?`,
      [payment_mode, id]
    );
    return result.affectedRows > 0;
  },

  // Collection summary
  async getSummary() {
    const [rows] = await db.execute(
      `SELECT
         SUM(amount)                              AS total_amount,
         SUM(IF(status='Paid', amount, 0))        AS collected,
         SUM(IF(status='Pending', amount, 0))     AS pending,
         SUM(IF(status='Overdue', amount, 0))     AS overdue,
         COUNT(*)                                 AS total_records,
         SUM(status='Paid')                       AS paid_count
       FROM fees`
    );
    return rows[0];
  },
};

module.exports = FeeService;
