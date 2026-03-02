 // Authentication check
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = '../Login/login.html';
                return;
            }

            loadAvailableCourses();
            loadRegisteredCourses();
        });

        // Load available courses data
        async function loadAvailableCourses() {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/admin/get-all-courses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const courses = (data.courses || []);
                    displayAvailableCourses(courses);
                } else {
                    throw new Error('Failed to load available courses');
                }
            } catch (error) {
                console.error('Error loading available courses:', error);
                showAlert('Failed to load available courses. Please try again.', 'danger');
            } finally {
                hideLoading();
            }
        }

        // Load registered courses data
        async function loadRegisteredCourses() {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/courses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const courses = data.courses || [];
                    // Filter out courses that may have been deleted (where course is null or _id is null due to populate)
                    const validCourses = courses.filter(course => course && course._id);
                    displayRegisteredCourses(validCourses);
                } else {
                    throw new Error('Failed to load registered courses');
                }
            } catch (error) {
                console.error('Error loading registered courses:', error);
                showAlert('Failed to load registered courses. Please try again.', 'danger');
            }
        }

        // Display available courses
        function displayAvailableCourses(courses) {
            const availableCoursesRow = document.getElementById('availableCoursesRow');
            const availableCoursesSection = document.getElementById('availableCoursesSection');
            const noAvailableCourses = document.getElementById('noAvailableCourses');

            availableCoursesRow.innerHTML = '';

            if (courses.length === 0) {
                noAvailableCourses.style.display = 'block';
                availableCoursesSection.style.display = 'block';
                return;
            }

            availableCoursesSection.style.display = 'block';
            noAvailableCourses.style.display = 'none';

            courses.forEach(course => {
                const courseCard = createAvailableCourseCard(course);
                availableCoursesRow.appendChild(courseCard);
            });

            window.availableCourses = courses;
        }

        // Display registered courses
        function displayRegisteredCourses(courses) {
            const registeredCoursesRow = document.getElementById('registeredCoursesRow');
            const registeredCoursesSection = document.getElementById('registeredCoursesSection');
            const noRegisteredCourses = document.getElementById('noRegisteredCourses');

            registeredCoursesRow.innerHTML = '';

            if (courses.length === 0) {
                noRegisteredCourses.style.display = 'block';
                registeredCoursesSection.style.display = 'block';
                return;
            }

            registeredCoursesSection.style.display = 'block';
            noRegisteredCourses.style.display = 'none';

            courses.forEach(course => {
                const courseCard = createRegisteredCourseCard(course);
                registeredCoursesRow.appendChild(courseCard);
            });

            window.registeredCourses = courses;
        }

        // Create available course card
        function createAvailableCourseCard(course) {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-lg-4 col-md-6 mb-4';

            // Instructor display
            let instructorDisplay = 'N/A';
            if (course.instructor && typeof course.instructor === 'object') {
                if (course.instructor.firstName) {
                    instructorDisplay = `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim();
                } else if (course.instructor.$oid) {
                    instructorDisplay = course.instructor.$oid;
                }
            } else if (course.instructor) {
                instructorDisplay = course.instructor;
            }

            const courseId = course.courseId || course._id || course.id;
            const description = course.description || 'No description available';

            colDiv.innerHTML = `
                <div class="card course-card">
                    <div class="card-body">
                        <i class="fas fa-graduation-cap course-icon"></i>
                        <h5 class="course-title">${course.name || 'Course Name'}</h5>
                        <p class="course-description">${description}</p>
                        <div class="course-meta">
                            <strong>Code:</strong> ${course.courseId || 'N/A'}<br>
                            <strong>Credits:</strong> 3<br>
                            <strong>Instructor:</strong> ${instructorDisplay}
                        </div>
                        <button class="btn btn-custom btn-sm" data-course-id="${courseId}" onclick="registerCourse('${courseId}')">
                            <i class="fas fa-plus me-1"></i>Register
                        </button>
                        <button class="btn btn-secondary btn-sm" data-course-id="${courseId}" onclick="toggleCourseDetails('${courseId}')">
                            <i class="fas fa-eye me-1"></i>View More
                        </button>
                        <div class="collapse mt-3" id="collapse-${courseId}">
                            <div class="p-3 bg-light rounded">
                                <h6>Course Name: ${course.name || 'Course Name'}</h6>
                                <p>Course ID: ${course.courseId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // mark DOM element with course identifier for easy lookup
            colDiv.setAttribute('data-course-id', courseId);

            return colDiv;
        }

        // Create registered course card
        function createRegisteredCourseCard(course) {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-lg-4 col-md-6 mb-4';

            // Instructor display
            let instructorDisplay = 'N/A';
            if (course.instructor && typeof course.instructor === 'object') {
                if (course.instructor.firstName) {
                    instructorDisplay = `${course.instructor.firstName} ${course.instructor.lastName || ''}`.trim();
                } else if (course.instructor.$oid) {
                    instructorDisplay = course.instructor.$oid;
                }
            } else if (course.instructor) {
                instructorDisplay = course.instructor;
            }

            // Use MongoDB _id as primary identifier (consistent with exam registration)
            // Store both _id and courseId as data attributes for flexible matching
            const courseId = course._id || course.courseId || course.id;
            const courseCode = course.courseId || 'N/A';
            const description = course.description || 'No description available';

            colDiv.innerHTML = `
                <div class="card course-card">
                    <div class="card-body">
                        <i class="fas fa-check-circle course-icon" style="color: #28a745;"></i>
                        <h5 class="course-title">${course.name || 'Course Name'}</h5>
                        <p class="course-description">${description}</p>
                        <div class="course-meta">
                            <strong>Code:</strong> ${courseCode}<br>
                            <strong>Credits:</strong> 3<br>
                            <strong>Instructor:</strong> ${instructorDisplay}
                        </div>
                        <button class="btn btn-unregister btn-sm" onclick="unregisterCourse('${courseId}')">
                            <i class="fas fa-times me-1"></i>Unregister
                        </button>
                        <button class="btn btn-secondary btn-sm" data-course-id="${courseId}" onclick="toggleCourseDetails('${courseId}')">
                            <i class="fas fa-eye me-1"></i>View More
                        </button>
                        <div class="collapse mt-3" id="collapse-${courseId}">
                            <div class="p-3 bg-light rounded">
                                <h6>Course Name: ${course.name || 'Course Name'}</h6>
                                <p>Course ID: ${courseCode}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Mark DOM element with both _id and courseId for flexible lookup during exam registration
            colDiv.setAttribute('data-course-id', courseId);
            colDiv.setAttribute('data-course-code', courseCode);

            return colDiv;
        }

        // Toggle course details expansion
        function toggleCourseDetails(courseId) {
            const collapseElement = document.getElementById(`collapse-${courseId}`);
            const button = document.querySelector(`button[data-course-id="${courseId}"][onclick*="toggleCourseDetails"]`);

            if (collapseElement && button) {
                const cardBody = collapseElement.parentElement;
                const description = cardBody.querySelector('.course-description');
                const meta = cardBody.querySelector('.course-meta');

                const bsCollapse = new bootstrap.Collapse(collapseElement, {
                    toggle: false
                });

                if (collapseElement.classList.contains('show')) {
                    bsCollapse.hide();
                    button.innerHTML = '<i class="fas fa-eye me-1"></i>View Less';
                    if (description) description.style.display = '';
                    if (meta) meta.style.display = '';
                } else {
                    bsCollapse.show();
                    button.innerHTML = '<i class="fas fa-eye-slash me-1"></i>View More';
                    if (description) description.style.display = 'none';
                    if (meta) meta.style.display = 'none';
                }
            }
        }

        // Register for a course
        async function registerCourse(courseId) {
            if (!confirm('Are you sure you want to register for this course?')) return;

            const button = document.querySelector(`button[data-course-id="${courseId}"]`);
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Registering...';
            }

            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/courses/register', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseId })
                });

                if (response.ok) {
                    showAlert('Successfully registered for the course!', 'success');
                    // Reload both sections
                    loadAvailableCourses();
                    loadRegisteredCourses();
                } else if (response.status === 400) {
                    const errorData = await response.json();
                    showAlert(errorData.message || 'Failed to register for the course', 'warning');
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to register for the course');
                }
            } catch (error) {
                console.error('Error registering for course:', error);
                showAlert('Failed to register for the course: ' + error.message, 'danger');
            } finally {
                if (button) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-plus me-1"></i>Register';
                }
            }
        }

        // Unregister from a course
        async function unregisterCourse(courseId) {
            if (!confirm('Are you sure you want to unregister from this course?')) return;

            const button = event ? event.target : document.querySelector(`button[onclick="unregisterCourse('${courseId}')"]`);
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Unregistering...';
            }

            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/courses/unregister', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseId })
                });

                if (response.ok) {
                    showAlert('Successfully unregistered from the course!', 'success');
                    // Reload both sections
                    loadAvailableCourses();
                    loadRegisteredCourses();
                } else if (response.status === 400 || response.status === 404) {
                    showAlert('Course not found or already unregistered.', 'warning');
                    // Remove the course card from the page
                    const card = button.closest('.card');
                    if (card) {
                        card.remove();
                    }
                    // Reload sections to update counts
                    loadAvailableCourses();
                    loadRegisteredCourses();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to unregister from the course');
                }
            } catch (error) {
                console.error('Error unregistering from course:', error);
                showAlert('Failed to unregister from the course: ' + error.message, 'danger');
            } finally {
                if (button) {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-times me-1"></i>Unregister';
                }
            }
        }

        // Register for exam
        async function registerForExam() {
            const token = localStorage.getItem('token');
            let registeredCourses = [];

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/courses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    registeredCourses = data.courses || [];
                    console.log('Registered courses for exam:', registeredCourses);
                } else {
                    throw new Error('Failed to fetch registered courses');
                }
            } catch (error) {
                console.error('Error loading registered courses:', error);
                showAlert('Failed to load registered courses.', 'danger');
                return;
            }

            if (registeredCourses.length === 0) {
                showAlert('No registered courses available for exam registration.', 'warning');
                return;
            }

            const examCoursesList = document.getElementById('examCoursesList');
            examCoursesList.innerHTML = '';

            let validCoursesCount = 0;

            registeredCourses.forEach(course => {
                // Send either the MongoDB _id or courseId to the backend
                // Backend accepts both and validates enrollment using courseId
                const courseIdentifier = course._id || course.courseId;
                const courseName = course.name || 'Course Name';
                const courseCode = course.courseId || 'N/A';
                
                // Only add if we have a valid identifier
                if (!courseIdentifier) {
                    console.warn('Course missing both _id and courseId:', course);
                    return;
                }
                
                validCoursesCount++;
                
                const div = document.createElement('div');
                div.className = 'form-check mb-2';
                div.innerHTML = `
                    <input class="form-check-input exam-course-checkbox" type="checkbox" value="${courseIdentifier}" data-course-id="${courseIdentifier}" id="examCourse_${courseIdentifier}" checked>
                    <label class="form-check-label" for="examCourse_${courseIdentifier}">
                        ${courseName} (${courseCode})
                    </label>
                `;
                examCoursesList.appendChild(div);
            });

            if (validCoursesCount === 0) {
                showAlert('None of your registered courses have valid identifiers. Please try again later.', 'warning');
                return;
            }

            const modal = new bootstrap.Modal(document.getElementById('examRegistrationModal'));
            modal.show();
        }

        // Clear exam registrations after successful registration
        async function clearExamRegistrations(courseIds) {
            const token = localStorage.getItem('token');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/exams/clear', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ courseIds })
                });

                const data = await response.json();
                console.log('Clear exam registrations response:', response.status, data);

                if (response.ok) {
                    console.log('Successfully cleared exam registrations:', data.clearedExams);
                    if (data.errors && data.errors.length > 0) {
                        console.warn('Some errors occurred while clearing:', data.errors);
                    }
                } else {
                    console.error('Failed to clear exam registrations:', data.message);
                }
            } catch (error) {
                console.error('Error clearing exam registrations:', error);
            }
        }

        // Handle exam registration form submission
        document.addEventListener('DOMContentLoaded', function() {
            const examForm = document.getElementById('examRegistrationForm');
            if (examForm) {
                examForm.addEventListener('submit', async function(e) {
                    e.preventDefault();

                    const selectedCourses = Array.from(this.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
                    if (selectedCourses.length === 0) {
                        showAlert('Please select at least one course for exam registration.', 'warning');
                        return;
                    }

                    console.log('Submitting courseIds:', selectedCourses);

                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Registering...';

                    const token = localStorage.getItem('token');

                    try {
                        const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/exams/register', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ courseIds: selectedCourses })
                        });

                        const data = await response.json();
                        console.log('Exam registration response:', response.status, data);

                        if (response.ok) {
                            showAlert(data.message, 'success');
                            if (data.errors && data.errors.length > 0) {
                                showAlert('Some errors occurred: ' + data.errors.join(', '), 'warning');
                            }
                            const modal = bootstrap.Modal.getInstance(document.getElementById('examRegistrationModal'));
                            modal.hide();

                            // Remove the courses from registered list after exam registration
                            if (window.registeredCourses && selectedCourses.length > 0) {
                                window.registeredCourses = window.registeredCourses.filter(course => {
                                    const courseId = course._id || course.courseId;
                                    return !selectedCourses.includes(courseId);
                                });
                                displayRegisteredCourses(window.registeredCourses);
                            }
                            
                            // Reload available courses to show courses that were previously registered
                            loadAvailableCourses();
                        } else {
                            // Show more detailed error message
                            let errorMessage = data.message || 'Failed to register for exams';
                            if (data.errors && data.errors.length > 0) {
                                errorMessage += ' - ' + data.errors.join(', ');
                            }
                            showAlert(errorMessage, 'danger');
                        }
                    } catch (error) {
                        console.error('Error registering for exams:', error);
                        showAlert('Failed to register for exams: ' + error.message, 'danger');
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                    }
                });
            }
        });

        // Utility functions
        function showAlert(message, type) {
            const alertDiv = document.getElementById('alertMessage');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;
            alertDiv.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertDiv.style.display = 'none';
            }, 5000);
        }

        function hideLoading() {
            document.getElementById('loadingState').style.display = 'none';
        }

        // Add CSS animation for loading spinner
        const style = document.createElement('style');
        style.textContent = `
            .loading-spinner {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #667eea;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
