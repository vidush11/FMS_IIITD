document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');
    const rows = tableBody.querySelectorAll('tr:not(.empty-row)');

    // Function to filter table rows
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        rows.forEach(row => {
            // Adjusted indices for service history columns
            const serviceData = {
                employeeId: row.cells[0].textContent.toLowerCase(),
                userId: row.cells[1].textContent.toLowerCase(),
                requestedService: row.cells[2].textContent.toLowerCase(),
                location: row.cells[3].textContent.toLowerCase(),
                requestedTime: row.cells[4].textContent.toLowerCase(),
                status: row.querySelector('.status-badge')?.textContent.toLowerCase() || '', // Status is in cell 5
                feedback: row.cells[6].textContent.toLowerCase()
            };

            // Check if row matches search term
            const matchesSearch = Object.values(serviceData).some(value =>
                value.includes(searchTerm)
            );

            // Check if row matches filter (status is still in cell 5)
            const matchesFilter = filterValue === 'all' ||
                (row.querySelector('.status-badge')?.classList.contains(filterValue) ?? false);

            // Show/hide row based on both conditions
            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Event listeners for search and filter
    searchInput.addEventListener('input', filterTable);
    filterSelect.addEventListener('change', filterTable);

    // No 'View' button functionality needed as per the new table structure
    // If you need interaction with rows, add event listeners here
}); 