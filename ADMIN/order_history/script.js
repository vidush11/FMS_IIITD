// Complete script.js for Order History Page (Date Removed)

document.addEventListener('DOMContentLoaded', function () {
    // --- Get DOM Elements ---
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const tableBody = document.querySelector('.data-table tbody');
    const workerIdInput = document.getElementById("assignWorkerId");
const locationSelect = document.getElementById("assignLocation");
const filterBtn = document.getElementById("assignBtn"); // This is your "Filter" button
filterBtn.addEventListener("click", async () => {
    const workerId = workerIdInput.value.trim();
    const location = locationSelect.value.trim();

    let url = "https://fmsbackend-iiitd.up.railway.app/orders/location-worker-orders";

    console.log(workerId);
    console.log(location);  

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                worker_id: workerId || null,  // send null if empty
                location: location || null
            })
        });

        const data = await res.json();

        if (!res.ok || !Array.isArray(data.orders)) {
            throw new Error(data.error || "Failed to fetch filtered data.");
        }

        orderHistoryData = data.orders; // Replace global data
        renderFiltered(orderHistoryData); // Rerender the table
    } catch (err) {
        console.error("Filtering error:", err);
        alert(`Failed to apply filter: ${err.message}`);
    }
});


    // --- Check if elements exist ---
    if (!searchInput || !filterSelect || !tableBody) {
        console.error("FATAL: Missing required elements."); return;
    }

    // --- Global store for fetched order data ---
    let orderHistoryData = [];

    // --- Helper: Create True/False Select Dropdown ---
    function createBooleanStatusSelect(currentValue) {
        const select = document.createElement('select');
        select.className = 'status-select edit-input';
        const options = [{ value: 'true', text: 'True' }, { value: 'false', text: 'False' }];
        if (typeof currentValue !== 'boolean') {
            const prompt = document.createElement('option');
            prompt.value = ""; prompt.textContent = "-- Select Status --"; prompt.selected = true; prompt.disabled = true; select.appendChild(prompt);
        }
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value; option.textContent = opt.text;
            if (typeof currentValue === 'boolean' && String(currentValue) === opt.value) { option.selected = true; }
            select.appendChild(option);
        });
        return select;
    }

    // --- Renders a given array of order data into the table body ---
    function renderFiltered(dataToRender) {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        // --- Update Colspan ---
        const numberOfColumns = 6; // OrderID, UserID, EmpID, Location, Collected, Actions

        if (!dataToRender || dataToRender.length === 0) {
            const tr = document.createElement('tr'); const td = document.createElement('td');
            td.colSpan = numberOfColumns; // Use variable
            td.textContent = 'No matching orders found.'; td.style.textAlign = 'center';
            tr.appendChild(td); tableBody.appendChild(tr); return;
        }

        dataToRender.forEach(order => {
            const tr = document.createElement('tr');
            tr.dataset.orderId = order.order_id;
            const statusText = order.collected === true ? 'True' : (order.collected === false ? 'False' : 'N/A');

            // --- Updated innerHTML (Removed Date Cell) ---
            tr.innerHTML = `
                <td>${order.order_id || 'N/A'}</td>           
                <td>${order.user_id || 'N/A'}</td>          
                <td>${order.worker_id || 'N/A'}</td>        
                <td>${order.location || 'N/A'}</td>        
                <td>${statusText}</td>                       
                <td>                                         
                    <div class="action-buttons">
                        <a href="#" class="action-btn btn-edit" title="Edit Status"><i class="fas fa-pencil-alt"></i></a>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // --- Fetches initial data ---
    async function renderTable() {
        if (!tableBody) { console.error("renderTable: Cannot find table body element."); return; }
        try {
            console.log("Fetching initial orders data...");
            const response = await fetch("https://fmsbackend-iiitd.up.railway.app/orders/all-orders", { credentials: 'include' });
            console.log("Fetch response status:", response.status);
            if (!response.ok) { let errorText = response.statusText; try { errorText = await response.text(); } catch (e) { } throw new Error(`HTTP error ${response.status}: ${errorText}`); }
            const fetchedResult = await response.json();
            console.log("Data fetched:", fetchedResult);
            if (!fetchedResult || !Array.isArray(fetchedResult.orders)) { console.error("Fetched data unexpected format. Received:", fetchedResult); throw new Error("Unexpected data format."); }
            orderHistoryData = fetchedResult.orders;
            renderFiltered(orderHistoryData); // Render the full initial data set
        } catch (error) {
            console.error("Error fetching/processing data:", error);
            // --- Update Colspan ---
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Failed to load orders: ${error.message}</td></tr>`;
        }
    }

    // --- Filtering Logic ---
    function filterAndRenderTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;

        const filteredData = orderHistoryData.filter(order => {
            const statusBool = order.collected;
            const statusText = statusBool === true ? 'true' : (statusBool === false ? 'false' : '');

            // --- Updated Searchable Values (Removed Date) ---
            const searchableValues = [
                order.order_id,
                order.user_id,
                order.worker_id,
                order.location,
                // No Date
                statusText
            ];
            const orderString = JSON.stringify(searchableValues).toLowerCase();
            const matchesSearch = orderString.includes(searchTerm);

            // Filter logic (remains same)
            let matchesFilter = (filterValue === 'all') || (filterValue === 'true' && statusBool === true) || (filterValue === 'false' && statusBool !== true);

            return matchesSearch && matchesFilter;
        });
        renderFiltered(filteredData); // Render the filtered subset
    }

    // --- Inline Status Editing Function ---
    function makeStatusEditable(row) {
        // --- Updated Cell Indices ---
        const statusCell = row.cells[4]; // 5th cell is Status (Collected)
        const actionCell = row.cells[5]; // 6th cell is Actions
        if (!statusCell || !actionCell) { console.error("Could not find status or action cell"); return; }

        const currentText = statusCell.textContent.trim().toLowerCase();
        const currentValue = currentText === 'true';
        const orderId = row.dataset.orderId;

        row.dataset.originalStatusHTML = statusCell.innerHTML;
        row.dataset.originalActionsHTML = actionCell.innerHTML;

        const statusSelect = createBooleanStatusSelect(currentValue);
        statusCell.innerHTML = '';
        statusCell.appendChild(statusSelect);
        statusSelect.focus();

        actionCell.innerHTML = `
            <div class="action-buttons">
                <a href="#" class="action-btn btn-save" title="Save Status"><i class="fas fa-check"></i></a>
                <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
            </div>
        `;

        const saveBtn = actionCell.querySelector('.btn-save');
        const cancelBtn = actionCell.querySelector('.btn-cancel');

        // --- Save Button Handler ---
        saveBtn.addEventListener('click', function handleSave(e) {
            e.preventDefault(); e.stopPropagation();
            const newStatusString = statusSelect.value;
            if (newStatusString === "") { alert("Please select a status (True or False)."); return; }
            const newStatusBoolean = newStatusString === 'true';

            const payload = { order_id: orderId, collected: newStatusBoolean };
            console.log(`Attempting update for order ${orderId} with payload:`, payload);
            const apiUrl = `https://fmsbackend-iiitd.up.railway.app/admin/update-order-status`;

            saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none';
            if (cancelBtn) { cancelBtn.style.opacity = '0.5'; cancelBtn.style.pointerEvents = 'none'; }

            fetch(apiUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
                .then(res => { if (!res.ok) return res.text().then(text => { throw new Error(`API Error ${res.status}: ${text || res.statusText}`) }); return res.json(); })
                .then(data => {
                    // Success: Update UI
                    console.log('Status updated on backend:', data);
                    statusCell.textContent = newStatusBoolean ? 'True' : 'False'; // Update status text
                    actionCell.innerHTML = row.dataset.originalActionsHTML || ''; // Restore actions
                    row.classList.remove('editing');
                    // Update local data
                    const dataIndex = orderHistoryData.findIndex(order => String(order.order_id) === String(orderId));
                    if (dataIndex !== -1) { orderHistoryData[dataIndex].collected = newStatusBoolean; }
                })
                .catch(error => {
                    // Error: Revert UI
                    console.error('Failed to update status:', error);
                    alert(`Error updating status: ${error.message}`);
                    statusCell.innerHTML = row.dataset.originalStatusHTML || currentText;
                    actionCell.innerHTML = row.dataset.originalActionsHTML || '';
                    row.classList.remove('editing');
                })
                .finally(() => {
                    // Clean up
                    delete row.dataset.originalStatusHTML; delete row.dataset.originalActionsHTML;
                    // Re-enable buttons (optional, as innerHTML change removes old ones)
                });
        });

        // --- Cancel Button Handler ---
        cancelBtn.addEventListener('click', function handleCancel(e) {
            e.preventDefault(); e.stopPropagation();
            statusCell.innerHTML = row.dataset.originalStatusHTML;
            actionCell.innerHTML = row.dataset.originalActionsHTML;
            row.classList.remove('editing');
            delete row.dataset.originalStatusHTML; delete row.dataset.originalActionsHTML;
            console.log(`Edit cancelled for order ${orderId}`);
        }, { once: true });
    }

    // --- Event Delegation for Edit Button Clicks ---
    tableBody.addEventListener('click', function (e) {
        const editBtn = e.target.closest('.btn-edit');
        if (!editBtn) return;
        e.preventDefault();
        const row = editBtn.closest('tr');
        if (!row || !row.dataset.orderId || row.classList.contains('editing')) return;
        const currentlyEditing = tableBody.querySelector('tr.editing');
        if (currentlyEditing && currentlyEditing !== row) { alert('Please save or cancel the current edit first.'); return; }
        row.classList.add('editing');
        makeStatusEditable(row);
    });

    // --- Attach Filter/Search Listeners ---
    searchInput.addEventListener('input', filterAndRenderTable);
    filterSelect.addEventListener('change', filterAndRenderTable);

    // --- Initial Load ---
    renderTable();

    console.log("Order History script initialized.");
});