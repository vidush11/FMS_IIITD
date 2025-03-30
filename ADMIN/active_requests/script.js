document.addEventListener('DOMContentLoaded', function () {
    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            const page = this.textContent.trim().toLowerCase();
            switch (page) {
                case 'dashboard':
                    window.location.href = '../admin_home/index.html';
                    break;
                case 'manage services':
                    window.location.href = '../service_management/index.html';
                    break;
                // Add other navigation cases as needed
            }
        });
    });

    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');

    function getRows() {
        // Ensure we select rows from the correct table body
        const currentTableBody = document.querySelector('.data-table tbody');
        return currentTableBody ? currentTableBody.querySelectorAll('tr:not(.empty-row)') : [];
    }
    let rows = getRows();

    // Function to filter table rows based on search and status
    function filterTable() {
        if (!searchInput || !filterSelect) { // Add checks for elements
            console.error("Search input or filter select not found for filtering.");
            return;
        }
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value; // Values are 'all', 'pending', 'in-progress'
        rows = getRows(); // Re-fetch rows

        rows.forEach(row => {
            if (row.classList.contains('editing')) {
                row.style.display = '';
                return;
            }
            // Indices: 0:EmpID, 1:UserID, 2:Service, 3:Building, 4:Room, 5:Time, 6:Status Cell
            const requestData = {
                empId: row.cells[0]?.textContent.toLowerCase() || '',
                userId: row.cells[1]?.textContent.toLowerCase() || '',
                service: row.cells[2]?.textContent.toLowerCase() || '',
                building: row.cells[3]?.textContent.toLowerCase() || '',
                room: row.cells[4]?.textContent.toLowerCase() || '',
                time: row.cells[5]?.textContent.toLowerCase() || '',
                status: row.querySelector('.status-badge')?.textContent.toLowerCase() || '' // Status is in cell 6
            };

            const matchesSearch = Object.values(requestData).some(value =>
                value.includes(searchTerm)
            );

            // Status is in cell 6
            const statusElement = row.querySelector('.status-badge');
            const matchesFilter = filterValue === 'all' ||
                (statusElement && statusElement.classList.contains(filterValue));

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Function to create the status select dropdown
    function createStatusSelect(currentStatusClass) {
        const select = document.createElement('select');
        select.className = 'status-select edit-input'; // Add edit-input for styling
        const statuses = {
            'pending': 'Pending',
            'in-progress': 'In Progress'
            // Add other relevant statuses like 'completed' if needed later
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

    // Function to create a status badge span
    function createStatusBadge(statusClass) {
        const span = document.createElement('span');
        span.classList.add('status-badge', statusClass);
        // Simple capitalization for status text
        span.textContent = statusClass.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        return span;
    }

    // Function to make an active request row editable (Employee ID and Status)
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        const empIdCell = cells[0]; // Employee ID is the first cell
        const statusCell = cells[6]; // Status is the 7th cell (index 6)
        const actionCell = cells[cells.length - 1]; // Actions cell is last

        // Store original HTML for relevant cells
        row.dataset.originalEmpIdHTML = empIdCell.innerHTML;
        row.dataset.originalStatusHTML = statusCell.innerHTML;
        row.dataset.originalActionsHTML = actionCell.innerHTML;

        // --- Create input field for Employee ID --- 
        const empIdInput = document.createElement('input');
        empIdInput.type = 'text';
        empIdInput.value = empIdCell.textContent.trim();
        empIdInput.className = 'edit-input emp-id-input';
        empIdCell.innerHTML = '';
        empIdCell.appendChild(empIdInput);

        // --- Create select dropdown for Status --- 
        const originalStatusBadge = statusCell.querySelector('.status-badge');
        const currentStatusClass = originalStatusBadge ? Array.from(originalStatusBadge.classList).find(cls => cls !== 'status-badge') : 'pending'; // Default to pending if no badge
        const statusSelect = createStatusSelect(currentStatusClass);
        statusCell.innerHTML = ''; // Clear the cell
        statusCell.appendChild(statusSelect);

        // Focus the first input field
        empIdInput.focus();

        // Replace action buttons with Save/Cancel
        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        // Add listeners specifically for these new Save/Cancel buttons
        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get new values
            const newEmpId = empIdInput.value.trim();
            const newStatusClass = statusSelect.value;

            // --- Update Employee ID Cell --- 
            empIdCell.textContent = newEmpId;

            // --- Update Status Cell with new badge --- 
            statusCell.innerHTML = '';
            statusCell.appendChild(createStatusBadge(newStatusClass));

            // Restore original action buttons
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');

            // Clean up dataset attributes
            delete row.dataset.originalEmpIdHTML;
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;

            filterTable(); // Re-apply filters if needed
        });

        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault();
            e.stopPropagation();
            // Restore original cell HTML
            empIdCell.innerHTML = row.dataset.originalEmpIdHTML || '';
            statusCell.innerHTML = row.dataset.originalStatusHTML || '';
            // Restore original buttons
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
            // Clean up dataset attributes
            delete row.dataset.originalEmpIdHTML;
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;
        });
    }

    // --- Event Listeners ---
    if (searchInput) {
        searchInput.addEventListener('input', filterTable);
    } else {
        console.error("Search input element not found. Cannot attach listener.");
    }

    if (filterSelect) {
        filterSelect.addEventListener('change', filterTable);
    } else {
        console.error("Filter select element not found. Cannot attach listener.");
    }

    // Listener for action buttons (Edit and Remove/Reject)
    if (tableBody) {
        console.log("Attaching listener to tableBody:", tableBody); // Debug
        tableBody.addEventListener('click', function (e) {
            // --- Debug: Log any click inside the table body ---
            console.log("Click detected inside tableBody.");
            // ---------------------------------------------------

            const targetButton = e.target.closest('.action-btn');

            // --- Debug: Log the found button and its classes ---
            console.log("Closest .action-btn found:", targetButton);
            if (targetButton) {
                console.log("Button classes:", targetButton.classList);
            }
            // ----------------------------------------------------

            if (!targetButton) return; // Exit if click wasn't on or inside a button

            e.preventDefault();
            const row = targetButton.closest('tr');
            // If the click is on save/cancel within an editing row, their specific handlers should manage it.
            if (row.classList.contains('editing')) return;

            const empId = row?.cells[0]?.textContent || 'N/A';
            const userId = row?.cells[1]?.textContent || 'N/A';

            if (targetButton.classList.contains('btn-edit')) {
                // Prevent editing multiple rows at once
                if (tableBody.querySelector('tr.editing')) {
                    alert('Please save or cancel the current edit first.');
                    return;
                }
                row.classList.add('editing'); // Mark row as being edited
                makeRowEditable(row); // Call the function to make the row editable

            } else if (targetButton.classList.contains('btn-reject')) {
                // --- Debug: Confirm Reject button branch is reached ---
                console.log("Reject (delete) button clicked!");
                // ------------------------------------------------------
                if (confirm(`Are you sure you want to remove the request by User ${userId}?`)) {
                    console.log(`Removing Request by User: ${userId}`);
                    row.style.opacity = '0';
                    setTimeout(() => {
                        row.remove();
                        rows = getRows();
                    }, 300);
                }
            }
        });
    } else {
        console.error("Table body not found. Cannot attach action button listener.");
    }

    // --- Initial Filter ---
    console.log("Calling initial filterTable()."); // Debug
    filterTable();
});

// Function to handle request approval
function approveRequest(requestId) {
    console.log(`Approving request ${requestId}`);
    // Add your approval logic here
}

// Function to handle request rejection
function rejectRequest(requestId) {
    console.log(`Rejecting request ${requestId}`);
    // Add your rejection logic here
}

// Function to handle request editing
function editRequest(requestId) {
    console.log(`Editing request ${requestId}`);
    // Add your edit logic here
}

// --- Placeholder Functions (Implement as needed) ---
/*
function openEditRequestModal(userId, currentEmpId) {
    // Logic to fetch request details and employee list, then populate/show an assignment modal
    console.log(`(Placeholder) Opening edit/assignment modal for request by ${userId}, current emp: ${currentEmpId}`);
}
*/ 