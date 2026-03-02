        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('token');
            const userRole = localStorage.getItem('userRole');

            if (!token || userRole !== 'student') {
                alert('Access denied. Please log in as a student.');
                window.location.href = 'login.html';
                return;
            }

            // Prefill name and email if available
            const studentNameInput = document.getElementById('studentName');
            const studentEmailInput = document.getElementById('studentEmail');

            fetch('https://school-management-api-zeta-two.vercel.app/api/students/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch profile'))
            .then(data => {
                const profile = data.profile;
                if (profile) {
                    studentNameInput.value = `${profile.Firstname || ''} ${profile.Lastname || ''}`.trim();
                    studentEmailInput.value = profile.email || '';
                }
            })
            .catch(console.error);

            const form = document.getElementById('supportForm');
            const alertPlaceholder = document.getElementById('alertPlaceholder');

            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = {
                    studentName: studentNameInput.value.trim(),
                    studentEmail: studentEmailInput.value.trim(),
                    subject: form.subject.value.trim(),
                    category: form.category.value,
                    message: form.message.value.trim()
                };

                if (!formData.studentName || !formData.studentEmail || !formData.subject || !formData.category || !formData.message) {
                    showAlert('Please fill in all fields.', 'danger');
                    return;
                }

                try {
                    const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/support/request', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });

                    if (response.ok) {
                        showAlert('Your support request has been submitted successfully.', 'success');
                        form.reset();
                    } else {
                        const errorData = await response.json();
                        showAlert(errorData.message || 'Failed to submit support request.', 'danger');
                    }
                } catch (error) {
                    showAlert('An error occurred while submitting your request. Please try again later.', 'danger');
                }
            });

            function showAlert(message, type) {
                alertPlaceholder.innerHTML = `
                    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
            }
        });
