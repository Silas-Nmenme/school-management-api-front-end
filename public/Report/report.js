const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api/admin'; // Adjust based on your backend URL
        const token = localStorage.getItem('token');

        // Role-based access check
        document.addEventListener('DOMContentLoaded', function() {
            const userRole = localStorage.getItem('userRole');
            
            if (!token || userRole !== 'admin') {
                alert('Access denied. Please log in as an admin.');
                window.location.href = '../Login/login.html';
            }
        });

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '../Login/login.html';
        });

        // Function to show specific report section
        function showReport(type) {
            // Hide all report sections
            document.querySelectorAll('.report-section').forEach(section => {
                section.classList.remove('active');
            });
            // Show selected report section
            document.getElementById(type + 'Report').classList.add('active');
        }

        // Function to generate student report
        async function generateStudentReport() {
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
                    const students = data.students || [];
                    const totalStudents = students.length;
                    const studentsByAge = groupStudentsByAge(students);

                    let html = `<h6>Total Students: ${totalStudents}</h6>`;
                    html += '<h6>Students by Age:</h6><ul class="list-group mb-3">';
                    studentsByAge.forEach(group => {
                        html += `<li class="list-group-item">Age ${group._id}: ${group.count}</li>`;
                    });
                    html += '</ul>';

                    html += '<h6>Student List:</h6><table class="table table-striped"><thead><tr><th>Name</th><th>Email</th><th>Age</th></tr></thead><tbody>';
                    students.forEach(student => {
                        html += `<tr><td>${student.Firstname || 'N/A'} ${student.Lastname || 'N/A'}</td><td>${student.email}</td><td>${student.age || 'N/A'}</td></tr>`;
                    });
                    html += '</tbody></table>';

                    document.getElementById('studentReportData').innerHTML = html;
                } else {
                    document.getElementById('studentReportData').innerHTML = `<p class="text-danger">Error: ${data.message}</p>`;
                }
            } catch (error) {
                document.getElementById('studentReportData').innerHTML = '<p class="text-danger">Error generating student report.</p>';
                console.error('Error fetching students:', error);
            }
        }

        // Function to generate course report
        async function generateCourseReport() {
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
                    const courses = data.courses || [];
                    const totalCourses = courses.length;
                    
                    let html = `<h6>Total Courses: ${totalCourses}</h6>`;
                    html += '<table class="table table-striped"><thead><tr><th>ID</th><th>Name</th><th>Instructor</th><th>Max Students</th><th>Duration</th></tr></thead><tbody>';
                    courses.forEach(course => {
                        const instructorName = course.instructor && typeof course.instructor === 'object' ? course.instructor.name : (course.instructor || 'N/A');
                        html += `<tr><td>${course.courseId}</td><td>${course.name}</td><td>${instructorName}</td><td>${course.maxStudents}</td><td>${course.duration}</td></tr>`;
                    });
                    html += '</tbody></table>';
                    
                    document.getElementById('courseReportData').innerHTML = html;
                } else {
                    document.getElementById('courseReportData').innerHTML = `<p class="text-danger">Error: ${data.message}</p>`;
                }
            } catch (error) {
                document.getElementById('courseReportData').innerHTML = '<p class="text-danger">Error generating course report.</p>';
                console.error('Error fetching courses:', error);
            }
        }

        // Function to generate staff report
        async function generateStaffReport() {
            try {
                const response = await fetch(`${API_BASE_URL}/get-all-staff`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    const staff = data.staff || [];
                    const totalStaff = staff.length;
                    
                    let html = `<h6>Total Staff: ${totalStaff}</h6>`;
                    html += '<table class="table table-striped"><thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead><tbody>';
                    staff.forEach(member => {
                        html += `<tr><td>${member.Firstname || 'N/A'} ${member.Lastname || 'N/A'}</td><td>${member.email}</td><td>${member.role}</td></tr>`;
                    });
                    html += '</tbody></table>';
                    
                    document.getElementById('staffReportData').innerHTML = html;
                } else {
                    document.getElementById('staffReportData').innerHTML = `<p class="text-danger">Error: ${data.message}</p>`;
                }
            } catch (error) {
                document.getElementById('staffReportData').innerHTML = '<p class="text-danger">Error generating staff report.</p>';
                console.error('Error fetching staff:', error);
            }
        }

        // Function to generate overview report
        async function generateOverviewReport() {
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

                const studentData = await studentResponse.json();
                const courseData = await courseResponse.json();
                const staffData = await staffResponse.json();

                let html = '<h6>System Overview:</h6><ul class="list-group">';
                if (studentResponse.ok) {
                    const totalStudents = studentData.students ? studentData.students.length : 0;
                    html += `<li class="list-group-item">Total Students: ${totalStudents}</li>`;
                } else {
                    html += '<li class="list-group-item text-danger">Error loading student data</li>';
                }

                if (courseResponse.ok) {
                    const totalCourses = courseData.courses ? courseData.courses.length : 0;
                    html += `<li class="list-group-item">Total Courses: ${totalCourses}</li>`;
                } else {
                    html += '<li class="list-group-item text-danger">Error loading course data</li>';
                }

                if (staffResponse.ok) {
                    const totalStaff = staffData.staff ? staffData.staff.length : 0;
                    html += `<li class="list-group-item">Total Staff: ${totalStaff}</li>`;
                } else {
                    html += '<li class="list-group-item text-danger">Error loading staff data</li>';
                }
                html += '</ul>';

                document.getElementById('overviewReportData').innerHTML = html;
            } catch (error) {
                document.getElementById('overviewReportData').innerHTML = '<p class="text-danger">Error generating overview report.</p>';
                console.error('Error fetching overview data:', error);
            }
        }

        // Helper function to group students by age
        function groupStudentsByAge(students) {
            const ageGroups = {};
            students.forEach(student => {
                const age = student.age || 'Unknown';
                if (!ageGroups[age]) {
                    ageGroups[age] = 0;
                }
                ageGroups[age]++;
            });
            return Object.keys(ageGroups).map(age => ({ _id: age, count: ageGroups[age] }));
        }
