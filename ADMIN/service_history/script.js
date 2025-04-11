document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');

    // Fetch service history data from backend
    async function fetchServiceHistory() {
        try {
            const response = await fetch('https://fmsbackend-iiitd.up.railway.app/admin/completed-requests');
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Failed to fetch');

            const data = result.requests || [];

            tableBody.innerHTML = ''; // Clear any existing rows

            if (data.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No service history found</td></tr>`;
                return;
            }

            data.forEach(item => {
                const status = "completed"; // Because we're fetching only completed
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.worker_id}</td>
                    <td>${item.user_id}</td>
                    <td>${item.service_type}</td>
                    <td>${item.location}</td>
                    <td>${new Date(item.request_time).toLocaleString()}</td>
                    <td><span class="status-badge ${status}">Completed</span></td>
                    <td>${item.feedback || 'N/A'}</td>
                `;
                tableBody.appendChild(row);
            });

            filterTable(); // Apply initial filter

        } catch (err) {
            console.error("Error loading service history:", err);
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error loading service history</td></tr>`;
        }
    }

    // --- Existing Filter Function ---
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        const rows = tableBody.querySelectorAll('tr:not(.empty-row)');

        rows.forEach(row => {
            const serviceData = {
                employeeId: row.cells[0]?.textContent.toLowerCase(),
                userId: row.cells[1]?.textContent.toLowerCase(),
                requestedService: row.cells[2]?.textContent.toLowerCase(),
                location: row.cells[3]?.textContent.toLowerCase(),
                requestedTime: row.cells[4]?.textContent.toLowerCase(),
                status: row.querySelector('.status-badge')?.textContent.toLowerCase() || '',
                feedback: row.cells[6]?.textContent.toLowerCase()
            };

            const matchesSearch = Object.values(serviceData).some(value =>
                value.includes(searchTerm)
            );

            const matchesFilter = filterValue === 'all' ||
                (row.querySelector('.status-badge')?.classList.contains(filterValue) ?? false);

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Attach listeners
    searchInput.addEventListener('input', filterTable);
    filterSelect.addEventListener('change', filterTable);

    // Initial load
    await fetchServiceHistory();
});
