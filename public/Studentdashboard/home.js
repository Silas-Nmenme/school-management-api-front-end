 // Role-based access check and load student data
        document.addEventListener('DOMContentLoaded', async function() {
            const userRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('token');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = 'login.html';
                return;
            }

            // Fetch student details from API
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const responseData = await response.json();
                    const profile = responseData.profile;
                    const studentName = `${profile.Firstname || ''} ${profile.Lastname || ''}`.trim() || 'Student';
                    const studentId = profile.studentId || 'N/A';

                    // Set student name and ID
                    document.getElementById('studentName').textContent = studentName;
                    document.querySelector('.student-info small').textContent = `Student ID: ${studentId}`;
                    document.querySelector('.card-header h5').innerHTML = `<i class="fas fa-home me-2"></i>Welcome, ${studentName}!`;
                } else {
                    throw new Error('Failed to fetch student data');
                }
            } catch (error) {
                console.error('Error fetching student data:', error);
                // Fallback to localStorage or dummy data
                const studentName = localStorage.getItem('studentName') || 'John Doe';
                document.getElementById('studentName').textContent = studentName;
                document.querySelector('.card-header h5').innerHTML = `<i class="fas fa-home me-2"></i>Welcome, ${studentName}!`;
                alert('Unable to load student details. Using cached data.');
            }
        });

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentName');
            window.location.href = 'login.html';
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('.navbar-nav .nav-link, .btn[href^="#"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('href');
                if (target.startsWith('#')) {
                    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Fetch exams from API
        async function fetchExams() {
            const token = localStorage.getItem('token');
            const examsList = document.getElementById('examsList');
            const noExamsMessage = document.getElementById('noExamsMessage');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/exams', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const exams = data.exams;

                    if (exams && exams.length > 0) {
                        // Clear loading message
                        examsList.innerHTML = '';

                        // Display each exam
                        exams.forEach(exam => {
                            const examDiv = document.createElement('div');
                            examDiv.className = 'deadline';
                            examDiv.innerHTML = `
                                <strong>${exam.name || 'Exam'}</strong><br>
                                <small class="text-muted">Date: ${exam.date || 'TBA'}</small>
                            `;
                            examsList.appendChild(examDiv);
                        });
                    } else {
                        // No exams registered
                        examsList.style.display = 'none';
                        noExamsMessage.style.display = 'block';
                    }
                } else if (response.status === 404) {
                    examsList.innerHTML = '<p class="text-muted">Student not found.</p>';
                } else {
                    throw new Error('Failed to fetch exams');
                }
            } catch (error) {
                console.error('Error fetching exams:', error);
                examsList.innerHTML = '<p class="text-danger">Unable to load exams. Please try again later.</p>';
            }
        }

        // Call fetchExams when DOM is loaded
        fetchExams();

        // Helper function to extract meaningful activity details
        function extractActivityDetails(activity) {
            // Handle string format
            if (typeof activity === 'string') {
                return activity.trim() || 'Activity recorded';
            }
            
            // Handle object format
            if (typeof activity === 'object' && activity !== null) {
                // First, check for direct descriptive fields
                const directFields = ['description', 'message', 'text', 'activity', 'activityText', 'details'];
                for (const field of directFields) {
                    if (activity[field] && typeof activity[field] === 'string' && activity[field].trim()) {
                        return activity[field].trim();
                    }
                }
                
                // Check for type-based descriptions
                const type = (activity.type || activity.activityType || '').toLowerCase();
                const courseName = activity.courseName || activity.course?.name || activity.course || '';
                const gradeValue = activity.grade || activity.gradeValue || activity.grade?.grade || '';
                const gradeSubject = activity.subject || activity.course || '';
                const examName = activity.examName || activity.exam?.name || activity.exam || '';
                const assignmentName = activity.assignmentName || activity.assignment?.name || activity.assignment || '';
                const fileName = activity.fileName || activity.file || '';
                
                if (type === 'enrollment' || type === 'enrolled' || type.includes('enroll')) {
                    if (courseName && typeof courseName === 'string' && courseName.trim()) {
                        return `Enrolled in ${courseName.trim()}`;
                    }
                    return 'Course enrollment';
                }
                
                if (type === 'grade' || type === 'grades' || type.includes('grade')) {
                    if (gradeValue && gradeSubject && typeof gradeSubject === 'string' && gradeSubject.trim()) {
                        return `Grade ${gradeValue} received for ${gradeSubject.trim()}`;
                    }
                    if (gradeValue) {
                        return `Grade posted: ${gradeValue}`;
                    }
                    if (gradeSubject && typeof gradeSubject === 'string' && gradeSubject.trim()) {
                        return `Grade posted for ${gradeSubject.trim()}`;
                    }
                    return 'Grade update';
                }
                
                if (type === 'exam' || type === 'exam registration' || type.includes('exam')) {
                    if (examName && typeof examName === 'string' && examName.trim()) {
                        return `Registered for exam: ${examName.trim()}`;
                    }
                    return 'Exam registration';
                }
                
                if (type === 'assignment' || type === 'submission' || type.includes('assignment')) {
                    if (assignmentName && typeof assignmentName === 'string' && assignmentName.trim()) {
                        return `Assignment submitted: ${assignmentName.trim()}`;
                    }
                    return 'Assignment submission';
                }
                
                if (type === 'login' || type === 'signin' || type.includes('login')) {
                    return 'Logged into the system';
                }
                
                if (type === 'logout' || type === 'signout' || type.includes('logout')) {
                    return 'Logged out of the system';
                }
                
                if (type === 'download' || type.includes('download')) {
                    if (fileName && typeof fileName === 'string' && fileName.trim()) {
                        return `Downloaded: ${fileName.trim()}`;
                    }
                    return 'File downloaded';
                }
                
                // Try to get values from remaining fields
                const meaningfulParts = [];
                const fieldsToSkip = ['action', 'timestamp', 'details', 'ID', 'id', '__v', '_id', 'studentId', 'updatedAt', 'createdAt', 'actionType', 'type', 'activityType'];
                
                for (const [key, value] of Object.entries(activity)) {
                    // Skip unwanted fields
                    if (fieldsToSkip.includes(key)) {
                        continue;
                    }
                    
                    // Skip if value is just an ID (24-character hex string or numeric ID)
                    if (typeof value === 'string' && (/^[0-9a-fA-F]{24}$/.test(value) || /^\d+$/.test(value))) {
                        continue;
                    }
                    
                    // Skip empty values
                    if (!value) {
                        continue;
                    }
                    
                    // Add meaningful string values
                    if (typeof value === 'string' && value.trim()) {
                        meaningfulParts.push(value.trim());
                    } else if (typeof value === 'number') {
                        meaningfulParts.push(value.toString());
                    }
                }
                
                if (meaningfulParts.length > 0) {
                    return meaningfulParts.join(' - ');
                }
                
                // Fallback
                return 'Activity recorded';
            }
            
            return 'Activity recorded';
        }

        // Fetch recent activity from API
        async function fetchRecentActivity() {
            const token = localStorage.getItem('token');
            const recentActivityList = document.getElementById('recentActivityList');
            const noActivityMessage = document.getElementById('noActivityMessage');

            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/recent-activity', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const recentActivity = data.recentActivity;

                    if (recentActivity && recentActivity.length > 0) {
                        // Clear loading message
                        recentActivityList.innerHTML = '';

                        // Display each activity
                        recentActivity.forEach(activity => {
                            const li = document.createElement('li');
                            const activityText = extractActivityDetails(activity);
                            li.innerHTML = activityText;
                            recentActivityList.appendChild(li);
                        });
                    } else {
                        // No recent activity
                        recentActivityList.style.display = 'none';
                        noActivityMessage.style.display = 'block';
                    }
                } else if (response.status === 404) {
                    recentActivityList.innerHTML = '<p class="text-muted">Student not found.</p>';
                } else {
                    throw new Error('Failed to fetch recent activity');
                }
            } catch (error) {
                console.error('Error getting recent activity:', error);
                recentActivityList.innerHTML = '<p class="text-danger">Unable to load recent activity. Please try again later.</p>';
            }
        }

        // Call fetchRecentActivity when DOM is loaded
        fetchRecentActivity();
