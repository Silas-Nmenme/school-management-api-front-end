 const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api/admin'; // Adjust based on your backend URL
        const token = localStorage.getItem('token');

        // Small helper to show alert messages inside the dashboard
        function showAlert(message, type = 'info', timeout = 4500) {
            const body = document.querySelector('.dashboard-body');
            if (!body) {
                // fallback to window alert if dashboard body is missing
                alert(message);
                return;
            }

            // remove any existing custom alert
            const existing = document.getElementById('globalAdminAlert');
            if (existing) existing.remove();

            const wrapper = document.createElement('div');
            wrapper.id = 'globalAdminAlert';
            wrapper.className = `alert alert-${type} animate__animated animate__fadeInDown`;
            wrapper.style.marginBottom = '18px';
            wrapper.innerHTML = message;

            body.insertBefore(wrapper, body.firstChild);

            if (timeout > 0) {
                setTimeout(() => {
                    wrapper.classList.remove('animate__fadeInDown');
                    wrapper.classList.add('animate__fadeOutUp');
                    setTimeout(() => wrapper.remove(), 500);
                }, timeout);
            }
        }

        // Role-based access check
        document.addEventListener('DOMContentLoaded', function() {
            const userRole = localStorage.getItem('userRole');
            
            if (!token || userRole !== 'admin') {
                alert('Access denied. Please log in as an admin.');
                window.location.href = '../Login/login.html';
            } else {
                loadDashboardOverview();
            }
        });

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '../Login/login.html';
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                if (target.startsWith('#')) {
                    document.querySelector(target).style.display = 'block';
                    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Function to load dashboard overview
        async function loadDashboardOverview() {
            try {
                const [studentResponse, courseResponse, staffResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/get-all-students`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch(`${API_BASE_URL}/get-all-courses`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch(`${API_BASE_URL}/get-all-staff`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

                if (studentResponse.ok) {
                    const studentData = await studentResponse.json();
                    const totalStudents = studentData.students ? studentData.students.length : 0;
                    document.getElementById('totalStudents').textContent = totalStudents;
                } else {
                    console.error('Error loading students:', studentResponse.status);
                    document.getElementById('totalStudents').textContent = 'N/A';
                }

                if (courseResponse.ok) {
                    const courseData = await courseResponse.json();
                    const activeCourses = courseData.courses ? courseData.courses.length : 0; // Assuming all courses are active
                    document.getElementById('activeCourses').textContent = activeCourses;
                } else {
                    console.error('Error loading courses:', courseResponse.status);
                    document.getElementById('activeCourses').textContent = 'N/A';
                }

                if (staffResponse.ok) {
                    const staffData = await staffResponse.json();
                    const totalStaff = staffData.staff ? staffData.staff.length : 0;
                    document.getElementById('staffMembers').textContent = totalStaff;
                } else {
                    console.error('Error loading staff:', staffResponse.status);
                    document.getElementById('staffMembers').textContent = 'N/A';
                }

            } catch (error) {
                console.error('Error fetching dashboard overview:', error);
                document.getElementById('totalStudents').textContent = 'Error';
                document.getElementById('activeCourses').textContent = 'Error';
                document.getElementById('staffMembers').textContent = 'Error';
            }
            // Load recent applications for admin quick view
            try {
                loadRecentApplications(5);
            } catch (e) {
                console.warn('Unable to load recent applications:', e);
            }
        }

        // Function to load students
        async function loadStudents() {
            try {
                const response = await fetch(`${API_BASE_URL}/get-all-students`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const students = data.students;
                    let html = '<h6>Students List:</h6><ul class="list-group">';
                    students.forEach(student => {
                        html += `<li class="list-group-item">${student.Firstname} ${student.Lastname} - ${student.email}</li>`;
                    });
                    html += '</ul>';
                    document.getElementById('studentsList').innerHTML = html;
                } else {
                    document.getElementById('studentsList').innerHTML = `<p class="text-danger">Error: ${data.message}</p>`;
                }
            } catch (error) {
                document.getElementById('studentsList').innerHTML = '<p class="text-danger">Error loading students.</p>';
                console.error('Error fetching students:', error);
            }
        }

        // Helper function to group students by age
        function groupStudentsByAge(students) {
            const ageGroups = {};
            students.forEach(student => {
                const age = student.age || 'Unknown'; // Assuming 'age' field exists, default to 'Unknown' if not
                if (!ageGroups[age]) {
                    ageGroups[age] = 0;
                }
                ageGroups[age]++;
            });
            return Object.keys(ageGroups).map(age => ({ _id: age, count: ageGroups[age] }));
        }

        // Function to load reports
        async function loadReports() {
            try {
                const [studentResponse, courseResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/get-all-students`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }),
                    fetch(`${API_BASE_URL}/get-all-courses`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    })
                ]);

                const studentData = await studentResponse.json();
                const courseData = await courseResponse.json();

                let html = '<h6>Student Report:</h6>';
                if (studentResponse.ok) {
                    const students = studentData.students || [];
                    const totalStudents = students.length;
                    const studentsByAge = groupStudentsByAge(students);
                    html += `<p>Total Students: ${totalStudents}</p>`;
                    html += '<h6>Students by Age:</h6><ul>';
                    studentsByAge.forEach(group => {
                        html += `<li>Age ${group._id}: ${group.count}</li>`;
                    });
                    html += '</ul>';
                } else {
                    html += `<p class="text-danger">Error: ${studentData.message}</p>`;
                }

                html += '<h6>Course Report:</h6>';
                if (courseResponse.ok) {
                    const courses = courseData.courses || [];
                    const totalCourses = courses.length;
                    const activeCourses = courses.length; // Assuming all courses are active
                    html += `<p>Total Courses: ${totalCourses}</p>`;
                    html += `<p>Active Courses: ${activeCourses}</p>`;
                } else {
                    html += `<p class="text-danger">Error: ${courseData.message}</p>`;
                }

                document.getElementById('reportsData').innerHTML = html;
            } catch (error) {
                document.getElementById('reportsData').innerHTML = '<p class="text-danger">Error loading reports.</p>';
                console.error('Error fetching reports:', error);
            }
        }

        // Function to load settings
        async function loadSettings() {
            // Check if token is present
            if (!token) {
                document.getElementById('settingsData').innerHTML = '<p class="text-danger">Authentication token missing. Please log in again.</p>';
                console.error('No authentication token found.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Settings fetch response status:', response.status, response.statusText);

                let data;
                try {
                    data = await response.json();
                    console.log('Settings fetch response data:', data);
                } catch (jsonError) {
                    console.error('Failed to parse JSON response:', jsonError);
                    data = { message: 'Invalid response format from server.' };
                }

                if (response.ok) {
                    const settings = data.settings;
                    if (!settings) {
                        document.getElementById('settingsData').innerHTML = '<p class="text-warning">Settings data not found in response.</p>';
                        console.warn('Settings object missing in response:', data);
                        return;
                    }
                    let html = '<h6>Current Settings:</h6>';
                    html += `<p>School Name: ${settings.schoolName || 'N/A'}</p>`;
                    html += `<p>School Email: ${settings.schoolEmail || 'N/A'}</p>`;
                    html += `<p>Allow Student Registration: ${settings.systemPreferences?.allowStudentRegistration ? 'Yes' : 'No'}</p>`;
                    html += `<p>Max Students Per Course: ${settings.systemPreferences?.maxStudentsPerCourse || 'N/A'}</p>`;
                    document.getElementById('settingsData').innerHTML = html;
                } else {
                    let errorMessage = 'Unknown error occurred.';
                    if (response.status === 500) {
                        errorMessage = 'Server error (500). Please check backend logs or contact support.';
                    } else if (response.status === 401) {
                        errorMessage = 'Unauthorized. Please log in again.';
                    } else if (response.status === 403) {
                        errorMessage = 'Forbidden. You do not have permission to access settings.';
                    } else if (response.status === 404) {
                        errorMessage = 'Settings endpoint not found. Please verify API URL.';
                    } else if (data.message) {
                        errorMessage = data.message;
                    }
                    document.getElementById('settingsData').innerHTML = `<p class="text-danger">Error loading settings: ${errorMessage}</p>`;
                    console.error('Error fetching settings:', response.status, response.statusText, data);
                }
            } catch (error) {
                document.getElementById('settingsData').innerHTML = '<p class="text-danger">Network error. Please check your connection and try again.</p>';
                console.error('Network error fetching settings:', error);
            }
        }

        // Function to load courses
        async function loadCourses() {
            try {
                const response = await fetch(`${API_BASE_URL}/get-all-courses`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const courses = data.courses;
                    let html = '<h6>Courses List:</h6><table class="table table-striped"><thead><tr><th>ID</th><th>Name</th><th>Instructor</th><th>Max Students</th><th>Actions</th></tr></thead><tbody>';
                    courses.forEach(course => {
                        html += `<tr>
                            <td>${course.courseId}</td>
                            <td>${course.name}</td>
                            <td>${course.instructor}</td>
                            <td>${course.maxStudents}</td>
                            <td>
                                <button class="btn btn-sm btn-custom" onclick="editCourse('${course._id}')">Edit</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCourse('${course._id}')">Delete</button>
                            </td>
                        </tr>`;
                    });
                    html += '</tbody></table>';
                    document.getElementById('coursesList').innerHTML = html;
                } else {
                    document.getElementById('coursesList').innerHTML = `<p class="text-danger">Error: ${data.message}</p>`;
                }
            } catch (error) {
                document.getElementById('coursesList').innerHTML = '<p class="text-danger">Error loading courses.</p>';
                console.error('Error fetching courses:', error);
            }
        }
        

        // Applications management functions
        async function loadApplications(status = 'all') {
            if (!token) return;
            const tbody = document.getElementById('applicationsTbody');
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

            try {
                let url = `${API_BASE_URL}/applications`;
                if (status && status !== 'all') url = `${API_BASE_URL}/applications/filter/${encodeURIComponent(status)}`;

                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Failed to fetch applications');
                const data = await res.json();
                const apps = data.applications || [];

                if (apps.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6">No applications found.</td></tr>';
                    return;
                }

                tbody.innerHTML = '';
                apps.forEach(app => {
                    const tr = document.createElement('tr');
                    const submitted = app.submissionDate ? new Date(app.submissionDate).toLocaleString() : '';
                    tr.innerHTML = `
                        <td>${app.firstName} ${app.lastName}</td>
                        <td>${app.email}</td>
                        <td>${app.course || ''}</td>
                        <td>${app.status}</td>
                        <td>${submitted}</td>
                        <td>
                            <button class="btn btn-sm btn-secondary me-1" onclick="viewApplicationDetails('${app._id}')">View</button>
                            <button class="btn btn-sm btn-custom" onclick="openStatusModal('${app._id}')">Update</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } catch (error) {
                console.error('Error loading applications:', error);
                tbody.innerHTML = '<tr><td colspan="6" class="text-danger">Error loading applications.</td></tr>';
            }
        }

        async function loadRecentApplications(limit = 5) {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/applications/recent?limit=${limit}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                console.log('Recent applications:', data.applications || []);
            } catch (error) {
                console.warn('Could not load recent applications', error);
            }
        }

        async function viewApplicationDetails(applicationId) {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/applications/${applicationId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch application');
                const data = await res.json();
                const app = data.application;
                const details = document.getElementById('applicationDetails');
                details.innerHTML = `
                    <p><strong>Name:</strong> ${app.firstName} ${app.lastName}</p>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Phone:</strong> ${app.phone || ''}</p>
                    <p><strong>Faculty / Department / Course:</strong> ${app.faculty} / ${app.department} / ${app.course}</p>
                    <p><strong>GPA / SAT / ACT:</strong> ${app.gpa || 'N/A'} / ${app.satScore || 'N/A'} / ${app.actScore || 'N/A'}</p>
                    <p><strong>Essay:</strong><br>${app.essay ? app.essay.replace(/\n/g, '<br>') : 'N/A'}</p>
                    <p><strong>Status:</strong> <span id="currentAppStatus">${app.status}</span></p>
                `;

                document.getElementById('adminStatusSelect').value = app.status || 'Pending';
                document.getElementById('adminRemarks').value = app.remarks || '';
                document.getElementById('saveApplicationStatusBtn').dataset.applicationId = applicationId;

                const modal = new bootstrap.Modal(document.getElementById('applicationModal'));
                modal.show();
            } catch (error) {
                console.error('Error fetching application details:', error);
                showAlert('Failed to load application details.', 'danger');
            }
        }

        function openStatusModal(applicationId) {
            viewApplicationDetails(applicationId);
        }

        document.addEventListener('DOMContentLoaded', function() {
            // Hook up filter and refresh button for applications
            const filter = document.getElementById('applicationStatusFilter');
            if (filter) filter.addEventListener('change', function() { loadApplications(this.value || 'all'); });
            const refreshBtn = document.getElementById('refreshApplicationsBtn');
            if (refreshBtn) refreshBtn.addEventListener('click', function() { loadApplications(document.getElementById('applicationStatusFilter').value || 'all'); });
            const saveBtn = document.getElementById('saveApplicationStatusBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', async function() {
                    const applicationId = this.dataset.applicationId;
                    if (!applicationId) return;
                    const status = document.getElementById('adminStatusSelect').value;
                    const remarks = document.getElementById('adminRemarks').value;

                    try {
                        const res = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ status, remarks })
                        });

                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Failed to update status');

                        showAlert('Application status updated successfully.', 'success');
                        loadApplications(document.getElementById('applicationStatusFilter').value || 'all');
                        const modal = bootstrap.Modal.getInstance(document.getElementById('applicationModal'));
                        if (modal) modal.hide();
                    } catch (error) {
                        console.error('Error updating application status:', error);
                        showAlert('Failed to update application status.', 'danger');
                    }
                });
            }
        });

        // Nav link to show applications section
        const navAppLink = document.getElementById('navApplicationsLink');
        if (navAppLink) {
            navAppLink.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelectorAll('.card').forEach(c => c.style.display = 'none');
                const appsCard = document.getElementById('applications');
                if (appsCard) appsCard.style.display = 'block';
                loadApplications('all');
            });
        }

        // Function to show add course form
        function showAddCourseForm() {
            document.getElementById('courseModalLabel').textContent = 'Add Course';
            document.getElementById('courseId').value = '';
            document.getElementById('courseName').value = '';
            document.getElementById('courseDescription').value = '';
            document.getElementById('courseInstructor').value = '';
            document.getElementById('courseMaxStudents').value = '';
            document.getElementById('courseDuration').value = '';
            document.getElementById('courseSchedule').value = '';
            document.getElementById('courseIdHidden').value = '';
            new bootstrap.Modal(document.getElementById('courseModal')).show();
        }

        // Function to edit course
        async function editCourse(courseId) {
            try {
                const response = await fetch(`${API_BASE_URL}/get-course/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const course = data.course;
                    document.getElementById('courseModalLabel').textContent = 'Edit Course';
                    document.getElementById('courseId').value = course.courseId;
                    document.getElementById('courseName').value = course.name;
                    document.getElementById('courseDescription').value = course.description;
                    document.getElementById('courseInstructor').value = course.instructor;
                    document.getElementById('courseMaxStudents').value = course.maxStudents;
                    document.getElementById('courseDuration').value = course.duration;
                    document.getElementById('courseSchedule').value = course.schedule;
                    document.getElementById('courseIdHidden').value = course._id;
                    new bootstrap.Modal(document.getElementById('courseModal')).show();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('Error loading course for editing.');
                console.error('Error:', error);
            }
        }

        // Function to save course (add or edit)
        async function saveCourse() {
            const courseId = document.getElementById('courseId').value;
            const name = document.getElementById('courseName').value;
            const description = document.getElementById('courseDescription').value;
            const instructor = document.getElementById('courseInstructor').value;
            const maxStudents = document.getElementById('courseMaxStudents').value;
            const duration = document.getElementById('courseDuration').value;
            const schedule = document.getElementById('courseSchedule').value;
            const hiddenId = document.getElementById('courseIdHidden').value;

            if (!courseId || !name || !instructor || !maxStudents || !duration || !schedule) {
                alert('All required fields must be filled.');
                return;
            }

            const courseData = { courseId, name, description, instructor, maxStudents, duration, schedule };
            const url = hiddenId ? `${API_BASE_URL}/edit-course/${hiddenId}` : `${API_BASE_URL}/add-course`;
            const method = hiddenId ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(courseData)
                });
                const data = await response.json();
                if (response.ok) {
                    alert(hiddenId ? 'Course updated successfully' : 'Course added successfully');
                    bootstrap.Modal.getInstance(document.getElementById('courseModal')).hide();
                    loadCourses();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('Error saving course.');
                console.error('Error:', error);
            }
        }

        // Function to delete course
        async function deleteCourse(courseId) {
            if (!confirm('Are you sure you want to delete this course?')) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/delete-course/${courseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    alert('Course deleted successfully');
                    loadCourses();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('Error deleting course.');
                console.error('Error:', error);
            }
        }