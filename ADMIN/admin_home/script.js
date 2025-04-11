// Basic JavaScript - can be expanded later
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard loaded');

    
    // Profile actions
    const viewProfileBtn = document.querySelector('.btn-view-profile');
    if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', function (e) {
            e.preventDefault();
            viewProfile();
        });
    }

    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Action buttons handling
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const row = this.closest('tr');
            const id = row.querySelector('td:first-child')?.textContent;

            if (this.classList.contains('btn-accept')) {
                handleApprove(id);
            } else if (this.classList.contains('btn-reject')) {
                handleReject(id);
            } else if (this.classList.contains('btn-edit')) {
                handleEdit(id);
            } else if (this.classList.contains('btn-save')) {
                updateServiceArea(id);
            }
        });
    });

    // View all links handling
    const viewAllLinks = document.querySelectorAll('.card-footer a');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const cardType = this.closest('section').classList;

            if (cardType.contains('active-requests')) {
                window.location.href = '../active_requests/index.html';
            } else if (cardType.contains('service-management')) {
                window.location.href = '../service_management/index.html';
            } else if (cardType.contains('order-history')) {
                window.location.href = '../order_history/index.html';
            } else if (cardType.contains('active-complaints')) {
                window.location.href = '../complaints/index.html';
            }
        });
    });

    // Event delegation for action buttons in tables
    const contentGrid = document.querySelector('.content-grid');

    if (contentGrid) {
        contentGrid.addEventListener('click', function (e) {
            const targetButton = e.target.closest('.action-btn');
            if (!targetButton) return;

            const cardSection = targetButton.closest('.main-section');
            if (!cardSection) return;

            e.preventDefault(); // Prevent default link behavior
            const row = targetButton.closest('tr');

            // --- Active Requests Card --- 
            if (cardSection.classList.contains('active-requests')) {
                const employeeId = row?.cells[0]?.textContent || 'N/A';
                const userId = row?.cells[1]?.textContent || 'N/A';

                if (targetButton.classList.contains('btn-edit')) {
                    alert(`Edit action triggered for Request by User: ${userId}, Current Employee: ${employeeId}. Implement assignment logic.`);
                    console.log(`Edit Active Request: User ${userId}, Employee ${employeeId}`);
                } else if (targetButton.classList.contains('btn-reject')) { // Trash icon
                    if (confirm(`Remove request by User ${userId}?`)) {
                        console.log(`Removing Active Request: User ${userId}, Employee ${employeeId}`);
                        row.style.opacity = '0';
                        setTimeout(() => row.remove(), 300);
                    }
                }
            }
            // --- Add similar handlers for other cards if needed (e.g., service-management, complaints) ---
            else if (cardSection.classList.contains('service-management')) {
                // Add handlers for service management buttons if necessary
            }
            else if (cardSection.classList.contains('active-complaints')) {
                // Add handlers for complaints buttons if necessary
            }
        });
    }
});

async function loadDashboardActiveRequests() {
    const dashboardTableBody = document.querySelector('.active-requests .data-table tbody');
    if (!dashboardTableBody) return;

    try {
        const response = await fetch("https://fmsbackend-iiitd.up.railway.app/admin/active-requests?limit=5");
        const data = await response.json();
        const requests = data.requests || [];

        dashboardTableBody.innerHTML = ""; // Clear any placeholder rows

        if (requests.length === 0) {
            dashboardTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No active requests</td></tr>`;
            return;
        }

        requests.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.worker_id || "N/A"}</td>
                <td>${item.user_id}</td>
                <td>${item.service}</td>
                <td>${item.building}</td>
                <td>${item.room_no}</td>
                <td>${new Date(item.time).toLocaleString()}</td>
                <td><span class="status-badge ${item.status}">${item.status.replace("-", " ")}</span></td>
                <td>
                    <div class="action-buttons">
                        <a href="#" class="action-btn btn-edit" title="Edit"><i class="fas fa-pencil-alt"></i></a>
                        <a href="#" class="action-btn btn-reject" title="Remove"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            `;
            dashboardTableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Error loading dashboard requests:", err);
    }
}

async function loadComplaintsWithLimit() {
    const tableBody = document.querySelector('.active-complaints .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch(`https://fmsbackend-iiitd.up.railway.app/complaint/active-complaints?limit=5`);
        const data = await response.json();
        const complaints = data.complaints || [];

        tableBody.innerHTML = ""; // Clear existing rows

        if (complaints.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No complaints found</td></tr>`;
            return;
        }

        complaints.forEach(item => {
            const statusClass = item.is_resolved ? "resolved" : "in-progress";
            const statusText = item.is_resolved ? "Resolved" : "In Progress";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.complaint_id}</td>
                <td>${new Date(item.complaint_datetime).toLocaleString()}</td>
                <td>${item.complaint}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <a href="#" class="action-btn btn-edit" title="Update Status"><i class="fas fa-pencil-alt"></i></a>
                        <a href="#" class="action-btn btn-reject" title="Delete Complaint"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Failed to load complaints:", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Error loading complaints</td></tr>`;
    }
}


// Call it inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardActiveRequests();
    loadComplaintsWithLimit(); // Fetch and display 5 complaints

});


// Profile Functions
function viewProfile() {
    console.log('Viewing profile');
    // Add your profile view logic here
}

function logout() {
    console.log('Logging out');
    window.location.href = '../admin_login/index.html';
}

// Service Management Functions
function updateServiceArea(employeeId) {
    const row = document.querySelector(`tr:has(td:first-child:contains('${employeeId}'))`);
    if (row) {
        const selects = row.querySelectorAll('select');
        const areas = Array.from(selects).map(select => select.value);
        console.log(`Updated service area for employee ${employeeId} to ${areas.join(', ')}`);
        // Add your update logic here
    }
}

function handleEdit(id) {
    console.log(`Editing item ${id}`);
    // Add your edit logic here
}

// Active Requests Functions
function handleApprove(requestId) {
    console.log(`Approving request ${requestId}`);
    // Add your approval logic here
}

function handleReject(requestId) {
    console.log(`Rejecting request ${requestId}`);
    // Add your rejection logic here
}

// View All Functions
function viewAllServices() {
    window.location.href = '../service_management/index.html';
}

function viewAllRequests() {
    window.location.href = '../active_requests/index.html';
}

function viewAllComplaints() {
    console.log('Viewing all complaints');
    // Add your view all complaints logic here
}

// Action button handling
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('action-button')) {
        e.preventDefault();
        const action = e.target.classList.contains('approve') ? 'approve' :
            e.target.classList.contains('reject') ? 'reject' :
                e.target.classList.contains('edit') ? 'edit' : 'unknown';

        console.log(`${action} action clicked`);
        // Add specific action handling here
    }
});

// Chart Initialization (keep existing chart code)
const ctx = document.getElementById('serviceChart')?.getContext('2d');
if (ctx) {
    const serviceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Completed', 'Pending', 'In Progress'],
            datasets: [{
                label: 'Services Status',
                data: [12, 19, 3], // Example data
                backgroundColor: [
                    'rgba(40, 167, 69, 0.7)',  // Success color (Completed)
                    'rgba(255, 193, 7, 0.7)', // Warning color (Pending)
                    'rgba(0, 123, 255, 0.7)'  // Primary color (In Progress)
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(0, 123, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += context.parsed;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
} else {
    console.warn("Chart element with ID 'serviceChart' not found.");
}

// Make sure this script doesn't define functions removed earlier
// e.g., viewAllRequests, viewAllServices, viewAllComplaints
// The navigation is now handled directly in the event listener above.