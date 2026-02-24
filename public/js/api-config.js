/* ============================================
   BETHEL COLLEGE API CONFIGURATION
   Faculty & Department API Utilities
   ============================================ */

// API Base URL - update this to match your backend
const API_BASE = 'https://school-management-api-zeta-two.vercel.app/api';

// API Connectivity Status
let apiConnected = null;
let apiError = null;

// Cache for faculties and departments to reduce API calls
let facultiesCache = null;
let departmentsCache = null;

/**
 * Test API connectivity and return status
 * @returns {Promise<Object>} {status: boolean, message: string, timestamp: Date}
 */
async function testAPIConnectivity() {
    try {
        const response = await fetch(`${API_BASE}/faculties`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            apiConnected = true;
            apiError = null;
            return {
                status: true,
                message: '✅ API is accessible',
                timestamp: new Date(),
                statusCode: response.status
            };
        } else {
            apiConnected = false;
            apiError = `HTTP ${response.status}: ${response.statusText}`;
            return {
                status: false,
                message: `❌ API returned error: ${response.status} ${response.statusText}`,
                timestamp: new Date(),
                statusCode: response.status
            };
        }
    } catch (error) {
        apiConnected = false;
        apiError = error.message;
        return {
            status: false,
            message: `❌ Cannot connect to API: ${error.message}`,
            timestamp: new Date(),
            error: error.message
        };
    }
}

/**
 * Get API status info for troubleshooting
 * @returns {Object} Diagnostic information
 */
function getAPIStatus() {
    return {
        apiBase: API_BASE,
        connected: apiConnected,
        error: apiError,
        faculties: {
            cached: !!facultiesCache,
            count: facultiesCache ? facultiesCache.length : 0
        },
        departments: {
            cached: !!departmentsCache,
            count: departmentsCache ? departmentsCache.length : 0
        }
    };
}

/* ============================================
   FACULTY API FUNCTIONS
   ============================================ */

/**
 * Fetch all faculties from the API
 * @returns {Promise<Array>} Array of faculty objects
 */
