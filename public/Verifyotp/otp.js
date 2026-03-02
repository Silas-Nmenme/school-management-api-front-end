let countdownTimer = null;
        let timeLeft = 60;

        // Start countdown
        function startCountdown() {
            const countdownText = document.getElementById('countdownText');
            const countdown = document.getElementById('countdown');
            const resendOtp = document.getElementById('resendOtp');
            
            countdownText.style.display = 'none';
            countdown.style.display = 'block';
            resendOtp.style.pointerEvents = 'none';
            
            countdownTimer = setInterval(() => {
                timeLeft--;
                document.getElementById('countdownTimer').textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(countdownTimer);
                    countdownText.style.display = 'block';
                    countdown.style.display = 'none';
                    resendOtp.style.pointerEvents = 'auto';
                    timeLeft = 60;
                }
            }, 1000);
        }

        // Resend OTP
        document.getElementById('resendOtp').addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = localStorage.getItem('resetEmail');
            const alertMessage = document.getElementById('alertMessage');
            
            if (!email) {
                showAlert('Email not found. Please go back to forgot password page.', 'danger');
                return;
            }
            
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
                    showAlert('OTP resent successfully! Please check your email.', 'success');
                    startCountdown();
                } else {
                    showAlert(data.message || 'Failed to resend OTP. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Resend OTP error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            }
        });

        // Form submission
        document.getElementById('verifyOtpForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const otp = document.getElementById('otp').value;
            const verifyBtn = document.getElementById('verifyBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            if (!otp || otp.length !== 6) {
                showAlert('Please enter a valid 6-digit OTP', 'danger');
                return;
            }
            
            // Show loading state
            verifyBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            
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
                    // Store student ID for password reset
                    localStorage.setItem('studentId', data.studentId);
                    
                    showAlert('OTP verified successfully! Redirecting to password reset...', 'success');
                    
                    // Redirect to reset password page after delay
                    setTimeout(() => {
                        window.location.href = '../Resetpassword/reset.html';
                    }, 2000);
                } else {
                    showAlert(data.message || 'Invalid OTP. Please try again.', 'danger');
                }
            } catch (error) {
                console.error('Verify OTP error:', error);
                showAlert('Network error. Please check your connection and try again.', 'danger');
            } finally {
                // Hide loading state
                verifyBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });

        // Auto-focus and auto-submit on OTP input
        document.getElementById('otp').addEventListener('input', function() {
            // Remove any non-numeric characters
            this.value = this.value.replace(/\D/g, '');
            
            // Auto-submit when 6 digits are entered
            if (this.value.length === 6) {
                document.getElementById('verifyBtn').click();
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

        // Check for OTP in URL parameters (for demo purposes)
        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const otpFromUrl = urlParams.get('otp');
            const emailFromUrl = urlParams.get('email');
            
            if (otpFromUrl) {
                document.getElementById('otp').value = otpFromUrl;
                document.getElementById('otpDisplay').style.display = 'block';
                document.getElementById('otpCode').textContent = otpFromUrl;
            }
            
            if (emailFromUrl) {
                localStorage.setItem('resetEmail', emailFromUrl);
            }
            
            // Start countdown if email exists
            if (localStorage.getItem('resetEmail')) {
                startCountdown();
            }
        });
