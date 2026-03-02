 // Show/hide group size field based on visit type
        document.getElementById('visitType').addEventListener('change', function() {
            const groupSizeGroup = document.getElementById('groupSizeGroup');
            if (this.value === 'group') {
                groupSizeGroup.style.display = 'block';
            } else {
                groupSizeGroup.style.display = 'none';
            }
        });

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('visitDate').setAttribute('min', today);

        // Form submission
        document.getElementById('visitForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            const visitMessage = document.getElementById('visitMessage');

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';

            // Hide previous messages
            visitMessage.style.display = 'none';

            try {
                // Collect form data
                const formData = new FormData(this);
                const visitData = {
                    firstName: formData.get('firstName'),
                    lastName: formData.get('lastName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    visitDate: formData.get('visitDate'),
                    visitTime: formData.get('visitTime'),
                    visitType: formData.get('visitType'),
                    groupSize: formData.get('visitType') === 'group' ? parseInt(formData.get('groupSize')) || 1 : 1,
                    interests: Array.from(document.getElementById('interests').selectedOptions).map(option => option.value),
                    message: formData.get('message') || ''
                };

                // Send to backend
                const response = await fetch('https://school-management-api-zeta-two.vercel.app/api/visits', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(visitData)
                });

                const data = await response.json();

                if (response.ok) {
                    // Show success message
                    visitMessage.className = 'alert alert-success';
                    visitMessage.innerHTML = `
                        <strong>Thank you, ${visitData.firstName}!</strong><br>
                        Your visit request has been submitted successfully. We will send a confirmation email shortly and contact you within 2 business days to confirm your appointment.
                    `;
                    visitMessage.style.display = 'block';

                    // Reset form
                    this.reset();
                    document.getElementById('groupSizeGroup').style.display = 'none';
                } else {
                    // Show error message
                    visitMessage.className = 'alert alert-danger';
                    visitMessage.textContent = data.message || 'Failed to submit visit request. Please try again.';
                    visitMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Visit submission error:', error);
                visitMessage.className = 'alert alert-danger';
                visitMessage.textContent = 'Network error. Please check your connection and try again.';
                visitMessage.style.display = 'block';
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
