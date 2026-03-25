// public/js/app.js  –  Main application logic

// ── Toast notification ────────────────────────────────────────
function toast(title, msg = '', type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Navigation ────────────────────────────────────────────────
function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  document.querySelectorAll('.page').forEach(el => el.classList.toggle('active', el.id === 'page-' + page));
  document.getElementById('topbar-title').textContent = {
    dashboard: 'Dashboard',
    students:  'Student Management',
    attendance:'Attendance',
    results:   'Exam Results',
    fees:      'Fee Management',
  }[page] || page;

  if (page === 'dashboard')  loadDashboard();
  if (page === 'students')   loadStudents();
  if (page === 'attendance') loadAttendance();
  if (page === 'results')    loadResults();
  if (page === 'fees')       loadFees();
}

// ── Live clock ────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('live-clock');
  function tick() {
    el.textContent = new Date().toLocaleString('en-IN', {
      weekday:'short', day:'2-digit', month:'short',
      hour:'2-digit', minute:'2-digit', second:'2-digit'
    });
  }
  tick();
  setInterval(tick, 1000);
}

// ── Helper: grade badge class ─────────────────────────────────
function gradeBadge(g) {
  if (!g) return '';
  const cl = g.startsWith('A') ? 'badge-a' : g.startsWith('B') ? 'badge-b' : g.startsWith('C') ? 'badge-c' : 'badge-f';
  return `<span class="badge ${cl}">${g}</span>`;
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [sc, tc, fc, att, feeSumm] = await Promise.all([
      API.students.count(),
      API.results.getAll(),
      API.fees.getAll(),
      API.attendance.today(),
      API.fees.summary(),
    ]);

    document.getElementById('dash-students').textContent   = sc.data.total;
    document.getElementById('dash-attendance').textContent = att.data.present || 0;
    document.getElementById('dash-results').textContent    = tc.count;
    document.getElementById('dash-collected').textContent  = '₹' + Number(feeSumm.data.collected || 0).toLocaleString('en-IN');
    document.getElementById('dash-pending').textContent    = '₹' + Number(feeSumm.data.pending  || 0).toLocaleString('en-IN');

    // Recent students
    const students = await API.students.getAll();
    const recTbody = document.getElementById('recent-students');
    recTbody.innerHTML = students.data.slice(0, 6).map(s => `
      <tr>
        <td><strong>${s.roll_no}</strong></td>
        <td>${s.name}</td>
        <td>${s.class} – ${s.section}</td>
        <td>${s.phone || '—'}</td>
      </tr>`).join('') || '<tr><td colspan="4" class="empty-state"><p>No students yet</p></td></tr>';

    // Fee progress
    const total     = parseFloat(feeSumm.data.total_amount) || 1;
    const collected = parseFloat(feeSumm.data.collected)    || 0;
    const pct       = Math.min(100, Math.round((collected / total) * 100));
    document.getElementById('fee-progress-bar').style.width = pct + '%';
    document.getElementById('fee-progress-pct').textContent = pct + '% collected';

  } catch (e) { toast('Dashboard error', e.message, 'error'); }
}

// ══════════════════════════════════════════════════════════════
// STUDENTS
// ══════════════════════════════════════════════════════════════
let editingStudentId = null;

