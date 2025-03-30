document.addEventListener('DOMContentLoaded', function () {
    // Get all service list items
    const serviceItems = document.querySelectorAll('.service-list li');

    serviceItems.forEach(item => {
        const editBtn = item.querySelector('.service-edit-btn');
        const deleteBtn = item.querySelector('.service-delete-btn');
        const serviceInfo = item.querySelector('.service-info span');

        if (editBtn) {
            editBtn.addEventListener('click', function (e) {
                e.preventDefault();

                // If already editing, return
                if (item.classList.contains('editing')) return;

                // Store original text
                const originalText = serviceInfo.textContent;

                // Create input field
                const input = document.createElement('input');
                input.type = 'text';
                input.value = originalText;
                input.className = 'edit-input';

                // Create save button
                const saveBtn = document.createElement('a');
                saveBtn.innerHTML = '<i class="fas fa-save"></i>';
                saveBtn.className = 'service-action-btn save-btn';
                saveBtn.href = '#';

                // Create cancel button
                const cancelBtn = document.createElement('a');
                cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
                cancelBtn.className = 'service-action-btn cancel-btn';
                cancelBtn.href = '#';

                // Add editing class to item
                item.classList.add('editing');

                // Replace text with input
                serviceInfo.textContent = '';
                serviceInfo.appendChild(input);

                // Replace edit and delete buttons with save and cancel
                const actionsDiv = item.querySelector('.service-actions');
                actionsDiv.innerHTML = '';
                actionsDiv.appendChild(saveBtn);
                actionsDiv.appendChild(cancelBtn);

                // Focus input
                input.focus();

                // Save functionality
                saveBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const newValue = input.value.trim();
                    if (newValue && newValue !== originalText) {
                        serviceInfo.textContent = newValue;
                        console.log(`Service name updated from "${originalText}" to "${newValue}"`);
                        // Here you would typically make an API call to update the service name
                    } else {
                        serviceInfo.textContent = originalText;
                    }
                    resetEditState();
                });

                // Cancel functionality
                cancelBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    serviceInfo.textContent = originalText;
                    resetEditState();
                });

                // Reset edit state
                function resetEditState() {
                    item.classList.remove('editing');
                    actionsDiv.innerHTML = `
                        <a href="#" class="service-action-btn service-edit-btn" title="Edit ${originalText}">
                            <i class="fas fa-pencil-alt"></i>
                        </a>
                        <a href="#" class="service-action-btn service-delete-btn" title="Delete ${originalText}">
                            <i class="fas fa-trash-alt"></i>
                        </a>
                    `;
                    // Reattach event listeners
                    attachEventListeners(item);
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const serviceName = serviceInfo.textContent;

                if (confirm(`Are you sure you want to delete ${serviceName}?`)) {
                    item.classList.add('fade-out');
                    setTimeout(() => {
                        item.remove();
                        console.log(`Service "${serviceName}" deleted`);
                        // Here you would typically make an API call to delete the service
                    }, 300);
                }
            });
        }
    });
});

// Function to attach event listeners to a service item
function attachEventListeners(item) {
    const editBtn = item.querySelector('.service-edit-btn');
    const deleteBtn = item.querySelector('.service-delete-btn');
    const serviceInfo = item.querySelector('.service-info span');

    if (editBtn) {
        editBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Trigger click event to maintain functionality
            editBtn.click();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const serviceName = serviceInfo.textContent;

            if (confirm(`Are you sure you want to delete ${serviceName}?`)) {
                item.classList.add('fade-out');
                setTimeout(() => {
                    item.remove();
                    console.log(`Service "${serviceName}" deleted`);
                    // Here you would typically make an API call to delete the service
                }, 300);
            }
        });
    }
} 