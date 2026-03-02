 // Role-based access check and load student data
        document.addEventListener('DOMContentLoaded', async function() {
            const userRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('token');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = '../Login/login.html';
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

            // Fetch grades
            try {
                const gradesResponse = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/grades', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (gradesResponse.ok) {
                    const gradesData = await gradesResponse.json();
                    const grades = gradesData.grades || [];
                    displayGrades(grades);
                    calculateGPA(grades);
                } else {
                    document.getElementById('gradesTableBody').innerHTML = '<tr><td colspan="6" class="text-center">No grades available</td></tr>';
                }
            } catch (error) {
                console.error('Error fetching grades:', error);
                document.getElementById('gradesTableBody').innerHTML = '<tr><td colspan="6" class="text-center">Error loading grades</td></tr>';
            }
        });

        function displayGrades(grades) {
            const tbody = document.getElementById('gradesTableBody');
            tbody.innerHTML = '';

            if (grades.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No grades available</td></tr>';
                return;
            }

            grades.forEach(grade => {
                const row = document.createElement('tr');
                const gradeClass = getGradeClass(grade.grade);
                const gradePoints = getGradePoints(grade.grade);

                row.innerHTML = `
                    <td>${grade.courseCode || 'N/A'}</td>
                    <td>${grade.courseName || 'N/A'}</td>
                    <td>${grade.credits || 3}</td>
                    <td class="${gradeClass}">${grade.grade || 'N/A'}</td>
                    <td>${gradePoints}</td>
                    <td>${grade.semester || 'N/A'}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function calculateGPA(grades) {
            if (grades.length === 0) return;

            let totalPoints = 0;
            let totalCredits = 0;

            grades.forEach(grade => {
                const credits = grade.credits || 3;
                const points = getGradePoints(grade.grade);
                totalPoints += points * credits;
                totalCredits += credits;
            });

            const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
            document.getElementById('currentGPA').textContent = gpa;
            document.getElementById('totalCredits').textContent = totalCredits;
        }

        function getGradePoints(grade) {
            const gradeMap = {
                'A': 4.0, 'A-': 3.7,
                'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                'D+': 1.3, 'D': 1.0,
                'F': 0.0
            };
            return gradeMap[grade] || 0;
        }

        function getGradeClass(grade) {
            if (!grade) return '';
            const firstChar = grade.charAt(0);
            return `grade-${firstChar}`;
        }

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentName');
            window.location.href = '../Login/login.html';
        });