async function loadStudents(query = {}) {
  try {
    const res = await API.students.getAll(query);
    const tbody = document.getElementById('student-tbody');
    tbody.innerHTML = res.data.length ? res.data.map(s => `
      <tr>
        <td><strong>${s.roll_no}</strong></td>
        <td>${s.name}</td>
        <td>${s.class}</td>
        <td>${s.section}</td>
        <td>${s.gender}</td>
        <td>${s.dob}</td>
        <td>${s.phone || '—'}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="editStudent(${s.id})" title="Edit">✏️</button>
            <button class="btn btn-danger btn-sm btn-icon" onclick="deleteStudent(${s.id},'${s.name}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>`).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🎓</div><p>No students found</p></div></td></tr>`;

    document.getElementById('student-count').textContent = `${res.count} student${res.count !== 1 ? 's' : ''}`;
  } catch (e) { toast('Load error', e.message, 'error'); }
}

async function submitStudentForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    if (editingStudentId) {
      await API.students.update(editingStudentId, data);
      toast('Updated!', `${data.name} has been updated.`, 'success');
      cancelStudentEdit();
    } else {
      await API.students.create(data);
      toast('Student Added!', `${data.name} (${data.roll_no}) added.`, 'success');
    }
    form.reset();
    loadStudents();
    loadDashboard();
  } catch (e) {
    toast('Error', e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = editingStudentId ? '💾 Update Student' : '➕ Add Student';
  }
}

async function editStudent(id) {
  try {
    const res = await API.students.getById(id);
    const s   = res.data;
    editingStudentId = id;
    const form = document.getElementById('student-form');
    ['name','roll_no','section','gender','dob','email','phone','address'].forEach(k => {
      if (form[k]) form[k].value = s[k] || '';
    });
    form['class'].value = s.class || '';
    form.querySelector('[type=submit]').innerHTML = '💾 Update Student';
    document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
    document.getElementById('student-form-title').textContent = '✏️ Edit Student';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) { toast('Error', e.message, 'error'); }
}

function cancelStudentEdit() {
  editingStudentId = null;
  document.getElementById('student-form').reset();
  document.getElementById('student-form').querySelector('[type=submit]').innerHTML = '➕ Add Student';
  document.getElementById('cancel-edit-btn').style.display = 'none';
  document.getElementById('student-form-title').textContent = '➕ Add New Student';
}

async function deleteStudent(id, name) {
  if (!confirm(`Delete student "${name}"? This will also remove their attendance, results and fees.`)) return;
  try {
    await API.students.delete(id);
    toast('Deleted', `${name} removed.`, 'success');
    loadStudents();
    loadDashboard();
  } catch (e) { toast('Error', e.message, 'error'); }
}

function filterStudents() {
  const search  = document.getElementById('s-search').value;
  const cls     = document.getElementById('s-class').value;
  const section = document.getElementById('s-section').value;
  loadStudents({ search, class: cls, section });
}

// ══════════════════════════════════════════════════════════════
// ATTENDANCE
// ══════════════════════════════════════════════════════════════
async function loadAttendance(query = {}) {
  try {
    const res = await API.attendance.getAll(query);
    const tbody = document.getElementById('att-tbody');
    tbody.innerHTML = res.data.length ? res.data.map(a => `
      <tr>
        <td>${a.date}</td>
        <td><strong>${a.roll_no}</strong></td>
        <td>${a.student_name}</td>
        <td>${a.class} – ${a.section}</td>
        <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>${a.remarks || '—'}</td>
      </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><p>No attendance records</p></div></td></tr>`;

    document.getElementById('att-count').textContent = `${res.count} record${res.count !== 1 ? 's' : ''}`;

    // Refresh today stats
    const today = await API.attendance.today();
    document.getElementById('att-present').textContent = today.data.present || 0;
    document.getElementById('att-absent').textContent  = today.data.absent  || 0;
    document.getElementById('att-late').textContent    = today.data.late    || 0;
  } catch (e) { toast('Load error', e.message, 'error'); }
}

async function submitAttendanceForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Marking…';

  try {
    await API.attendance.mark(data);
    toast('Attendance Marked!', `Status: ${data.status}`, 'success');
    form.reset();
    // reset date to today
    form.querySelector('[name=date]').value = todayISO();
    loadAttendance();
  } catch (e) { toast('Error', e.message, 'error'); }
  finally { btn.disabled=false; btn.innerHTML='✅ Mark Attendance'; }
}

function filterAttendance() {
  loadAttendance({
    student_id: document.getElementById('a-student').value,
    date:       document.getElementById('a-date').value,
    status:     document.getElementById('a-status').value,
  });
}

// ══════════════════════════════════════════════════════════════
// RESULTS
// ══════════════════════════════════════════════════════════════
async function loadResults(query = {}) {
  try {
    const res = await API.results.getAll(query);
    const tbody = document.getElementById('result-tbody');
    tbody.innerHTML = res.data.length ? res.data.map(r => {
      const pct = Math.round((r.marks / r.max_marks) * 100);
      return `<tr>
        <td>${r.exam_date}</td>
        <td><strong>${r.roll_no}</strong></td>
        <td>${r.student_name}</td>
        <td>${r.subject}</td>
        <td>${r.exam_type}</td>
        <td>${r.marks} / ${r.max_marks}</td>
        <td>${pct}%</td>
        <td>${gradeBadge(r.grade)}</td>
      </tr>`;
    }).join('')
    : `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">📊</div><p>No results found</p></div></td></tr>`;

    document.getElementById('result-count').textContent = `${res.count} record${res.count !== 1 ? 's' : ''}`;
  } catch (e) { toast('Load error', e.message, 'error'); }
}

