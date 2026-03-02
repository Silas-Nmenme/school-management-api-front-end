// Role-based access check and load student data
        document.addEventListener('DOMContentLoaded', async function() {
            const userRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('token');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = 'login.html';
                return;
            }

            // Fetch student profile
            try {
                const profileResponse = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    const profile = profileData.profile;
                    const studentName = `${profile.Firstname || ''} ${profile.Lastname || ''}`.trim() || 'Student';
                    const studentId = profile.studentId || 'N/A';

                    document.getElementById('studentName').textContent = studentName;
                    document.querySelector('.student-info small').textContent = `Student ID: ${studentId}`;
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }

            // Fetch courses and generate schedule
            try {
                const coursesResponse = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/courses', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    const courses = coursesData.courses || [];
                    displayCourses(courses);
                    generateTimetable(courses);
                } else {
                    document.getElementById('coursesList').innerHTML = '<p class="text-center">No courses available</p>';
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                document.getElementById('coursesList').innerHTML = '<p class="text-center">Error loading courses</p>';
            }
        });

        function displayCourses(courses) {
            const coursesList = document.getElementById('coursesList');
            coursesList.innerHTML = '';

            if (courses.length === 0) {
                coursesList.innerHTML = '<div class="col-12"><p class="text-center">No courses enrolled</p></div>';
                return;
            }

            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'col-md-6 col-lg-4 mb-3';
                courseCard.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">${course.name || 'Course Name'}</h6>
                            <p class="card-text text-muted">${course.description || 'No description available'}</p>
                            <small class="text-muted">Course ID: ${course.courseId || 'N/A'}</small>
                        </div>
                    </div>
                `;
                coursesList.appendChild(courseCard);
            });
        }

        function generateTimetable(courses) {
            const tbody = document.getElementById('timetableBody');
            tbody.innerHTML = '';

            // Time slots (assuming standard college schedule)
            const timeSlots = [
                '8:00 AM - 9:00 AM',
                '9:00 AM - 10:00 AM',
                '10:00 AM - 11:00 AM',
                '11:00 AM - 12:00 PM',
                '12:00 PM - 1:00 PM',
                '1:00 PM - 2:00 PM',
                '2:00 PM - 3:00 PM',
                '3:00 PM - 4:00 PM',
                '4:00 PM - 5:00 PM'
            ];

            // Days of the week
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

            // Create schedule matrix
            const schedule = {};
            timeSlots.forEach(time => {
                schedule[time] = {};
                days.forEach(day => {
                    schedule[time][day] = null;
                });
            });

            // Populate schedule with courses (dummy data for now)
            // In a real app, courses would have schedule information
            if (courses.length > 0) {
                // Example: Assign first course to Monday 9 AM
                if (courses[0]) {
                    schedule['9:00 AM - 10:00 AM']['monday'] = courses[0];
                }
                // Assign second course to Wednesday 11 AM
                if (courses[1]) {
                    schedule['11:00 AM - 12:00 PM']['wednesday'] = courses[1];
                }
                // Assign third course to Friday 2 PM
                if (courses[2]) {
                    schedule['2:00 PM - 3:00 PM']['friday'] = courses[2];
                }
            }

            // Generate table rows
            timeSlots.forEach(time => {
                const row = document.createElement('tr');
                row.innerHTML = `<td class="time-column">${time}</td>`;

                days.forEach(day => {
                    const course = schedule[time][day];
                    if (course) {
                        row.innerHTML += `
                            <td class="course-cell">
                                <div class="course-name">${course.name || 'Course'}</div>
                                <div class="course-details">${course.courseId || 'N/A'}</div>
                            </td>
                        `;
                    } else {
                        row.innerHTML += `<td class="course-cell empty">-</td>`;
                    }
                });

                tbody.appendChild(row);
            });
        }

        // Semester selector functionality
        document.querySelectorAll('.semester-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                // In a real app, you would fetch schedule for the selected semester
                console.log('Selected semester:', this.dataset.semester);
            });
        });

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentName');
            window.location.href = '/public/Login/login.html';
        });
