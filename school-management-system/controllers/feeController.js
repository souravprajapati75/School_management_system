// controllers/feeController.js
const FeeService = require('../services/feeService');

const FeeController = {

  // POST /api/fees
  async create(req, res) {
    try {
      const { student_id, fee_type, amount, due_date } = req.body;
      if (!student_id || !fee_type || !amount || !due_date) {
        return res.status(400).json({ success: false, message: 'student_id, fee_type, amount, and due_date are required' });
      }
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
      }
      const fee = await FeeService.create(req.body);
      return res.status(201).json({ success: true, message: 'Fee record created', data: fee });
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Student not found' });
      }
      console.error('FeeController.create:', err);
      return res.status(500).json({ success: false, message: 'Failed to create fee record' });
    }
  },

  // GET /api/fees
  async getAll(req, res) {
    try {
      const fees = await FeeService.getAll(req.query);
      return res.json({ success: true, count: fees.length, data: fees });
    } catch (err) {
      console.error('FeeController.getAll:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch fees' });
    }
  },

  // PATCH /api/fees/:id/pay
  async markPaid(req, res) {
    try {
      const { payment_mode = 'Cash' } = req.body;
      const updated = await FeeService.markPaid(req.params.id, payment_mode);
      if (!updated) return res.status(404).json({ success: false, message: 'Fee record not found' });
      return res.json({ success: true, message: 'Fee marked as paid' });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to update fee' });
    }
  },

  // GET /api/fees/summary
  async summary(req, res) {
    try {
      const data = await FeeService.getSummary();
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch summary' });
    }
  },
};

module.exports = FeeController;
