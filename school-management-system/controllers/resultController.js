// controllers/resultController.js
const ResultService = require('../services/resultService');

const ResultController = {

  // POST /api/results
  async create(req, res) {
    try {
      const { student_id, subject, exam_type, marks, max_marks = 100, exam_date } = req.body;
      if (!student_id || !subject || !exam_type || marks === undefined || !exam_date) {
        return res.status(400).json({ success: false, message: 'student_id, subject, exam_type, marks, and exam_date are required' });
      }
      if (isNaN(marks) || marks < 0 || marks > max_marks) {
        return res.status(400).json({ success: false, message: `Marks must be between 0 and ${max_marks}` });
      }
      const result = await ResultService.create(req.body);
      return res.status(201).json({ success: true, message: `Result saved. Grade: ${result.grade}`, data: result });
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Student not found' });
      }
      console.error('ResultController.create:', err);
      return res.status(500).json({ success: false, message: 'Failed to save result' });
    }
  },

  // GET /api/results
  async getAll(req, res) {
    try {
      const results = await ResultService.getAll(req.query);
      return res.json({ success: true, count: results.length, data: results });
    } catch (err) {
      console.error('ResultController.getAll:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch results' });
    }
  },

  // GET /api/results/toppers
  async toppers(req, res) {
    try {
      const { exam_type = 'Final', limit = 5 } = req.query;
      const data = await ResultService.getToppers(exam_type, parseInt(limit));
      return res.json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch toppers' });
    }
  },
};

module.exports = ResultController;
