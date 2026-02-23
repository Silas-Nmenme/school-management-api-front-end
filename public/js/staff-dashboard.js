// Staff dashboard client-side logic
(function(){
  // Configuration: set apiBase to your API base path
  const apiBase = 'https://school-management-api-zeta-two.vercel.app/api/staff';
  const tokenKeyCandidates = ['staffToken','token'];

  // Flag to prevent redirect loops
  let isRedirecting = false;

  function getToken(){
    for (const k of tokenKeyCandidates) { const v = localStorage.getItem(k); if (v) return v; }
    return null;
  }

  function authHeaders(){
    const t = getToken();
    return t ? { 'Authorization': 'Bearer '+t, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' };
  }

  function redirectToLogin(){
    // Prevent redirect loops
    if (isRedirecting) return;
    isRedirecting = true;
    
    console.warn('Token missing or auth failed; redirecting to login.');
    localStorage.removeItem('staffToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('staffData');
    window.location.href = 'login.html';
  }

  async function handleResponse(res, endpoint){
    if (res.status === 401 || res.status === 403) { 
      console.error(`Auth failed (${res.status}) at ${endpoint}`); 
      redirectToLogin(); 
      throw new Error('Unauthorized'); 
    }
    const data = await res.json().catch(()=>({}));
    if (!res.ok) {
      console.error(`Request failed: ${endpoint} (${res.status})`, data);
      throw data;
    }
    return data;
  }

  async function fetchDashboard(){
    const el = document.getElementById('staffInfo');
    try{
      const endpoint = apiBase+'/dashboard';
      const res = await fetch(endpoint,{ headers: authHeaders() });
      const data = await handleResponse(res, endpoint);
      document.getElementById('totalStudents').textContent = data.metrics.totalStudents ?? '—';
      document.getElementById('activeCourses').textContent = data.metrics.activeCourses ?? '—';
      document.getElementById('pendingApps').textContent = data.metrics.pendingApplications ?? '—';
      const s = data.staff || {};
      el.innerHTML = `<strong>${s.firstName || ''} ${s.lastName || ''}</strong><div class="muted-small">${s.role || ''} • ${s.department || ''}</div><div class="muted-small">Last login: ${s.lastLogin ? new Date(s.lastLogin).toLocaleString() : '—'}</div>`;
    } catch(e){ console.error('dashboard',e); el.textContent = 'Unable to load account'; }
  }

  async function fetchStudents(){
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';
    try{
      const endpoint = apiBase+'/students';
      const res = await fetch(endpoint,{ headers: authHeaders() });
      const data = await handleResponse(res, endpoint);
      const rows = (data.students||[]).map(s => renderStudentRow(s));
      tbody.innerHTML = rows.join('') || '<tr><td colspan="7">No students found</td></tr>';
      attachStudentRowHandlers();
    }catch(e){ console.error(e); tbody.innerHTML = '<tr><td colspan="7">Failed to load</td></tr>'; }
  }

  function renderStudentRow(s){
    const name = `${s.Firstname || s.firstname || ''} ${s.Lastname || s.lastname || ''}`.trim();
    return `<tr data-id="${s._id}"><td>${s.studentId||s._id}</td><td>${escapeHtml(name)}</td><td>${escapeHtml(s.email||'')}</td><td class="age">${s.age??''}</td><td class="phone">${escapeHtml(s.phone||'')}</td><td>${new Date(s.createdAt||'').toLocaleDateString()||''}</td><td class="action-row"><button class="btn btn-edit">Edit</button></td></tr>`;
  }

  function attachStudentRowHandlers(){
    document.querySelectorAll('.btn-edit').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const tr = e.target.closest('tr');
        if (!tr) return;
        if (tr.classList.contains('editing')) return saveStudentEdits(tr);
        startEditRow(tr);
      });
    });
  }

  function startEditRow(tr){
    tr.classList.add('editing');
    const age = tr.querySelector('.age').textContent || '';
    const phone = tr.querySelector('.phone').textContent || '';
    tr.querySelector('.age').innerHTML = `<input class="edit-input inp-age" value="${age}">`;
    tr.querySelector('.phone').innerHTML = `<input class="edit-input inp-phone" value="${phone}">`;
    const btn = tr.querySelector('.btn-edit'); btn.textContent='Save';
  }

  async function saveStudentEdits(tr){
    const id = tr.dataset.id;
    const ageVal = tr.querySelector('.inp-age').value.trim();
    const phoneVal = tr.querySelector('.inp-phone').value.trim();
    const payload = {};
    if (ageVal) payload.age = isNaN(ageVal)? ageVal : Number(ageVal);
    if (phoneVal) payload.phone = phoneVal;
    if (!Object.keys(payload).length) { cancelEditRow(tr); return; }
    try{
      const endpoint = apiBase+`/students/${id}`;
      const res = await fetch(endpoint,{ method:'PUT', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await handleResponse(res, endpoint);
      tr.querySelector('.age').textContent = data.student.age ?? '';
      tr.querySelector('.phone').textContent = data.student.phone ?? '';
      tr.classList.remove('editing');
      tr.querySelector('.btn-edit').textContent = 'Edit';
    }catch(err){ alert('Update failed'); console.error(err); }
  }

  function cancelEditRow(tr){
    tr.classList.remove('editing');
    // reload students to ensure consistency
    fetchStudents();
  }

  async function fetchTeam(){
    const ul = document.getElementById('teamList'); ul.innerHTML='Loading...';
    try{
      const endpoint = apiBase+'/team';
      const res = await fetch(endpoint,{ headers: authHeaders() });
      const data = await handleResponse(res, endpoint);
      ul.innerHTML = (data.staff||[]).map(s=>`<li><div><strong>${escapeHtml(s.firstName||'')} ${escapeHtml(s.lastName||'')}</strong><div class="muted-small">${escapeHtml(s.role||'')} • ${escapeHtml(s.department||'')}</div></div><div class="muted-small">${escapeHtml(s.email||'')}</div></li>`).join('') || '<li>No team members</li>';
    }catch(e){ console.error(e); ul.innerHTML='Failed to load'; }
  }

  function escapeHtml(str){ if (!str) return ''; return String(str).replace(/[&<>"']/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[s])); }

  // Change password
  async function changePassword(currentPassword, newPassword){
    try{
      const endpoint = apiBase+'/change-password';
      const res = await fetch(endpoint,{ method:'POST', headers: authHeaders(), body: JSON.stringify({ currentPassword, newPassword }) });
      await handleResponse(res, endpoint);
      alert('Password changed'); closeModal();
    }catch(err){ alert(err.message || 'Failed to change password'); }
  }

  function showModal(){ document.getElementById('modal').classList.remove('hidden'); }
  function closeModal(){ document.getElementById('modal').classList.add('hidden'); }

  function wireUI(){
    document.getElementById('btnLogout').addEventListener('click', ()=>{ localStorage.removeItem('staffToken'); localStorage.removeItem('token'); redirectToLogin(); });
    document.getElementById('btnRefresh').addEventListener('click', ()=>fetchAll());
    document.getElementById('btnShowChangePassword').addEventListener('click', showModal);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);
    document.getElementById('changePasswordForm').addEventListener('submit', (ev)=>{
      ev.preventDefault(); changePassword(document.getElementById('currentPassword').value, document.getElementById('newPassword').value);
    });
    document.getElementById('searchStudents').addEventListener('input', (e)=>{
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#studentsTable tbody tr').forEach(tr=>{
        const text = tr.textContent.toLowerCase(); tr.style.display = text.includes(q)?'':'none';
      });
    });
  }

  // Role-based access check - similar to admin dashboard
  function checkAccess(){
    const token = getToken();
    const userRole = localStorage.getItem('userRole');
    
    console.log('Staff dashboard access check:', { token: !!token, userRole });
    
    if (!token || userRole !== 'staff') {
      console.warn('Access denied: Invalid or missing token, or wrong role.');
      redirectToLogin();
      return false;
    }
    return true;
  }

  function ensureAuth(){ 
    const token = getToken();
    const userRole = localStorage.getItem('userRole');
    
    // Check both token and role
    if (!token || userRole !== 'staff') {
      console.warn('No valid token or wrong role found on page load; redirecting to login.');
      redirectToLogin(); 
    }
  }

  async function fetchAll(){ 
    if (!checkAccess()) return;
    await Promise.allSettled([fetchDashboard(), fetchStudents(), fetchTeam()]); 
  }

  // init
  document.addEventListener('DOMContentLoaded', ()=>{ try{ wireUI(); fetchAll(); }catch(e){ console.error(e); } });

})();
