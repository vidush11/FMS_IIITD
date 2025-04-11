document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');

    // Get all non-empty rows initially for filtering
    function getRows() {
        return tableBody.querySelectorAll('tr:not(.empty-row)');
    }
    let rows = getRows(); // Initial fetch

    // Function to filter table rows based on search and status
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        rows = getRows(); // Re-fetch rows in case rows were added/deleted

        rows.forEach(row => {
            // Check if row is currently being edited
            if (row.classList.contains('editing')) {
                row.style.display = ''; // Keep editing rows visible
                return;
            }

            const complaintData = {
                id: row.cells[0]?.textContent.toLowerCase() || '',
                time: row.cells[1]?.textContent.toLowerCase() || '',
                complaint: row.cells[2]?.textContent.toLowerCase() || '',
                status: row.querySelector('.status-badge')?.textContent.toLowerCase() || ''
            };

            const matchesSearch = Object.values(complaintData).some(value =>
                value.includes(searchTerm)
            );

            const statusElement = row.querySelector('.status-badge');
            const matchesFilter = filterValue === 'all' ||
                (statusElement && statusElement.classList.contains(filterValue));

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Function to create the status select dropdown
    function createStatusSelect(currentStatusClass) {
        const select = document.createElement('select');
        select.className = 'status-select edit-input'; // Add edit-input for potential shared styling
        const statuses = {
            'in-progress': 'In Progress',
            'resolved': 'Resolved'
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
        span.textContent = statusClass.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()); // Capitalize
        return span;
    }

    // --- Event Listeners ---
    searchInput.addEventListener('input', filterTable);
    filterSelect.addEventListener('change', filterTable);

    // Listener for action buttons (Edit, Delete, Save, Cancel)
    tableBody.addEventListener('click', function (e) {
        const targetButton = e.target.closest('.action-btn');
        if (!targetButton) return;

        e.preventDefault();
        const row = targetButton.closest('tr');
        const complaintId = row.cells[0].textContent;
        const statusCell = row.cells[3]; // Status is the 4th cell (index 3)
        const actionCell = row.cells[4]; // Actions is the 5th cell (index 4)

        if (targetButton.classList.contains('btn-edit')) {
            // Prevent editing multiple rows at once (optional)
            if (tableBody.querySelector('tr.editing')) {
                alert('Please save or cancel the current edit first.');
                return;
            }
            row.classList.add('editing'); // Mark row as being edited

            // Store original status badge and action buttons
            const originalStatusBadge = statusCell.querySelector('.status-badge');
            const currentStatusClass = originalStatusBadge ? Array.from(originalStatusBadge.classList).find(cls => cls !== 'status-badge') : 'in-progress'; // Default if no badge
            row.dataset.originalStatusHTML = statusCell.innerHTML; // Store original HTML
            row.dataset.originalActionsHTML = actionCell.innerHTML;

            // Replace status badge with dropdown
            const statusSelect = createStatusSelect(currentStatusClass);
            statusCell.innerHTML = ''; // Clear the cell
            statusCell.appendChild(statusSelect);

            // Replace action buttons with Save/Cancel
            actionCell.innerHTML = `
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
                    <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
                </div>
            `;

        } else if (targetButton.classList.contains('btn-save')) {
            const statusSelect = statusCell.querySelector('.status-select');
            if (statusSelect) {
                const newStatusClass = statusSelect.value;
                // Update status cell with new badge
                statusCell.innerHTML = '';
                statusCell.appendChild(createStatusBadge(newStatusClass));
                // Restore original action buttons
                actionCell.innerHTML = row.dataset.originalActionsHTML || ''; // Use stored HTML
                row.classList.remove('editing');
                // Clean up dataset attributes
                delete row.dataset.originalStatusHTML;
                delete row.dataset.originalActionsHTML;
                filterTable(); // Re-apply filter in case status change affects it
            }

        } else if (targetButton.classList.contains('btn-cancel')) {
            // Restore original status and action buttons
            statusCell.innerHTML = row.dataset.originalStatusHTML || '';
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
            // Clean up dataset attributes
            delete row.dataset.originalStatusHTML;
            delete row.dataset.originalActionsHTML;

        } else if (targetButton.classList.contains('btn-reject')) {
            if (confirm(`Are you sure you want to delete complaint ${complaintId}?`)) {
                console.log(`Deleting Complaint ID: ${complaintId}`);
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    rows = getRows(); // Update the rows list after deletion
                }, 300);
            }
        }
    });
    document.getElementById("dateFilterBtn").addEventListener("click", async () => {
        const selectedDate = document.getElementById("complaintDateFilter").value;
        if (!selectedDate) {
            alert("Please select a date to filter.");
            return;
        }
    
        try {
            const response = await fetch("https://fmsbackend-iiitd.up.railway.app/complaint/date-complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate })
            });
    
            const data = await response.json();
    
            if (!response.ok || !Array.isArray(data.complaints)) {
                throw new Error(data.error || "Failed to fetch complaints.");
            }
    
            const complaints = data.complaints;
            const tbody = document.querySelector('.data-table tbody');
            tbody.innerHTML = "";
    
            if (complaints.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No complaints found on selected date</td></tr>`;
                return;
            }
    
            complaints.forEach(c => {
                const statusClass = c.is_resolved ? 'resolved' : 'in-progress';
                const statusText = c.is_resolved ? 'Resolved' : 'In Progress';
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.complaint_id}</td>
                    <td>${new Date(c.complaint_datetime).toLocaleString()}</td>
                    <td>${c.complaint}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <a href="#" class="action-btn btn-edit" title="Update Status"><i class="fas fa-pencil-alt"></i></a>
                            <a href="#" class="action-btn btn-reject" title="Delete Complaint"><i class="fas fa-trash"></i></a>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
    
            rows = getRows();
            filterTable();
        } catch (err) {
            console.error("Date filter error:", err);
            alert("Failed to filter complaints by date.");
        }
    });    
    async function fetchAndDisplayComplaints() {
        try {
            const response = await fetch('https://fmsbackend-iiitd.up.railway.app/complaint/active-complaints'); // Adjust URL as needed
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch complaints");
            }
    
            const complaints = data.complaints || [];
            const tbody = document.querySelector('.data-table tbody');
            tbody.innerHTML = ""; // Clear old rows
    
            if (complaints.length === 0) {
                const row = document.createElement("tr");
                row.innerHTML = `<td colspan="5" style="text-align:center;">No active complaints found</td>`;
                tbody.appendChild(row);
                return;
            }
    
            complaints.forEach(c => {
                const statusClass = c.is_resolved ? 'resolved' : 'in-progress';
                const statusText = c.is_resolved ? 'Resolved' : 'In Progress';
    
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.complaint_id}</td>
                    <td>${new Date(c.complaint_datetime).toLocaleString()}</td>
                    <td>${c.complaint}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div class="action-buttons">
                            <a href="#" class="action-btn btn-edit" title="Update Status"><i class="fas fa-pencil-alt"></i></a>
                            <a href="#" class="action-btn btn-reject" title="Delete Complaint"><i class="fas fa-trash"></i></a>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
    
            // Refresh row references
            rows = getRows();
            filterTable();
        } catch (err) {
            console.error("Error fetching complaints:", err);
            alert("Failed to load complaints.");
        }
    }

    // --- Initial Filter ---
    filterTable();
    fetchAndDisplayComplaints();
});

// Removed placeholder functions as they are not implemented here

// --- Placeholder Functions (Implement as needed) ---
/*
function openEditComplaintModal(complaintId) {
    // ...
}
// Removed showComplaintDetails placeholder
*/ 