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
        'Plumber',
        'Carpenter',
        'HVAC Technician',
        'Security',
        'Janitor',
        'Maintenance Staff'
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

        const payload = {
            worker_id: document.getElementById('empID').value.trim(),
            worker_name: document.getElementById('empName').value.trim(),
            phone: document.getElementById('empPhone').value.trim(),
            assigned_role: document.getElementById('empRole').value.trim(),
            workerpassword: document.getElementById('empPassword').value.trim()
        };

        if (!payload.worker_id || !payload.worker_name || !payload.phone || !payload.assigned_role || !payload.workerpassword) {
            alert("Please fill all fields.");
            return;
        }

        try {
            const res = await fetch('https://fmsbackend-iiitd.up.railway.app/admin/add-employee', {
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
                doj: row.cells[2]?.textContent.toLowerCase() || '',
                phone: row.cells[3]?.textContent.toLowerCase() || '',
                role: row.cells[4]?.textContent.toLowerCase() || ''
            };

            // Check search match
            const matchesSearch = Object.values(employeeData).some(value =>
                value.includes(searchTerm)
            );

            // Check filter match (Role is in cell 4)
            const roleCell = row.cells[4];
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
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        const originalValues = [];
        row.dataset.originalHTML = {}; // Use dataset for original HTML

        // Indices: 1=Name, 2=DoJ, 3=Phone, 4=Role
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            originalValues[i] = cell.textContent; // Store original text
            row.dataset.originalHTML[i] = cell.innerHTML; // Store original HTML structure

            let inputElement;
            if (i === 2) { // Date of Joining
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                inputElement.value = formatDateForInput(cell.textContent);
            } else if (i === 3) { // Phone number
                inputElement = document.createElement('input');
                inputElement.type = 'tel';
                inputElement.value = cell.textContent;
            } else if (i === 4) { // Role
                inputElement = createRoleSelect(cell.textContent);
            } else { // Name (i=1)
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = cell.textContent;
            }

            // Add edit-input class if it's an input or select we added
            if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'SELECT') {
                inputElement.classList.add('edit-input');
            }

            cell.innerHTML = ''; // Clear cell before appending new element
            cell.appendChild(inputElement);
        }

        // Store original buttons and replace with Save/Cancel
        const actionCell = cells[cells.length - 1];
        row.dataset.originalActionsHTML = actionCell.innerHTML;
        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        // Add event listeners for THIS INSTANCE of save/cancel
        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault();
            e.stopPropagation();
            const inputsAndSelect = row.querySelectorAll('.edit-input'); // Name, DoJ, Phone, Role select
            inputsAndSelect.forEach((element, index) => {
                const targetCell = cells[index + 1];
                if (element.type === 'date') {
                    targetCell.textContent = formatDateForDisplay(element.value);
                } else {
                    targetCell.textContent = element.value;
                }
            });
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
            filterTable(); // Re-apply filter
        });

        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault();
            e.stopPropagation();
            for (let i = 1; i < cells.length - 1; i++) {
                cells[i].innerHTML = row.dataset.originalHTML[i] || originalValues[i]; // Restore original HTML
            }
            actionCell.innerHTML = row.dataset.originalActionsHTML || '';
            row.classList.remove('editing');
        });
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
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    rows = getRows(); // Update rows list
                    updateLastEmployeeId();
                }, 300);
            }
        }
        // Save/Cancel are handled by listeners attached in makeRowEditable
    });

    // Add new employee functionality
    addButton.addEventListener('click', function () {
        lastEmployeeId++;
        const newRow = createEmployeeRow(null, '', '', '', ''); // Pass null for ID

        const lastDataRow = Array.from(tableBody.querySelectorAll('tr:not(.empty-row)')).pop();
        if (lastDataRow) {
            lastDataRow.insertAdjacentElement('afterend', newRow);
        } else {
            tableBody.insertBefore(newRow, tableBody.firstChild);
        }
        rows = getRows(); // Update rows list

        newRow.classList.add('editing');
        makeRowEditable(newRow);
    });

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

const employees = [
    {
        id: 'EMP001',
        name: 'John Smith',
        joiningDate: '01/01/2024',
        phone: '9876543210',
        role: 'Electrician'
    },
    {
        id: 'EMP002',
        name: 'Sarah Wilson',
        joiningDate: '15/01/2024',
        phone: '9876543211',
        role: 'Plumber'
    },
    // Add more employee objects here as needed
];

// Function to populate the employee table
function populateEmployeeTable() {
    const tableBody = document.querySelector('.data-table tbody');
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    // Clear existing content
    tableBody.innerHTML = '';

    // Populate table with employee data
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.joiningDate}</td>
            <td>${employee.phone}</td>
            <td>${employee.role}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-edit"><i class="fas fa-pencil-alt"></i></a>
                    <a href="#" class="action-btn btn-reject"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Add empty rows if needed for styling/layout consistency
    const minRows = 8; // Adjust as needed based on desired empty space
    const currentRows = employees.length;
    const emptyRowsToAdd = Math.max(0, minRows - currentRows);

    for (let i = 0; i < emptyRowsToAdd; i++) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        `;
        tableBody.appendChild(emptyRow);
    }
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
function addEmployee() {
    // Here you would typically show a form or modal to collect employee details
    // For now, let's add a sample employee
    const newEmployee = {
        id: generateNextEmployeeId(),
        name: 'New Employee',
        joiningDate: new Date().toLocaleDateString(),
        phone: '9876543212',
        role: 'Maintenance Staff'
    };

    employees.push(newEmployee);
    populateEmployeeTable();
}

// Add click event listener to the Add Employee button
document.querySelector('.EMP_ADD').addEventListener('click', addEmployee);

// Initialize the table when the page loads
document.addEventListener('DOMContentLoaded', populateEmployeeTable); 