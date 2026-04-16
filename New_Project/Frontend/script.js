// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Get DOM elements
const todoForm = document.getElementById('todoForm');
const tasksContainer = document.getElementById('tasksContainer');
const loadingIndicator = document.getElementById('loadingIndicator');

// Load tasks from backend on page load
let tasks = [];

// Fetch all tasks from backend
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/gettodos`);
        const result = await response.json();
        
        if (result.success) {
            tasks = result.data;
            displayTasks();
        } else {
            showAlert('Failed to load tasks', 'error');
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksContainer.innerHTML = '<p class="empty-message">⚠️ Failed to connect to server. Make sure backend is running.</p>';
    }
}

// Display tasks
function displayTasks() {
    if (tasks.length === 0) {
        tasksContainer.innerHTML = '<p class="empty-message">✨ No tasks yet. Add one above!</p>';
        return;
    }
    
    let html = '';
    tasks.forEach(task => {
        html += `
            <div class="task-card" data-id="${task._id}">
                <div class="task-title">
                    ${task.itemId ? `<span class="task-id-badge">ID: ${escapeHtml(task.itemId)}</span>` : ''}
                    ${task.itemUUID ? `<span class="task-uuid-badge">UUID: ${escapeHtml(task.itemUUID)}</span>` : ''}
                    ${task.itemHash ? `<span class="task-hash-badge">HASH: ${escapeHtml(task.itemHash)}</span>` : ''}
                    📌 ${escapeHtml(task.itemName)}
                </div>
                <div class="task-description">${escapeHtml(task.itemDescription || 'No description')}</div>
                <div class="task-actions">
                    <button onclick="deleteTask('${task._id}')" class="delete-btn">🗑️ Delete</button>
                </div>
                <small style="color: #999; font-size: 11px;">Added: ${new Date(task.createdAt).toLocaleString()}</small>
            </div>
        `;
    });
    tasksContainer.innerHTML = html;
}

// Generate a random Item ID if not provided
function generateItemId() {
    const prefix = 'TASK';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
}

// Generate UUID v4 format
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Generate SHA-256 hash (simplified for frontend)
async function generateHash(input) {
    // Convert string to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    
    // Generate SHA-256 hash using Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert buffer to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

// Generate hash from item name and timestamp
async function generateItemHash(itemName) {
    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 15);
    const inputString = `${itemName}-${timestamp}-${randomString}`;
    return await generateHash(inputString);
}

// Validate UUID format
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}

// Validate Hash format (hexadecimal, 64 chars for SHA-256, or 32 chars for MD5)
function isValidHash(hash) {
    // Accepts SHA-256 (64 hex chars) or MD5 (32 hex chars)
    const hashRegex = /^[a-f0-9]{32}$|^[a-f0-9]{64}$/i;
    return hashRegex.test(hash);
}

// Show alert message
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    const form = document.getElementById('todoForm');
    container.insertBefore(alertDiv, form.nextSibling);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Handle form submission - POST to /submittodoitem
todoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    let itemId = document.getElementById('itemId').value.trim();
    let itemUUID = document.getElementById('itemUUID').value.trim();
    let itemHash = document.getElementById('itemHash').value.trim();
    const itemName = document.getElementById('itemName').value.trim();
    const itemDescription = document.getElementById('itemDescription').value.trim();
    
    // Validate input
    if (itemName === '') {
        showAlert('Please enter an item name!', 'error');
        return;
    }
    
    // Auto-generate Item ID if not provided
    if (itemId === '') {
        itemId = generateItemId();
        showAlert(`Auto-generated Item ID: ${itemId}`, 'success');
    }
    
    // Auto-generate UUID if not provided
    if (itemUUID === '') {
        itemUUID = generateUUID();
        showAlert(`Auto-generated UUID: ${itemUUID}`, 'success');
    } else {
        // Validate UUID format if user provided one
        if (!isValidUUID(itemUUID)) {
            showAlert('Invalid UUID format! Please use format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', 'error');
            return;
        }
    }
    
    // Auto-generate Hash if not provided
    if (itemHash === '') {
        itemHash = await generateItemHash(itemName);
        showAlert(`Auto-generated SHA-256 Hash: ${itemHash.substring(0, 16)}...`, 'success');
    } else {
        // Validate Hash format if user provided one
        if (!isValidHash(itemHash)) {
            showAlert('Invalid Hash format! Use MD5 (32 chars) or SHA-256 (64 chars) hexadecimal', 'error');
            return;
        }
    }
    
    // Check for duplicate Item ID
    const existingTaskById = tasks.find(task => task.itemId === itemId);
    if (existingTaskById) {
        showAlert(`Item ID "${itemId}" already exists! Please use a unique ID.`, 'error');
        return;
    }
    
    // Check for duplicate UUID
    const existingTaskByUUID = tasks.find(task => task.itemUUID === itemUUID);
    if (existingTaskByUUID) {
        showAlert(`UUID "${itemUUID}" already exists! Please use a unique UUID.`, 'error');
        return;
    }
    
    // Check for duplicate Hash
    const existingTaskByHash = tasks.find(task => task.itemHash === itemHash);
    if (existingTaskByHash) {
        showAlert(`Hash "${itemHash.substring(0, 16)}..." already exists! Please use a unique hash.`, 'error');
        return;
    }
    
    // Disable submit button and show loading
    const submitBtn = todoForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    
    try {
        // Send POST request to backend route /submittodoitem
        const response = await fetch(`${API_BASE_URL}/submittodoitem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                itemId: itemId,
                itemUUID: itemUUID,
                itemHash: itemHash,
                itemName: itemName,
                itemDescription: itemDescription || ''
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success - clear form and refresh tasks
            showAlert(`✅ Task "${itemId}" (Hash: ${itemHash.substring(0, 16)}...) saved to database successfully!`, 'success');
            todoForm.reset();
            document.getElementById('itemId').focus();
            
            // Refresh the task list from database
            await fetchTasks();
        } else {
            // Error from server
            showAlert(result.message || 'Failed to save task', 'error');
        }
        
    } catch (error) {
        console.error('Error submitting todo:', error);
        showAlert('❌ Failed to connect to backend. Make sure server is running on port 5000', 'error');
    } finally {
        // Re-enable submit button and hide loading
        submitBtn.disabled = false;
        loadingIndicator.style.display = 'none';
    }
});