async function fetchFaculties() {
    // Return cached data if available
    if (facultiesCache) {
        return facultiesCache;
    }

    try {
        const response = await fetch(`${API_BASE}/faculties`, {
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        facultiesCache = data.faculties || [];
        apiConnected = true;
        apiError = null;
        return facultiesCache;
    } catch (error) {
        apiConnected = false;
        apiError = error.message;
        console.error('Error fetching faculties:', {
            message: error.message,
            apiBase: API_BASE,
            suggestion: 'Check if backend server is running and API_BASE URL is correct'
        });
        return [];
    }
}

/**
 * Get a single faculty by ID
 * @param {string} facultyId - The faculty MongoDB ObjectId
 * @returns {Promise<Object|null>} Faculty object or null
 */
async function getFacultyById(facultyId) {
    try {
        const response = await fetch(`${API_BASE}/faculties/${facultyId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.faculty || null;
    } catch (error) {
        console.error('Error fetching faculty:', error);
        return null;
    }
}

/**
 * Get faculty by name (for backward compatibility)
 * @param {string} name - Faculty name
 * @returns {Promise<Object|null>} Faculty object or null
 */
async function getFacultyByName(name) {
    try {
        const faculties = await fetchFaculties();
        return faculties.find(f => f.name.toLowerCase() === name.toLowerCase()) || null;
    } catch (error) {
        console.error('Error finding faculty by name:', error);
        return null;
    }
}

/* ============================================
   DEPARTMENT API FUNCTIONS
   ============================================ */

/**
 * Fetch all departments from the API
 * @returns {Promise<Array>} Array of department objects
 */
async function fetchDepartments() {
    // Return cached data if available
    if (departmentsCache) {
        return departmentsCache;
    }

    try {
        const response = await fetch(`${API_BASE}/departments`, {
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        departmentsCache = data.departments || [];
        apiConnected = true;
        apiError = null;
        return departmentsCache;
    } catch (error) {
        apiConnected = false;
        apiError = error.message;
        console.error('Error fetching departments:', {
            message: error.message,
            apiBase: API_BASE,
            suggestion: 'Check if backend server is running and API_BASE URL is correct'
        });
        return [];
    }
}

/**
 * Fetch departments by faculty ID
 * @param {string} facultyId - The faculty MongoDB ObjectId
 * @returns {Promise<Array>} Array of department objects
 */
async function fetchDepartmentsByFaculty(facultyId) {
    try {
        const response = await fetch(`${API_BASE}/departments?facultyId=${facultyId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.departments || [];
    } catch (error) {
        console.error('Error fetching departments by faculty:', error);
        return [];
    }
}

/**
 * Get a single department by ID
 * @param {string} departmentId - The department MongoDB ObjectId
 * @returns {Promise<Object|null>} Department object or null
 */
async function getDepartmentById(departmentId) {
    try {
        const response = await fetch(`${API_BASE}/departments/${departmentId}`);
        if (!response.ok) return null;
        const data = await response.json();
        return data.department || null;
    } catch (error) {
        console.error('Error fetching department:', error);
        return null;
    }
}

/**
 * Get departments by faculty name (for backward compatibility)
 * @param {string} facultyName - Faculty name
 * @returns {Promise<Array>} Array of department objects
 */
async function getDepartmentsByFacultyName(facultyName) {
    try {
        const faculties = await fetchFaculties();
        const faculty = faculties.find(f => f.name.toLowerCase() === facultyName.toLowerCase());
        if (!faculty) return [];
        
        const departments = await fetchDepartments();
        return departments.filter(d => d.faculty && d.faculty._id === faculty._id) || [];
    } catch (error) {
        console.error('Error finding departments by faculty name:', error);
        return [];
    }
}

/* ============================================
   DROPDOWN POPULATION FUNCTIONS
   ============================================ */

/**
 * Populate a faculty select dropdown
 * @param {string} selectId - The ID of the select element
 * @param {string} defaultOption - Default option text
 */
async function populateFacultyDropdown(selectId, defaultOption = 'Choose a faculty...') {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Select element with id "${selectId}" not found`);
        return;
    }

    const faculties = await fetchFaculties();
    
    // Clear existing options except the first one (default)
    select.innerHTML = `<option value="">${defaultOption}`;
    
    // Add faculty options
    faculties.forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty._id;
        option.textContent = faculty.name;
        if (faculty.icon) {
            option.textContent = `${faculty.icon} ${faculty.name}`;
        }
        select.appendChild(option);
    });
}

/**
 * Populate a department select dropdown based on selected faculty
 * @param {string} facultySelectId - The ID of the faculty select element
 * @param {string} departmentSelectId - The ID of the department select element
 * @param {string} defaultOption - Default option text
 */
async function populateDepartmentDropdown(facultySelectId, departmentSelectId, defaultOption = 'Choose a department...') {
    const facultySelect = document.getElementById(facultySelectId);
    const departmentSelect = document.getElementById(departmentSelectId);
    
    if (!facultySelect || !departmentSelect) {
        console.error('Faculty or department select element not found');
        return;
    }

    const facultyId = facultySelect.value;
    
    // Reset department dropdown
    departmentSelect.innerHTML = `<option value="">${defaultOption}</option>`;
    
    if (!facultyId) {
        departmentSelect.disabled = true;
        return;
    }

    const departments = await fetchDepartmentsByFaculty(facultyId);
    
    // Enable and populate department dropdown
    departmentSelect.disabled = false;
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept._id;
        option.textContent = dept.name;
        departmentSelect.appendChild(option);
    });
}

/**
 * Set up a faculty select with automatic department loading
 * @param {string} facultySelectId - Faculty select ID
 * @param {string} departmentSelectId - Department select ID
 * @param {string} courseSelectId - Course select ID (optional, for backward compatibility)
 */
function setupFacultyDepartmentChain(facultySelectId, departmentSelectId, courseSelectId = null) {
    const facultySelect = document.getElementById(facultySelectId);
    const departmentSelect = document.getElementById(departmentSelectId);
    
    if (!facultySelect) {
        console.error(`Faculty select "${facultySelectId}" not found`);
        return;
    }

    // Populate faculties on page load
    populateFacultyDropdown(facultySelectId);

    // When faculty changes, populate departments
    facultySelect.addEventListener('change', async function() {
        await populateDepartmentDropdown(facultySelectId, departmentSelectId);
        
        // Also reset course dropdown if it exists
        if (courseSelectId) {
            const courseSelect = document.getElementById(courseSelectId);
            if (courseSelect) {
                courseSelect.innerHTML = '<option value="">Choose a course...</option>';
                courseSelect.disabled = true;
            }
        }
    });
}

/* ============================================
   APPLICATION SUBMISSION HELPERS
   ============================================ */

/**
 * Prepare application data for submission (converts IDs to ObjectIds if needed)
 * @param {Object} formData - Raw form data
 * @returns {Object} Prepared application data
 */
async function prepareApplicationData(formData) {
    const facultyId = formData.get('faculty');
    const departmentId = formData.get('department');
    
    // If faculty/department are already ObjectIds, use them directly
    // Otherwise, fetch the corresponding ObjectIds
    let finalFacultyId = facultyId;
    let finalDepartmentId = departmentId;
    
    // Check if we need to resolve names to IDs
    if (facultyId && !facultyId.match(/^[0-9a-fA-F]{24}$/)) {
        const faculty = await getFacultyByName(facultyId);
        if (faculty) finalFacultyId = faculty._id;
    }
    
    if (departmentId && !departmentId.match(/^[0-9a-fA-F]{24}$/)) {
        // Need to find department by name and faculty
        const departments = await fetchDepartments();
        const dept = departments.find(d => 
            d.name.toLowerCase() === departmentId.toLowerCase()
        );
        if (dept) finalDepartmentId = dept._id;
    }
    
    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        highSchool: formData.get('highSchool'),
        gpa: formData.get('gpa') ? parseFloat(formData.get('gpa')) : undefined,
        satScore: formData.get('satScore') ? parseInt(formData.get('satScore')) : undefined,
        actScore: formData.get('actScore') ? parseInt(formData.get('actScore')) : undefined,
        faculty: finalFacultyId,
        department: finalDepartmentId,
        course: formData.get('course'),
        essay: formData.get('essay')
    };
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

/**
 * Clear all caches (useful after data updates)
 */
function clearCaches() {
    facultiesCache = null;
    departmentsCache = null;
}

/**
 * Seed initial data (call this once to populate faculties and departments)
 */
async function seedInitialData() {
    try {
        const response = await fetch(`${API_BASE}/seed/all`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        
        // Clear caches after seeding
        clearCaches();
        
        return data;
    } catch (error) {
        console.error('Error seeding data:', error);
        throw error;
    }
}

/**
 * Search for departments by query string
 * @param {string} query - Search query
 * @param {string} facultyId - Optional faculty ID to filter by
 * @returns {Promise<Array>} Array of matching departments
 */
async function searchDepartments(query, facultyId = null) {
    try {
        let url = `${API_BASE}/departments/search?q=${encodeURIComponent(query)}`;
        if (facultyId) {
            url += `&facultyId=${facultyId}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.departments || [];
    } catch (error) {
        console.error('Error searching departments:', error);
        return [];
    }
}

/**
 * Get formatted program options (courses) for a department
 * @param {Object} department - Department object
 * @param {Object} faculty - Faculty object 
 * @returns {Array} Array of course name strings
 */
function getProgramOptions(department, faculty) {
    if (!department) return [];
    
    const deptName = department.name.replace('Department of ', '').trim();
    
    // Determine degree prefix based on faculty type
    let degreePrefix = 'BSc';
    if (faculty) {
        const facultyName = faculty.name.toLowerCase();
        if (facultyName.includes('engineering')) degreePrefix = 'BEng';
        else if (facultyName.includes('arts') || facultyName.includes('humanities')) degreePrefix = 'BA';
        else if (facultyName.includes('law')) degreePrefix = 'LLB';
        else if (facultyName.includes('business')) degreePrefix = 'BBA';
        else if (facultyName.includes('health') || facultyName.includes('medicine')) degreePrefix = 'BSc';
        else if (facultyName.includes('agriculture')) degreePrefix = 'BSc';
    }
    
    // Create degree options - typically Bachelor's, Master's, and PhD
    return [
        `${degreePrefix} ${deptName}`,
        `MSc ${deptName}`,
        `PhD ${deptName}`
    ];
}

// Export functions for use in other scripts
window.BethelAPI = {
    API_BASE,
    fetchFaculties,
    fetchDepartments,
    fetchDepartmentsByFaculty,
    getFacultyById,
    getDepartmentById,
    getFacultyByName,
    getDepartmentsByFacultyName,
    populateFacultyDropdown,
    populateDepartmentDropdown,
    setupFacultyDepartmentChain,
    prepareApplicationData,
    clearCaches,
    seedInitialData,
    searchDepartments,
    getProgramOptions,
    testAPIConnectivity,
    getAPIStatus
};
