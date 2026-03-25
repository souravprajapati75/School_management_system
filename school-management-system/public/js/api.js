// public/js/api.js  –  Centralised API helper
const BASE = '/api';

async function request(method, endpoint, body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res  = await fetch(BASE + endpoint, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function buildQS(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') qs.set(k, v); });
  const s = qs.toString();
  return s ? '?' + s : '';
}

const API = {
  students: {
    create:  (b)    => request('POST',   '/students', b),
    getAll:  (q={}) => request('GET',    '/students' + buildQS(q)),
    getById: (id)   => request('GET',    `/students/${id}`),
    update:  (id,b) => request('PUT',    `/students/${id}`, b),
    delete:  (id)   => request('DELETE', `/students/${id}`),
    count:   ()     => request('GET',    '/students/stats/count'),
  },
  attendance: {
    mark:    (b)   => request('POST', '/attendance', b),
    getAll:  (q={})=> request('GET',  '/attendance' + buildQS(q)),
    today:   ()    => request('GET',  '/attendance/today'),
    summary: (sid) => request('GET',  `/attendance/summary/${sid}`),
  },
  results: {
    create:  (b)    => request('POST', '/results', b),
    getAll:  (q={}) => request('GET',  '/results' + buildQS(q)),
    toppers: (q={}) => request('GET',  '/results/toppers' + buildQS(q)),
  },
  fees: {
    create:   (b)    => request('POST',  '/fees', b),
    getAll:   (q={}) => request('GET',   '/fees' + buildQS(q)),
    markPaid: (id,b) => request('PATCH', `/fees/${id}/pay`, b),
    summary:  ()     => request('GET',   '/fees/summary'),
  },
};
