/* ============================================
   BETHEL COLLEGE STATIC DATA
   Faculty, Department, and Course Data
   ============================================ */

// Static faculty and department data
const facultiesData = [
    {
        id: "faculty-1",
        name: "FACULTY OF SCIENCE",
        icon: "🔬",
        departments: [
            "Department of Computer Science",
            "Department of Software Engineering",
            "Department of Information Systems",
            "Department of Cybersecurity",
            "Department of Artificial Intelligence",
            "Department of Data Science",
            "Department of Mathematics",
            "Department of Applied Mathematics",
            "Department of Statistics",
            "Department of Actuarial Science",
            "Department of Physics",
            "Department of Applied Physics",
            "Department of Medical Physics",
            "Department of Chemistry",
            "Department of Industrial Chemistry",
            "Department of Biochemistry",
            "Department of Biology",
            "Department of Microbiology",
            "Department of Biotechnology",
            "Department of Environmental Science"
        ]
    },
    {
        id: "faculty-2",
        name: "FACULTY OF ENGINEERING",
        icon: "🏗",
        departments: [
            "Department of Mechanical Engineering",
            "Department of Mechatronics Engineering",
            "Department of Automotive Engineering",
            "Department of Civil Engineering",
            "Department of Structural Engineering",
            "Department of Building Engineering",
            "Department of Electrical Engineering",
            "Department of Electronics Engineering",
            "Department of Computer Engineering",
            "Department of Telecommunications Engineering",
            "Department of Chemical Engineering",
            "Department of Petroleum Engineering",
            "Department of Gas Engineering",
            "Department of Marine Engineering",
            "Department of Aerospace Engineering",
            "Department of Agricultural Engineering",
            "Department of Biomedical Engineering",
            "Department of Materials Engineering",
            "Department of Metallurgical Engineering",
            "Department of Industrial & Production Engineering"
        ]
    },
    {
        id: "faculty-3",
        name: "FACULTY OF BUSINESS & MANAGEMENT SCIENCES",
        icon: "💼",
        departments: [
            "Department of Business Administration",
            "Department of Management Studies",
            "Department of Human Resource Management",
            "Department of Entrepreneurship",
            "Department of Marketing",
            "Department of International Business",
            "Department of Accounting",
            "Department of Finance",
            "Department of Banking & Finance",
            "Department of Insurance",
            "Department of Economics",
            "Department of Development Economics",
            "Department of Public Administration",
            "Department of Procurement & Supply Chain",
            "Department of Logistics Management",
            "Department of Project Management",
            "Department of Taxation",
            "Department of Real Estate Management",
            "Department of Hospitality Management",
            "Department of Tourism Management"
        ]
    },
    {
        id: "faculty-4",
        name: "FACULTY OF ARTS & HUMANITIES",
        icon: "🎨",
        departments: [
            "Department of English Language",
            "Department of English Literature",
            "Department of Linguistics",
            "Department of Creative Writing",
            "Department of History",
            "Department of International Studies",
            "Department of Philosophy",
            "Department of Religious Studies",
            "Department of Islamic Studies",
            "Department of Christian Studies",
            "Department of Theatre Arts",
            "Department of Performing Arts",
            "Department of Music",
            "Department of Fine Arts",
            "Department of Visual Arts",
            "Department of Graphic Design",
            "Department of Fashion Design",
            "Department of French",
            "Department of Spanish",
            "Department of Chinese Studies"
        ]
    },
    {
        id: "faculty-5",
        name: "FACULTY OF SOCIAL SCIENCES",
        icon: "🌍",
        departments: [
            "Department of Political Science",
            "Department of Public Policy",
            "Department of Sociology",
            "Department of Anthropology",
            "Department of Psychology",
            "Department of Criminology",
            "Department of Peace & Conflict Studies",
            "Department of Gender Studies",
            "Department of Geography",
            "Department of Urban & Regional Planning",
            "Department of Demography",
            "Department of Social Work",
            "Department of International Relations",
            "Department of Strategic Studies",
            "Department of Security Studies",
            "Department of Communication Studies",
            "Department of Media Studies",
            "Department of Journalism",
            "Department of Broadcasting",
            "Department of Development Studies"
        ]
    },
    {
        id: "faculty-6",
        name: "FACULTY OF HEALTH SCIENCES",
        icon: "🏥",
        departments: [
            "Department of Medicine",
            "Department of Surgery",
            "Department of Nursing",
            "Department of Pharmacy",
            "Department of Pharmacology",
            "Department of Anatomy",
            "Department of Physiology",
            "Department of Medical Laboratory Science",
            "Department of Public Health",
            "Department of Environmental Health",
            "Department of Dentistry",
            "Department of Optometry",
            "Department of Physiotherapy",
            "Department of Radiography",
            "Department of Nutrition & Dietetics",
            "Department of Epidemiology",
            "Department of Health Information Management",
            "Department of Community Health",
            "Department of Veterinary Medicine",
            "Department of Biomedical Sciences"
        ]
    },
    {
        id: "faculty-7",
        name: "FACULTY OF LAW",
        icon: "⚖",
        departments: [
            "Department of Public Law",
            "Department of Private Law",
            "Department of Commercial Law",
            "Department of International Law",
            "Department of Constitutional Law",
            "Department of Criminal Law",
            "Department of Property Law",
            "Department of Maritime Law",
            "Department of Environmental Law",
            "Department of Tax Law"
        ]
    },
    {
        id: "faculty-8",
        name: "FACULTY OF AGRICULTURE",
        icon: "🌾",
        departments: [
            "Department of Crop Science",
            "Department of Soil Science",
            "Department of Animal Science",
            "Department of Agricultural Economics",
            "Department of Agribusiness",
            "Department of Fisheries & Aquaculture",
            "Department of Forestry",
            "Department of Horticulture",
            "Department of Plant Breeding",
            "Department of Agricultural Extension"
        ]
    },
    {
        id: "faculty-9",
        name: "FACULTY OF EDUCATION",
        icon: "🏛",
        departments: [
            "Department of Educational Management",
            "Department of Curriculum Studies",
            "Department of Early Childhood Education",
            "Department of Primary Education",
            "Department of Secondary Education",
            "Department of Guidance & Counselling",
            "Department of Special Education",
            "Department of Educational Psychology",
            "Department of Adult Education",
            "Department of Science Education"
        ]
    },
    {
        id: "faculty-10",
        name: "FACULTY OF ENVIRONMENTAL SCIENCES",
        icon: "🏗",
        departments: [
            "Department of Architecture",
            "Department of Quantity Surveying",
            "Department of Building Technology",
            "Department of Estate Management",
            "Department of Surveying & Geoinformatics",
            "Department of Urban Planning",
            "Department of Environmental Management",
            "Department of Landscape Architecture",
            "Department of Interior Design",
            "Department of Construction Management"
        ]
    },
    {
        id: "faculty-11",
        name: "FACULTY OF INFORMATION & DIGITAL TECHNOLOGIES",
        icon: "💻",
        departments: [
            "Department of Information Technology",
            "Department of Cloud Computing",
            "Department of Blockchain Technology",
            "Department of Robotics",
            "Department of Internet of Things",
            "Department of Game Development",
            "Department of UI/UX Design",
            "Department of Digital Marketing",
            "Department of E-Commerce",
            "Department of Business Analytics"
        ]
    },
    {
        id: "faculty-12",
        name: "FACULTY OF TRANSPORT & LOGISTICS",
        icon: "🚢",
        departments: [
            "Department of Transportation Management",
            "Department of Aviation Management",
            "Department of Maritime Studies",
            "Department of Railway Engineering",
            "Department of Logistics Engineering",
            "Department of Fleet Management",
            "Department of Port Management",
            "Department of Supply Chain Analytics"
        ]
    },
    {
        id: "faculty-13",
        name: "FACULTY OF CREATIVE & MEDIA TECHNOLOGIES",
        icon: "🎭",
        departments: [
            "Department of Film Production",
            "Department of Cinematography",
            "Department of Animation",
            "Department of Multimedia Technology",
            "Department of Sound Engineering",
            "Department of Digital Photography",
            "Department of Content Creation",
            "Department of Advertising"
        ]
    },
    {
        id: "faculty-14",
        name: "FACULTY OF ADVANCED RESEARCH & INNOVATION",
        icon: "🔬",
        departments: [
            "Department of Nanotechnology",
            "Department of Renewable Energy",
            "Department of Space Science",
            "Department of Climate Change Studies",
            "Department of Artificial Intelligence Research",
            "Department of Biotechnology Research",
            "Department of Smart Systems Engineering",
            "Department of Quantum Computing"
        ]
    },
    {
        id: "faculty-15",
        name: "FACULTY OF PROFESSIONAL STUDIES",
        icon: "📊",
        departments: [
            "Department of Leadership Studies",
            "Department of Corporate Governance",
            "Department of Risk Management",
            "Department of Financial Technology (FinTech)",
            "Department of Compliance & Regulation",
            "Department of Business Law",
            "Department of Digital Transformation",
            "Department of Innovation Management"
        ]
    }
];

