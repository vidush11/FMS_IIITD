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
    // 🆕 Fetch and populate active complaints
    async function fetchAndDisplayRequests() {
        try {
            const response = await fetch("https://fmsbackend-iiitd.up.railway.app/admin/active-requests", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const data = await response.json();
            const requests = data.requests || [];

            if (!tableBody) return;
            tableBody.innerHTML = ""; // Clear table

            if (requests.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="8" style="text-align:center;">No active requests found</td>`;
                tableBody.appendChild(row);
                return;
            }

            requests.forEach((item) => {
                const row = document.createElement("tr");
                // --- STORE ORIGINAL TIME ---
                row.dataset.requestTimeOriginal = item.time; // Store the raw timestamp string
                row.dataset.userId = item.user_id; // Store user ID for easier access

                row.innerHTML = `
                    <td>${item.worker_id || "N/A"}</td>
                    <td>${item.user_id}</td>
                    <td>${item.service}</td>
                    <td>${item.building}</td>
                    <td>${item.room_no}</td>
                    <td>${new Date(item.time).toLocaleString()}</td> 
                    <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
                    <td>
                        <div class="action-buttons">
                            <a href="#" class="action-btn btn-edit" title="Edit"><i class="fas fa-edit"></i></a>
                            <a href="#" class="action-btn btn-reject" title="Reject"><i class="fas fa-times"></i></a>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Refresh rows for search/filter logic
            rows = getRows();
            filterTable();
        } catch (error) {
            console.error("Error fetching Requests:", error);
        }
    }
    fetchAndDisplayRequests();
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
        // Values are 'all', 'pending', 'in-progress'
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

            row.style.display = matchesSearch ? '' : 'none';
        });
    }

    // Function to create the status select dropdown
    function createStatusSelect(currentStatusClass) {
        const select = document.createElement('select');
        select.className = 'status-select edit-input'; // Add edit-input for styling
        const statuses = {
            'pending': 'Pending',
            'completed': 'Completed'
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
    // Function to make an active request row editable (Employee ID and Status)
    // Function to make an active request row editable (Employee ID and Status)
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        // Indices: 0=EmpID, 1=UserID, 2=Service, 3=Building, 4=Room, 5=Time, 6=Status, 7=Actions
        const empIdCell = cells[0];
        // We get UserID and Original Time from dataset now
        const statusCell = cells[6];
        const actionCell = cells[7];

        // Store original HTML
        row.dataset.originalEmpIdHTML = empIdCell.innerHTML;
        row.dataset.originalStatusHTML = statusCell.innerHTML;
        row.dataset.originalActionsHTML = actionCell.innerHTML;
        // Note: originalUserId and originalRequestTime are already set on the row dataset

        // Create Employee ID input
        const empIdInput = document.createElement('input');
        empIdInput.type = 'text';
        empIdInput.value = empIdCell.textContent.trim();
        empIdInput.className = 'edit-input emp-id-input';
        empIdCell.innerHTML = '';
        empIdCell.appendChild(empIdInput);

        // Create Status select dropdown
        const originalStatusBadge = statusCell.querySelector('.status-badge');
        const currentStatusClass = originalStatusBadge ? Array.from(originalStatusBadge.classList).find(cls => cls !== 'status-badge') : 'pending';
        const statusSelect = createStatusSelect(currentStatusClass); // Uses your existing helper
        statusCell.innerHTML = '';
        statusCell.appendChild(statusSelect);

        empIdInput.focus();

        // Replace action buttons
        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        // --- Save Button Handler ---
        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault();
            e.stopPropagation();

            // --- 1. Gather Data ---
            const newEmpId = empIdInput.value.trim();
            const newStatusClass = statusSelect.value; // 'pending' or 'completed'
            const isCompletedBoolean = newStatusClass === 'completed'; // Convert status string to boolean

            // --- Get Identifiers from row's dataset ---
            const userId = row.dataset.userId;
            const originalRequestTime = row.dataset.requestTimeOriginal; // Use the stored original time

            // Basic check for identifiers
            if (!userId || !originalRequestTime) {
                alert("Error: Could not get identifying information (User ID / Time) for the request.");
                return;
            }
            if (!newEmpId && isCompletedBoolean) { // Ensure worker assigned if completing
                alert("Error: Please assign an Employee ID before completing the request.");
                return;
            }

            // --- 2. Prepare Payload ---
            // ** Adjust payload keys based on backend requirements **
            const payload = {
                user_id: userId,
                worker_id: newEmpId || null, // Send the new worker_id (or null if cleared)
                request_time: originalRequestTime, // Send the ORIGINAL timestamp string
                iscompleted: isCompletedBoolean // Send the boolean status
            };

            // ** Replace with your ACTUAL backend endpoint for updates **
            // Using the complete-request endpoint name from your error message
            const apiUrl = `https://fmsbackend-iiitd.up.railway.app/admin/complete-request`;

            console.log("Sending PUT request to update request:", apiUrl, payload);

            // Disable buttons visually
            saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none';
            if (cancelBtn) { cancelBtn.style.opacity = '0.5'; cancelBtn.style.pointerEvents = 'none'; }

            // --- 3. Execute Fetch ---
            fetch(apiUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
                .then(response => {
                    console.log('Update Request API Response Status:', response.status);
                    if (!response.ok) {
                        return response.text().then(text => {
                            let errorDetail = text || response.statusText;
                            try { errorDetail = JSON.parse(text).error || JSON.parse(text).message || errorDetail; } catch (e) { }
                            throw new Error(`API Error ${response.status}: ${errorDetail}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    // --- SUCCESS: Update UI ---
                    console.log("Request successfully updated on backend:", data);
                    empIdCell.textContent = newEmpId || 'N/A'; // Update Emp ID cell
                    statusCell.innerHTML = '';
                    statusCell.appendChild(createStatusBadge(newStatusClass)); // Update status cell
                    actionCell.innerHTML = row.dataset.originalActionsHTML || '';
                    row.classList.remove('editing');
                    // Re-fetch data to reflect changes (especially if item was completed)
                    fetchAndDisplayRequests();
                })
                .catch(error => {
                    // --- ERROR: Revert UI ---
                    console.error("Error updating request via API:", error);
                    alert(`Failed to update request: ${error.message}`);
                    empIdCell.innerHTML = row.dataset.originalEmpIdHTML || '';
                    statusCell.innerHTML = row.dataset.originalStatusHTML || '';
                    actionCell.innerHTML = row.dataset.originalActionsHTML || '';
                    row.classList.remove('editing');
                })
                .finally(() => {
                    // Clean up stored data attributes
                    delete row.dataset.originalEmpIdHTML;
                    delete row.dataset.originalStatusHTML;
                    delete row.dataset.originalActionsHTML;
                    // No need to delete userId/requestTimeOriginal as they are set during render
                    // Re-enable buttons (optional safety)
                });

        }); // End Save Listener

        // --- Cancel Button Handler ---
        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault();
            e.stopPropagation();
            // Restore original cell HTML
            empIdCell.innerHTML = row.dataset.originalEmpIdHTML || '';
            statusCell.innerHTML = row.dataset.originalStatusHTML || '';
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
            // Clean up dataset attributes
            delete row.dataset.originalEmpIdHTML;
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;
        }, { once: true }); // Keep { once: true } for cancel
    }


    // --- (Ensure the rest of your script is present) ---
    // document.addEventListener('DOMContentLoaded', function () { ... });
    // fetchAndDisplayRequests function
    // getRows function
    // filterTable function
    // createStatusSelect function
    // createStatusBadge function
    // tableBody click listener calling makeRowEditable
    // Initial fetchAndDisplayRequests() call
    // etc.

    // --- (Keep the rest of your code: fetchAndDisplayRequests, getRows, filterTable, createStatusSelect, createStatusBadge, event listeners, initial calls etc.) ---

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