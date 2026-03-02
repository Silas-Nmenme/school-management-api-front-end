// Password strength checker
        function checkPasswordStrength(password) {
            let strength = 0;
            const feedback = document.getElementById('passwordStrength');
            
            if (password.length >= 6) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            feedback.style.display = 'block';
            if (strength < 2) {
                feedback.textContent = 'Weak password';
                feedback.className = 'password-strength weak';
            } else if (strength < 4) {
                feedback.textContent = 'Medium strength password';
                feedback.className = 'password-strength medium';
            } else {
                feedback.textContent = 'Strong password';
                feedback.className = 'password-strength strong';
            }
        }

        // Password confirmation validation
        function validatePasswordMatch() {
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const matchFeedback = document.getElementById('passwordMatch');
            
            if (confirmPassword && password !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('is-invalid');
                matchFeedback.style.display = 'block';
                return false;
            } else {
                document.getElementById('confirmPassword').classList.remove('is-invalid');
                matchFeedback.style.display = 'none';
                return true;
            }
        }

        // Password toggle functionality
        document.getElementById('toggleNewPassword').addEventListener('click', function() {
            const passwordField = document.getElementById('newPassword');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });

        document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
            const passwordField = document.getElementById('confirmPassword');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });

        // Event listeners
        document.getElementById('newPassword').addEventListener('input', function() {
            checkPasswordStrength(this.value);
            validatePasswordMatch();
        });

        document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);

        // Form submission
        document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const resetBtn = document.getElementById('resetBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            // Validate password match
            if (!validatePasswordMatch()) {
                return;
            }
            
            if (newPassword.length < 6) {
                showAlert('Password must be at least 6 characters long', 'danger');
                return;
            }
            
            const studentId = localStorage.getItem('studentId');
            if (!studentId) {
                showAlert('Session expired. Please start the password reset process again.', 'danger');
                setTimeout(() => {
                    window.location.href = '../Forgotpassword/forgot.html';
                }, 3000);
                return;
            }
            
            // Show loading state
            resetBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            
            // Hide previous alerts
            alertMessage.style.display = 'none';
            
            try {
                const response = await fetch(`https://school-management-api-zeta-two.vercel.app/api/students/reset-password/${studentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        newPassword: newPassword,
                        confirmedPassword: confirmPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Clear stored data
                    localStorage.removeItem('studentId');
                    localStorage.removeItem('resetEmail');
                    
                    showAlert('Password reset successfully! You can now login with your new password.', 'success');
                    
                    // Redirect to login after delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
                } else {
                    showAlert(data.message || 'Failed to reset password. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            } finally {
                // Hide loading state
                resetBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });

        // Utility function to show alerts
        function showAlert(message, type) {
            const alertMessage = document.getElementById('alertMessage');
            alertMessage.className = `alert alert-${type}`;
            alertMessage.textContent = message;
            alertMessage.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                alertMessage.style.display = 'none';
            }, 5000);
        }

        // Check if user has valid session
        document.addEventListener('DOMContentLoaded', function() {
            const studentId = localStorage.getItem('studentId');
            if (!studentId) {
                showAlert('Please complete the OTP verification first.', 'danger');
                setTimeout(() => {
                    window.location.href = '../Forgotpassword/forgot.html';
                }, 3000);
            }
        });