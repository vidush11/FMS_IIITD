// Basic JavaScript - can be expanded later
document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard loaded');

    document.querySelector(".login-time").innerHTML = new Date();

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
                
            `;
            dashboardTableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Error loading dashboard requests:", err);
    }
}

async function loadAssignedWorkersDashboard(limit = 7) {
    const tableBody = document.querySelector('.service-management .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch(`https://fmsbackend-iiitd.up.railway.app/worker/latest-area-of-service?limit=${limit}`);
        const data = await response.json();
        const workers = data.workers || [];

        tableBody.innerHTML = '';

        if (workers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No assignments found</td></tr>`;
            return;
        }

        const buildingOptions = [
            "LHC complex",
            "R&D block",
            "Old Academic",
            "Faculty Residence",
            "H1 boys hostel",
            "H2 boys hostel",
            "Girls Hostel",
            "Old Boys Hostel"
        ];

        workers.forEach(worker => {
            const row = document.createElement('tr');
            const optionsHTML = buildingOptions.map(loc => {
                const selected = loc === worker.assigned_location ? 'selected' : '';
                return `<option value="${loc}" ${selected}>${loc}</option>`;
            }).join('');

            row.innerHTML = `
                <td>${worker.worker_id}</td>
                <td>${worker.name}</td>
                <td>
                    <select data-employee="${worker.worker_id}">
                        <option value="">Select Building</option>
                        ${optionsHTML}
                    </select>
                </td>
                <td>
                    <div class="action-buttons" style="justify-content: flex-start;">
                        <a href="#" class="action-btn btn-save"><i class="fas fa-save"></i></a>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load assignments:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error loading assignments</td></tr>`;
    }
}


async function loadComplaintsWithLimit() {
    const tableBody = document.querySelector('.active-complaints .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch(`https://fmsbackend-iiitd.up.railway.app/complaint/last-day-complaints`);
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
                <td>${new Date(item.complaints.complaint_datetime).toLocaleString()}</td>
                <td>${item.complaints.complaint}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                
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
    loadAssignedWorkersDashboard();
    loadAvgRequestsPerService();
    loadTopRatedEmployees();

    document.addEventListener('click', async function (e) {
        const saveBtn = e.target.closest('.btn-save');
        if (!saveBtn) return;

        e.preventDefault();

        const row = saveBtn.closest('tr');
        if (!row) return;

        const workerId = parseInt(row.cells[0]?.textContent.trim());
        const selectedBuilding = row.querySelector('select')?.value;

        if (!selectedBuilding || selectedBuilding === '') {
            alert('Please select a building before saving.');
            return;
        }

        try {
            const response = await fetch("https://fmsbackend-iiitd.up.railway.app/worker/new-assign", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    worker_id: workerId,
                    assigned_location: selectedBuilding
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Assignment update failed');
            }

            alert('Assignment updated successfully!');
        } catch (err) {
            console.error("Error saving assignment:", err);
            alert(`Error: ${err.message}`);
        }
    });

});

async function renderLineChartForAvgServices() {
    try {
        const res = await fetch('https://fmsbackend-iiitd.up.railway.app/worker/avg-services');
        const result = await res.json();

        if (!res.ok || !Array.isArray(result.data)) {
            throw new Error(result.error || "Failed to fetch chart data");
        }

        const ctx = document.getElementById("lineAvgChart").getContext("2d");

        const labels = result.data.map(worker => `ID ${worker.worker_id}`);
        const values = result.data.map(worker => worker.avg_services);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Average Services",
                    data: values,
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: "#1f77b4",
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Worker ID'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Avg Services'
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Line chart error:", err);
    }
}

document.addEventListener("DOMContentLoaded", renderLineChartForAvgServices);

async function loadAvgRequestsPerService() {
    try {
        const response = await fetch("https://fmsbackend-iiitd.up.railway.app/statistics/avg-requests-per-service");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch');

        const labels = data.averages.map(entry => entry.service_type);
        const values = data.averages.map(entry => parseFloat(entry.average_requests.toFixed(2)));

        const ctx = document.getElementById("avgRequestChart").getContext("2d");
        console.log("Chart data:", labels, values);
        new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [{
                    label: "Avg Requests/Day",
                    data: values,
                    backgroundColor: "rgba(0, 61, 57, 1)",
                    borderColor: "rgba(0, 61, 57, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: context => `${context.parsed.y} requests/day`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Requests" }
                    }
                }
            }
        });
    } catch (err) {
        console.error("Chart load error:", err);
    }
}

async function loadTopRatedEmployees() {
    const tableBody = document.querySelector('.top-employees .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('https://fmsbackend-iiitd.up.railway.app/statistics/top-rated-workers');
        const data = await response.json();
        const workers = data.workers || [];

        tableBody.innerHTML = '';

        if (workers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No top employees found</td></tr>`;
            return;
        }

        workers.forEach(worker => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${worker.worker_id}</td>
                <td>${worker.name}</td>
                <td>${worker.assigned_role}</td>
                <td>${worker.rating.toFixed(2)}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load top employees:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error loading data</td></tr>`;
    }
}



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

document.getElementById("fetchWorkersBtn").addEventListener("click", async () => {
    const selectedService = document.getElementById("serviceSelect").value;
  
    try {
      const response = await fetch("https://fmsbackend-iiitd.up.railway.app/worker/highest-completed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ service_type: selectedService })
      });
  
      const result = await response.json();
      if (result.data && Array.isArray(result.data)) {
        renderWorkerCards(result.data);
      } else {
        console.error("Invalid response format:", result);
        document.getElementById("workerCardsContainer").innerHTML = "<p>No workers found for this service.</p>";
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      document.getElementById("workerCardsContainer").innerHTML = "<p style='color:red;'>Failed to fetch workers.</p>";
    }
  });
  
  function renderWorkerCards(workers) {
    const container = document.getElementById("workerCardsContainer");
    container.innerHTML = ""; // clear old cards
  
    if (workers.length === 0) {
      container.innerHTML = "<p>No workers found for this service.</p>";
      return;
    }
  
    workers.forEach(worker => {
      const card = document.createElement("div");
      card.style.cssText = `
        background: white;
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        padding: 15px;
        width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      `;
  
      card.innerHTML = `
        <div style="font-size: 3em; color: #003D39; margin-bottom: 10px;">
          <i class="fas fa-user-circle"></i>
        </div>
        <h4 style="margin: 5px 0;">${worker.name}</h4>
        <p style="margin: 0; font-size: 0.9em; color: #666;">ID: ${worker.worker_id}</p>
      `;
  
      container.appendChild(card);
    });
  }

// Make sure this script doesn't define functions removed earlier
// e.g., viewAllRequests, viewAllServices, viewAllComplaints
// The navigation is now handled directly in the event listener above.