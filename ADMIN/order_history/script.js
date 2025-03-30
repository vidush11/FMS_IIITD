document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');
    // const rows = tableBody.querySelectorAll('tr:not(.empty-row)'); // No longer needed here

    // --- Sample Data Store ---
    // In a real app, this would be fetched from an API
    let orderHistoryData = [
        { orderId: 'ORD-101', userId: 'USR-001', employeeId: 'EMP-003', location: 'H1-B-101', date: '2024-07-20', status: 'completed' },
        { orderId: 'ORD-102', userId: 'USR-005', employeeId: 'EMP-001', location: 'UHC-205', date: '2024-07-21', status: 'pending' },
        { orderId: 'ORD-103', userId: 'USR-012', employeeId: 'EMP-002', location: 'Rs.D-110', date: '2024-07-21', status: 'cancelled' },
        { orderId: 'ORD-104', userId: 'USR-008', employeeId: 'EMP-003', location: 'H1-A-302', date: '2024-07-19', status: 'completed' },
        { orderId: 'ORD-105', userId: 'USR-002', employeeId: 'EMP-004', location: 'Building-X-101', date: '2024-07-22', status: 'in-progress' },
        // Add more sample orders if needed
    ];

    // --- Helper Functions (Keep createStatusBadge and createStatusSelect) ---
    // Helper: Create Status Badge
    function createStatusBadge(statusClass) {
        const span = document.createElement('span');
        span.classList.add('status-badge', statusClass);
        let statusText = statusClass.replace('-', ' ');
        statusText = statusText.charAt(0).toUpperCase() + statusText.slice(1);
        span.textContent = statusText;
        return span;
    }

    // Helper: Create Status Select Dropdown
    function createStatusSelect(currentStatusClass) {
        const select = document.createElement('select');
        select.className = 'status-select edit-input';
        const statuses = {
            'pending': 'Pending',
            'in-progress': 'In Progress',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        for (const value in statuses) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = statuses[value];
            if (value === currentStatusClass) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        return select;
    }

    // --- Table Rendering Function ---
    function renderTable(data) {
        tableBody.innerHTML = ''; // Clear existing rows
        if (!data || data.length === 0) {
            // Optional: Display a message if no data
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 7; // Match number of columns
            td.textContent = 'No orders found.';
            td.style.textAlign = 'center';
            tr.appendChild(td);
            tableBody.appendChild(tr);
            return;
        }

        data.forEach(order => {
            const tr = document.createElement('tr');
            tr.dataset.orderId = order.orderId; // Store ID for reference if needed

            tr.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.userId}</td>
                <td>${order.employeeId}</td>
                <td>${order.location}</td>
                <td>${order.date}</td>
                <td></td> 
                <td>
                    <div class="action-buttons">
                        <a href="#" class="action-btn btn-edit" title="Edit Status"><i class="fas fa-pencil-alt"></i></a>
                    </div>
                </td>
            `;

            // Append the status badge to the correct cell (index 5)
            const statusCell = tr.cells[5];
            statusCell.appendChild(createStatusBadge(order.status));

            tableBody.appendChild(tr);
        });
    }

    // Function to filter and re-render table rows
    function filterAndRenderTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        const filteredData = orderHistoryData.filter(order => {
            const matchesSearch = Object.values(order).some(value =>
                String(value).toLowerCase().includes(searchTerm)
            );
            const matchesFilter = filterValue === 'all' || order.status === filterValue;
            return matchesSearch && matchesFilter;
        });

        renderTable(filteredData);
        // Important: Re-attach or ensure edit listeners work on the newly rendered rows.
        // Since we use event delegation on tableBody, the existing edit listener should still work.
    }

    // Event listeners for search and filter
    searchInput.addEventListener('input', filterAndRenderTable);
    filterSelect.addEventListener('change', filterAndRenderTable);

    // --- Inline Status Editing Logic (Slightly Modified) ---

    // Function to make a status cell editable (mostly unchanged, operates on the clicked row's DOM)
    function makeStatusEditable(row) {
        const statusCell = row.cells[5];
        const actionCell = row.cells[6];
        const originalStatusBadge = statusCell.querySelector('.status-badge');
        const currentStatusClass = originalStatusBadge ? Array.from(originalStatusBadge.classList).find(cls => cls !== 'status-badge') : 'pending';
        const orderId = row.dataset.orderId; // Get order ID if needed for data update

        // Store original HTML (still useful for cancel)
        row.dataset.originalStatusHTML = statusCell.innerHTML;
        row.dataset.originalActionsHTML = actionCell.innerHTML;

        // Create select dropdown
        const statusSelect = createStatusSelect(currentStatusClass);
        statusCell.innerHTML = '';
        statusCell.appendChild(statusSelect);
        statusSelect.focus();

        // Change action buttons to Save/Cancel
        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save" title="Save Status"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        // Add temporary listeners for Save/Cancel
        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault();
            e.stopPropagation();
            const newStatusClass = statusSelect.value;

            // --- Update the DOM directly --- 
            statusCell.innerHTML = '';
            statusCell.appendChild(createStatusBadge(newStatusClass));
            actionCell.innerHTML = row.dataset.originalActionsHTML; // Restore original edit button
            row.classList.remove('editing');

            // --- Update the underlying data store --- 
            const dataIndex = orderHistoryData.findIndex(order => order.orderId === orderId);
            if (dataIndex !== -1) {
                orderHistoryData[dataIndex].status = newStatusClass;
                console.log(`Order ${orderId} data updated to status: ${newStatusClass}`);
            } else {
                console.error(`Could not find order ${orderId} in data store to update.`);
            }

            // Clean up dataset attributes
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;

            // Re-filter/render *could* be done, but might be jarring if the edit causes the row to disappear.
            // For now, just updating the DOM and data source is fine.
            filterAndRenderTable(); // Re-render to ensure consistency after edit
        }, { once: true });

        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault();
            e.stopPropagation();
            // Restore original cell HTML
            statusCell.innerHTML = row.dataset.originalStatusHTML;
            actionCell.innerHTML = row.dataset.originalActionsHTML;
            row.classList.remove('editing');

            // Clean up dataset attributes
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;
            console.log(`Edit cancelled for order ${orderId}`);
        }, { once: true });
    }

    // Event listener for Edit button clicks (using delegation - this remains the same)
    tableBody.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit');
        if (!editBtn) return;

        e.preventDefault();
        const row = editBtn.closest('tr');
        // Ensure it's not an 'editing' row already or a header/empty row
        if (row.classList.contains('editing') || !row.dataset.orderId) return;

        // Prevent editing multiple rows at once
        const currentlyEditing = tableBody.querySelector('tr.editing');
        if (currentlyEditing && currentlyEditing !== row) {
            alert('Please save or cancel the current edit first.');
            return;
        }

        row.classList.add('editing');
        makeStatusEditable(row);
    });

    // --- Initial Table Render ---
    renderTable(orderHistoryData);

}); 