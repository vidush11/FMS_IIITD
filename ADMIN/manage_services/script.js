// Complete script.js for Manage Services Page (Buttons Functionality Removed)

// No JavaScript needed for button functionality as they have been removed.

document.addEventListener('DOMContentLoaded', () => {

    loadAvgRequestsPerService();
    loadTopRatedEmployees();
    happyusers();
    Users_with_complaints_but_no_requests()
})
// Keep this file if you plan to add other dynamic features later.

console.log("Manage Services script loaded (button functionality removed).");

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

async function loadTopRatedEmployees() {
    const tableBody = document.querySelector('.bpe .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('https://fmsbackend-iiitd.up.railway.app/worker/num20');
        const data = await response.json();
        console.log("nnnn", data);
        const workers = data.data || [];

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
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load top employees:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error loading data</td></tr>`;
    }
}

async function happyusers() {
    const tableBody = document.querySelector('.awe .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('https://fmsbackend-iiitd.up.railway.app/users/num19');
        const data = await response.json();
        console.log("wowow", data);
        const workers = data.users || [];

        tableBody.innerHTML = '';

        if (workers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No top employees found</td></tr>`;
            return;
        }

        workers.forEach(worker => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${worker.user_id}</td>
                <td>${worker.username}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load top employees:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error loading data</td></tr>`;
    }
}

async function Users_with_complaints_but_no_requests() {
    const tableBody = document.querySelector('.dfd .data-table tbody');
    if (!tableBody) return;

    try {
        const response = await fetch('https://fmsbackend-iiitd.up.railway.app/users/num21');
        const data = await response.json();
        console.log("bsdk", data);
        const workers = data.user || [];

        tableBody.innerHTML = '';

        if (workers.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">No top employees found</td></tr>`;
            return;
        }

        workers.forEach(worker => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${worker.user_id}</td>
                <td>${worker.username}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load top employees:", err);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Error loading data</td></tr>`;
    }
}