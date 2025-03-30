// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get the table body where students are listed
    const tableBody = document.querySelector('.data-table tbody');
    const mainContent = document.querySelector('.main-content');
    const searchInput = document.querySelector('.search-input'); // Get search input
    const filterSelect = document.querySelector('.filter-select'); // Get filter select

    // --- Debugging: Check if elements are selected ---
    console.log("Search Input Element:", searchInput);
    console.log("Filter Select Element:", filterSelect);
    if (!searchInput || !filterSelect) {
        console.error("ERROR: Search input or filter select element not found!");
        // return; // Optional: Stop script if elements are missing
    }
    // --------------------------------------------------

    // Add "Add Student" button
    const addButton = document.createElement('button');
    addButton.className = 'add-student-btn'; // Changed class name
    addButton.innerHTML = '<i class="fas fa-plus"></i> Add Student'; // Changed text
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        tableContainer.appendChild(addButton);
    } else {
        console.error("ERROR: .table-container not found for Add button!");
    }

    // Counter for new student roll numbers (assuming simple increment)
    let lastRollNo = 0;
    const buildingOptions = ['H1', 'H2', 'Old Boys Hostel', 'Girls Hostel']; // Building options

    // Get all non-empty rows initially
    function getRows() {
        return tableBody.querySelectorAll('tr:not(.empty-row)');
    }
    let rows = getRows();

    // Update last roll number based on existing entries
    function updateLastRollNo() {
        const rollNos = Array.from(tableBody.querySelectorAll('tr:not(.empty-row) td:first-child'))
            .map(td => parseInt(td.textContent)); // Assuming roll no is just numeric
        lastRollNo = rollNos.length > 0 ? Math.max(...rollNos) : 2023000; // Start from a base if empty
        // Adjust base year/number as needed
    }

    // Initialize last roll number
    updateLastRollNo();

    // Function to filter table rows based on search and building
    function filterTable() {
        // --- Debugging: Check filter function call and values ---
        console.log("filterTable() called");
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value; // Building name or 'all'
        console.log(`Search Term: '${searchTerm}', Filter Value: '${filterValue}'`);
        // ------------------------------------------------------
        rows = getRows(); // Re-fetch rows

        rows.forEach(row => {
            if (row.classList.contains('editing')) {
                row.style.display = ''; // Keep editing rows visible
                return;
            }

            // Indices: 0=RollNo, 1=Name, 2=Phone, 3=Building, 4=Floor, 5=Room
            const studentData = {
                rollNo: row.cells[0]?.textContent.toLowerCase() || '',
                name: row.cells[1]?.textContent.toLowerCase() || '',
                phone: row.cells[2]?.textContent.toLowerCase() || '',
                building: row.cells[3]?.textContent.toLowerCase() || '',
                floor: row.cells[4]?.textContent.toLowerCase() || '',
                room: row.cells[5]?.textContent.toLowerCase() || ''
            };

            // Check search match
            const matchesSearch = Object.values(studentData).some(value =>
                value.includes(searchTerm)
            );

            // Check filter match (Building is in cell 3)
            const buildingCell = row.cells[3];
            const matchesFilter = filterValue === 'all' ||
                (buildingCell && buildingCell.textContent === filterValue);

            // --- Debugging: Log match results per row ---
            // console.log(`Row ${row.cells[0]?.textContent}: Search=${matchesSearch}, Filter=${matchesFilter}`);
            // ---------------------------------------------

            row.style.display = matchesSearch && matchesFilter ? '' : 'none';
        });
    }

    // Function to create a new student row
    function createStudentRow(rollNo = null, name = '', phone = '', building = '', floor = '', room = '') {
        const newRollNo = rollNo || lastRollNo;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${newRollNo}</td>
            <td>${name}</td>
            <td>${phone}</td>
            <td>${building}</td>
            <td>${floor}</td>
            <td>${room}</td>
            <td>
                <div class="action-buttons">
                    <a href="#" class="action-btn btn-edit"><i class="fas fa-pencil-alt"></i></a>
                    <a href="#" class="action-btn btn-reject"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        return tr;
    }

    // Function to create building select dropdown
    function createBuildingSelect(selectedBuilding = '') {
        const select = document.createElement('select');
        select.className = 'building-select edit-input'; // Add class for styling

        // Add default prompt option
        const promptOption = document.createElement('option');
        promptOption.value = '';
        promptOption.textContent = 'Select Building';
        promptOption.disabled = true;
        promptOption.selected = !selectedBuilding; // Select if no building is pre-selected
        select.appendChild(promptOption);

        // Add building options
        buildingOptions.forEach(building => {
            const option = document.createElement('option');
            option.value = building;
            option.textContent = building;
            option.selected = building === selectedBuilding;
            select.appendChild(option);
        });
        return select;
    }

    // Function to make a student row editable
    function makeRowEditable(row) {
        const cells = row.querySelectorAll('td');
        const originalValues = [];
        row.dataset.originalHTML = {}; // Store original HTML per cell

        // Indices: 1=Name, 2=Phone, 3=Building, 4=Floor, 5=Room
        for (let i = 1; i < cells.length - 1; i++) {
            const cell = cells[i];
            originalValues[i] = cell.textContent; // Store text content for cancel
            row.dataset.originalHTML[i] = cell.innerHTML; // Store innerHTML for cancel

            let inputElement;
            if (i === 2) { // Phone number
                inputElement = document.createElement('input');
                inputElement.type = 'tel';
                inputElement.value = cell.textContent;
            } else if (i === 3) { // Building -> Dropdown
                inputElement = createBuildingSelect(cell.textContent);
            } else { // Name (i=1), Floor (i=4), Room (i=5)
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
        const cancelBtn = actionCell.querySelector('.btn-cancel'); // Changed selector

        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering the table body listener again
            const inputsAndSelect = row.querySelectorAll('.edit-input');
            inputsAndSelect.forEach((element, index) => {
                const targetCell = cells[index + 1];
                targetCell.textContent = element.value; // Update cell text content
            });
            actionCell.innerHTML = row.dataset.originalActionsHTML || ''; // Restore original buttons
            row.classList.remove('editing');
            filterTable(); // Re-apply filters
        });

        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent triggering the table body listener again
            for (let i = 1; i < cells.length - 1; i++) {
                // Restore original HTML content if stored, otherwise original text
                cells[i].innerHTML = row.dataset.originalHTML[i] || originalValues[i];
            }
            actionCell.innerHTML = row.dataset.originalActionsHTML || ''; // Restore original buttons
            row.classList.remove('editing');
        });
    }

    // Event delegation for edit and delete buttons
    tableBody.addEventListener('click', function (e) {
        const target = e.target.closest('.action-btn');
        if (!target) return;

        e.preventDefault();
        const row = target.closest('tr');

        // Handle Save/Cancel first if the row is already being edited
        if (row.classList.contains('editing')) {
            if (target.classList.contains('btn-save')) {
                // Find the save button and trigger its click handler programmatically
                row.querySelector('.btn-save').click();
            } else if (target.classList.contains('btn-reject')) {
                // Find the cancel button and trigger its click handler programmatically
                row.querySelector('.btn-reject').click();
            }
            row.classList.remove('editing'); // Remove editing class after save/cancel
            return; // Stop further processing for this click
        }

        // Handle Edit/Delete for non-editing rows
        if (target.classList.contains('btn-edit')) {
            // Prevent editing multiple rows at once
            if (tableBody.querySelector('tr.editing')) {
                alert('Please save or cancel the current edit first.');
                return;
            }
            row.classList.add('editing'); // Mark row as being edited
            makeRowEditable(row);
        } else if (target.classList.contains('btn-reject')) {
            if (confirm('Are you sure you want to remove this student?')) {
                row.style.opacity = '0';
                setTimeout(() => {
                    row.remove();
                    rows = getRows(); // Update rows list
                    updateLastRollNo();
                }, 300);
            }
        }
    });

    // Add new student functionality
    addButton.addEventListener('click', function () {
        lastRollNo++;
        // Create row with empty values for Building, Floor, Room
        const newRow = createStudentRow(lastRollNo, '', '', '', '', '');

        const lastDataRow = Array.from(tableBody.querySelectorAll('tr:not(.empty-row)')).pop();
        if (lastDataRow) {
            lastDataRow.insertAdjacentElement('afterend', newRow);
        } else {
            tableBody.insertBefore(newRow, tableBody.firstChild);
        }

        rows = getRows(); // Update rows list

        row.classList.add('editing'); // Mark row as being edited
        makeRowEditable(newRow); // Make the new row editable immediately
    });

    // Add CSS for the add button, edit inputs/select, and filter/search bar
    const style = document.createElement('style');
    style.textContent = `
        .table-actions {
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--border-color);
            flex-wrap: wrap; /* Allow wrapping on small screens */
            gap: 10px;
        }
        .search-box {
            position: relative;
            flex: 1 1 250px; /* Flex grow, shrink, base width */
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
             flex: 1 1 200px; /* Flex grow, shrink, base width */
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
        .add-student-btn { 
            /* Position button top-right relative to table-container */
            position: absolute; 
            top: -45px; /* Adjust as needed based on h1 margin */
            right: 0;
            /* Removed float */
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            /* margin-bottom: 15px; Removed margin */
            z-index: 10; /* Ensure it's above table actions */
        }
        .add-student-btn:hover { 
            background-color: var(--primary-dark);
        }
        /* Style the container relatively to position the button */
        .table-container {
            position: relative;
            margin-top: 10px; /* Add space for the button */
        }
        .edit-input, .building-select { 
            width: 100%;
            padding: 5px;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            font-size: 0.9em;
            margin: 0; 
        }
        .edit-input:focus, .building-select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 3px rgba(26, 188, 156, 0.3);
        }
        .building-select {
             background-color: white; 
        }
    `;
    document.head.appendChild(style);

    // --- Event Listener Attachment --- 
    if (searchInput && filterSelect) {
        // --- Debugging: Confirm listeners are attached --- 
        console.log("Attaching event listeners...");
        // -------------------------------------------------
        searchInput.addEventListener('input', filterTable);
        filterSelect.addEventListener('change', filterTable);
        // --- Debugging: Confirm attachment --- 
        console.log("Event listeners attached.");
        // ------------------------------------
    }
    // --------------------------------

    // Initial filter call
    filterTable();
}); 