  const statusResult = document.getElementById('statusResult');
        const appIdInput = document.getElementById('appIdInput');
        const checkBtn = document.getElementById('checkBtn');

        function showResult(html) {
            statusResult.style.display = 'block';
            statusResult.innerHTML = html;
        }

        async function fetchStatus(id) {
            if (!id) return;
            showResult('<div class="alert alert-info">Checking status&hellip;</div>');
            try {
                const res = await fetch(`https://school-management-api-zeta-two.vercel.app/api/applications/${encodeURIComponent(id)}/status`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
                const data = await res.json();
                if (res.ok) {
                    const submitted = data.submissionDate ? new Date(data.submissionDate).toLocaleString() : 'N/A';
                    showResult(`
                        <div class="alert alert-success">
                            <h5 class="mb-1">Status: ${data.status}</h5>
                            <p class="mb-1"><strong>Submitted:</strong> ${submitted}</p>
                            <p class="mb-0"><strong>Remarks:</strong> ${data.remarks || 'None'}</p>
                        </div>
                    `);
                } else {
                    showResult(`<div class="alert alert-danger">${data.message || 'Application not found'}</div>`);
                }
            } catch (err) {
                console.error('Error fetching status', err);
                showResult('<div class="alert alert-danger">Network error while checking status.</div>');
            }
        }

        checkBtn.addEventListener('click', () => fetchStatus(appIdInput.value.trim()));

        // Auto-check from URL ?id=
        const params = new URLSearchParams(window.location.search);
        const idFromUrl = params.get('id');
        if (idFromUrl) {
            appIdInput.value = idFromUrl;
            fetchStatus(idFromUrl);
        }
