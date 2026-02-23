// Staff dashboard client-side logic
(function(){
  // Configuration: set apiBase to your API base path
  const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api/staff';
  
  // Get token from localStorage (use 'token' key like admin dashboard)
  function getToken() {
    return localStorage.getItem('token');
  }

  // Get auth headers
  function getAuthHeaders() {
    const token = getToken();
    return token ? { 
      'Authorization': 'Bearer ' + token, 
      'Content-Type': 'application/json' 
    } : { 
      'Content-Type': 'application/json' 
    };
  }

  // Redirect to login page
  function redirectToLogin() {
    console.warn('Redirecting to login...');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffData');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
  }

  // Check if user is authenticated
  function checkAuth() {
    const token = getToken();
    const userRole = localStorage.getItem('userRole');
    
    console.log('Auth check:', { token: !!token, userRole: userRole });
    
    if (!token || userRole !== 'staff') {
      console.warn('Access denied: Missing token or wrong role');
      redirectToLogin();
      return false;
    }
    return true;
  }

  // Handle API response
  async function handleResponse(res, endpoint) {
    // Handle 401/403 - redirect to login
    if (res.status === 401 || res.status === 403) {
      console.error(`Auth failed (${res.status}) at ${endpoint}`);
      
      // Try to get error message for mustChangePassword
      try {
        const data = await res.json();
        if (data.mustChangePassword) {
          console.log('Password change required');
          // Don't redirect, show password change modal instead
          showPasswordChangeRequiredModal();
          throw new Error('Password change required');
        }
      } catch (e) {
        if (e.message !== 'Password change required') {
          redirectToLogin();
        }
      }
      throw new Error('Unauthorized');
    }
    
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`Request failed: ${endpoint} (${res.status})`, data);
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  // Show password change required modal
  function showPasswordChangeRequiredModal() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.remove('hidden');
      // Update modal text to indicate password change is required
      const title = modal.querySelector('h3');
      if (title) {
        title.textContent = 'Password Change Required';
      }
      // Add a message about required password change
      const form = document.getElementById('changePasswordForm');
      if (form) {
        const existingMsg = form.querySelector('.required-msg');
        if (!existingMsg) {
          const msg = document.createElement('p');
          msg.className = 'required-msg';
          msg.style.color = '#d97706';
          msg.style.marginBottom = '15px';
          msg.textContent = 'You must change your password before continuing.';
          form.insertBefore(msg, form.firstChild);
        }
      }
    }
  }

  // Fetch dashboard data
  async function fetchDashboard() {
    const el = document.getElementById('staffInfo');
    try {
      const res = await fetch(API_BASE_URL + '/dashboard', { 
        headers: getAuthHeaders() 
      });
      const data = await handleResponse(res, '/dashboard');
      
      // Update metrics
      document.getElementById('totalStudents').textContent = data.metrics?.totalStudents ?? '—';
      document.getElementById('activeCourses').textContent = data.metrics?.activeCourses ?? '—';
      document.getElementById('pendingApps').textContent = data.metrics?.pendingApplications ?? '—';
      
      // Update staff info
      const s = data.staff || {};
      el.innerHTML = `
        <strong>${s.firstName || ''} ${s.lastName || ''}</strong>
        <div class="muted-small">${s.role || ''} • ${s.department || ''}</div>
        <div class="muted-small">Last login: ${s.lastLogin ? new Date(s.lastLogin).toLocaleString() : '—'}</div>
      `;
      
      // Check if password change is required
      if (data.mustChangePassword) {
        showPasswordChangeRequiredModal();
      }
      
    } catch (e) {
      console.error('Dashboard error:', e);
      if (e.message !== 'Password change required') {
        el.textContent = 'Unable to load account';
      }
    }
  }

  // Fetch students list
  async function fetchStudents() {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading…</td></tr>';
    
    try {
      const res = await fetch(API_BASE_URL + '/students', { 
        headers: getAuthHeaders() 
      });
      const data = await handleResponse(res, '/students');
      
      const students = data.students || [];
      if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No students found</td></tr>';
        return;
      }
      
      tbody.innerHTML = students.map(s => renderStudentRow(s)).join('');
      attachStudentRowHandlers();
      
    } catch (e) {
      console.error('Students error:', e);
      tbody.innerHTML = '<tr><td colspan="7">Failed to load students</td></tr>';
    }
  }

  // Render student row
  function renderStudentRow(s) {
    const name = `${s.Firstname || s.firstName || ''} ${s.Lastname || s.lastName || ''}`.trim();
    return `
      <tr data-id="${s._id}">
        <td>${s.studentId || s._id}</td>
        <td>${escapeHtml(name)}</td>
        <td>${escapeHtml(s.email || '')}</td>
        <td class="age">${s.age ?? ''}</td>
        <td class="phone">${escapeHtml(s.phone || '')}</td>
        <td>${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}</td>
        <td class="action-row"><button class="btn btn-edit">Edit</button></td>
      </tr>
    `;
  }

  // Attach edit button handlers
  function attachStudentRowHandlers() {
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr');
        if (!tr) return;
        
        if (tr.classList.contains('editing')) {
          await saveStudentEdits(tr);
        } else {
          startEditRow(tr);
        }
      });
    });
  }

  // Start editing a row
  function startEditRow(tr) {
    tr.classList.add('editing');
    const age = tr.querySelector('.age').textContent || '';
    const phone = tr.querySelector('.phone').textContent || '';
    
    tr.querySelector('.age').innerHTML = `<input class="edit-input inp-age" value="${age}">`;
    tr.querySelector('.phone').innerHTML = `<input class="edit-input inp-phone" value="${phone}">`;
    tr.querySelector('.btn-edit').textContent = 'Save';
  }

  // Save student edits
  async function saveStudentEdits(tr) {
    const id = tr.dataset.id;
    const ageVal = tr.querySelector('.inp-age').value.trim();
    const phoneVal = tr.querySelector('.inp-phone').value.trim();
    
    const payload = {};
    if (ageVal) payload.age = isNaN(ageVal) ? ageVal : Number(ageVal);
    if (phoneVal) payload.phone = phoneVal;
    
    if (!Object.keys(payload).length) {
      cancelEditRow(tr);
      return;
    }
    
    try {
      const res = await fetch(API_BASE_URL + '/students/' + id, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      
      const data = await handleResponse(res, '/students/' + id);
      
      tr.querySelector('.age').textContent = data.student?.age ?? '';
      tr.querySelector('.phone').textContent = data.student?.phone ?? '';
      tr.classList.remove('editing');
      tr.querySelector('.btn-edit').textContent = 'Edit';
      
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update student');
    }
  }

  // Cancel editing
  function cancelEditRow(tr) {
    tr.classList.remove('editing');
    fetchStudents();
  }

  // Fetch team members
  async function fetchTeam() {
    const ul = document.getElementById('teamList');
    ul.innerHTML = 'Loading...';
    
    try {
      const res = await fetch(API_BASE_URL + '/team', { 
        headers: getAuthHeaders() 
      });
      const data = await handleResponse(res, '/team');
      
      const staff = data.staff || [];
      if (staff.length === 0) {
        ul.innerHTML = '<li>No team members</li>';
        return;
      }
      
      ul.innerHTML = staff.map(s => `
        <li>
          <div>
            <strong>${escapeHtml(s.firstName || '')} ${escapeHtml(s.lastName || '')}</strong>
            <div class="muted-small">${escapeHtml(s.role || '')} • ${escapeHtml(s.department || '')}</div>
          </div>
          <div class="muted-small">${escapeHtml(s.email || '')}</div>
        </li>
      `).join('');
      
    } catch (e) {
      console.error('Team error:', e);
      ul.innerHTML = '<li>Failed to load team members</li>';
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#39;');
  }

  // Change password
  async function changePassword(currentPassword, newPassword) {
    try {
      const res = await fetch(API_BASE_URL + '/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await handleResponse(res, '/change-password');
      
      alert('Password changed successfully!');
      closeModal();
      
      // Remove required message if present
      const requiredMsg = document.querySelector('.required-msg');
      if (requiredMsg) requiredMsg.remove();
      
    } catch (err) {
      console.error('Password change error:', err);
      alert(err.message || 'Failed to change password');
    }
  }

  // Show modal
  function showModal() {
    document.getElementById('modal').classList.remove('hidden');
  }

  // Close modal
  function closeModal() {
    document.getElementById('modal').classList.add('hidden');
  }

  // Wire up UI events
  function wireUI() {
    // Logout
    document.getElementById('btnLogout').addEventListener('click', function() {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('staffToken');
      localStorage.removeItem('staffData');
      localStorage.removeItem('userData');
      redirectToLogin();
    });

    // Refresh
    document.getElementById('btnRefresh').addEventListener('click', function() {
      fetchAll();
    });

    // Change password buttons
    document.getElementById('btnShowChangePassword').addEventListener('click', showModal);
    document.getElementById('btnCloseModal').addEventListener('click', closeModal);

    // Change password form
    document.getElementById('changePasswordForm').addEventListener('submit', function(ev) {
      ev.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      changePassword(currentPassword, newPassword);
    });

    // Search students
    document.getElementById('searchStudents').addEventListener('input', function(e) {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#studentsTable tbody tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    // Close modal on outside click
    document.getElementById('modal').addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }

  // Fetch all data
  async function fetchAll() {
    if (!checkAuth()) return;
    
    try {
      await Promise.all([
        fetchDashboard(),
        fetchStudents(),
        fetchTeam()
      ]);
    } catch (e) {
      console.error('Error fetching data:', e);
    }
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing staff dashboard...');
    wireUI();
    fetchAll();
  });

})();
