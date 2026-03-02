 // Get staffId from URL parameters
        function getStaffIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('staffId');
        }

        // Check if user is authenticated
        function checkAuthentication() {
            const token = localStorage.getItem('token');
            const staffId = getStaffIdFromURL();

            if (!token || !staffId) {
                window.location.href = 'login.html';
            }
        }

        // Password strength checker
        function checkPasswordStrength(password) {
            let strength = 0;
            const feedback = document.getElementById('passwordStrength');
            const meter = document.getElementById('strengthMeterFill');

            if (password.length >= 6) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            feedback.style.display = 'block';
            meter.className = 'strength-meter-fill';

            if (strength < 2) {
                feedback.textContent = '⚠️ Weak password';
                feedback.className = 'password-strength weak';
                meter.classList.add('weak');
            } else if (strength < 4) {
                feedback.textContent = '⚠️ Medium strength password';
                feedback.className = 'password-strength medium';
                meter.classList.add('medium');
            } else {
                feedback.textContent = '✓ Strong password';
                feedback.className = 'password-strength strong';
                meter.classList.add('strong');
            }
        }

        // Password confirmation validation
        function validatePasswordMatch() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const matchFeedback = document.getElementById('passwordMatch');

            if (confirmPassword && newPassword !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('is-invalid');
                matchFeedback.style.display = 'block';
                return false;
            } else {
                document.getElementById('confirmPassword').classList.remove('is-invalid');
                matchFeedback.style.display = 'none';
                return true;
            }
        }

        // Event listeners
        document.getElementById('newPassword').addEventListener('input', function() {
            checkPasswordStrength(this.value);
            validatePasswordMatch();
        });

        document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);

        // Form submission
        document.getElementById('changePasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const changePasswordBtn = document.getElementById('changePasswordBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            const token = localStorage.getItem('token');
            const staffId = getStaffIdFromURL();

            // Validate password match
            if (!validatePasswordMatch()) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Passwords do not match. Please try again.';
                alertMessage.style.display = 'block';
                return;
            }

            const newPassword = document.getElementById('newPassword').value;

            // Validate password length
            if (newPassword.length < 6) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Password must be at least 6 characters long.';
                alertMessage.style.display = 'block';
                return;
            }

            // Show loading state
            changePasswordBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';

            // Hide previous alerts
            alertMessage.style.display = 'none';

            try {
                const response = await fetch(`https://school-management-api-zeta-two.vercel.app/api/staff/${staffId}/change-password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        newPassword: newPassword
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    alertMessage.className = 'alert alert-success';
                    alertMessage.innerHTML = `
                        <strong><i class="fas fa-check-circle me-2"></i>Password Changed Successfully!</strong><br>
                        Your password has been updated. You will be redirected to the dashboard in a few seconds...
                    `;
                    alertMessage.style.display = 'block';

// Redirect to appropriate dashboard after delay
                    setTimeout(() => {
                        // Determine dashboard based on role (you can store role in localStorage)
                        const userRole = localStorage.getItem('userRole') || 'staff';
                        if (userRole === 'admin') {
                            window.location.href = '../Admindashboard/admin_dashboard.html';
                        } else {
                            window.location.href = '../Staffdashboard/staff_dashboard.html';
                        }
                    }, 3000);
                } else {
                    // Show error message
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.textContent = data.message || 'Failed to change password. Please try again.';
                    alertMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Password change error:', error);
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Network error. Please check your connection and try again.';
                alertMessage.style.display = 'block';
            } finally {
                // Hide loading state
                changePasswordBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });

        // Check authentication on page load
        window.addEventListener('DOMContentLoaded', checkAuthentication);
