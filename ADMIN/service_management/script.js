// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const itemText = e.target.textContent.trim();

            // Handle navigation
            switch (itemText) {
                case 'Dashboard':
                    window.location.href = '../admin_home/index.html';
                    break;
                // Add other navigation cases as needed
            }
        });
    });

    const addServiceBtn = document.getElementById('add-service-btn');
    const newServiceNameInput = document.getElementById('new-service-name');
    const serviceList = document.querySelector('.service-list');

    if (!addServiceBtn || !newServiceNameInput || !serviceList) {
        console.error('Service management elements not found!');
        return; // Stop if essential elements are missing
    }

    // Function to create a new service list item
    function createServiceListItem(serviceName) {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="service-info">
                <span>${serviceName}</span>
            </div>
            <div class="service-actions">
                <a href="#" class="action-btn service-edit-btn" title="Edit Service"><i class="fas fa-pencil-alt"></i></a>
                <a href="#" class="action-btn service-delete-btn" title="Delete Service"><i class="fas fa-trash"></i></a>
            </div>
        `;
        return li;
    }

    // Function to add a new service
    function addService() {
        const serviceName = newServiceNameInput.value.trim();
        if (!serviceName) {
            alert('Please enter a service name.');
            return;
        }
        const newItem = createServiceListItem(serviceName);
        serviceList.appendChild(newItem);
        newServiceNameInput.value = ''; // Clear input
        // Here you would typically also make an API call to save the service
        console.log(`Service added: ${serviceName}`);
    }

    // Function to make a service name editable
    function makeServiceEditable(listItem) {
        const serviceInfoDiv = listItem.querySelector('.service-info');
        const serviceSpan = serviceInfoDiv.querySelector('span');
        const currentName = serviceSpan.textContent;

        // Store original HTML
        listItem.dataset.originalInfoHTML = serviceInfoDiv.innerHTML;
        listItem.dataset.originalActionsHTML = listItem.querySelector('.service-actions').innerHTML;

        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentName;
        input.className = 'edit-input'; // Use a common class for styling

        serviceInfoDiv.innerHTML = '';
        serviceInfoDiv.appendChild(input);
        input.focus();

        // Change action buttons to Save/Cancel
        const actionsDiv = listItem.querySelector('.service-actions');
        actionsDiv.innerHTML = `
            <a href="#" class="action-btn btn-save" title="Save Changes"><i class="fas fa-check"></i></a>
            <a href="#" class="action-btn btn-cancel" title="Cancel Edit"><i class="fas fa-times"></i></a>
        `;

        // Add temporary listeners for Save/Cancel
        const saveBtn = actionsDiv.querySelector('.btn-save');
        const cancelBtn = actionsDiv.querySelector('.btn-cancel');

        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const newName = input.value.trim();
            if (!newName) {
                alert('Service name cannot be empty.');
                return;
            }
            // Update the span
            serviceInfoDiv.innerHTML = `<span>${newName}</span>`;
            // Restore original buttons
            actionsDiv.innerHTML = listItem.dataset.originalActionsHTML;
            listItem.classList.remove('editing');
            delete listItem.dataset.originalInfoHTML;
            delete listItem.dataset.originalActionsHTML;
            // API call to save the updated name
            console.log(`Service updated: ${currentName} -> ${newName}`);
        }, { once: true }); // Ensure listener is removed after firing

        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Restore original HTML
            serviceInfoDiv.innerHTML = listItem.dataset.originalInfoHTML;
            actionsDiv.innerHTML = listItem.dataset.originalActionsHTML;
            listItem.classList.remove('editing');
            delete listItem.dataset.originalInfoHTML;
            delete listItem.dataset.originalActionsHTML;
            console.log(`Edit cancelled for: ${currentName}`);
        }, { once: true });
    }

    // Event listener for the Add Service button
    addServiceBtn.addEventListener('click', addService);

    // Event listener for the service list (handles Edit/Delete clicks using delegation)
    serviceList.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.action-btn');
        if (!targetButton) return; // Exit if click wasn't on an action button

        e.preventDefault();
        const listItem = targetButton.closest('li');

        // Ignore clicks on save/cancel, handled by temporary listeners
        if (targetButton.classList.contains('btn-save') || targetButton.classList.contains('btn-cancel')) {
            return;
        }

        if (targetButton.classList.contains('service-edit-btn')) {
            // Prevent editing multiple items at once
            if (serviceList.querySelector('li.editing')) {
                alert('Please save or cancel the current edit first.');
                return;
            }
            listItem.classList.add('editing');
            makeServiceEditable(listItem);
        } else if (targetButton.classList.contains('service-delete-btn')) {
            const serviceName = listItem.querySelector('.service-info span').textContent;
            if (confirm(`Are you sure you want to delete the service "${serviceName}"?`)) {
                // API call to delete the service
                console.log(`Deleting service: ${serviceName}`);
                listItem.style.opacity = '0';
                setTimeout(() => listItem.remove(), 300); // Remove after fade
            }
        }
    });

    // --- Load Initial Services (Placeholder) ---
    // In a real app, you would fetch these from a server/API
    const initialServices = ["Plumbing", "Electrical", "Cleaning", "Carpentry"];
    initialServices.forEach(serviceName => {
        const newItem = createServiceListItem(serviceName);
        serviceList.appendChild(newItem);
    });
});

// Service area management
function updateServiceArea(employeeId) {
    const selectedArea = document.querySelector(`select[data-employee="${employeeId}"]`).value;
    console.log('Updated service area for employee', employeeId, 'to:', selectedArea);
    // Add your update logic here
}

function handleEdit(employeeId) {
    console.log('Editing service area for employee:', employeeId);
    // Add your edit logic here
} 