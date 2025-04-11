// Global students array (can be initialized empty)
let students = [];

function showModal() {
    const modal = document.getElementById("addStudentModal");
    if (modal) modal.style.display = "block";
}

function hideModal() {
    const modal = document.getElementById("addStudentModal");
    if (modal) modal.style.display = "none";
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log("DOM fully loaded. Starting setup...");

    const tableBody = document.querySelector('.data-table tbody');
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const addbut = document.querySelector('.PLEASE_B');

    const closeBtn = document.getElementById("closeModal");
    const form = document.getElementById("addStudentForm");

    // --------- Student Info Modal Setup ---------
    const studentInfoModal = document.getElementById("studentInfoModal");
    const closeStudentModalBtn = document.getElementById("closeStudentModal");
    const studentDetails = document.getElementById("studentDetails");
    const fetchHistoryBtn = document.getElementById("fetchHistoryBtn");
    const historyTableBody = document.querySelector("#historyTable tbody");
    const historyDateInput = document.getElementById("historyDate");
    const complaintTableBody = document.querySelector("#complaintTableBody");


    // Attach click handler for each info button
    document.querySelectorAll('.btn-info').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('tr');
            const cells = row.querySelectorAll('td');

            const userId = cells[0].textContent.trim();
            const name = cells[1].textContent.trim();
            const building = cells[2].textContent.trim();
            const room = cells[3].textContent.trim();
            const email = cells[4].textContent.trim();

            studentDetails.innerHTML = `
            <p><strong>Roll No:</strong> ${userId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Hostel:</strong> ${building}</p>
            <p><strong>Room:</strong> ${room}</p>
            <p><strong>Email:</strong> ${email}</p>
        `;

            studentInfoModal.dataset.userid = userId;
            studentInfoModal.style.display = "block";

        });
    });

    // Close modal on 'X'
    closeStudentModalBtn.addEventListener('click', () => {
        studentInfoModal.style.display = "none";
        historyTableBody.innerHTML = '';
    });

    // Close modal on outside click
    window.addEventListener('click', e => {
        if (e.target === studentInfoModal) {
            studentInfoModal.style.display = "none";
            historyTableBody.innerHTML = '';
        }
    });

    // Fetch services on date + user_id
    fetchHistoryBtn.addEventListener('click', async () => {
        const date = historyDateInput.value;
        const userId = studentInfoModal.dataset.userid;
        if (!date || !userId) {
            alert("Please select a date");
            return;
        }

        try {
            const res = await fetch(`https://fmsbackend-iiitd.up.railway.app/statistics/services-by-date?user_id=${userId}&date=${date}`);
            const data = await res.json();
            historyTableBody.innerHTML = '';

            data.services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${service.service_id}</td>
                <td>${service.worker_id}</td>
                <td>${service.room_no}</td>
                <td>${service.building}</td>
                <td>${new Date(service.request_time).toLocaleString()}</td>
                <td>${service.feedback || "N/A"}</td>
                <td>${service.rating || "N/A"}</td>
                <td>${service.is_completed || "false"}</td>
            `;
                historyTableBody.appendChild(row);
            });

        } catch (err) {
            console.error("Failed to fetch services:", err);
            alert("Could not fetch data.");
        }
    });


    if (closeBtn) {
        closeBtn.addEventListener("click", hideModal);
    }

    window.addEventListener("click", function (e) {
        const modal = document.getElementById("addStudentModal");
        if (e.target === modal) {
            hideModal();
        }
    });

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const payload = {
                user_id: document.getElementById("studentRoll").value,
                username: document.getElementById("studentName").value,
                building: document.getElementById("studentBuilding").value,
                roomno: document.getElementById("studentRoom").value,
                email: document.getElementById("studentEmail").value,
                userpassword: document.getElementById("studentPassword").value
            };

            try {
                const res = await fetch("https://fmsbackend-iiitd.up.railway.app/admin/add-user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();
                if (res.ok) {
                    console.log(result);
                    alert("Student added successfully!");
                    hideModal();
                } else {
                    alert("Error: " + (result.error || "Something went wrong"));
                }
            } catch (err) {
                console.error(err);
                alert("Failed to add student.");
            }
        });
    }

    if (!tableBody || !searchInput || !filterSelect || !addbut) {
        console.error("FATAL: Could not find essential table elements.");
        return;
    }
    console.log("Essential elements found.");

    let rows = [];

    function getRows() {
        return tableBody ? tableBody.querySelectorAll('tr:not(.empty-row)') : [];
    }

    // --- Updated createStudentRow to include email and password columns ---
    // --- Password column is added but likely kept empty or shows '****' for display ---
    function createStudentRow(rollNo = '', name = '', building = '', room = '', email = '', password = '') { // Added passwordPlaceholder
        const tr = document.createElement('tr');
        tr.dataset.userId = rollNo; // Store rollNo as userId on the row

        tr.innerHTML = `
            <td>${rollNo || 'N/A'}</td>
            <td>${name || 'N/A'}</td>
            <td>${building || 'N/A'}</td>
            <td>${room || 'N/A'}</td>
            <td>${email || 'N/A'}</td>
            <td>${password || 'N/A'}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-edit" title="Edit Student"><i class="fas fa-pencil-alt"></i></a>
                    <a href="#" class="action-btn btn-reject" data-userid="${rollNo}" title="Remove Student"><i class="fas fa-trash"></i></a>
                    <a href="#" class="action-btn btn-info" data-userid="${rollNo}" title="info student"><i class="fas fa-info-circle"></i></a>
                </div>
            </td>
        `;
        return tr;
    }

    const buildingOptions = ['H1 boys hostel', 'H2 boys hostel', 'Old Boys Hostel', 'Girls Hostel'];

    function createBuildingSelect(selectedBuilding = '') {
        // ... (createBuildingSelect function remains the same) ...
        const select = document.createElement('select');
        select.className = 'building-select edit-input';
        const promptOption = document.createElement('option');
        promptOption.value = '';
        promptOption.textContent = 'Select Building';
        promptOption.disabled = true;
        promptOption.selected = !selectedBuilding;
        select.appendChild(promptOption);
        buildingOptions.forEach(building => {
            const option = document.createElement('option');
            option.value = building;
            option.textContent = building;
            option.selected = building === selectedBuilding;
            select.appendChild(option);
        });
        return select;
    }

    // --- Updated makeRowEditable: Skip index 0 (Roll No) ---
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        // Indices: 0=Roll, 1=Name, 2=Building, 3=Room, 4=Email, 5=Actions (Adjust if password column IS displayed)
        // Assuming password column is NOT displayed, indices are 0-4 for data, 5 for Actions
        const numberOfDataCells = cells.length - 1; // Exclude Actions cell

        const originalValues = Array.from(cells).map(cell => cell.textContent);
        row.dataset.originalHTML = {}; // Store original HTML

        // --- Loop through data cells (0 to number Of Data Cells - 1) ---
        for (let i = 0; i < numberOfDataCells; i++) {
            const cell = cells[i];
            row.dataset.originalHTML[i] = cell.innerHTML; // Store original HTML regardless

            // --- *** MODIFICATION: Skip making Roll No (index 0) editable *** ---
            if (i === 0) {
                console.log(`Skipping edit for cell ${i} (Roll No)`);
                continue; // Go to the next iteration, leaving the cell as is
            }
            // --- *** END MODIFICATION *** ---


            // --- Create inputs for other cells ---
            let inputElement;
            if (i === 2) { // Building (Index 2) -> Dropdown
                inputElement = createBuildingSelect(originalValues[i]);
            } else if (i === 4) { // Email (Index 4) -> Email Input
                inputElement = document.createElement('input');
                inputElement.type = 'email';
                inputElement.value = originalValues[i];
                inputElement.classList.add('edit-input', 'email-input');
            }
            else if (i === 5) { // Password (Index 5 IF DISPLAYED) -> Password Input
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = originalValues[i]; // Placeholder instead of current value
                inputElement.classList.add('edit-input');
            }
            else { // Name (i=1), Room (i=3) -> Text Input
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = originalValues[i];
                inputElement.classList.add('edit-input');
            }

            // Append the input/select
            cell.innerHTML = '';
            cell.appendChild(inputElement);
        }

        // // --- Add Password Input (still needed, perhaps in Name cell?) ---
        // const passwordCell = cells[1]; // Adding to Name cell (index 1)
        // const passwordLabel = document.createElement('label');
        // // ... (password label/input creation remains the same) ...
        // passwordLabel.textContent = ' New Password (optional): ';
        // passwordLabel.style.display = 'block';
        // passwordLabel.style.marginTop = '5px';
        // passwordLabel.style.fontSize = '0.8em';

        // const passwordInputElement = document.createElement('input');
        // passwordInputElement.type = 'password';
        // passwordInputElement.placeholder = 'Enter new password to change';
        // passwordInputElement.classList.add('edit-input', 'password-input');
        // passwordInputElement.style.marginTop = '2px';

        // passwordCell.appendChild(passwordLabel);
        // passwordCell.appendChild(passwordInputElement);


        // --- Update Action Buttons ---
        const actionCell = cells[numberOfDataCells]; // Actions cell
        row.dataset.originalActionsHTML = actionCell.innerHTML;
        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        // --- Attach Save/Cancel Listeners ---
        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        // --- Updated: handleSave gets Roll No from originalValues or data attribute ---
        function handleSaveClick(e) {
            e.preventDefault();
            e.stopPropagation();

            // --- Gather data ---
            const payload = {};
            // --- *** MODIFICATION: Get user_id from original data, not input *** ---
            payload.user_id = originalValues[0]; // Roll No was stored at index 0
            // --- *** END MODIFICATION *** ---

            // Get other values from their input fields
            payload.username = row.querySelector('td:nth-child(2) input.edit-input')?.value; // First input in Name cell
            payload.email = row.querySelector('td:nth-child(5) input.email-input')?.value;
            payload.building = row.querySelector('td:nth-child(3) select.edit-input')?.value;
            payload.roomno = row.querySelector('td:nth-child(4) input.edit-input')?.value; // Use specific class
            payload.userpassword = row.querySelector('td:nth-child(6) input.edit-input')?.value; // Password from Name cell

            // if (passwordInputVal && passwordInputVal.trim() !== '') {
            //     payload.userpassword = passwordInputVal;
            // }

            console.log("Payload to send:", payload);

            if (!payload.user_id || !payload.username || !payload.email) {
                alert('Roll No, Name, and Email are required.');
                return;
            }

            // --- Perform Fetch ---
            // *** Ensure this URL matches your backend route ***
            fetch("https://fmsbackend-iiitd.up.railway.app/admin/update-user-data", { // Changed URL assumption
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => {
                    // ... (Response handling remains the same) ...
                    if (!res.ok) {
                        return res.text().then(text => {
                            let errorJson = {};
                            try { errorJson = JSON.parse(text); } catch (e) { }
                            throw new Error(`Save failed: ${res.status} ${res.statusText}. ${errorJson.error || errorJson.message || text}`);
                        });
                    }
                    return res.json();
                })
                .then(data => {
                    console.log("Update successful:", data);
                    row.classList.remove('editing');
                    // Update cell content visually (skip Roll No cell 0)
                    cells[1].textContent = payload.username;
                    cells[2].textContent = payload.building;
                    cells[3].textContent = payload.roomno;
                    cells[4].textContent = payload.email;
                    cells[5].textContent = payload.userpassword;
                    // Don't need to update password cell display

                    actionCell.innerHTML = row.dataset.originalActionsHTML || '';
                    row.classList.remove('editing');

                    filterTable();
                })
                .catch(error => {
                    console.error("Error saving user data:", error);
                    alert(`Error: ${error.message}`);
                });
        }

        function handleCancelClick(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Cancel clicked for row:", row);

            // Restore original HTML (Loop starts from 0, but cell 0's originalHTML is just its text)
            cells.forEach((cell, index) => {
                if (index < numberOfDataCells) { // Don't restore action cell
                    cell.innerHTML = row.dataset.originalHTML[index] || originalValues[index];
                }
            });

            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
            console.log("Row edit cancelled.");
        }

        saveBtn.addEventListener('click', handleSaveClick);
        cancelBtn.addEventListener('click', handleCancelClick);
    }


    // --- filterTable needs adjustment if password column is displayed ---
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        rows = getRows();

        if (!rows) return;

        rows.forEach(row => {
            if (row.classList.contains('editing')) {
                row.style.display = ''; return;
            }

            // Indices: 0=Roll, 1=Name, 2=Building, 3=Room, 4=Email (assuming pwd not displayed)
            const studentData = {
                rollNo: row.cells[0]?.textContent.toLowerCase() || '',
                name: row.cells[1]?.textContent.toLowerCase() || '',
                building: row.cells[2]?.textContent.toLowerCase() || '',
                room: row.cells[3]?.textContent.toLowerCase() || '',
                email: row.cells[4]?.textContent.toLowerCase() || '',
                password: row.cells[5]?.textContent || ''
            };

            const matchesSearch = Object.values(studentData).some(value =>
                value.includes(searchTerm)
            );
            const buildingCell = row.cells[2];
            const matchesFilter = filterValue === 'all' ||
                (buildingCell && buildingCell.textContent === filterValue);

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }


    // --- loadstudents (adjustment if pwd placeholder added) ---
    function loadstudents(studentsData, targetTableBody) {
        // ... (checks remain same) ...
        if (!Array.isArray(studentsData)) { /*...*/ return; }
        if (!targetTableBody) { /*...*/ return; }

        console.log(`Loading students. Received array with ${studentsData.length} students.`);
        targetTableBody.innerHTML = '';

        if (studentsData.length === 0) {
            targetTableBody.innerHTML = `<tr><td colspan="6">No students found.</td></tr>`; // Colspan might be 6 if pwd displayed
        } else {
            studentsData.forEach(student => {
                const row = createStudentRow(
                    student.user_id,
                    student.username,
                    student.building,
                    student.roomno,
                    student.email,
                    student.userpassword
                    // No need to pass password placeholder here unless createStudentRow uses it
                );
                targetTableBody.appendChild(row);
            });
        }

        rows = getRows();
        filterTable();
        console.log("Finished loading students.");
    }

    // --- Fetch Data (remains same) ---
    try {
        console.log("Attempting fetch...");
        const response = await fetch("https://fmsbackend-iiitd.up.railway.app/admin/view-users");
        // ... (rest of fetch logic) ...
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const fetchedData = await response.json();
        console.log("Data fetched:", fetchedData);
        if (!fetchedData || !Array.isArray(fetchedData.users)) {
            throw new Error("Fetched data unexpected format.");
        }
        students = fetchedData.users;
        loadstudents(students, tableBody);

    } catch (error) {
        console.error("Error fetching/processing data:", error);
        if (tableBody) {
            // Adjust colspan if needed
            tableBody.innerHTML = `<tr><td colspan="6">Failed to load data: ${error.message}</td></tr>`;
        }
    }

    // --- Table Actions (remains same) ---
    tableBody.addEventListener('click', function (e) {
        // ... (edit/delete logic remains the same) ...
        const target = e.target.closest('.action-btn');
        if (!target) return;
        e.preventDefault();
        const row = target.closest('tr');
        if (!row) return;

        const isEditing = row.classList.contains('editing');

        if (target.classList.contains('btn-edit') && !isEditing) {
            if (tableBody.querySelector('tr.editing')) {
                alert('Please save or cancel the current edit first.'); return;
            }
            row.classList.add('editing');
            makeRowEditable(row);
        } else if (target.classList.contains('btn-reject') && !isEditing) {
            const userIdToDelete = target.dataset.userid;
            console.log(userIdToDelete);
            if (!userIdToDelete) { alert("Error: Cannot identify user."); return; }
            if (confirm(`Remove student ${userIdToDelete}?`)) {
                row.style.opacity = '0';
                setTimeout(() => row.remove(), 300);
                fetch("https://fmsbackend-iiitd.up.railway.app/admin/remove-user", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        user_id: userIdToDelete
                    })
                })
                    .then(res => res.json())
                    .then(data => { console.log(data); rows = getRows(); })

            }
        }
    });

    // --- Add Student Button (adjustment if pwd column displayed) ---
    addbut.addEventListener('click', function () {
        showModal();
    });

    // Listeners and CSS injection remain the same
    searchInput.addEventListener('input', filterTable);
    filterSelect.addEventListener('change', filterTable);
    const style = document.createElement('style');
    style.textContent = ` /* ... your styles ... */ `;
    document.head.appendChild(style);

    // Replace this (remove nested DOMContentLoaded listener)
    document.querySelectorAll('.btn-info').forEach(btn => {
        btn.addEventListener('click', async function () {
            const row = this.closest('tr');
            const cells = row.querySelectorAll('td');

            const userId = cells[0].textContent;
            const name = cells[1].textContent;
            const email = cells[4].textContent; // Email is column 4
            const hostel = cells[2].textContent;
            const room = cells[3].textContent;

            studentDetails.innerHTML = `
            <p><strong>Roll No:</strong> ${userId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Hostel:</strong> ${hostel}</p>
            <p><strong>Room:</strong> ${room}</p>
        `;

            studentInfoModal.dataset.userid = userId;
            try {
                const complaintRes = await fetch("https://fmsbackend-iiitd.up.railway.app/complaint/user-complaints", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId })
                });

                const complaintData = await complaintRes.json();
                complaintTableBody.innerHTML = '';

                if (!complaintRes.ok || !Array.isArray(complaintData.complaints)) {
                    throw new Error(complaintData.error || "Failed to fetch complaints");
                }
                if (complaintData.complaints.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td colspan="4" style="text-align:center;">No complaints found.</td>`;
                    complaintTableBody.appendChild(row);
                } else {
                    complaintData.complaints.forEach(entry => {
                        console.log(entry.complaint_id);
                        console.log(new Date(entry.complaints.complaint_datetime).toLocaleString());
                        console.log(entry.complaints.complaint);
                        console.log(entry.is_resolved ? 'Resolved' : 'In Progress');
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${entry.complaint_id}</td>
                        <td>${new Date(entry.complaints.complaint_datetime).toLocaleString()}</td>
                        <td>${entry.complaints.complaint}</td>
                        <td>${entry.is_resolved ? 'Resolved' : 'In Progress'}</td>
                    `;
                        complaintTableBody.appendChild(row);
                    });
                }
            } catch (err) {
                console.error("Error fetching complaints:", err);
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4" style="text-align:center; color:red;">Error loading complaints</td>`;
                complaintTableBody.appendChild(row);
            }
            studentInfoModal.style.display = "block";
        });
    });

    closeStudentModalBtn.addEventListener('click', () => {
        studentInfoModal.style.display = "none";
        historyTableBody.innerHTML = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === studentInfoModal) {
            studentInfoModal.style.display = "none";
            historyTableBody.innerHTML = '';
        }
    });

    fetchHistoryBtn.addEventListener('click', async () => {
        const date = document.getElementById("historyDate").value;
        const userId = studentInfoModal.dataset.userid;
        if (!date || !userId) return;

        try {
            const res = await fetch(`https://fmsbackend-iiitd.up.railway.app/statistics/services-by-date?user_id=${userId}&date=${date}`);
            const data = await res.json();
            historyTableBody.innerHTML = '';

            data.services.forEach(service => {
                const row = document.createElement('tr');
                row.innerHTML = `
                <td>${service.service_id}</td>
                <td>${service.worker_id}</td>
                <td>${service.room_no}</td>
                <td>${service.building}</td>
                <td>${new Date(service.request_time).toLocaleString()}</td>
                <td>${service.feedback || "N/A"}</td>
                <td>${service.rating || "N/A"}</td>
                <td>${service.is_completed || "false"}</td>
            `;
                historyTableBody.appendChild(row);
            });
        } catch (err) {
            console.error("Failed to fetch service history:", err);
        }

    });


    console.log("Setup complete.");
});

