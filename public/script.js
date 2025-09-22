// Global Variables
const API_BASE_URL = 'https://school-management-api-nu0b.onrender.com/api'; // Update this to your backend URL
let currentUser = null;
let currentToken = null;
let resetStudentId = null; // Store student ID for password reset flow

// DOM Elements
const sections = ['home', 'register', 'login', 'forgotPassword', 'otpVerification', 'resetPassword', 'admin', 'profile'];
const modals = {
    loading: new bootstrap.Modal(document.getElementById('loadingModal')),
    success: new bootstrap.Modal(document.getElementById('successModal')),
    error: new bootstrap.Modal(document.getElementById('errorModal'))
};

// Utility Functions
const showLoading = () => modals.loading.show();
const hideLoading = () => modals.loading.hide();

const showSuccess = (message) => {
    document.getElementById('successMessage').textContent = message;
    modals.success.show();
};

const showError = (message) => {
    document.getElementById('errorMessage').textContent = message;
    modals.error.show();
};

const showSection = (sectionId) => {
    // Hide all sections
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('animate__animated', 'animate__fadeInUp');
    }

    // Update navigation based on authentication status
    updateNavigation();
};

const updateNavigation = () => {
    const adminNav = document.getElementById('adminNav');
    const logoutNav = document.getElementById('logoutNav');

    if (currentUser && currentUser.isAdmin) {
        adminNav.style.display = 'block';
        logoutNav.style.display = 'block';
    } else if (currentUser) {
        adminNav.style.display = 'none';
        logoutNav.style.display = 'block';
    } else {
        adminNav.style.display = 'none';
        logoutNav.style.display = 'none';
    }
};

