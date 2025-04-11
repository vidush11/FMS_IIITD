// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('.data-table tbody');
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const mainContent = document.querySelector('.main-content');
    const addButton = document.querySelector('.EMP_ADD');

    // Add "Add Employee" button to the top of the table
    const empModal = document.getElementById('addEmployeeModal');
    const empCloseBtn = document.getElementById('closeEmployeeModal');
    const empForm = document.getElementById('addEmployeeForm');

    // Available roles for the dropdown
    const availableRoles = [
        'Electrician',
        'Cleaner',
        'Painter',
        'Carpentry',
        'Guard',
        'Miscellaneous'
    ];

    // Counter for new employee IDs
    let lastEmployeeId = 0;
    addButton?.addEventListener('click', () => {
        empModal.style.display = 'block';
    });

    // Close modal
    empCloseBtn?.addEventListener('click', () => {
        empModal.style.display = 'none';
    });

    // Optional: Close when clicking outside modal
    window.addEventListener('click', (e) => {
        if (e.target === empModal) {
            empModal.style.display = 'none';
        }
    });

    // Handle form submission
    empForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const now = new Date();

        const payload = {
            worker_id: document.getElementById('empID').value.trim(),
            name: document.getElementById('empName').value.trim(),
            phone_no: document.getElementById('empPhone').value.trim(),
            assigned_role: document.getElementById('empRole').value.trim(),
            date_of_joining: now,
            rating: 0,
            workerpassword: document.getElementById('empPassword').value.trim()
        };

        if (!payload.worker_id || !payload.name || !payload.phone_no || !payload.assigned_role || !payload.workerpassword) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const res = await fetch('https://fmsbackend-iiitd.up.railway.app/admin/add-worker', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to add employee");

            alert("Employee added successfully!");
            empModal.style.display = 'none';
            empForm.reset();
            populateEmployeeTable();

        } catch (err) {
            console.error(err);
            alert(`Error: ${err.message}`);
        }
    });

    // Get all non-empty rows initially
    function getRows() {
        return tableBody.querySelectorAll('tr:not(.empty-row)');
    }
    let rows = getRows();

    // Update last employee ID based on existing entries
    function updateLastEmployeeId() {
        const employeeIds = Array.from(tableBody.querySelectorAll('tr:not(.empty-row) td:first-child'))
            .map(td => parseInt(td.textContent.replace('EMP', '')));
        lastEmployeeId = employeeIds.length > 0 ? Math.max(...employeeIds) : 0;
    }

    // Initialize last employee ID
    updateLastEmployeeId();

    // Function to filter table rows based on search and role
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value; // Role name or 'all'
        rows = getRows();

        rows.forEach(row => {
            if (row.classList.contains('editing')) {
                row.style.display = '';
                return;
            }

            // Indices: 0=ID, 1=Name, 2=DoJ, 3=Phone, 4=Role
            const employeeData = {
                id: row.cells[0]?.textContent.toLowerCase() || '',
                name: row.cells[1]?.textContent.toLowerCase() || '',
                doj: row.cells[4]?.textContent.toLowerCase() || '',
                phone: row.cells[2]?.textContent.toLowerCase() || '',
                role: row.cells[3]?.textContent.toLowerCase() || ''
            };

            // Check search match
            const matchesSearch = Object.values(employeeData).some(value =>
                value.includes(searchTerm)
            );

            // Check filter match (Role is in cell 4)
            const roleCell = row.cells[3];
            const matchesFilter = filterValue === 'all' ||
                (roleCell && roleCell.textContent === filterValue);

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Function to create role select element
    function createRoleSelect(selectedRole = '') {
        const select = document.createElement('select');
        select.className = 'role-select edit-input';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select Role';
        defaultOption.selected = !selectedRole;
        select.appendChild(defaultOption);
        availableRoles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            option.selected = role === selectedRole;
            select.appendChild(option);
        });
        return select;
    }

    // Function to format date for input
    function formatDateForInput(dateStr) {
        if (!dateStr || typeof dateStr !== 'string') return '';
        const parts = dateStr.split('/');
        if (parts.length !== 3) return '';
        const year = parts[2];
        const month = parts[1].padStart(2, '0');
        const day = parts[0].padStart(2, '0');
        if (isNaN(parseInt(year)) || isNaN(parseInt(month)) || isNaN(parseInt(day))) return '';
        return `${year}-${month}-${day}`;
    }

    // Function to format date for display
    function formatDateForDisplay(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toLocaleDateString('en-IN');
    }

    // Function to create a new employee row
    function createEmployeeRow(id = null, name = '', doj = '', phone = '', role = '') {
        const newId = id || `EMP${String(lastEmployeeId).padStart(3, '0')}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${newId}</td>
            <td>${name}</td>
            <td>${formatDateForDisplay(doj)}</td>
            <td>${phone}</td>
            <td>${role}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-edit"><i class="fas fa-pencil-alt"></i></a>
                    <a href="#" class="action-btn btn-reject"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        return tr;
    }

    // Function to make a row editable
    // Function to make a row editable
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        // Indices based on image: 0=ID, 1=Name, 2=Phone, 3=Role, 4=DoJ, 5=Rating, 6=Password, 7=Actions
        const numberOfDataCells = cells.length - 1; // Exclude actions cell

        const originalValues = Array.from(cells).map(cell => cell.textContent); // Store original text values
        row.dataset.originalHTML = {}; // Use dataset for original HTML

        // --- Loop through data cells (0 to numberOfDataCells - 1) ---
        for (let i = 0; i < numberOfDataCells; i++) {
            const cell = cells[i];
            const currentText = cell.textContent.trim(); // Get trimmed text content
            row.dataset.originalHTML[i] = cell.innerHTML; // Store original HTML

            // --- Skip making Employee ID (index 0) editable ---
            if (i === 0) {
                console.log(`Skipping edit for cell ${i} (Employee ID)`);
                continue;
            }

            // --- Create inputs/selects for other cells ---
            let inputElement;

            switch (i) {
                case 1: // Name (Index 1)
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.value = currentText;
                    inputElement.classList.add('edit-input', 'name-input');
                    break;
                case 2: // Phone Number (Index 2)
                    inputElement = document.createElement('input');
                    inputElement.type = 'tel'; // Use 'tel' type
                    inputElement.value = currentText;
                    inputElement.classList.add('edit-input', 'phone-input');
                    break;
                case 3: // Assigned Role (Index 3)
                    console.log(`Creating role select for cell ${i}, current text: "${currentText}"`);
                    // Pass the trimmed text content to match against availableRoles
                    inputElement = createRoleSelect(currentText); // createRoleSelect handles the selection logic
                    inputElement.classList.add('edit-input'); // Keep common class
                    break;
                case 4: // Date of Joining (Index 4)
                    console.log(`Creating date input for cell ${i}, current text: "${currentText}"`);
                    inputElement = document.createElement('input');
                    inputElement.type = 'date';
                    // --- FIX: Directly use the text content if it's YYYY-MM-DD ---
                    inputElement.value = currentText; // Assign directly
                    inputElement.classList.add('edit-input', 'date-input');
                    break;
                case 5: // Rating (Index 5)
                    inputElement = document.createElement('input');
                    inputElement.type = 'number'; // Use 'number' type
                    inputElement.step = '0.01'; // Allow decimals for rating
                    inputElement.value = currentText;
                    inputElement.classList.add('edit-input', 'rating-input');
                    break;
                case 6: // Password (Index 6)
                    inputElement = document.createElement('input');
                    inputElement.type = 'text';
                    inputElement.value = currentText; // Don't show current password
                    inputElement.classList.add('edit-input', 'password-input');
                    break;
                default:
                    // Should not happen with current structure
                    console.warn("Unhandled cell index in makeRowEditable:", i);
                    continue; // Skip this cell if index is unexpected
            }

            // Append the created input/select
            cell.innerHTML = '';
            cell.appendChild(inputElement);
        }

        // --- Update Action Buttons ---
        const actionCell = cells[numberOfDataCells]; // Actions cell (index 7)
        row.dataset.originalActionsHTML = actionCell.innerHTML; // Store original buttons
        actionCell.innerHTML = `
        <div class="action-buttons">
            <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
           
        </div>
    `;

        // --- Attach Save/Cancel Listeners ---
        const saveBtn = actionCell.querySelector('.btn-save');
        // Make sure cancel button exists

        // --- Save Button Handler ---
        saveBtn.addEventListener('click', function handleSave(e) {
            // ... (Your existing save logic using querySelector to get values - this part was good) ...
            e.preventDefault(); e.stopPropagation();
            const payload = {};
            payload.worker_id = cells[0].textContent.trim();
            payload.name = row.querySelector('td:nth-child(2) input.edit-input')?.value.trim();
            payload.phone_no = row.querySelector('td:nth-child(3) input.edit-input')?.value.trim();
            payload.assigned_role = row.querySelector('td:nth-child(4) select.edit-input')?.value; // Corrected selector for Role
            payload.date_of_joining = row.querySelector('td:nth-child(5) input[type="date"].edit-input')?.value; // Corrected selector for DoJ
            payload.rating = row.querySelector('td:nth-child(6) input.rating-input')?.value;
            const passwordInputVal = row.querySelector('td:nth-child(7) input.password-input')?.value;
            if (passwordInputVal && passwordInputVal.trim() !== '') { payload.workerpassword = passwordInputVal; }
            if (payload.rating !== undefined && payload.rating !== '') { payload.rating = parseFloat(payload.rating); if (isNaN(payload.rating)) { payload.rating = null; } } else if (payload.rating === '') { payload.rating = null; }
            console.log("Data gathered for PUT:", payload);
            if (!payload.worker_id || !payload.name || !payload.phone_no || !payload.assigned_role || !payload.date_of_joining) { alert('Error: Required fields missing.'); return; }
            const apiUrl = "https://fmsbackend-iiitd.up.railway.app/admin/update-worker-role"; // ** CHECK URL **
            const fetchOptions = { method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" }, credentials: 'include', body: JSON.stringify(payload) };
            // saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none'; if (cancelBtn) { cancelBtn.style.opacity = '0.5'; cancelBtn.style.pointerEvents = 'none'; }
            saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none';
            fetch(apiUrl, fetchOptions)
                .then(response => { if (!response.ok) { return response.text().then(text => { /* Error Handling */ throw new Error(`API Error ${response.status}: ${text || response.statusText}`); }); } return response.json(); })
                .then(data => {
                    console.log("Worker updated successfully:", data);
                    cells[1].textContent = payload.name;
                    cells[2].textContent = payload.phone_no;
                    cells[3].textContent = payload.assigned_role;
                    cells[4].textContent = payload.date_of_joining; // Display raw date YYYY-MM-DD is fine
                    cells[5].textContent = payload.rating !== null ? payload.rating : 'N/A';
                    cells[6].textContent = payload.workerpassword; // Password placeholder
                    actionCell.innerHTML = row.dataset.originalActionsHTML || '';
                    row.classList.remove('editing');
                    filterTable();
                })
                .catch(error => {
                    console.error("Error updating worker:", error); alert(`Failed to update employee: ${error.message}`);
                    cells.forEach((cell, index) => { if (index > 0 && index < cells.length - 1) { if (row.dataset.originalHTML && row.dataset.originalHTML[index] !== undefined) { cell.innerHTML = row.dataset.originalHTML[index]; } else if (originalValues && originalValues[index] !== undefined) { cell.textContent = originalValues[index]; } } });
                    actionCell.innerHTML = row.dataset.originalActionsHTML || ''; row.classList.remove('editing');
                })
                .finally(() => { delete row.dataset.originalHTML; delete row.dataset.originalActionsHTML; /* Optionally re-enable buttons */ });
        });

        // --- Cancel Button Handler ---
        // Keep { once: true } for cancel
    }

    // Event delegation for table body clicks
    tableBody.addEventListener('click', function (e) {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        const row = target.closest('tr');
        // Prevent acting on already editing rows via delegation
        if (row.classList.contains('editing') &&
            !target.classList.contains('btn-save') &&
            !target.classList.contains('btn-cancel')) {
            return;
        }

        e.preventDefault();

        if (target.classList.contains('btn-edit')) {
            if (tableBody.querySelector('tr.editing')) {
                alert('Please save or cancel the current edit first.');
                return;
            }
            row.classList.add('editing');
            makeRowEditable(row);
        } else if (target.classList.contains('btn-reject')) {
            if (confirm('Are you sure you want to remove this employee?')) {
                let worker_id = target.dataset.workerid;
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    rows = getRows(); // Update rows list
                    updateLastEmployeeId();
                }, 300);
                fetch("https://fmsbackend-iiitd.up.railway.app/admin/remove-worker", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        worker_id: worker_id
                    })
                }).then(res => res.json()).then(data => { console.log(data) })
            }
        }
        // Save/Cancel are handled by listeners attached in makeRowEditable
    });

    // Add new employee functionality

    // Add CSS for the add button, edit inputs, role select, and filter/search bar
    const style = document.createElement('style');
    style.textContent = `
        /* Styles for filter/search bar */
        .table-actions {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            flex-wrap: wrap; 
            gap: 10px;
        }
        .search-box {
            position: relative;
            flex: 1 1 250px; 
        }
        .search-input {
            width: 100%;
            padding: 8px 35px 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.9rem;
        }
        .search-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
        }
        .filter-box {
             flex: 1 1 200px; 
        }
        .filter-select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.9rem;
            background-color: white;
            cursor: pointer;
        }

        /* Adjusted Add Button Styles */
        .add-employee-btn {
            position: absolute; 
            top: -45px; /* Adjust based on h1 margin */
            right: 0;
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            z-index: 10; 
        }
        .add-employee-btn:hover {
            background-color: var(--primary-dark);
        }
        
        /* Container for positioning */
        .table-container {
            position: relative;
            margin-top: 10px; 
        }

        /* Existing styles for edit inputs/select */
        .edit-input {
            width: 100%;
            padding: 5px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.9em;
            margin: 0;
        }
        .edit-input:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 3px rgba(26, 188, 156, 0.3);
        }
        .role-select {
            width: 100%;
            padding: 5px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.9em;
            background-color: white;
            margin: 0;
        }
        .role-select:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        /* Added Save/Cancel button styles */
        .btn-save {
            background-color: var(--success-color);
        }
        .btn-cancel {
             background-color: var(--text-muted);
        }
        .btn-save:hover, .btn-cancel:hover {
            opacity: 0.85;
        }
    `;
    document.head.appendChild(style);

    // Attach search/filter listeners
    if (searchInput && filterSelect) {
        searchInput.addEventListener('input', filterTable);
        filterSelect.addEventListener('change', filterTable);
    }

    // Initial filter call
    filterTable();
});

let employees = [
    // Add more employee objects here as needed
];

// Function to populate the employee table
async function populateEmployeeTable() {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    // Clear existing content
    tableBody.innerHTML = '';

    try {
        console.log("Fetching initial orders data...");
        const response = await fetch("https://fmsbackend-iiitd.up.railway.app/admin/view-employees", { credentials: 'include' });
        console.log("Fetch response status:", response.status);
        if (!response.ok) { let errorText = response.statusText; try { errorText = await response.text(); } catch (e) { } throw new Error(`HTTP error ${response.status}: ${errorText}`); }
        const fetchedResult = await response.json();
        console.log("Data fetched:", fetchedResult);
        if (!fetchedResult || !Array.isArray(fetchedResult.employees)) { console.error("Fetched data unexpected format. Received:", fetchedResult); throw new Error("Unexpected data format."); }
        employees = fetchedResult.employees;
        // Render the full initial data set
    } catch (error) {
        console.error("Error fetching/processing data:", error);
        // --- Update Colspan ---
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Failed to load orders: ${error.message}</td></tr>`;
    }

    // Populate table with employee data
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.worker_id}</td>
            <td>${employee.name}</td>
            <td>${employee.phone_no}</td>
            <td>${employee.assigned_role}</td>
            <td>${employee.date_of_joining}</td>
            <td>${employee.rating}</td>
            <td>${employee.workerpassword}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-edit"><i class="fas fa-pencil-alt"></i></a>
                    <a href="#" class="action-btn btn-reject" data-workerid="${employee.worker_id}"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add empty rows if needed for styling/layout consistency
    const minRows = 8; // Adjust as needed based on desired empty space
    const currentRows = employees.length;
    const emptyRowsToAdd = Math.max(0, minRows - currentRows);


}

// Function to generate next employee ID
function generateNextEmployeeId() {
    if (employees.length === 0) return 'EMP001';

    const lastEmployee = employees[employees.length - 1];
    const lastId = parseInt(lastEmployee.id.replace('EMP', ''));
    const nextId = lastId + 1;
    return `EMP${String(nextId).padStart(3, '0')}`;
}

// Function to add a new employee


// Add click event listener to the Add Employee button
//document.querySelector('.EMP_ADD').addEventListener('click', addEmployee);

// Initialize the table when the page loads
document.addEventListener('DOMContentLoaded', populateEmployeeTable); 