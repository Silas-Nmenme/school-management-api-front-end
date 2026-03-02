 let allResources = [];

        // Role-based access check and load student data
        document.addEventListener('DOMContentLoaded', async function() {
            const userRole = localStorage.getItem('userRole');
            const token = localStorage.getItem('token');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = '../Login/login.html';
                return;
            }

            // Fetch student profile
            try {
                const profileResponse = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const profileData = await profileResponse.json();
                    const profile = profileData.profile;
                    const studentName = `${profile.Firstname || ''} ${profile.Lastname || ''}`.trim() || 'Student';
                    const studentId = profile.studentId || 'N/A';

                    document.getElementById('studentName').textContent = studentName;
                    document.querySelector('.student-info small').textContent = `Student ID: ${studentId}`;
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }

            // Fetch library resources
            await loadLibraryResources();
        });

        async function loadLibraryResources() {
            try {
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/students/library', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                document.getElementById('loadingMessage').style.display = 'none';

                if (response.ok) {
                    const data = await response.json();
                    allResources = data.resources || [];
                    displayResources(allResources);
                } else {
                    console.error('Failed to fetch library resources');
                    document.getElementById('resourcesGrid').innerHTML = '<div class="col-12"><p class="text-center text-muted">Unable to load library resources at this time.</p></div>';
                }
            } catch (error) {
                console.error('Error fetching library resources:', error);
                document.getElementById('loadingMessage').style.display = 'none';
                document.getElementById('resourcesGrid').innerHTML = '<div class="col-12"><p class="text-center text-muted">Error loading library resources. Please try again later.</p></div>';
            }
        }

        function displayResources(resources) {
            const grid = document.getElementById('resourcesGrid');
            grid.innerHTML = '';

            if (resources.length === 0) {
                document.getElementById('noResultsMessage').classList.remove('d-none');
                return;
            }

            document.getElementById('noResultsMessage').classList.add('d-none');

            resources.forEach(resource => {
                const resourceCard = document.createElement('div');
                resourceCard.className = 'col-md-6 col-lg-4 mb-4';
                resourceCard.innerHTML = `
                    <div class="card resource-card position-relative">
                        <div class="availability-badge ${resource.available ? 'available' : 'unavailable'}">
                            ${resource.available ? 'Available' : 'Unavailable'}
                        </div>
                        <div class="card-body">
                            <div class="resource-type ${resource.type.toLowerCase()}">
                                ${resource.type}
                            </div>
                            <h6 class="resource-title">${resource.title}</h6>
                            <p class="resource-author">by ${resource.author}</p>
                            <div class="mt-auto">
                                ${resource.available ?
                                    `<a href="${resource.link}" target="_blank" class="btn btn-custom btn-sm">
                                        <i class="fas fa-external-link-alt me-1"></i>Access Resource
                                    </a>` :
                                    `<button class="btn btn-secondary btn-sm" disabled>
                                        <i class="fas fa-clock me-1"></i>Unavailable
                                    </button>`
                                }
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(resourceCard);
            });
        }

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function() {
            filterResources();
        });

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                filterResources();
            });
        });

        function filterResources() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

            let filteredResources = allResources;

            // Apply type filter
            if (activeFilter !== 'all') {
                filteredResources = filteredResources.filter(resource =>
                    resource.type.toLowerCase() === activeFilter
                );
            }

            // Apply search filter
            if (searchTerm) {
                filteredResources = filteredResources.filter(resource =>
                    resource.title.toLowerCase().includes(searchTerm) ||
                    resource.author.toLowerCase().includes(searchTerm) ||
                    resource.type.toLowerCase().includes(searchTerm)
                );
            }

            displayResources(filteredResources);
        }

        // Logout functionality
        document.getElementById('logoutBtn').addEventListener('click', function() {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            localStorage.removeItem('studentName');
            window.location.href = '../Login/login.html';
        });