/**
 * Get all faculties
 * @returns {Array} Array of faculty objects
 */
function getFaculties() {
    return facultiesData;
}

/**
 * Get departments for a specific faculty
 * @param {string} facultyId - The faculty ID
 * @returns {Array} Array of department names
 */
function getDepartmentsByFacultyId(facultyId) {
    const faculty = facultiesData.find(f => f.id === facultyId);
    return faculty ? faculty.departments : [];
}

/**
 * Get departments by faculty name
 * @param {string} facultyName - The faculty name
 * @returns {Array} Array of department names
 */
function getDepartmentsByFacultyName(facultyName) {
    const faculty = facultiesData.find(f => f.name === facultyName || f.name.replace('FACULTY OF ', '') === facultyName);
    return faculty ? faculty.departments : [];
}

/**
 * Get all departments flattened
 * @returns {Array} Array of all department names
 */
function getAllDepartments() {
    return facultiesData.flatMap(f => f.departments);
}

/**
 * Get course options for a department
 * @param {string} departmentName - The department name
 * @param {string} facultyName - The faculty name (optional, for degree prefix)
 * @returns {Array} Array of course/program names
 */
function getCourseOptions(departmentName, facultyName = '') {
    // Extract the core subject from department name
    let subject = departmentName.replace('Department of ', '').trim();
    
    // Determine degree prefix based on faculty
    let degreePrefix = 'BSc';
    const fn = facultyName.toLowerCase();
    if (fn.includes('engineering')) degreePrefix = 'BEng';
    else if (fn.includes('arts') || fn.includes('humanities')) degreePrefix = 'BA';
    else if (fn.includes('law')) degreePrefix = 'LLB';
    else if (fn.includes('business') || fn.includes('management')) degreePrefix = 'BBA';
    else if (fn.includes('health') || fn.includes('medicine') || fn.includes('nursing')) degreePrefix = 'BSc';
    else if (fn.includes('agriculture')) degreePrefix = 'BSc';
    else if (fn.includes('education')) degreePrefix = 'B.Ed';
    else if (fn.includes('social sciences')) degreePrefix = 'BA';
    else if (fn.includes('science')) degreePrefix = 'BSc';
    
    // Handle special cases
    if (subject.includes('Medicine') || subject.includes('Surgery')) {
        degreePrefix = 'MBBS';
    }
    
    // Generate course options
    const courses = [];
    
    if (degreePrefix === 'MBBS') {
        courses.push(`MBBS ${subject.replace('Medicine', '').replace('Surgery', '').trim()}`);
    } else if (degreePrefix === 'LLB') {
        courses.push(`LLB (Hons) ${subject.replace('Law', '').trim()}`);
    } else if (degreePrefix === 'B.Ed') {
        courses.push(`B.Ed ${subject.replace('Education', '').trim()}`);
    } else {
        courses.push(`${degreePrefix} ${subject}`);
    }
    
    // Add Master's and PhD options
    if (degreePrefix !== 'MBBS') {
        const mastersPrefix = degreePrefix.replace('B', 'M');
        courses.push(`${mastersPrefix} ${subject}`);
        courses.push(`PhD ${subject}`);
    }
    
    return courses;
}

/**
 * Find faculty by department name
 * @param {string} departmentName - The department name
 * @returns {Object|null} Faculty object or null
 */
function getFacultyByDepartment(departmentName) {
    return facultiesData.find(f => f.departments.includes(departmentName)) || null;
}

// Export functions for use in other scripts
window.StaticData = {
    faculties: facultiesData,
    getFaculties,
    getDepartmentsByFacultyId,
    getDepartmentsByFacultyName,
    getAllDepartments,
    getCourseOptions,
    getFacultyByDepartment
};
