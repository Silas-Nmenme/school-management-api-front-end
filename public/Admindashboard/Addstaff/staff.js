// Password strength checker
        function checkStaffPasswordStrength(password) {
            let strength = 0;
            const feedback = document.getElementById('staffPasswordStrength');

            if (password.length >= 6) strength++;
            if (password.match(/[a-z]/)) strength++;
            if (password.match(/[A-Z]/)) strength++;
            if (password.match(/[0-9]/)) strength++;
            if (password.match(/[^a-zA-Z0-9]/)) strength++;

            if (!password) {
                feedback.style.display = 'none';
                return;
            }

            feedback.style.display = 'block';
            if (strength < 2) {
                feedback.textContent = '⚠️ Weak password';
                feedback.className = 'password-strength weak';
            } else if (strength < 4) {
                feedback.textContent = '⚠️ Medium strength password';
                feedback.className = 'password-strength medium';
            } else {
                feedback.textContent = '✓ Strong password';
                feedback.className = 'password-strength strong';
            }
        }

        // Password confirmation validation
        function validateStaffPasswordMatch() {
            const password = document.getElementById('staffPassword').value;
            const confirmPassword = document.getElementById('staffConfirmPassword').value;
            const matchFeedback = document.getElementById('staffPasswordMatch');
            const confirmField = document.getElementById('staffConfirmPassword');

            if (!confirmPassword) {
                confirmField.classList.remove('is-invalid');
                matchFeedback.style.display = 'none';
                return true;
            }

            if (password !== confirmPassword) {
                confirmField.classList.add('is-invalid');
                matchFeedback.style.display = 'block';
                return false;
            } else {
                confirmField.classList.remove('is-invalid');
                matchFeedback.style.display = 'none';
                return true;
            }
        }

        // Event listeners
        document.getElementById('staffPassword').addEventListener('input', function() {
            checkStaffPasswordStrength(this.value);
            // Also check password match if confirm password has value
            if (document.getElementById('staffConfirmPassword').value) {
                validateStaffPasswordMatch();
            }
        });

        document.getElementById('staffConfirmPassword').addEventListener('input', validateStaffPasswordMatch);

        // Form submission
        document.getElementById('staffForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const registerBtn = document.getElementById('staffRegisterBtn');
            const loadingSpinner = document.getElementById('staffLoadingSpinner');
            const alertMessage = document.getElementById('alertMessage');

            // Validate password match first
            if (!validateStaffPasswordMatch()) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Passwords do not match. Please try again.';
                alertMessage.style.display = 'block';
                return;
            }

            const firstName = document.getElementById('staffFirstName').value.trim();
            const lastName = document.getElementById('staffLastName').value.trim();
            const email = document.getElementById('staffEmail').value.trim();
            const phone = document.getElementById('staffPhone').value.trim();
            const role = document.getElementById('staffRole').value.trim();
            const department = document.getElementById('staffDepartment').value.trim();
            const salary = document.getElementById('staffSalary').value;
            const password = document.getElementById('staffPassword').value;

            // Validate all required fields
            if (!firstName || !lastName || !email || !phone || !password || !role || !department) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Please fill in all required fields (marked with *)';
                alertMessage.style.display = 'block';
                return;
            }

            // Validate password length
            if (password.length < 6) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Password must be at least 6 characters long.';
                alertMessage.style.display = 'block';
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.textContent = 'Please enter a valid email address.';
                alertMessage.style.display = 'block';
                return;
            }

            // Show loading state
            registerBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';

            // Hide previous alerts
            alertMessage.style.display = 'none';

            try {
                // Build registration data - only send fields that backend expects
                const registrationData = {
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phone: phone,
                    password: password,
                    role: role,
                    department: department
                };

                // Only add salary if it has a value
                if (salary) {
                    registrationData.salary = parseFloat(salary);
                }

                console.log('Sending staff registration data:', registrationData);

                const token = localStorage.getItem('token');

                if (!token) {
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.innerHTML = '<strong>Error:</strong> Authentication token not found. Please log in again.';
                    alertMessage.style.display = 'block';
                    registerBtn.disabled = false;
                    loadingSpinner.style.display = 'none';
                    return;
                }

                console.log('Using token:', token.substring(0, 20) + '...');

                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/admin/add-staff', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(registrationData)
                });

                console.log('Response status:', response.status);
                console.log('Response headers:', response.headers);

                // Check if response is actually JSON
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    const text = await response.text();
                    console.error('Non-JSON response:', text.substring(0, 200));
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.innerHTML = `<strong>Error:</strong> Server returned an invalid response. The API endpoint may be down or unavailable. Status: ${response.status}`;
                    alertMessage.style.display = 'block';
                    registerBtn.disabled = false;
                    loadingSpinner.style.display = 'none';
                    return;
                }

                console.log('Response data:', data);

                if (response.ok && response.status === 201) {
                    // Success - Staff member created
                    const staffId = data.staffId;
                    
                    alertMessage.className = 'alert alert-success';
                    alertMessage.innerHTML = `
                        <strong><i class="fas fa-check-circle me-2"></i>Staff Member Added Successfully!</strong><br>
                        <strong>${firstName} ${lastName}</strong> has been created as a staff member.<br>
                        <small style="display: block; margin-top: 10px;">
                            <i class="fas fa-envelope me-2"></i><strong>Next Steps:</strong><br>
                            • A welcome email with temporary login credentials has been sent to <strong>${email}</strong><br>
                            • Staff member must log in and change their password on first login<br>
                            • Staff ID: <code>${staffId}</code>
                        </small><br>
                        <small style="margin-top: 10px; display: block;">You will be redirected to dashboard in 5 seconds...</small>
                    `;
                    alertMessage.style.display = 'block';

                    // Redirect to dashboard after delay
                    setTimeout(() => {
                        window.location.href = 'admin_dashboard.html';
                    }, 5000);
                } else {
                    // Error response
                    const errorMessage = data.message || 'Staff registration failed. Please try again.';
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.innerHTML = `<strong>Error (${response.status}):</strong> ${errorMessage}`;
                    alertMessage.style.display = 'block';
                    
                    console.error('Backend error:', data);
                }
            } catch (error) {
                console.error('Staff registration error:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                alertMessage.className = 'alert alert-danger';
                alertMessage.innerHTML = `<strong>Error:</strong> ${error.message}. Please check the console for more details.`;
                alertMessage.style.display = 'block';
            } finally {
                // Hide loading state
                registerBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });
