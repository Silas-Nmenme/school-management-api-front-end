const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api';

const facultySelect = document.getElementById('faculty');
const departmentSelect = document.getElementById('department');
const courseSelect = document.getElementById('course');
const form = document.getElementById('applicationForm');
const alertMessage = document.getElementById('alertMessage');
const applyBtn = document.getElementById('applyBtn');
const loadingSpinner = document.getElementById('loadingSpinner');

/* ============================================
   LOAD FACULTIES
============================================ */
async function loadFaculties() {
    try {
        const res = await fetch(`${API_BASE_URL}/faculties`);
        const faculties = await res.json();

        facultySelect.innerHTML = '<option value="">Choose a faculty...</option>';

        faculties.forEach(faculty => {
            const option = document.createElement('option');
            option.value = faculty._id; // ✅ ObjectId
            option.textContent = faculty.name;
            facultySelect.appendChild(option);
        });
    } catch (err) {
        showError('Failed to load faculties.');
    }
}

/* ============================================
   LOAD DEPARTMENTS BY FACULTY
============================================ */
facultySelect.addEventListener('change', async function() {
    const facultyId = this.value;

    departmentSelect.innerHTML = '<option value="">Loading departments...</option>';
    departmentSelect.disabled = true;
    courseSelect.innerHTML = '<option value="">Choose a course...</option>';
    courseSelect.disabled = true;

    if (!facultyId) return;

    try {
        const res = await fetch(`${API_BASE_URL}/faculties/${facultyId}/departments`);
        const data = await res.json();
        
        // Response is { faculty: { departments: [...] }, totalDepartments: n }
        const departments = data.faculty?.departments || [];

        departmentSelect.innerHTML = '<option value="">Choose a department...</option>';
        departmentSelect.disabled = false;

        departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept._id; // ✅ ObjectId
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
        });
    } catch (err) {
        console.error('Error loading departments:', err);
        showError('Failed to load departments.');
    }
});

/* ============================================
   LOAD COURSES BY DEPARTMENT
============================================ */
departmentSelect.addEventListener('change', async function() {
    const departmentId = this.value;

    courseSelect.innerHTML = '<option value="">Loading courses...</option>';
    courseSelect.disabled = true;

    if (!departmentId) return;

    try {
        const res = await fetch(`${API_BASE_URL}/departments/${departmentId}`);
        const data = await res.json();
        
        // Response is { message: "...", department: {...} }
        const department = data.department;

        if (!department || !department.courses) {
            courseSelect.innerHTML = '<option value="">No courses available</option>';
            courseSelect.disabled = false;
            return;
        }

        courseSelect.innerHTML = '<option value="">Choose a course...</option>';
        courseSelect.disabled = false;

        department.courses
            .filter(c => c.isActive !== false)
            .forEach(course => {
                const option = document.createElement('option');
                option.value = course.name;
                option.textContent = course.name;
                courseSelect.appendChild(option);
            });

    } catch (err) {
        console.error('Error loading courses:', err);
        showError('Failed to load courses.');
    }
});

/* ============================================
   CHARACTER COUNTER
============================================ */
document.getElementById('essay').addEventListener('input', function() {
    document.getElementById('charCount').textContent = 2000 - this.value.length;
});

/* ============================================
   SUBMIT APPLICATION
============================================ */
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    alertMessage.style.display = 'none';
    applyBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';

    const formData = new FormData(form);
    const departmentId = departmentSelect.value;

    if (!departmentId) {
        showError('Please select a department.');
        resetButton();
        return;
    }

    const payload = {
        firstName: formData.get('firstName')?.trim(),
        lastName: formData.get('lastName')?.trim(),
        email: formData.get('email')?.trim(),
        phone: formData.get('phone')?.trim(),
        address: formData.get('address')?.trim(),
        highSchool: formData.get('highSchool')?.trim(),
        gpa: formData.get('gpa') ? parseFloat(formData.get('gpa')) : null,
        satScore: formData.get('satScore') ? parseInt(formData.get('satScore')) : null,
        actScore: formData.get('actScore') ? parseInt(formData.get('actScore')) : null,
        departmentId: departmentId, // ✅ ONLY THIS
        course: formData.get('course'),
        essay: formData.get('essay')?.trim() || ''
    };

    try {
        const res = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            showError(data.message || 'Submission failed.');
            resetButton();
            return;
        }

        showSuccess(`Application submitted successfully! Your ID: ${data.applicationId}`);
        form.reset();
        departmentSelect.disabled = true;
        courseSelect.disabled = true;
        document.getElementById('charCount').textContent = '2000';

    } catch (err) {
        showError('Network error. Please try again.');
    } finally {
        resetButton();
    }
});

/* ============================================
   HELPERS
============================================ */
function showError(message) {
    alertMessage.className = 'alert alert-danger';
    alertMessage.textContent = message;
    alertMessage.style.display = 'block';
}

function showSuccess(message) {
    alertMessage.className = 'alert alert-success';
    alertMessage.textContent = message;
    alertMessage.style.display = 'block';
}

function resetButton() {
    applyBtn.disabled = false;
    loadingSpinner.style.display = 'none';
}

/* ============================================
   INIT
============================================ */
document.addEventListener('DOMContentLoaded', loadFaculties);