 let currentStep = 1;
        let studentId = null;

        // Step management functions
        function showStep(step) {
            // Hide all steps
            document.getElementById('step1Content').style.display = 'none';
            document.getElementById('step2Content').style.display = 'none';
            document.getElementById('step3Content').style.display = 'none';
            
            // Show current step
            document.getElementById(`step${step}Content`).style.display = 'block';
            
            // Update step indicators
            document.querySelectorAll('.step').forEach((stepEl, index) => {
                stepEl.classList.remove('active', 'completed');
                if (index + 1 < step) {
                    stepEl.classList.add('completed');
                } else if (index + 1 === step) {
                    stepEl.classList.add('active');
                }
            });
            
            currentStep = step;
        }

        // Step 1: Send OTP
        document.getElementById('sendOtpBtn').addEventListener('click', async function() {
            const email = document.getElementById('email').value;
            const sendOtpBtn = this;
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            if (!email) {
                showAlert('Please enter your email address', 'danger');
                return;
            }
            
            // Show loading state
            sendOtpBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            
            // Hide previous alerts
            alertMessage.style.display = 'none';
            
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/forget-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('OTP sent successfully! Please check your email.', 'success');
                    showStep(2);
                } else {
                    showAlert(data.message || 'Failed to send OTP. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Send OTP error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            } finally {
                // Hide loading state
                sendOtpBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });

        // Step 2: Verify OTP
        document.getElementById('verifyOtpBtn').addEventListener('click', async function() {
            const otp = document.getElementById('otp').value;
            const verifyOtpBtn = this;
            const verifySpinner = document.getElementById('verifySpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            if (!otp || otp.length !== 6) {
                showAlert('Please enter a valid 6-digit OTP', 'danger');
                return;
            }
            
            // Show loading state
            verifyOtpBtn.disabled = true;
            verifySpinner.style.display = 'inline-block';
            
            // Hide previous alerts
            alertMessage.style.display = 'none';
            
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ otp })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    studentId = data.studentId;
                    showAlert('OTP verified successfully!', 'success');
                    showStep(3);
                } else {
                    showAlert(data.message || 'Invalid OTP. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Verify OTP error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            } finally {
                // Hide loading state
                verifyOtpBtn.disabled = false;
                verifySpinner.style.display = 'none';
            }
        });

        // Step 3: Reset Password
        document.getElementById('resetPasswordBtn').addEventListener('click', async function() {
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const resetPasswordBtn = this;
            const resetSpinner = document.getElementById('resetSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            if (!newPassword || !confirmNewPassword) {
                showAlert('Please fill in all fields', 'danger');
                return;
            }
            
            if (newPassword !== confirmNewPassword) {
                showAlert('Passwords do not match', 'danger');
                return;
            }
            
            if (newPassword.length < 6) {
                showAlert('Password must be at least 6 characters long', 'danger');
                return;
            }
            
            // Show loading state
            resetPasswordBtn.disabled = true;
            resetSpinner.style.display = 'inline-block';
            
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
                        confirmedPassword: confirmNewPassword
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('Password reset successfully! You can now login with your new password.', 'success');
                    
                    // Redirect to login after delay
                    setTimeout(() => {
                        window.location.href = '../login/login.html';
                    }, 3000);
                } else {
                    showAlert(data.message || 'Failed to reset password. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Reset password error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            } finally {
                // Hide loading state
                resetPasswordBtn.disabled = false;
                resetSpinner.style.display = 'none';
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

        // Auto-focus on OTP input when step 2 is shown
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('otp').addEventListener('input', function() {
                if (this.value.length === 6) {
                    document.getElementById('verifyOtpBtn').click();
                }
            });
        });
