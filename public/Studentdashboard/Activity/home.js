// Global activity data
        let allActivities = [];
        
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
                } else {
                    throw new Error('Failed to fetch student data');
                }
            } catch (error) {
                console.error('Error fetching student data:', error);
                // Fallback to localStorage or dummy data
                const studentName = localStorage.getItem('studentName') || 'John Doe';
                document.getElementById('studentName').textContent = studentName;
            }
            
            // Fetch full activity log
            fetchAllActivities();
        });

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentName');
            window.location.href = 'login.html';
        });

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
        
        // Fetch all activities from API
        async function fetchAllActivities() {
            const token = localStorage.getItem('token');
            const activityList = document.getElementById('activityList');
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
                    const activities = data.recentActivity;

                    if (activities && activities.length > 0) {
                        // Process activities
                        allActivities = activities.map(function(activity) {
                            // Extract meaningful text from activity
                            const activityText = extractActivityDetails(activity);
                            const activityType = (activity.type || activity.activityType || '').toLowerCase();
                            const activityTime = activity.time || activity.date || activity.timestamp || '';
                            
                            return {
                                text: activityText,
                                type: activityType,
                                time: activityTime
                            };
                        });
                        
                        displayActivities(allActivities);
                        updateStats(allActivities);
                    } else {
                        // No activities
                        activityList.style.display = 'none';
                        noActivityMessage.style.display = 'block';
                    }
                } else if (response.status === 404) {
                    activityList.innerHTML = '<p class="text-muted">Student not found.</p>';
                } else {
                    throw new Error('Failed to fetch activities');
                }
            } catch (error) {
                console.error('Error getting activities:', error);
                activityList.innerHTML = '<p class="text-danger">Unable to load activities. Please try again later.</p>';
            }
        }

        // Display activities in the list
        function displayActivities(activities) {
            const activityList = document.getElementById('activityList');
            const noActivityMessage = document.getElementById('noActivityMessage');
            
            if (activities.length === 0) {
                activityList.style.display = 'none';
                noActivityMessage.style.display = 'block';
                return;
            }
            
            activityList.style.display = 'block';
            noActivityMessage.style.display = 'none';
            activityList.innerHTML = '';
            
            activities.forEach(function(activity) {
                const div = document.createElement('div');
                
                // Determine icon and color based on activity type
                let iconClass = 'fa-info-circle';
                let iconColor = '#667eea';
                let borderClass = '';
                
                const type = activity.type ? activity.type.toLowerCase() : '';
                
                if (type === 'enrollment' || type === 'enrolled') {
                    iconClass = 'fa-check-circle';
                    iconColor = '#28a745';
                    borderClass = 'success';
                } else if (type === 'grade' || type === 'grades') {
                    iconClass = 'fa-chart-line';
                    iconColor = '#17a2b8';
                    borderClass = 'info';
                } else if (type === 'download') {
                    iconClass = 'fa-download';
                    iconColor = '#6c757d';
                    borderClass = '';
                } else if (type === 'login' || type === 'signin') {
                    iconClass = 'fa-sign-in-alt';
                    iconColor = '#17a2b8';
                    borderClass = 'info';
                } else if (type === 'logout' || type === 'signout') {
                    iconClass = 'fa-sign-out-alt';
                    iconColor = '#dc3545';
                    borderClass = 'danger';
                } else if (type === 'warning' || type === 'alert') {
                    iconClass = 'fa-exclamation-triangle';
                    iconColor = '#ffc107';
                    borderClass = 'warning';
                }
                
                div.className = 'activity-item ' + borderClass;
                div.innerHTML = '<div class="d-flex align-items-start">' +
                    '<i class="fas ' + iconClass + ' activity-icon" style="color: ' + iconColor + ';"></i>' +
                    '<div class="activity-content">' +
                    '<div class="activity-description">' + activity.text + '</div>' +
                    '</div></div>';
                activityList.appendChild(div);
            });
        }

        // Format activity type for display
        function formatActivityType(type) {
            if (!type) return 'Activity';
            
            const typeStr = type.toString().toLowerCase();
            
            if (typeStr === 'enrollment' || typeStr === 'enrolled') return 'Course Enrollment';
            if (typeStr === 'grade' || typeStr === 'grades') return 'Grade Update';
            if (typeStr === 'download') return 'File Download';
            if (typeStr === 'login' || typeStr === 'signin') return 'Login';
            if (typeStr === 'logout' || typeStr === 'signout') return 'Logout';
            
            // Capitalize first letter
            return type.charAt(0).toUpperCase() + type.slice(1);
        }

        // Update statistics
        function updateStats(activities) {
            document.getElementById('totalActivities').textContent = activities.length;
            
            let enrollments = 0;
            let grades = 0;
            
            activities.forEach(function(a) {
                const type = a.type ? a.type.toLowerCase() : '';
                if (type === 'enrollment' || type === 'enrolled') {
                    enrollments++;
                }
                if (type === 'grade' || type === 'grades') {
                    grades++;
                }
            });
            
            document.getElementById('enrollmentCount').textContent = enrollments;
            document.getElementById('gradeCount').textContent = grades;
        }

        // Filter button click handlers
        document.querySelectorAll('.filter-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                
                if (filter === 'all') {
                    displayActivities(allActivities);
                } else {
                    const filtered = allActivities.filter(function(activity) {
                        const type = activity.type ? activity.type.toLowerCase() : '';
                        return type === filter;
                    });
                    displayActivities(filtered);
                }
            });
        });