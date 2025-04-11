document.addEventListener('DOMContentLoaded', async function () {
    // --- Get Elements ---
    const searchInput = document.querySelector('.search-input');
    const tableBody = document.querySelector('.data-table tbody');
    // --- Updated Selectors ---
    const startDateTimeInput = document.getElementById('start-datetime');
    const endDateTimeInput = document.getElementById('end-datetime');
    // --- End Updated Selectors ---
    const buildingSelect = document.getElementById('building-select');
    const applyFilterBtn = document.getElementById('filter-apply-btn');

    // --- Check Elements ---
    if (!searchInput || !tableBody || !startDateTimeInput || !endDateTimeInput || !buildingSelect || !applyFilterBtn) {
        console.error("FATAL: One or more filter/table elements are missing!");
        return;
    }

    // --- Global store for fetched order data ---
    let orderHistoryData = [];

    // --- Fetches initial data OR data based on parameters ---
    async function fetchServiceHistory(params = {}) {
        const tableBody = document.querySelector('.data-table tbody'); // Re-select just in case
        if (!tableBody) { console.error("fetchServiceHistory: Table body not found."); return; }

        try {
            let url;
            let fetchOptions = {
                method: 'GET', headers: { 'Accept': 'application/json' }, credentials: 'include'
            };

            if (Object.keys(params).length > 0) {
                // Use POST endpoint for filtered requests
                url = 'https://fmsbackend-iiitd.up.railway.app/request/building-date-requests'; // The POST endpoint
                fetchOptions.method = 'POST';
                fetchOptions.headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(params);
                console.log(`Fetching FILTERED history from: ${url} with body:`, params);
            } else {
                // Use GET endpoint for all completed requests initially
                url = 'https://fmsbackend-iiitd.up.railway.app/admin/completed-requests';
                console.log(`Fetching ALL history from: ${url}`);
            }

            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Loading history...</td></tr>`; // Corrected colspan

            const response = await fetch(url, fetchOptions);
            const result = await response.json();
            console.log("Fetch response status:", response.status);
            if (!response.ok) throw new Error(result.error || `Failed to fetch history (${response.status})`);

            const data = result.requests || []; // Expect { requests: [...] }
            console.log("Data received:", data);

            // Store initial full data set globally
            if (Object.keys(params).length === 0) {
                orderHistoryData = data;
                console.log("Stored initial data globally.");
            }

            renderHistoryTable(data); // Render the fetched data

        } catch (err) {
            console.error("Error loading service history:", err);
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error loading service history: ${err.message}</td></tr>`; // Corrected colspan
            }
        }
    }

    // --- Renders the history data ---
    function renderHistoryTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const numberOfColumns = 7; // EmpID, UserID, Service, Location, Time, Status, Feedback

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${numberOfColumns}" style="text-align:center;">No service history found matching criteria</td></tr>`;
            return;
        }

        data.forEach(item => {
            const status = "completed";
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.worker_id || 'N/A'}</td>
                <td>${item.user_id || 'N/A'}</td>
                <td>${item.service_type || 'N/A'}</td>
                <td>${item.location || 'N/A'}</td>
                <td>${item.request_time ? new Date(item.request_time).toLocaleString() : 'N/A'}</td>
                <td><span class="status-badge ${status}">Completed</span></td>
                <td>${item.feedback || 'N/A'}</td>
            `;
            tableBody.appendChild(row);
        });
        filterTable(); // Apply text search AFTER rendering
    }

    // --- Text Search Filter Function ---
    function filterTable() {
        // ... (keep the filterTable function as is - it only handles text search) ...
         const searchInput = document.querySelector('.search-input'); // Re-select inside if needed
         const tableBody = document.querySelector('.data-table tbody');
         if (!searchInput || !tableBody) { return; }
         const searchTerm = searchInput.value.toLowerCase().trim();
         const rows = tableBody.querySelectorAll('tr');
         rows.forEach(row => {
             if (row.querySelectorAll('th').length > 0 || row.querySelectorAll('td[colspan]').length > 0) { row.style.display = ''; return; }
             const cells = row.querySelectorAll('td');
             let rowTextContent = '';
             if(cells.length > 0) { for(let i = 0; i < cells.length; i++) { rowTextContent += (cells[i].textContent || '').toLowerCase() + ' '; } }
             const matchesSearch = searchTerm === '' || rowTextContent.includes(searchTerm);
             row.style.display = matchesSearch ? '' : 'none';
         });
    }

    // --- Function to Fetch Data Based on Filters ---
    // Called when the green check button is clicked
    function fetchFilteredHistory() {
        // 1. Get current values from the datetime-local and select inputs
        const startDateTimeValue = startDateTimeInput.value; // YYYY-MM-DDTHH:mm
        const endDateTimeValue = endDateTimeInput.value;     // YYYY-MM-DDTHH:mm
        const buildingValue = buildingSelect.value;

        // 2. Prepare parameters object
        // Append ':00' for seconds if backend/DB requires it, otherwise datetime-local format might be fine
        const params = {};
        if (startDateTimeValue) params.startTime = `${startDateTimeValue}:00`;
        if (endDateTimeValue) params.endTime = `${endDateTimeValue}:00`;
        if (buildingValue && buildingValue !== 'all') params.building = buildingValue;

        if (Object.keys(params).length === 0) {
            console.log("No specific filters applied. Fetching all completed requests.");
            fetchServiceHistory(); // Refetch all if no filters
            return;
        }

        console.log("Applying filters:", params);
        // 3. Call fetchServiceHistory WITH the parameters to trigger POST
        fetchServiceHistory(params);
    }

    // --- Attach Listeners ---
    searchInput.addEventListener('input', filterTable);
    applyFilterBtn.addEventListener('click', fetchFilteredHistory);

    // --- Initial Load ---
    fetchServiceHistory(); // Load all history initially

    console.log("Service History script initialized.");
});