// Delete task from database
async function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task from the database?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/deletetodo/${id}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('Task deleted successfully!', 'success');
                await fetchTasks(); // Refresh the list
            } else {
                showAlert('Failed to delete task', 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            showAlert('Error connecting to server', 'error');
        }
    }
}

// Helper function to prevent XSS attacks
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load tasks when page loads
fetchTasks();

// Optional: Keyboard shortcut (Enter to submit)
document.getElementById('itemName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        todoForm.dispatchEvent(new Event('submit'));
    }
});

// Auto-focus on Item ID field when page loads
document.getElementById('itemId').focus();

// Real-time UUID validation
document.getElementById('itemUUID').addEventListener('blur', function() {
    const uuid = this.value.trim();
    if (uuid !== '' && !isValidUUID(uuid)) {
        showAlert('Invalid UUID format! Example: 550e8400-e29b-41d4-a716-446655440000', 'error');
        this.style.borderColor = '#ff6b6b';
    } else {
        this.style.borderColor = '#ddd';
    }
});

// Real-time Hash validation
document.getElementById('itemHash').addEventListener('blur', function() {
    const hash = this.value.trim();
    if (hash !== '' && !isValidHash(hash)) {
        showAlert('Invalid Hash format! Use MD5 (32 hex chars) or SHA-256 (64 hex chars)', 'error');
        this.style.borderColor = '#ff6b6b';
    } else {
        this.style.borderColor = '#ddd';
    }
});

// Real-time Item ID validation for duplicates
document.getElementById('itemId').addEventListener('blur', async function() {
    const itemId = this.value.trim();
    if (itemId !== '') {
        const existing = tasks.find(task => task.itemId === itemId);
        if (existing) {
            showAlert(`Item ID "${itemId}" already exists!`, 'error');
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '#ddd';
        }
    }
});

// Optional: Add copy hash button functionality
function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert(`${type} copied to clipboard!`, 'success');
    });
}