document.addEventListener('DOMContentLoaded', async function () {
    // --- Get Elements ---
    const searchInput = document.querySelector('.search-input');
    // Removed filterSelect reference as it's now specific to building
    const tableBody = document.querySelector('.data-table tbody');
    const startDateInput = document.getElementById('S_D');
    const startTimeInput = document.getElementById('S_T');
    const endDateInput = document.getElementById('E_D');
    const endTimeInput = document.getElementById('E_T');
    const buildingSelect = document.getElementById('building-select'); // Get building select
    const applyFilterBtn = document.getElementById('filter-apply-btn'); // Get the button

    // --- Check Elements ---
    if (!searchInput || !tableBody || !startDateInput || !startTimeInput || !endDateInput || !endTimeInput || !buildingSelect || !applyFilterBtn) {
        console.error("FATAL: One or more filter/table elements are missing!");
        return;
    }

    // --- Initial Data Load (Keeps existing functionality) ---
    async function fetchServiceHistory(params = {}) { // Allow passing query params
        try {
            // --- Build URL with optional paramet
            const baseUrl = 'https://fmsbackend-iiitd.up.railway.app/admin/completed-requests'; // Base endpoint
            const queryParams = new URLSearchParams();

            // Add params ONLY if they have a value
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.startTime) queryParams.append('startTime', params.startTime);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            if (params.endTime) queryParams.append('endTime', params.endTime);
            if (params.building && params.building !== 'all') queryParams.append('building', params.building);
            // Add search term if needed (though often handled client-side after fetch)
            // if (params.searchTerm) queryParams.append('search', params.searchTerm);

            const url = `${baseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            console.log("Fetching history from:", url);
            // --- End URL Build ---

            // Add credentials if backend requires session
            const response = await fetch(url, { credentials: 'include' });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || `Failed to fetch (${response.status})`);

            const data = result.requests || [];
            renderHistoryTable(data); // Call a dedicated render function

        } catch (err) {
            console.error("Error loading service history:", err);
            if (tableBody) { // Check tableBody again just in case
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Error loading service history: ${err.message}</td></tr>`;
            }
        }
    }

    // --- Renders the history data ---
    function renderHistoryTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = ''; // Clear any existing rows

        if (data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No service history found matching criteria</td></tr>`;
            return;
        }

        data.forEach(item => {
            const status = "completed"; // Assuming this endpoint only returns completed
            const row = document.createElement('tr');
            // ** Ensure these property names match your data **
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

        filterTable(); // Apply text search filter AFTER rendering new data
    }


    // --- Text Search Filter Function (Filters currently displayed rows) ---
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const rows = tableBody.querySelectorAll('tr'); // Get all rows currently in tbody

        rows.forEach(row => {
            // Skip header rows if any sneak in, or message rows
            if (row.querySelectorAll('th').length > 0 || row.querySelectorAll('td[colspan]').length > 0) {
                 row.style.display = ''; // Keep message rows visible
                 return;
            }

            // --- Updated Search Logic ---
            const cells = row.querySelectorAll('td');
            let rowTextContent = '';
            if(cells.length > 0) {
                // Combine text from all cells
                 for(let i = 0; i < cells.length; i++) {
                     rowTextContent += (cells[i].textContent || '').toLowerCase() + ' ';
                 }
            }

            const matchesSearch = searchTerm === '' || rowTextContent.includes(searchTerm);
            row.style.display = matchesSearch ? '' : 'none';
        });
    }

    // --- Function to Fetch Data Based on Filters ---
    // This is called when the green check button is clicked
    function fetchFilteredHistory() {
        // 1. Get current values from all filters
        const startDate = startDateInput.value;
        const startTime = startTimeInput.value;
        const endDate = endDateInput.value;
        const endTime = endTimeInput.value;
        const building = buildingSelect.value;

        // 2. Prepare parameters object (only include non-empty values)
        const params = {};
        if (startDate) params.startDate = startDate;
        if (startTime) params.startTime = startTime;
        if (endDate) params.endDate = endDate;
        if (endTime) params.endTime = endTime;
        if (building && building !== 'all') params.building = building; // Don't send 'all'

        console.log("Applying filters:", params);

        // 3. Call the fetch function with the parameters
        // This will construct the URL and fetch/render the new data
        fetchServiceHistory(params);
    }

    // --- Attach Listeners ---
    searchInput.addEventListener('input', filterTable); // Text search filters current view
    applyFilterBtn.addEventListener('click', fetchFilteredHistory); // Button triggers new fetch

    // --- Initial Load ---
    fetchServiceHistory(); // Load all history initially
});