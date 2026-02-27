// Current step tracker
        let currentStudentStep = 1;
        const totalSteps = 3;

        // Registration type switching
        // Only student registration is supported on this page
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                // ensure student form visible
                document.getElementById('studentForm').style.display = 'block';
            });
        });

        // Multi-step navigation functions
        function updateProgressSteps(type, step) {
            const progressSteps = document.querySelectorAll(`#${type}ProgressSteps .progress-step`);
            progressSteps.forEach((progressStep, index) => {
                const stepNum = index + 1;
                progressStep.classList.remove('active', 'completed');
                if (stepNum < step) {
                    progressStep.classList.add('completed');
                } else if (stepNum === step) {
                    progressStep.classList.add('active');
                }
            });
        }

        function updateFormSteps(type, step) {
            const formSteps = document.querySelectorAll(`#${type}Form .form-step`);
            formSteps.forEach(formStep => {
                formStep.classList.remove('active');
                if (parseInt(formStep.dataset.step) === step) {
                    formStep.classList.add('active');
                }
            });
        }

        function validateStep(type, step) {
            // Only student flow remains; validate student form steps
            let isValid = true;
            const stepFields = [];
            if (step === 1) {
                stepFields.push({ id: 'studentId', name: 'Student ID' },
                                { id: 'firstName', name: 'First Name' },
                                { id: 'lastName', name: 'Last Name' },
                                { id: 'age', name: 'Age' });
            } else if (step === 2) {
                stepFields.push({ id: 'email', name: 'Email' },
                                { id: 'phone', name: 'Phone' });
            }

            stepFields.forEach(field => {
                const input = document.getElementById(field.id);
                if (input && !input.value.trim()) {
                    setFieldInvalid(input, field.name + ' is required');
                    isValid = false;
                } else if (input && input.id.includes('email') && input.value) {
                    if (!validateEmail(input.value)) {
                        setFieldInvalid(input, 'Please enter a valid email');
                        isValid = false;
                    }
                }
            });

            return isValid;
        }

        function nextStep(type) {
            // Only student flow remains
            const currentStep = currentStudentStep;
            if (!validateStep('student', currentStep)) return;
            if (currentStep < totalSteps) {
                const newStep = currentStep + 1;
                currentStudentStep = newStep;
                updateProgressSteps('student', newStep);
                updateFormSteps('student', newStep);
            }
        }

        function prevStep(type) {
            const currentStep = currentStudentStep;
            if (currentStep > 1) {
                const newStep = currentStep - 1;
                currentStudentStep = newStep;
                updateProgressSteps('student', newStep);
                updateFormSteps('student', newStep);
            }
        }

        // Field validation functions
        function setFieldInvalid(input, message) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            const icon = input.parentElement.querySelector('.validation-icon');
            if (icon) {
                icon.className = 'validation-icon invalid';
                icon.innerHTML = '<i class="fas fa-times"></i>';
            }
            const errorDiv = input.parentElement.nextElementSibling;
            if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                errorDiv.style.display = 'flex';
                errorDiv.querySelector('span').textContent = message;
            }
        }

        function setFieldValid(input) {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            const icon = input.parentElement.querySelector('.validation-icon');
            if (icon) {
                icon.className = 'validation-icon valid';
                icon.innerHTML = '<i class="fas fa-check"></i>';
            }
        }

        function clearValidation(input) {
            input.classList.remove('is-invalid', 'is-valid');
            const icon = input.parentElement.querySelector('.validation-icon');
            if (icon) {
                icon.className = 'validation-icon';
                icon.innerHTML = '';
            }
        }

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        // Real-time validation listeners
        function setupRealTimeValidation() {
            // Student form fields
            const studentFields = ['studentId', 'firstName', 'lastName', 'age', 'email', 'phone'];
            
            studentFields.forEach(fieldId => {
                const input = document.getElementById(fieldId);
                if (input) {
                    input.addEventListener('blur', function() {
                        if (this.value.trim()) {
                            if (fieldId === 'email' && !validateEmail(this.value)) {
                                setFieldInvalid(this, 'Please enter a valid email address');
                            } else if (fieldId === 'age' && (this.value < 1 || this.value > 150)) {
                                setFieldInvalid(this, 'Please enter a valid age');
                            } else {
                                setFieldValid(this);
                            }
                        }
                    });
                    
                    input.addEventListener('input', function() {
                        if (this.classList.contains('is-invalid') || this.classList.contains('is-valid')) {
                            if (this.value.trim()) {
                                if (fieldId === 'email' && !validateEmail(this.value)) {
                                    setFieldInvalid(this, 'Please enter a valid email address');
                                } else if (fieldId === 'age' && (this.value < 1 || this.value > 150)) {
                                    setFieldInvalid(this, 'Please enter a valid age');
                                } else {
                                    setFieldValid(this);
                                }
                            } else {
                                clearValidation(this);
                            }
                        }
                    });
                }
            });

            // Admin fields removed (admin registration disabled)
        }

        // Enhanced Password Strength Checker
        function checkPasswordStrength(password) {
            const requirements = {
                length: password.length >= 8,
                lower: /[a-z]/.test(password),
                upper: /[A-Z]/.test(password),
                number: /[0-9]/.test(password),
                special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
            };

            const metCount = Object.values(requirements).filter(Boolean).length;
            
            // Update requirement indicators
            document.getElementById('req-length').classList.toggle('met', requirements.length);
            document.getElementById('req-lower').classList.toggle('met', requirements.lower);
            document.getElementById('req-upper').classList.toggle('met', requirements.upper);
            document.getElementById('req-number').classList.toggle('met', requirements.number);
            document.getElementById('req-special').classList.toggle('met', requirements.special);

            // Update strength bar and text
            const fill = document.getElementById('passwordStrengthFill');
            const text = document.getElementById('passwordStrengthText');
            
            fill.className = 'password-strength-fill';
            text.className = 'password-strength-text';
            
            if (metCount === 0) {
                text.textContent = '';
            } else if (metCount <= 2) {
                fill.classList.add('weak');
                text.classList.add('weak');
                text.textContent = 'Weak password';
            } else if (metCount === 3) {
                fill.classList.add('medium');
                text.classList.add('medium');
                text.textContent = 'Medium strength';
            } else if (metCount === 4) {
                fill.classList.add('strong');
                text.classList.add('strong');
                text.textContent = 'Strong password';
            } else {
                fill.classList.add('very-strong');
                text.classList.add('very-strong');
                text.textContent = 'Very strong password';
            }

            return metCount >= 4;
        }

        // Admin password strength removed (admin registration disabled)

        // Password Match Validation
        function validatePasswordMatch(passwordId, confirmId, matchId, iconId) {
            const password = document.getElementById(passwordId).value;
            const confirm = document.getElementById(confirmId).value;
            const matchDiv = document.getElementById(matchId);
            const icon = document.getElementById(iconId);

            if (confirm) {
                if (password === confirm) {
                    matchDiv.className = 'password-match match';
                    matchDiv.innerHTML = '<i class="fas fa-check-circle"></i><span>Passwords match</span>';
                    if (icon) {
                        icon.className = 'validation-icon valid';
                        icon.innerHTML = '<i class="fas fa-check"></i>';
                    }
                    return true;
                } else {
                    matchDiv.className = 'password-match no-match';
                    matchDiv.innerHTML = '<i class="fas fa-times-circle"></i><span>Passwords do not match</span>';
                    if (icon) {
                        icon.className = 'validation-icon invalid';
                        icon.innerHTML = '<i class="fas fa-times"></i>';
                    }
                    return false;
                }
            } else {
                matchDiv.className = 'password-match';
                matchDiv.innerHTML = '<i class="fas fa-circle"></i><span>Please confirm your password</span>';
                if (icon) {
                    icon.className = 'validation-icon';
                    icon.innerHTML = '';
                }
                return false;
            }
        }

        // Event Listeners for Password
        document.getElementById('password')?.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            if (document.getElementById('confirmPassword').value) {
                validatePasswordMatch('password', 'confirmPassword', 'passwordMatch', 'confirmPasswordIcon');
            }
        });

        document.getElementById('confirmPassword')?.addEventListener('input', function() {
            validatePasswordMatch('password', 'confirmPassword', 'passwordMatch', 'confirmPasswordIcon');
        });

        // Admin password listeners removed (admin registration disabled)

        // Initialize real-time validation
        setupRealTimeValidation();

        // Success Animation
        function showSuccessAnimation() {
            const overlay = document.getElementById('successOverlay');
            overlay.classList.add('active');
            
            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#667eea', '#764ba2', '#10b981', '#f59e0b']
            });

            // More confetti after delay
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#667eea', '#764ba2', '#10b981']
                });
                confetti({
                    particleCount: 100,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#667eea', '#764ba2', '#10b981']
                });
            }, 500);

            // Redirect after animation
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        }

        // Student Form Submission
        document.getElementById('registerForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const registerBtn = document.getElementById('registerBtn');
            const loadingSpinner = document.getElementById('loadingSpinner');
            const alertMessage = document.getElementById('alertMessage');
            
            // Validate privacy policy
            const privacyCheckbox = document.getElementById('privacyPolicy');
            const privacyError = document.getElementById('privacyError');
            if (!privacyCheckbox.checked) {
                privacyError.style.display = 'flex';
                return;
            } else {
                privacyError.style.display = 'none';
            }
            
            // Validate password strength
            const password = document.getElementById('password').value;
            const isStrongPassword = checkPasswordStrength(password);
            if (!isStrongPassword) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Please create a stronger password that meets all requirements.</span>';
                alertMessage.style.display = 'flex';
                return;
            }
            
            // Validate password match
            if (!validatePasswordMatch('password', 'confirmPassword', 'passwordMatch', 'confirmPasswordIcon')) {
                alertMessage.className = 'alert alert-danger';
                alertMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Passwords do not match. Please try again.</span>';
                alertMessage.style.display = 'flex';
                return;
            }
            
            // Show loading state
            registerBtn.disabled = true;
            loadingSpinner.style.display = 'inline-block';
            
            // Hide previous alerts
            alertMessage.style.display = 'none';
            
            try {
                const formData = new FormData(this);
                const registrationData = {
                    studentId: formData.get('studentId'),
                    Firstname: formData.get('Firstname'),
                    Lastname: formData.get('Lastname'),
                    email: formData.get('email'),
                    age: formData.get('age'),
                    phone: formData.get('phone'),
                    password: formData.get('password'),
                    confirmpassword: formData.get('confirmpassword')
                };

                // Client-side validation
                if (!registrationData.studentId || !registrationData.studentId.toString().trim()) {
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i><span>Student ID is required to register.</span>';
                    alertMessage.style.display = 'flex';
                    registerBtn.disabled = false;
                    loadingSpinner.style.display = 'none';
                    return;
                }

                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success animation
                    showSuccessAnimation();
                    
                    // Store for login page
                    localStorage.setItem('registrationSuccess', 'true');
                    localStorage.setItem('registeredEmail', registrationData.email);
                } else {
                    alertMessage.className = 'alert alert-danger';
                    alertMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${data.message || 'Registration failed. Please try again.'}</span>`;
                    alertMessage.style.display = 'flex';
                }
            } catch (error) {
                console.error('Registration error:', error);
                alertMessage.className = 'alert alert-danger';
                alertMessage.innerHTML = '<i class="fas fa-wifi"></i><span>Network error. Please check your connection and try again.</span>';
                alertMessage.style.display = 'flex';
            } finally {
                registerBtn.disabled = false;
                loadingSpinner.style.display = 'none';
            }
        });

        // Admin Form Submission handler removed/commented out to prevent public admin self-registration.

        // Pre-fill email from localStorage if registration was successful
        document.addEventListener('DOMContentLoaded', function() {
            const registrationSuccess = localStorage.getItem('registrationSuccess');
            const registeredEmail = localStorage.getItem('registeredEmail');
            
            if (registrationSuccess === 'true') {
                document.getElementById('email').value = registeredEmail;
                localStorage.removeItem('registrationSuccess');
                localStorage.removeItem('registeredEmail');
            }
        });