async function submitResultForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));
  data.marks     = parseFloat(data.marks);
  data.max_marks = parseFloat(data.max_marks) || 100;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    const res = await API.results.create(data);
    toast('Result Saved!', `Grade: ${res.data.grade}`, 'success');
    form.reset();
    loadResults();
  } catch (e) { toast('Error', e.message, 'error'); }
  finally { btn.disabled=false; btn.innerHTML='💾 Save Result'; }
}

function filterResults() {
  loadResults({
    student_id: document.getElementById('r-student').value,
    exam_type:  document.getElementById('r-exam-type').value,
  });
}

// ══════════════════════════════════════════════════════════════
// FEES
// ══════════════════════════════════════════════════════════════
async function loadFees(query = {}) {
  try {
    const [res, summ] = await Promise.all([API.fees.getAll(query), API.fees.summary()]);
    const tbody = document.getElementById('fee-tbody');
    tbody.innerHTML = res.data.length ? res.data.map(f => `
      <tr>
        <td><strong>${f.roll_no}</strong></td>
        <td>${f.student_name}</td>
        <td>${f.fee_type}</td>
        <td>₹${Number(f.amount).toLocaleString('en-IN')}</td>
        <td>${f.due_date}</td>
        <td>${f.paid_date || '—'}</td>
        <td><span class="badge badge-${f.status.toLowerCase()}">${f.status}</span></td>
        <td>${f.payment_mode || '—'}</td>
        <td>
          ${f.status !== 'Paid' ? `<button class="btn btn-success btn-sm" onclick="markFeePaid(${f.id})">💳 Pay</button>` : '—'}
        </td>
      </tr>`).join('')
    : `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">💰</div><p>No fee records</p></div></td></tr>`;

    document.getElementById('fee-count').textContent = `${res.count} record${res.count !== 1 ? 's' : ''}`;

    // Summary cards
    const d = summ.data;
    document.getElementById('f-total').textContent     = '₹' + Number(d.total_amount||0).toLocaleString('en-IN');
    document.getElementById('f-collected').textContent = '₹' + Number(d.collected   ||0).toLocaleString('en-IN');
    document.getElementById('f-pending').textContent   = '₹' + Number(d.pending     ||0).toLocaleString('en-IN');
    document.getElementById('f-overdue').textContent   = '₹' + Number(d.overdue     ||0).toLocaleString('en-IN');
  } catch (e) { toast('Load error', e.message, 'error'); }
}

async function submitFeeForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('[type=submit]');
  const data = Object.fromEntries(new FormData(form));

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await API.fees.create(data);
    toast('Fee Added!', `${data.fee_type} fee of ₹${Number(data.amount).toLocaleString('en-IN')} recorded.`, 'success');
    form.reset();
    loadFees();
    loadDashboard();
  } catch (e) { toast('Error', e.message, 'error'); }
  finally { btn.disabled=false; btn.innerHTML='💾 Add Fee Record'; }
}

async function markFeePaid(id) {
  const mode = prompt('Payment mode? (Cash / Online / Cheque / DD)', 'Cash');
  if (!mode) return;
  try {
    await API.fees.markPaid(id, { payment_mode: mode });
    toast('Fee Paid!', 'Payment recorded successfully.', 'success');
    loadFees();
    loadDashboard();
  } catch (e) { toast('Error', e.message, 'error'); }
}

function filterFees() {
  loadFees({
    status:   document.getElementById('f-status').value,
    fee_type: document.getElementById('f-type').value,
  });
}

// ── Populate student dropdowns ────────────────────────────────
async function populateStudentDropdowns() {
  try {
    const res = await API.students.getAll();
    const options = res.data.map(s => `<option value="${s.id}">${s.roll_no} – ${s.name}</option>`).join('');
    ['att-student-id', 'res-student-id', 'fee-student-id'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<option value="">— Select Student —</option>' + options;
    });
    // filter dropdowns (text)
    ['a-student','r-student'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = '<option value="">All Students</option>' + options;
    });
  } catch (e) { /* silently fail */ }
}

// ── Utility ───────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  startClock();

  // Set today's date as default in date inputs
  document.querySelectorAll('input[type=date]').forEach(el => {
    if (!el.value) el.value = todayISO();
  });

  // Nav click
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.page));
  });

  // Form submissions
  document.getElementById('student-form')   ?.addEventListener('submit', submitStudentForm);
  document.getElementById('attendance-form')?.addEventListener('submit', submitAttendanceForm);
  document.getElementById('result-form')    ?.addEventListener('submit', submitResultForm);
  document.getElementById('fee-form')       ?.addEventListener('submit', submitFeeForm);

  // Populate student selects then load dashboard
  await populateStudentDropdowns();
  navigate('dashboard');
});
