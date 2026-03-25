// controllers/attendanceController.js
const AttendanceService = require('../services/attendanceService');

const AttendanceController = {

  // POST /api/attendance
  async mark(req, res) {
    try {
      const { student_id, date, status } = req.body;
      if (!student_id || !date || !status) {
        return res.status(400).json({ success: false, message: 'student_id, date, and status are required' });
      }
      const validStatuses = ['Present', 'Absent', 'Late'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
      }
      const record = await AttendanceService.mark(req.body);
      return res.status(201).json({ success: true, message: 'Attendance marked', data: record });
    } catch (err) {
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({ success: false, message: 'Student not found' });
      }
      console.error('AttendanceController.mark:', err);
      return res.status(500).json({ success: false, message: 'Failed to mark attendance' });
    }
  },

  // GET /api/attendance
  async getAll(req, res) {
    try {
      const records = await AttendanceService.getAll(req.query);
      return res.json({ success: true, count: records.length, data: records });
    } catch (err) {
      console.error('AttendanceController.getAll:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
    }
  },

  // GET /api/attendance/today
  async today(req, res) {
    try {
      const summary = await AttendanceService.getTodayCount();
      return res.json({ success: true, data: summary });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch today stats' });
    }
  },

  // GET /api/attendance/summary/:student_id
  async summary(req, res) {
    try {
      const rows = await AttendanceService.getSummary(req.params.student_id);
      return res.json({ success: true, data: rows });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to fetch summary' });
    }
  },
};

module.exports = AttendanceController;
