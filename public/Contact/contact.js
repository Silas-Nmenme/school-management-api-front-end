 document.addEventListener('DOMContentLoaded', function() {
            const form = document.querySelector('form');
            const submitBtn = document.querySelector('button[type="submit"]');
            const apiUrl = 'https://school-management-api-zeta-two.vercel.app/api/contact';

            form.addEventListener('submit', async function(e) {
                e.preventDefault();

                // Get form data
                const formData = {
                    name: document.getElementById('name').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    subject: document.getElementById('subject').value.trim(),
                    message: document.getElementById('message').value.trim()
                };

                // Basic validation
                if (!formData.name || !formData.email || !formData.subject || !formData.message) {
                    alert('Please fill in all fields.');
                    return;
                }

                if (!formData.email.includes('@')) {
                    alert('Please enter a valid email address.');
                    return;
                }

                // Disable submit button and show loading
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';

                try {
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    if (response.ok) {
                        alert('Thank you! Your message has been sent successfully. We will get back to you soon.');
                        form.reset();
                    } else {
                        const errorData = await response.json();
                        alert(`Error: ${errorData.message || 'Failed to send message. Please try again.'}`);
                    }
                } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('An error occurred while sending your message. Please check your connection and try again.');
                } finally {
                    // Re-enable submit button
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Message';
                }
            });
        });