const logout = async () => {
    try {
        showLoading();

        const response = await fetch(`${API_BASE_URL}/students/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            // Clear local storage and user data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            currentUser = null;
            currentToken = null;

            showSuccess('Logged out successfully!');
            showSection('home');
        } else {
            showError(data.message || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError('Network error occurred');
    } finally {
        hideLoading();
    }
};

// API Functions
const apiCall = async (endpoint, options = {}) => {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(currentToken && { 'Authorization': `Bearer ${currentToken}` })
        }
    };

    const finalOptions = { ...defaultOptions, ...options };
    if (finalOptions.body && typeof finalOptions.body === 'object') {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, finalOptions);

    let data;
    try {
        data = await response.json();
    } catch (err) {
        data = null; // Response is not JSON
    }

    if (!response.ok) {
        // If there's a message in the response, use it; otherwise, show a generic error
        throw new Error((data && data.message) || `API call failed: ${response.status} ${response.statusText}`);
    }

    return data;
};

// Authentication Functions
const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        try {
            currentToken = token;
            currentUser = JSON.parse(user);
            updateNavigation();
            return true;
        } catch (error) {
            console.error('Error parsing stored user data:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
        }
    }
    return false;
};

// Form Handlers
const handleRegister = async (e) => {
    e.preventDefault();

    const formData = {
        firstname: document.getElementById('regFirstname').value.trim(),
        lastname: document.getElementById('regLastname').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        age: parseInt(document.getElementById('regAge').value),
        phone: document.getElementById('regPhone').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('regConfirmPassword').value
    };

    // Validation
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.age || !formData.phone || !formData.password) {
        showError('All fields are required');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (formData.password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (!formData.email.includes('@')) {
        showError('Please enter a valid email address');
        return;
    }

    try {
        showLoading();

        const data = await apiCall('/students/register', {
            method: 'POST',
            body: formData
        });

        showSuccess('Registration successful! Please login with your credentials.');
        document.getElementById('registerForm').reset();
        showSection('login');

    } catch (error) {
        console.error('Registration error:', error);
        // Provide more specific error messages based on the error
        if (error.message.includes('400')) {
            showError('Registration failed. Please check all fields and try again.');
        } else if (error.message.includes('email') || error.message.includes('Email')) {
            showError('This email is already registered. Please use a different email.');
        } else {
            showError(error.message || 'Registration failed. Please try again.');
        }
    } finally {
        hideLoading();
    }
};

const handleLogin = async (e) => {
    e.preventDefault();

    const formData = {
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
    };

    if (!formData.email || !formData.password) {
        showError('Email and password are required');
        return;
    }

    try {
        showLoading();

        const data = await apiCall('/students/login', {
            method: 'POST',
            body: formData
        });

        // Store authentication data
        currentToken = data.token;
        localStorage.setItem('token', currentToken);

        // Store user data from login response
        currentUser = data.user || data.student || {
            email: formData.email,
            firstname: data.firstname,
            lastname: data.lastname,
            isAdmin: data.isAdmin || false
        };
        localStorage.setItem('user', JSON.stringify(currentUser));

        showSuccess('Login successful! Welcome back.');
        document.getElementById('loginForm').reset();
        showSection('profile');

    } catch (error) {
        console.error('Login error:', error);
        // Provide more specific error messages
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            showError('Invalid email or password. Please try again.');
        } else if (error.message.includes('404')) {
            showError('Account not found. Please register first.');
        } else {
            showError(error.message || 'Login failed. Please try again.');
        }
    } finally {
        hideLoading();
    }
};

const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotEmail').value.trim();

    if (!email) {
        showError('Email is required');
        return;
    }

    try {
        showLoading();

        const data = await apiCall('/students/forget-password', {
            method: 'POST',
            body: { email }
        });

        showSuccess('OTP sent to your email! Please check your inbox.');
        document.getElementById('forgotPasswordForm').reset();
        showSection('otpVerification');

    } catch (error) {
        console.error('Forgot password error:', error);
        showError(error.message || 'Failed to send OTP');
    } finally {
        hideLoading();
    }
};

const handleOTPVerification = async (e) => {
    e.preventDefault();

    const otp = document.getElementById('otp').value.trim();

    if (!otp) {
        showError('OTP is required');
        return;
    }

    try {
        showLoading();

        const data = await apiCall('/students/verify-otp', {
            method: 'POST',
            body: { otp }
        });

        // Store studentId for password reset
        resetStudentId = data.studentId;
        localStorage.setItem('resetStudentId', resetStudentId);

        showSuccess('OTP verified successfully! You can now reset your password.');
        document.getElementById('otpForm').reset();
        showSection('resetPassword');

    } catch (error) {
        console.error('OTP verification error:', error);
        showError(error.message || 'Invalid OTP');
    } finally {
        hideLoading();
    }
};

const handleResetPassword = async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!newPassword || !confirmNewPassword) {
        showError('Both password fields are required');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        showError('Passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    try {
        showLoading();

        // Note: In a real implementation, you'd get the studentId from the OTP verification response
        // For now, we'll assume it's stored in a variable or localStorage
        const studentId = localStorage.getItem('resetStudentId');

        const data = await apiCall(`/students/reset-password/${studentId}`, {
            method: 'PUT',
            body: {
                newPassword,
                confirmedPassword: confirmNewPassword
            }
        });

        showSuccess('Password reset successfully! You can now login with your new password.');
        document.getElementById('resetPasswordForm').reset();
        localStorage.removeItem('resetStudentId');
        showSection('login');

    } catch (error) {
        console.error('Reset password error:', error);
        showError(error.message || 'Password reset failed');
    } finally {
        hideLoading();
    }
};

// Admin Functions
const loadAdminStats = async () => {
    try {
        const studentCountResponse = await apiCall('/students/student-count');
        const totalStudents = studentCountResponse.totalStudents;

        // For now, we'll show basic stats since we don't have an endpoint to get all students
        // In a real implementation, you'd create an endpoint to get all students with admin status
        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('activeUsers').textContent = totalStudents;
        document.getElementById('totalAdmins').textContent = 'N/A'; // Would need endpoint to get this

        showSuccess('Admin stats loaded successfully!');

    } catch (error) {
        console.error('Error loading admin stats:', error);
        showError('Failed to load admin statistics');
    }
};

const loadStudentsTable = async () => {
    try {
        // Since we don't have an endpoint to get all students, we'll show a message
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    <em>Student management features would be implemented with backend endpoints</em>
                </td>
            </tr>
        `;

        showSuccess('Admin panel loaded!');

    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students');
    }
};

const handleAddStudent = async (e) => {
    e.preventDefault();

    const formData = {
        firstname: document.getElementById('adminFirstname').value.trim(),
        lastname: document.getElementById('adminLastname').value.trim(),
        email: document.getElementById('adminEmail').value.trim(),
        age: parseInt(document.getElementById('adminAge').value),
        phone: document.getElementById('adminPhone').value.trim(),
        password: document.getElementById('adminPassword').value,
        confirmPassword: document.getElementById('adminConfirmPassword').value
    };

    // Validation
    if (!formData.firstname || !formData.lastname || !formData.email || !formData.age || !formData.phone || !formData.password) {
        showError('All fields are required');
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (formData.password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    if (!formData.email.includes('@')) {
        showError('Please enter a valid email address');
        return;
    }

    try {
        showLoading();

        await apiCall('/admin/add-student', {
            method: 'POST',
            body: formData
        });

        showSuccess('Student added successfully!');
        document.getElementById('addStudentForm').reset();
        loadStudentsTable();
        loadAdminStats();

    } catch (error) {
        console.error('Add student error:', error);
        // Provide more specific error messages
        if (error.message.includes('400')) {
            showError('Failed to add student. Please check all fields and try again.');
        } else if (error.message.includes('email') || error.message.includes('Email')) {
            showError('This email is already registered. Please use a different email.');
        } else {
            showError(error.message || 'Failed to add student. Please try again.');
        }
    } finally {
        hideLoading();
    }
};

const editStudent = async (studentId) => {
    // Implementation for editing student
    showError('Edit functionality to be implemented');
};

const deleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        showLoading();

        await apiCall(`/admin/delete-student/${studentId}`, {
            method: 'DELETE'
        });

        showSuccess('Student deleted successfully!');
        loadStudentsTable();
        loadAdminStats();

    } catch (error) {
        console.error('Delete student error:', error);
        showError(error.message || 'Failed to delete student');
    } finally {
        hideLoading();
    }
};

const makeAdmin = async (studentId) => {
    if (!confirm('Are you sure you want to make this student an admin?')) {
        return;
    }

    try {
        showLoading();

        await apiCall(`/students/make-admin/${studentId}`, {
            method: 'PATCH'
        });

        showSuccess('Student has been granted admin privileges successfully!');
        loadStudentsTable();
        loadAdminStats();

    } catch (error) {
        console.error('Make admin error:', error);
        showError(error.message || 'Failed to make student admin');
    } finally {
        hideLoading();
    }
};

// Profile Functions
const loadProfile = () => {
    if (!currentUser) return;

    document.getElementById('profileStudentId').textContent = currentUser.studentId || 'N/A';
    document.getElementById('profileName').textContent = `${currentUser.Firstname || ''} ${currentUser.Lastname || ''}`.trim() || 'N/A';
    document.getElementById('profileEmail').textContent = currentUser.email || 'N/A';
    document.getElementById('profileAge').textContent = currentUser.age || 'N/A';
    document.getElementById('profilePhone').textContent = currentUser.phone || 'N/A';
    document.getElementById('profileAdminStatus').textContent = currentUser.isAdmin ? 'Administrator' : 'Student';
    document.getElementById('profileCreatedAt').textContent = currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A';

    const adminButton = document.getElementById('profileAdminButton');
    if (currentUser.isAdmin) {
        adminButton.style.display = 'block';
    } else {
        adminButton.style.display = 'none';
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    checkAuthStatus();

    // Set initial section
    if (currentUser) {
        showSection('profile');
    } else {
        showSection('home');
    }

    // Form event listeners
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('forgotPasswordForm').addEventListener('submit', handleForgotPassword);
    document.getElementById('otpForm').addEventListener('submit', handleOTPVerification);
    document.getElementById('resetPasswordForm').addEventListener('submit', handleResetPassword);
    document.getElementById('addStudentForm').addEventListener('submit', handleAddStudent);

    // Load admin data if user is admin
    if (currentUser && currentUser.isAdmin) {
        loadAdminStats();
        loadStudentsTable();
    }

    // Load profile if user is logged in
    if (currentUser) {
        loadProfile();
    }

    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.type === 'submit') {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 2000);
            }
        });
    });

    // Add input validation feedback
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid') && this.value.trim()) {
                this.classList.remove('is-invalid');
            }
        });
    });

    // Add password confirmation validation
    const confirmPassword = document.getElementById('regConfirmPassword');
    const adminConfirmPassword = document.getElementById('adminConfirmPassword');

    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const password = document.getElementById('regPassword').value;
            if (this.value && this.value !== password) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    if (adminConfirmPassword) {
        adminConfirmPassword.addEventListener('input', function() {
            const password = document.getElementById('adminPassword').value;
            if (this.value && this.value !== password) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    // Add animation classes to elements
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .card').forEach(el => {
        observer.observe(el);
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close modals on escape
            Object.values(modals).forEach(modal => modal.hide());
        }
    });

    // Add responsive navigation toggle
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
        });
    }

    // Add auto-refresh for admin panel
    if (currentUser && currentUser.isAdmin) {
        setInterval(() => {
            loadAdminStats();
            loadStudentsTable();
        }, 30000); // Refresh every 30 seconds
    }
});

// Export functions for global use
window.showSection = showSection;
window.logout = logout;
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
window.makeAdmin = makeAdmin;
