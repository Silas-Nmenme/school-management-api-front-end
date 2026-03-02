const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api/admin';
        let coursesData = []; // Store courses data globally for editing
        const token = localStorage.getItem('token'); // <-- Move this here

        // Authentication check
        document.addEventListener('DOMContentLoaded', function() {
            const userRole = localStorage.getItem('userRole');
            if (!token || userRole !== 'admin') {
                alert('Access denied. Please log in as an admin.');
                window.location.href = '..Login/login.html';
                return;
            }
            loadCourses();
        });

        // Load courses data
        async function loadCourses() {
            const token = localStorage.getItem('token');

            if (!token) {
                showAlert('Authentication token is missing. Please log in again.', 'danger');
                window.location.href = '..Login/login.html';
                return;
            }

            try {
                showAlert('Loading courses...', 'info');
                const response = await fetch(`${API_BASE_URL}/get-all-courses`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    coursesData = data.courses || [];
                    displayCourses(coursesData);
                    hideAlert();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to load courses');
                }
            } catch (error) {
                console.error('Error loading courses:', error);
                showAlert('Failed to load courses: ' + error.message, 'danger');
                displayCourses([]);
            }
        }

       
function displayCourses(courses) {
    const tbody = document.getElementById('coursesTableBody');
    
    if (courses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No courses found. Add your first course!</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = courses.map(course => {
        // Format days display
        const daysArr = course.days || [];
        const daysStr = Array.isArray(daysArr) ? daysArr.map(d => d.charAt(0) + d.slice(1).toLowerCase()).join(', ') : '';
        const startTime = course.startTime || '';
        const endTime = course.endTime || '';
        const scheduleDisplay = `${daysStr} ${startTime} - ${endTime}`.trim();

        // Instructor display
        let instructorDisplay = 'N/A';
        let instructorTypeDisplay = course.instructorModel || '';
        if (course.instructor && typeof course.instructor === 'object') {
            if (course.instructor.firstName) {
                instructorDisplay = `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim();
            } else if (course.instructor.$oid) {
                instructorDisplay = course.instructor.$oid;
            } else {
                instructorDisplay = 'N/A';
            }
        } else if (course.instructor) {
            instructorDisplay = course.instructor;
        }

        return `
            <tr>
                <td>${course._id}</td>
                <td>${course.name}</td>
                <td>${course.description || 'N/A'}</td>
                <td>${instructorDisplay} <span class="text-muted">(${instructorTypeDisplay})</span></td>
                <td>${course.maxStudents}</td>
                <td>${course.duration}</td>
                <td>${scheduleDisplay}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editCourse('${course._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCourse('${course._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}


        // Show add course modal
        function showAddCourseModal() {
            document.getElementById('courseModalLabel').textContent = 'Add New Course';
            document.getElementById('courseForm').reset();
            document.getElementById('courseIdHidden').value = '';
            new bootstrap.Modal(document.getElementById('courseModal')).show();
        }

        // Edit course
        function editCourse(courseId) {
            const course = coursesData.find(c => c._id === courseId);
            if (!course) {
                showAlert('Course not found', 'danger');
                return;
            }

            document.getElementById('courseModalLabel').textContent = 'Edit Course';
            document.getElementById('courseId').value = course.courseId;
            document.getElementById('courseName').value = course.name;
            document.getElementById('courseDescription').value = course.description || '';
            document.getElementById('courseInstructor').value = (course.instructor && typeof course.instructor === 'object') ? course.instructor._id : course.instructor || '';
            document.getElementById('courseInstructorModel').value = course.instructorModel || '';
            document.getElementById('courseMaxStudents').value = course.maxStudents;
            document.getElementById('courseDuration').value = course.duration;
            document.getElementById('courseStartTime').value = course.startTime || '';
            document.getElementById('courseEndTime').value = course.endTime || '';

            // Set selected days
            const daysSelect = document.getElementById('courseDays');
            const days = course.days || [];
            for (let option of daysSelect.options) {
                option.selected = days.includes(option.value);
            }

            document.getElementById('courseIdHidden').value = course._id;
            new bootstrap.Modal(document.getElementById('courseModal')).show();
        }

        // Save course (add or edit)
        async function saveCourse() {
            const token = localStorage.getItem('token');

            if (!token) {
                showAlert('Authentication token is missing. Please log in again.', 'danger');
                window.location.href = '../Login/login.html';
                return;
            }

            const courseId = document.getElementById('courseId').value;
            const name = document.getElementById('courseName').value;
            const description = document.getElementById('courseDescription').value;
            const instructor = document.getElementById('courseInstructor').value;
            const instructorModel = document.getElementById('courseInstructorModel').value;
            const maxStudents = document.getElementById('courseMaxStudents').value;
            const duration = document.getElementById('courseDuration').value;
            const startTime = document.getElementById('courseStartTime').value;
            const endTime = document.getElementById('courseEndTime').value;
            const daysSelect = document.getElementById('courseDays');
            const days = Array.from(daysSelect.selectedOptions).map(opt => opt.value);
            const hiddenId = document.getElementById('courseIdHidden').value;

            if (!courseId || !name || !instructor || !instructorModel || !maxStudents || !duration || !startTime || !endTime || days.length === 0) {
                alert('All required fields must be filled.');
                return;
            }

            const courseData = {
                courseId,
                name,
                description,
                instructor,
                instructorModel,
                maxStudents,
                duration,
                startTime,
                endTime,
                days
            };
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

        // Delete course
        async function deleteCourse(courseId) {
            if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                return;
            }

            const token = localStorage.getItem('token');

            if (!token) {
                showAlert('Authentication token is missing. Please log in again.', 'danger');
                window.location.href = '../Login/login.html';
                return;
            }

            try {
                showAlert('Deleting course...', 'info');
                const response = await fetch(`${API_BASE_URL}/delete-course/${courseId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (response.ok) {
                    showAlert('Course deleted successfully', 'success');
                    loadCourses(); // Refresh the list
                } else {
                    throw new Error(data.message || 'Failed to delete course');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                showAlert('Failed to delete course: ' + error.message, 'danger');
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
