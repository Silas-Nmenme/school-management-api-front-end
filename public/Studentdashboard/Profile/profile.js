let currentProfileData = {};

        // Authentication check
        document.addEventListener('DOMContentLoaded', function() {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');
            
            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = 'login.html';
                return;
            }
            
            loadProfile();
        });

        // Load profile data
        async function loadProfile() {
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    displayProfile(data.profile);
                } else {
                    throw new Error('Failed to load profile');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                showAlert('Failed to load profile. Please try again.', 'danger');
            }
        }

        // Display profile information
        function displayProfile(profile) {
            currentProfileData = profile;
            
            document.getElementById('studentName').textContent = `${profile.Firstname} ${profile.Lastname}`;
            document.getElementById('studentId').textContent = `Student ID: ${profile.studentId}`;
            document.getElementById('studentEmail').textContent = profile.email;
            document.getElementById('studentAge').textContent = profile.age;
            document.getElementById('studentPhone').textContent = profile.phone;
            
            // Populate edit form
            document.getElementById('editFirstName').value = profile.Firstname;
            document.getElementById('editLastName').value = profile.Lastname;
            document.getElementById('editAge').value = profile.age;
            document.getElementById('editPhone').value = profile.phone;
        }

        // Show edit form
        document.getElementById('editProfileBtn').addEventListener('click', function() {
            document.getElementById('profileDisplayCard').style.display = 'none';
            document.getElementById('editProfileCard').style.display = 'block';
        });

        // Cancel edit
        document.getElementById('cancelEditBtn').addEventListener('click', function() {
            document.getElementById('editProfileCard').style.display = 'none';
            document.getElementById('profileDisplayCard').style.display = 'block';
            hideAlert();
        });

        // Update profile
        document.getElementById('editProfileForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const updateBtn = document.getElementById('updateProfileBtn');
            const updateSpinner = document.getElementById('updateSpinner');
            
            updateBtn.disabled = true;
            updateSpinner.style.display = 'inline-block';
            hideAlert();
            
            const formData = new FormData(this);
            const updateData = {
                Firstname: formData.get('Firstname'),
                Lastname: formData.get('Lastname'),
                age: formData.get('age'),
                phone: formData.get('phone')
            };
            
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('Profile updated successfully!', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    showAlert(data.message || 'Failed to update profile', 'danger');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                showAlert('Network error. Please try again.', 'danger');
            } finally {
                updateBtn.disabled = false;
                updateSpinner.style.display = 'none';
            }
        });

        // Utility functions
        function showAlert(message, type) {
            const alertDiv = document.getElementById('editAlert');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;
            alertDiv.style.display = 'block';
        }

        function hideAlert() {
            document.getElementById('editAlert').style.display = 'none';
        }
