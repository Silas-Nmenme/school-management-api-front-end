/* ============================================
   BETHEL COLLEGE API CONFIGURATION
   Faculty & Department API Utilities
   ============================================ */

// API Base URL Configuration
// Change this based on your backend location:
// LOCAL: 'http://localhost:5000/api' or 'http://localhost:3000/api'
// VERCEL: 'https://school-management-api-zeta-two.vercel.app/api'
const API_BASE = 'https://school-management-api-zeta-two.vercel.app'; // <-- Change this to match your backend

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

/**
 * Comprehensive API Diagnostic - Run this in browser console for troubleshooting
 * Usage: await BethelAPI.diagnoseAPI()
 */
async function diagnoseAPI() {
    console.log('🔍 Bethel College API Diagnostic Report');
    console.log('=' .repeat(50));
    
    const report = {
        timestamp: new Date().toISOString(),
        apiBaseUrl: API_BASE,
        checks: {}
    };
    
    // Check 1: API Base URL format
    console.log('✓ Check 1: API Base URL');
    console.log(`  URL: ${API_BASE}`);
    report.checks.urlFormat = {
        status: API_BASE ? 'OK' : 'MISSING',
        url: API_BASE
    };
    
    // Check 2: Test connectivity to faculties endpoint
    console.log('✓ Check 2: Testing /api/faculties endpoint');
    try {
        const response = await fetch(`${API_BASE}/faculties`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`  ✓ Connected! Found ${data.faculties?.length || 0} faculties`);
            report.checks.facultiesEndpoint = {
                status: 'SUCCESS',
                httpStatus: response.status,
                totalFaculties: data.faculties?.length || 0
            };
        } else {
            console.error(`  ✗ HTTP Error ${response.status}`);
            report.checks.facultiesEndpoint = {
                status: 'ERROR',
                httpStatus: response.status,
                message: `Got ${response.status} error - backend may not have this endpoint`
            };
        }
    } catch (error) {
        console.error(`  ✗ Connection Error: ${error.message}`);
        report.checks.facultiesEndpoint = {
            status: 'FAILED',
            error: error.message,
            troubleshoot: [
                '1. Is backend server running?',
                '2. Is it running on the correct port?',
                '3. Check API_BASE URL is correct',
                '4. If using Vercel, is it deployed?'
            ]
        };
    }
    
    // Check 3: Test connectivity to departments endpoint
    console.log('✓ Check 3: Testing /api/departments endpoint');
    try {
        const response = await fetch(`${API_BASE}/departments`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`  ✓ Connected! Found ${data.departments?.length || 0} departments`);
            report.checks.departmentsEndpoint = {
                status: 'SUCCESS',
                httpStatus: response.status,
                totalDepartments: data.departments?.length || 0
            };
        } else {
            console.error(`  ✗ HTTP Error ${response.status}`);
            report.checks.departmentsEndpoint = {
                status: 'ERROR',
                httpStatus: response.status
            };
        }
    } catch (error) {
        console.error(`  ✗ Connection Error: ${error.message}`);
        report.checks.departmentsEndpoint = {
            status: 'FAILED',
            error: error.message
        };
    }
    
    // Check 4: Cache status
    console.log('✓ Check 4: Cache Status');
    console.log(`  Faculties cached: ${facultiesCache ? facultiesCache.length : 0}`);
    console.log(`  Departments cached: ${departmentsCache ? departmentsCache.length : 0}`);
    report.checks.cache = {
        facultiesCached: facultiesCache?.length || 0,
        departmentsCached: departmentsCache?.length || 0
    };
    
    // Summary
    console.log('=' .repeat(50));
    console.log('📋 DIAGNOSTIC SUMMARY:');
    console.log(JSON.stringify(report, null, 2));
    
    // Recommendations
    const hasFacultiesError = report.checks.facultiesEndpoint?.status !== 'SUCCESS';
    if (hasFacultiesError) {
        console.warn('⚠️ RECOMMENDATIONS:');
        console.warn('1. Start your backend server: npm start');
        console.warn('2. Verify the port matches API_BASE (currently ' + API_BASE + ')');
        console.warn('3. Check that routes are registered in your backend');
        console.warn('4. Seed database: POST to http://localhost:PORT/api/seed/all');
    } else {
        console.log('✅ API is working! Try running: await BethelAPI.fetchFaculties()');
    }
    
    return report;
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
    getAPIStatus,
    diagnoseAPI
};
