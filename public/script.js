// Global Variables
const API_BASE_URL = 'https://silasschool.netlify.app/api';
let currentUser = null;
let currentToken = null;

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
            },
            body: JSON.stringify({
                email: currentUser.email,
                password: document.getElementById('loginPassword').value // This should be stored securely
            })
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
        Fistname: document.getElementById('regFirstname').value.trim(),
        Lastname: document.getElementById('regLastname').value.trim(),
        email: document.getElementById('regEmail').value.trim(),
        age: parseInt(document.getElementById('regAge').value),
        phone: document.getElementById('regPhone').value.trim(),
        password: document.getElementById('regPassword').value,
        confirmpassword: document.getElementById('regConfirmPassword').value
    };

    // Validation
    if (!formData.Fistname || !formData.Lastname || !formData.email || !formData.age || !formData.phone || !formData.password) {
        showError('All fields are required');
        return;
    }

    if (formData.password !== formData.confirmpassword) {
        showError('Passwords do not match');
        return;
    }

    if (formData.password.length < 6) {
        showError('Password must be at least 6 characters long');
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
        showError(error.message || 'Registration failed');
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

        // Get user profile (you might want to create a profile endpoint)
        // For now, we'll store basic info
        currentUser = { email: formData.email };
        localStorage.setItem('user', JSON.stringify(currentUser));

        showSuccess('Login successful! Welcome back.');
        document.getElementById('loginForm').reset();
        showSection('profile');

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Login failed');
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
        const [studentCountResponse, studentsResponse] = await Promise.all([
            apiCall('/students/student-count'),
            apiCall('/admin/get-all-students')
        ]);

        const totalStudents = studentCountResponse.totalStudents;
        const students = studentsResponse.students;
        const adminCount = students.filter(student => student.isAdmin).length;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('activeUsers').textContent = totalStudents;
        document.getElementById('totalAdmins').textContent = adminCount;

    } catch (error) {
        console.error('Error loading admin stats:', error);
        showError('Failed to load admin statistics');
    }
};

const loadStudentsTable = async () => {
    try {
        const data = await apiCall('/admin/get-all-students');
        const students = data.students;
        const tbody = document.getElementById('studentsTableBody');

        tbody.innerHTML = '';

        students.forEach(student => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${student.studentId || 'N/A'}</td>
                <td>${student.Fistname} ${student.Lastname}</td>
                <td>${student.email}</td>
                <td>${student.age}</td>
                <td>${student.phone}</td>
                <td>
                    <span class="badge ${student.isAdmin ? 'bg-success' : 'bg-secondary'}">
                        ${student.isAdmin ? 'Admin' : 'Student'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editStudent('${student._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading students:', error);
        showError('Failed to load students');
    }
};

const handleAddStudent = async (e) => {
    e.preventDefault();

    const formData = {
        Fistname: document.getElementById('adminFirstname').value.trim(),
        Lastname: document.getElementById('adminLastname').value.trim(),
        email: document.getElementById('adminEmail').value.trim(),
        age: parseInt(document.getElementById('adminAge').value),
        phone: document.getElementById('adminPhone').value.trim(),
        password: document.getElementById('adminPassword').value,
        confirmpassword: document.getElementById('adminConfirmPassword').value
    };

    // Validation
    if (!formData.Fistname || !formData.Lastname || !formData.email || !formData.age || !formData.phone || !formData.password) {
        showError('All fields are required');
        return;
    }

    if (formData.password !== formData.confirmpassword) {
        showError('Passwords do not match');
        return;
    }

    if (formData.password.length < 6) {
        showError('Password must be at least 6 characters long');
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
        showError(error.message || 'Failed to add student');
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

// Profile Functions
const loadProfile = () => {
    if (!currentUser) return;

    document.getElementById('profileStudentId').textContent = currentUser.studentId || 'N/A';
    document.getElementById('profileName').textContent = `${currentUser.Fistname || ''} ${currentUser.Lastname || ''}`.trim() || 'N/A';
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
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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
