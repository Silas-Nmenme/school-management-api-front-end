 // ==========================================
        // LOGIN FUNCTIONALITY
        // Supports Student, Admin, and Staff login
        // ==========================================

        // API Configuration
        const API_CONFIG = {
            // Set this to your API base URL if served from a sub-path
            // e.g., const apiBase = '/api' or const apiBase = '/student-api'
            base: 'https://school-management-api-zeta-two.vercel.app',
            
            // Endpoint base paths for each role (each router mounts a '/login' endpoint)
            endpoints: {
                student: '/api/students',
                admin: '/api/admin',
                staff: '/api/staff'
            },
            
            // Dashboard redirects for each role
            dashboards: {
                student: 'student_dashboard.html',
                admin: 'admin_dashboard.html',
                staff: 'staff_dashboard.html'
            }
        };

        // Build full API URL for login
        function getLoginEndpoint(role) {
            const endpoint = API_CONFIG.endpoints[role] || API_CONFIG.endpoints.student;
            return `${API_CONFIG.base}${endpoint}/login`;
        }

        // Get redirect URL based on role
        function getRedirectUrl(role) {
            return API_CONFIG.dashboards[role] || API_CONFIG.dashboards.student;
        }

        // Role selection functionality
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Password visibility toggle
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordField = document.getElementById('password');
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

        // Main login form submission handler
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginBtn = document.getElementById('loginBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            // Get selected role from active button
            const selectedRole = document.querySelector('.role-btn.active').dataset.role;
            
            // Validate role
            if (!selectedRole || !API_CONFIG.endpoints[selectedRole]) {
                showAlert('alert-danger', 'Invalid role selected. Please refresh and try again.');
                return;
            }
            
            // Show loading state
            loginBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            
            // Hide previous alerts
            alertMessage.style.display = 'none';
            
            try {
                // Get form data
                const formData = new FormData(this);
                const email = formData.get('email');
                const password = formData.get('password');
                
                // Validate input
                if (!email || !password) {
                    showAlert('alert-danger', 'Please enter both email and password.');
                    return;
                }
                
                // Get the appropriate API endpoint for the selected role
                const apiEndpoint = getLoginEndpoint(selectedRole);
                console.log('Attempting login to:', apiEndpoint, 'for role:', selectedRole);
                
                // Make the login request
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                // Handle non-OK responses
                if (!response.ok) {
                    let errorMessage = `Login failed: ${response.status} ${response.statusText}`;
                    
                    try {
                        const errorData = await response.json();
                        if (errorData && errorData.message) {
                            errorMessage = errorData.message;
                        }
                    } catch (jsonError) {
                        // Response wasn't JSON, use default error message
                        console.log('Non-JSON error response');
                    }

                    showAlert('alert-danger', errorMessage);
                    console.error('Login error:', { endpoint: apiEndpoint, status: response.status, statusText: response.statusText });
                    return;
                }

                // Parse successful response
                let data;
                try {
                    data = await response.json();
                } catch (jsonError) {
                    console.error('Failed to parse response as JSON:', jsonError);
                    showAlert('alert-danger', 'Invalid response from server. Please try again.');
                    return;
                }

                // Handle successful login with token
                if (data.token) {
                    // Store authentication data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', selectedRole);
                    localStorage.setItem('userEmail', email);
                    
                    // Store additional user data if provided
                    if (data.user) {
                        localStorage.setItem('userData', JSON.stringify(data.user));
                    }
                    
                    // Store role-specific tokens
                    if (selectedRole === 'staff') {
                        localStorage.setItem('staffToken', data.token);
                    } else if (selectedRole === 'admin') {
                        localStorage.setItem('adminToken', data.token);
                    }
                    
                    // Store staff-specific data
                    if (selectedRole === 'staff' && data.staff) {
                        localStorage.setItem('staffData', JSON.stringify(data.staff));
                    }

                    // Show success message
                    showAlert('alert-success', 'Login successful! Redirecting...');

                    // Redirect after short delay
                    setTimeout(() => {
                        const redirectUrl = getRedirectUrl(selectedRole);
                        window.location.href = redirectUrl;
                    }, 800);
                } else {
                    // No token in response
                    showAlert('alert-danger', (data && data.message) ? data.message : 'Login failed. No authentication token received.');
                }
                
            } catch (error) {
                console.error('Login error:', error);
                
                // Provide more helpful error messages
                let errorMessage = 'Network error. Please check your connection and try again.';
                
                if (error.message && error.message.includes('Failed to fetch')) {
                    errorMessage = 'Unable to connect to server. Please check if the backend API is running.';
                }
                
                showAlert('alert-danger', errorMessage);
            } finally {
                // Hide loading state
                loginBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
            
            // Helper function to show alerts
            function showAlert(className, message) {
                alertMessage.className = `alert ${className}`;
                alertMessage.innerHTML = `<i class="fas fa-${className.includes('success') ? 'check' : 'exclamation'}-circle"></i> ${message}`;
                alertMessage.style.display = 'block';
            }
        });

        // Check if user is already logged in
        function checkExistingSession() {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('userRole');
            
            if (token && role && API_CONFIG.dashboards[role]) {
                // Optionally redirect to dashboard if already logged in
                // window.location.href = API_CONFIG.dashboards[role];
            }
        }
        
        // Initialize session check
        checkExistingSession();
