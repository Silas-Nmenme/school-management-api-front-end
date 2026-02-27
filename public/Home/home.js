// API Base URL - Vercel API (defined at the top so it's available to all functions)
        const API_BASE_URL = 'https://school-management-api-zeta-two.vercel.app/api';

        // Animate on scroll using Intersection Observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe feature cards and sections for scroll animations
        document.querySelectorAll('.feature-card, .fade-in-up').forEach(el => {
            el.classList.add('fade-in-up');
            observer.observe(el);
        });

        // Fetch and update student count dynamically
        async function updateStudentCount() {
            try {
                const response = await fetch(`${API_BASE_URL}/students/student-count`);
                if (response.ok) {
                    const data = await response.json();
                    const studentCountElement = document.getElementById('studentCount');
                    studentCountElement.textContent = data.totalStudents + '+';
                } else {
                    console.error('Failed to fetch student count:', response.statusText);
                }
            } catch (error) {
                console.error('Error fetching student count:', error);
            }
        }

        // Update student count on page load
        updateStudentCount();

        // Contact form submission with toast notifications
        document.getElementById('contactForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get the form element using e.currentTarget to ensure correct reference
            const form = e.currentTarget;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            
            // Validate required fields
            if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                toast.error('Please fill in all required fields.', 'Validation Error');
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading-spinner-custom"></span> Sending...';
            
            try {
                // Send form data to backend API
                const response = await fetch(`${API_BASE_URL}/contact`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Show success toast
                    toast.success('Your message has been sent successfully! We will get back to you soon.', 'Message Sent');
                    
                    // Reset form
                    form.reset();
                } else {
                    // Show error toast
                    toast.error(data.message || 'Failed to send message. Please try again.', 'Error');
                }
            } catch (error) {
                console.error('Contact form submission error:', error);
                // Show error toast for network errors
                toast.error('Network error. Please check your connection and try again.', 'Connection Error');
            } finally {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Add hover effects to feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.querySelector('.feature-icon').style.transform = 'scale(1.1)';
            });
            card.addEventListener('mouseleave', function() {
                this.querySelector('.feature-icon').style.transform = 'scale(1)';
            });
        });

        // Load academic programs from backend API with static fallback
        async function loadPrograms() {
            const programsLoading = document.getElementById('programsLoading');
            const facultiesAccordion = document.getElementById('facultiesAccordion');
            const errorDetails = document.getElementById('errorDetails');

            try {
                console.log('Loading programs from backend API...');
                
                // Fetch faculties from backend API
                const facultiesResponse = await fetch(`${API_BASE_URL}/faculties`);
                
                if (!facultiesResponse.ok) {
                    throw new Error('Failed to fetch faculties from API');
                }
                
                const facultiesData = await facultiesResponse.json();
                const faculties = facultiesData.faculties || facultiesData;
                
                if (!faculties || faculties.length === 0) {
                    console.log('No faculties from API, falling back to static data');
                    throw new Error('No faculties found');
                }

                console.log(`Loaded ${faculties.length} faculties from API`);

                // Build accordion items for each faculty
                let accordionHTML = '';
                for (let i = 0; i < faculties.length; i++) {
                    const faculty = faculties[i];
                    const isExpanded = i === 0; // Expand first faculty
                    
                    // Get departments for this faculty from API
                    let departments = [];
                    try {
                        const deptResponse = await fetch(`${API_BASE_URL}/faculties/${faculty._id || faculty.id}/departments`);
                        if (deptResponse.ok) {
                            const deptData = await deptResponse.json();
                            // The API returns { message, faculty: { departments: [...] }, totalDepartments }
                            // Extract departments from deptData.faculty.departments
                            if (deptData.faculty && Array.isArray(deptData.faculty.departments)) {
                                departments = deptData.faculty.departments;
                            } else if (Array.isArray(deptData.departments)) {
                                departments = deptData.departments;
                            } else if (Array.isArray(deptData)) {
                                departments = deptData;
                            } else {
                                console.warn(`Unexpected departments format for ${faculty.name}:`, deptData);
                            }
                        }
                    } catch (deptError) {
                        console.error(`Error fetching departments for ${faculty.name}:`, deptError);
                    }
                    
                    // Only use static data fallback if departments is still empty after API attempt
                    if (!departments || !Array.isArray(departments) || departments.length === 0) {
                        console.log(`No departments from API for ${faculty.name}, loading from static data`);
                        const staticFaculties = StaticData.getFaculties();
                        const staticFaculty = staticFaculties.find(f => f.name === faculty.name);
                        if (staticFaculty && staticFaculty.departments) {
                            departments = staticFaculty.departments.map(d => ({ name: d, courses: [] }));
                        }
                    }
                    
                    console.log(`Loaded ${departments.length} departments for ${faculty.name}`);
                    
                    // Build department HTML
                    let departmentsHTML = '';
                    let colIndex = 0;
                    
                    for (const dept of departments) {
                        if (colIndex % 2 === 0) {
                            if (colIndex > 0) departmentsHTML += '</div>';
                            departmentsHTML += '<div class="row">';
                        }
                        
                        const deptName = dept.name;
                        
                        // Get courses from API or generate from static data
                        let courses = [];
                        if (dept.courses && dept.courses.length > 0) {
                            courses = dept.courses;
                        } else {
                            // Fall back to static data course generation
                            courses = StaticData.getCourseOptions(deptName, faculty.name).map(c => ({ name: c, type: 'Program' }));
                        }
                        
                        departmentsHTML += `
                            <div class="col-md-6">
                                <h5>${deptName}</h5>
                                <ul class="list-unstyled">
                        `;
                        
                        // Add program options
                        courses.forEach(program => {
                            const programName = program.name || program;
                            const programType = program.type || '';
                            departmentsHTML += `<li><i class="fas fa-graduation-cap me-2"></i>${programName}</li>`;
                        });
                        
                        departmentsHTML += `
                                </ul>
                            </div>
                        `;
                        colIndex++;
                    }
                    if (colIndex > 0) departmentsHTML += '</div>';
                    
                    // Create accordion item
                    const facultyIcon = faculty.icon || '📚';
                    accordionHTML += `
                        <div class="accordion-item">
                            <h2 class="accordion-header" id="heading${i}">
                                <button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="${isExpanded}" aria-controls="collapse${i}">
                                    ${facultyIcon} ${faculty.name}
                                </button>
                            </h2>
                            <div id="collapse${i}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" aria-labelledby="heading${i}" data-bs-parent="#facultiesAccordion">
                                <div class="accordion-body">
                                    ${departmentsHTML}
                                </div>
                            </div>
                        </div>
                    `;
                }
                
                // Update accordion
                facultiesAccordion.innerHTML = accordionHTML;
                programsLoading.style.display = 'none';
                facultiesAccordion.style.display = 'block';
                errorDetails.style.display = 'none';
                
                console.log('Programs loaded successfully from API');
            } catch (error) {
                console.warn('API fetch failed, falling back to static data:', error);
                
                // Fallback to static data
                try {
                    console.log('Loading programs from static data fallback...');
                    
                    const faculties = StaticData.getFaculties();
                    console.log(`Loaded ${faculties.length} faculties from static data`);
                    
                    if (!faculties || faculties.length === 0) {
                        throw new Error('No faculties found');
                    }

                    // Build accordion items for each faculty
                    let accordionHTML = '';
                    for (let i = 0; i < faculties.length; i++) {
                        const faculty = faculties[i];
                        const isExpanded = i === 0;
                        
                        const departments = faculty.departments;
                        console.log(`Loaded ${departments.length} departments for ${faculty.name}`);
                        
                        let departmentsHTML = '';
                        let colIndex = 0;
                        for (const deptName of departments) {
                            if (colIndex % 2 === 0) {
                                if (colIndex > 0) departmentsHTML += '</div>';
                                departmentsHTML += '<div class="row">';
                            }
                            
                            const courseOptions = StaticData.getCourseOptions(deptName, faculty.name);
                            
                            departmentsHTML += `
                                <div class="col-md-6">
                                    <h5>${deptName}</h5>
                                    <ul class="list-unstyled">
                            `;
                            
                            courseOptions.forEach(program => {
                                departmentsHTML += `<li><i class="fas fa-graduation-cap me-2"></i>${program}</li>`;
                            });
                            
                            departmentsHTML += `
                                    </ul>
                                </div>
                            `;
                            colIndex++;
                        }
                        if (colIndex > 0) departmentsHTML += '</div>';
                        
                        accordionHTML += `
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="heading${i}">
                                    <button class="accordion-button ${isExpanded ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="${isExpanded}" aria-controls="collapse${i}">
                                        ${faculty.icon} ${faculty.name}
                                    </button>
                                </h2>
                                <div id="collapse${i}" class="accordion-collapse collapse ${isExpanded ? 'show' : ''}" aria-labelledby="heading${i}" data-bs-parent="#facultiesAccordion">
                                    <div class="accordion-body">
                                        ${departmentsHTML}
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    facultiesAccordion.innerHTML = accordionHTML;
                    programsLoading.style.display = 'none';
                    facultiesAccordion.style.display = 'block';
                    errorDetails.style.display = 'none';
                    
                    console.log('Programs loaded successfully from static data');
                } catch (staticError) {
                    console.error('Error loading programs:', staticError);
                    programsLoading.style.display = 'none';
                    facultiesAccordion.style.display = 'none';
                    errorDetails.style.display = 'block';
                }
            }
        }

        // Load programs when page loads
        document.addEventListener('DOMContentLoaded', loadPrograms);

        // Navbar toggle functionality
        document.addEventListener('DOMContentLoaded', function() {
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.getElementById('navbarNav');
            const navbarTogglerIcon = navbarToggler.querySelector('i');

            // Toggle icon on collapse show/hide
            navbarCollapse.addEventListener('show.bs.collapse', function() {
                navbarTogglerIcon.classList.remove('fa-bars');
                navbarTogglerIcon.classList.add('fa-times');
            });

            navbarCollapse.addEventListener('hide.bs.collapse', function() {
                navbarTogglerIcon.classList.remove('fa-times');
                navbarTogglerIcon.classList.add('fa-bars');
            });

            // Close navbar when clicking outside
            document.addEventListener('click', function(event) {
                const isClickInsideNavbar = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);
                if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
                        hide: true
                    });
                }
            });
        });

        // Automatic year adjustment
        document.getElementById('currentYear').textContent = new Date().getFullYear();
