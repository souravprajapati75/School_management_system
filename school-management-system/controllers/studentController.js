// controllers/studentController.js
const StudentService = require('../services/studentService');

// Validation helper
function validateStudent(data) {
  const required = ['name', 'roll_no', 'class', 'section', 'gender', 'dob'];
  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === '') {
      return `Field "${field}" is required`;
    }
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return 'Invalid email format';
  }
  return null;
}

const StudentController = {

  // POST /api/students
  async create(req, res) {
    try {
      const error = validateStudent(req.body);
      if (error) return res.status(400).json({ success: false, message: error });

      const student = await StudentService.create(req.body);
      return res.status(201).json({ success: true, message: 'Student added successfully', data: student });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Roll number or email already exists' });
      }
      console.error('StudentController.create:', err);
      return res.status(500).json({ success: false, message: 'Failed to create student' });
    }
  },

  // GET /api/students
  async getAll(req, res) {
    try {
      const students = await StudentService.getAll(req.query);
      return res.json({ success: true, count: students.length, data: students });
    } catch (err) {
      console.error('StudentController.getAll:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch students' });
    }
  },

  // GET /api/students/:id
  async getById(req, res) {
    try {
      const student = await StudentService.getById(req.params.id);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      return res.json({ success: true, data: student });
    } catch (err) {
      console.error('StudentController.getById:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch student' });
    }
  },

  // PUT /api/students/:id
  async update(req, res) {
    try {
      const error = validateStudent(req.body);
      if (error) return res.status(400).json({ success: false, message: error });

      const updated = await StudentService.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, message: 'Student not found' });
      return res.json({ success: true, message: 'Student updated successfully' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Roll number or email already exists' });
      }
      console.error('StudentController.update:', err);
      return res.status(500).json({ success: false, message: 'Failed to update student' });
    }
  },

  // DELETE /api/students/:id
  async delete(req, res) {
    try {
      const deleted = await StudentService.delete(req.params.id);
      if (!deleted) return res.status(404).json({ success: false, message: 'Student not found' });
      return res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
      console.error('StudentController.delete:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete student' });
    }
  },

  // GET /api/students/stats/count
  async count(req, res) {
    try {
      const total = await StudentService.count();
      return res.json({ success: true, data: { total } });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Failed to count students' });
    }
  },
};

module.exports = StudentController;
