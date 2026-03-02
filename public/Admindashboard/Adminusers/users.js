const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api/admin';
        let studentsData = [];
        let staffData = [];
        const token = localStorage.getItem('token');

        // Authentication check
        document.addEventListener('DOMContentLoaded', function() {
            const userRole = localStorage.getItem('userRole');
            if (!token || userRole !== 'admin') {
                alert('Access denied. Please log in as an admin.');
                window.location.href = '../Login/login.html';
                return;
            }
            loadStudents();
            loadStaff();
        });

        // Helper to safely read response body as JSON or text
        async function readResponse(response) {
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                try {
                    const text = await response.text();
                    data = { __raw: text };
                } catch (e2) {
                    data = { __raw: 'Unable to read response body' };
                }
            }
            return data;
        }

        // Load students data
        async function loadStudents() {
            try {
                showAlert('Loading students...', 'info');
                const response = await fetch(`${API_BASE_URL}/get-all-students`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await readResponse(response);
                    studentsData = data.students || [];
                    displayStudents(studentsData);
                    hideAlert();
                } else {
                    const errorData = await readResponse(response);
                    const msg = (errorData && errorData.message) || errorData.__raw || 'Failed to load students';
                    throw new Error(msg);
                }
            } catch (error) {
                console.error('Error loading students:', error);
                showAlert('Failed to load students: ' + error.message, 'danger');
                displayStudents([]);
            }
        }

        // Load staff data
        async function loadStaff() {
            try {
                showAlert('Loading staff...', 'info');
                const response = await fetch(`${API_BASE_URL}/get-all-staff`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await readResponse(response);
                    staffData = data.staff || [];
                    displayStaff(staffData);
                    hideAlert();
                } else {
                    const errorData = await readResponse(response);
                    const msg = (errorData && errorData.message) || errorData.__raw || 'Failed to load staff';
                    throw new Error(msg);
                }
            } catch (error) {
                console.error('Error loading staff:', error);
                showAlert('Failed to load staff: ' + error.message, 'danger');
                displayStaff([]);
            }
        }

        // Display students
        function displayStudents(students) {
            const tbody = document.getElementById('studentsTableBody');

            if (students.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            <i class="fas fa-user-graduate fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No students found. Add your first student!</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = students.map(student => `
                <tr>
                    <td>${student.Firstname || student.firstName || 'N/A'}</td>
                    <td>${student.Lastname || student.lastName || 'N/A'}</td>
                    <td>${student.email || 'N/A'}</td>
                    <td>${student.phone || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editUser('${student._id}', 'student')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${student._id}', 'student')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Display staff
        function displayStaff(staff) {
            const tbody = document.getElementById('staffTableBody');

            if (staff.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <i class="fas fa-user-tie fa-3x text-muted mb-3"></i>
                            <p class="text-muted">No staff found. Add your first staff member!</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = staff.map(member => `
                <tr>
                    <td>${member.firstName || 'N/A'}</td>
                    <td>${member.lastName || 'N/A'}</td>
                    <td>${member.email || 'N/A'}</td>
                    <td>${member.phone || 'N/A'}</td>
                    <td>${member.role || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editUser('${member._id}', 'staff')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${member._id}', 'staff')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `).join('');
        }

        // Show add user modal
        function showAddUserModal(type) {
            document.getElementById('userModalLabel').textContent = `Add New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            document.getElementById('userForm').reset();
            document.getElementById('userIdHidden').value = '';
            document.getElementById('userTypeHidden').value = type;

            if (type === 'student') {
                document.getElementById('studentFields').style.display = 'block';
                document.getElementById('staffFields').style.display = 'none';
                document.getElementById('role').required = false;
            } else {
                document.getElementById('staffFields').style.display = 'block';
                document.getElementById('studentFields').style.display = 'none';
                document.getElementById('role').required = true;
            }

            new bootstrap.Modal(document.getElementById('userModal')).show();
        }

        // Edit user
        function editUser(userId, type) {
            const data = type === 'student' ? studentsData : staffData;
            const user = data.find(u => u._id === userId);
            if (!user) {
                showAlert('User not found', 'danger');
                return;
            }

            document.getElementById('userModalLabel').textContent = `Edit ${type.charAt(0).toUpperCase() + type.slice(1)}`;
            document.getElementById('firstName').value = user.firstName || user.Firstname || '';
            document.getElementById('lastName').value = user.lastName || user.Lastname || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('userIdHidden').value = user._id;
            document.getElementById('userTypeHidden').value = type;

            if (type === 'student') {
                document.getElementById('studentFields').style.display = 'block';
                document.getElementById('staffFields').style.display = 'none';
                document.getElementById('studentId').value = user.studentId || '';
                document.getElementById('major').value = user.major || '';
                document.getElementById('role').required = false;
            } else {
                document.getElementById('staffFields').style.display = 'block';
                document.getElementById('studentFields').style.display = 'none';
                document.getElementById('role').value = user.role || '';
                document.getElementById('department').value = user.department || '';
                document.getElementById('role').required = true;
            }

            new bootstrap.Modal(document.getElementById('userModal')).show();
        }

        // Save user (add or edit)
        async function saveUser() {
            const Firstname = document.getElementById('firstName').value;
            const Lastname = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const type = document.getElementById('userTypeHidden').value;
            const hiddenId = document.getElementById('userIdHidden').value;

            if (!Firstname || !Lastname || !email) {
                alert('First Name, Last Name, and Email are required.');
                return;
            }

            let userData = { Firstname, Lastname, email, phone };

            if (type === 'student') {
                userData.studentId = document.getElementById('studentId').value;
                userData.major = document.getElementById('major').value;
            } else {
                userData.role = document.getElementById('role').value;
                userData.department = document.getElementById('department').value;
                if (!userData.role) {
                    alert('Role is required for staff.');
                    return;
                }
            }

            const url = hiddenId ? `${API_BASE_URL}/edit-${type}/${hiddenId}` : `${API_BASE_URL}/add-${type}`;
            const method = hiddenId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                const data = await readResponse(response);
                if (response.ok) {
                    alert(hiddenId ? `${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully` : `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`);
                    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                    if (type === 'student') loadStudents(); else loadStaff();
                } else {
                    const msg = (data && data.message) || data.__raw || 'Unknown server error';
                    alert(`Error: ${msg}`);
                }
            } catch (error) {
                alert('Error saving user.');
                console.error('Error:', error);
            }
        }

        // Delete user - aligned with backend deleteStudent and deleteStaff functions
        async function deleteUser(userId, type) {
            if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
                return;
            }

            // Determine the appropriate endpoint based on user type
            const endpoint = type === 'staff' ? 'delete-staff' : 'delete-student';

            try {
                showAlert(`Deleting ${type}...`, 'info');
                
                const response = await fetch(`${API_BASE_URL}/${endpoint}/${userId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await readResponse(response);
                
                // Handle successful deletion
                if (response.ok) {
                    showAlert(data.message || `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
                    if (type === 'student') {
                        loadStudents();
                    } else {
                        loadStaff();
                    }
                } else {
                    // Handle specific error cases from backend
                    const msg = (data && data.message) || data.__raw || `Failed to delete ${type}`;
                    
                    // Check for permission errors (403 Forbidden)
                    if (response.status === 403) {
                        showAlert(`Access denied: Only admins can delete ${type}s`, 'danger');
                    } else if (response.status === 404) {
                        showAlert(`${type.charAt(0).toUpperCase() + type.slice(1)} not found`, 'warning');
                    } else {
                        throw new Error(msg);
                    }
                }
            } catch (error) {
                console.error(`Error deleting ${type}:`, error);
                showAlert(`Failed to delete ${type}: ` + error.message, 'danger');
            }
        }

        // Utility functions
        function showAlert(message, type) {
            const alertDiv = document.getElementById('alertMessage');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;
            alertDiv.style.display = 'block';

            // Auto-hide after 5 seconds for non-error messages
            if (type !== 'danger') {
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 5000);
            }
        }

        function hideAlert() {
            document.getElementById('alertMessage').style.display = 'none';
        }
