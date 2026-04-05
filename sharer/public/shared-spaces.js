// Shared Spaces Functionality

const API_URL = 'http://localhost:3000/api';

// Current user email (in production, this would come from authentication)
let currentUserEmail = localStorage.getItem('userEmail') || '';
let currentUserName = localStorage.getItem('userName') || '';
let currentSpaceId = null;

// Initialize shared spaces
function initializeSharedSpaces() {
    // Event listeners
    document.getElementById('createSpaceBtn')?.addEventListener('click', showCreateSpaceModal);
    document.getElementById('closeCreateSpaceModal')?.addEventListener('click', () => {
        document.getElementById('createSpaceModal').style.display = 'none';
    });
    document.getElementById('createSpaceSubmitBtn')?.addEventListener('click', createSharedSpace);
    document.getElementById('closeSpaceDetailsModal')?.addEventListener('click', () => {
        document.getElementById('spaceDetailsModal').style.display = 'none';
    });
    document.getElementById('inviteMemberBtn')?.addEventListener('click', inviteMember);
    document.getElementById('spaceUploadBtn')?.addEventListener('click', () => {
        document.getElementById('spaceFileInput').click();
    });
    document.getElementById('spaceFileInput')?.addEventListener('change', uploadToSpace);

    // Tab switching
    document.querySelectorAll('.spaces-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchSpacesTab(btn.dataset.tab));
    });

    document.querySelectorAll('.space-details-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchDetailsTab(btn.dataset.tab));
    });

    // Load user's spaces
    if (currentUserEmail) {
        loadUserSpaces();
    } else {
        promptForUserInfo();
    }
}

// Prompt user for email (temporary - in production use proper auth)
function promptForUserInfo() {
    const email = prompt('Enter your email to use shared spaces:');
    if (email) {
        currentUserEmail = email;
        localStorage.setItem('userEmail', email);
        
        const name = prompt('Enter your name (optional):') || 'Anonymous';
        currentUserName = name;
        localStorage.setItem('userName', name);
        
        loadUserSpaces();
    }
}

// Switch spaces tab
function switchSpacesTab(tabName) {
    document.querySelectorAll('.spaces-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.spaces-container .tab-content').forEach(content => {
        if (content.id === tabName) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Switch details tab
function switchDetailsTab(tabName) {
    document.querySelectorAll('.space-details-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    document.querySelectorAll('.space-details-modal .tab-content').forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Show create space modal
function showCreateSpaceModal() {
    document.getElementById('ownerEmail').value = currentUserEmail;
    document.getElementById('ownerName').value = currentUserName;
    document.getElementById('createSpaceModal').style.display = 'flex';
}

// Create shared space
async function createSharedSpace() {
    const name = document.getElementById('spaceName').value.trim();
    const description = document.getElementById('spaceDescription').value.trim();
    const ownerEmail = document.getElementById('ownerEmail').value.trim();
    const ownerName = document.getElementById('ownerName').value.trim();

    if (!name || !ownerEmail) {
        showToast('Please enter space name and your email', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/spaces/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, ownerEmail, ownerName })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create space');
        }

        showToast(`Space "${name}" created successfully! 🎉`, 'success');
        document.getElementById('createSpaceModal').style.display = 'none';
        
        // Clear form
        document.getElementById('spaceName').value = '';
        document.getElementById('spaceDescription').value = '';
        
        // Reload spaces
        loadUserSpaces();

    } catch (error) {
        console.error('Create space error:', error);
        showToast('Failed to create space: ' + error.message, 'error');
    }
}

// Load user's spaces
async function loadUserSpaces() {
    if (!currentUserEmail) return;

    try {
        const response = await fetch(`${API_URL}/spaces/user/${encodeURIComponent(currentUserEmail)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to load spaces');
        }

        // Display owned spaces
        displaySpaces(data.ownedSpaces, 'mySpacesList', true);
        
        // Display shared spaces
        displaySpaces(data.memberSpaces, 'sharedSpacesList', false);

    } catch (error) {
        console.error('Load spaces error:', error);
        document.getElementById('mySpacesList').innerHTML = '<p class="loading">Failed to load spaces</p>';
        document.getElementById('sharedSpacesList').innerHTML = '<p class="loading">Failed to load spaces</p>';
    }
}

// Display spaces
function displaySpaces(spaces, containerId, isOwner) {
    const container = document.getElementById(containerId);

    if (!spaces || spaces.length === 0) {
        container.innerHTML = '<p class="loading">No spaces yet</p>';
        return;
    }

    container.innerHTML = spaces.map(space => `
        <div class="space-card" onclick="openSpaceDetails('${space.spaceId}')">
            <div class="space-card-header">
                <div>
                    <h3>📁 ${space.name}</h3>
                    <p>${space.description || 'No description'}</p>
                </div>
                ${isOwner ? '<span class="space-badge">Owner</span>' : '<span class="space-badge" style="background: var(--emerald-green);">Member</span>'}
            </div>
            <div class="space-stats">
                <div class="space-stat">
                    <span>📄</span>
                    <span>${space.files?.length || 0} files</span>
                </div>
                <div class="space-stat">
                    <span>👥</span>
                    <span>${space.members?.length || 0} members</span>
                </div>
                <div class="space-stat">
                    <span>📅</span>
                    <span>${new Date(space.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Open space details
async function openSpaceDetails(spaceId) {
    currentSpaceId = spaceId;
    
    try {
        const response = await fetch(`${API_URL}/spaces/${spaceId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to load space details');
        }

        const space = data.space;
        
        // Update modal title
        document.getElementById('spaceDetailsTitle').textContent = `📁 ${space.name}`;
        
        // Load space files
        loadSpaceFiles(spaceId);
        
        // Display members
        displayMembers(space);
        
        // Show modal
        document.getElementById('spaceDetailsModal').style.display = 'flex';

    } catch (error) {
        console.error('Load space details error:', error);
        showToast('Failed to load space details', 'error');
    }
}

// Load space files
async function loadSpaceFiles(spaceId) {
    try {
        const response = await fetch(`${API_URL}/spaces/${spaceId}/files`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to load files');
        }

        const container = document.getElementById('spaceFilesList');
        
        if (!data.files || data.files.length === 0) {
            container.innerHTML = '<p class="loading">No files in this space yet</p>';
            return;
        }

        container.innerHTML = data.files.map(file => `
            <div class="space-file-item">
                <div>
                    <strong>${file.originalName}</strong>
                    <p style="color: var(--mid-gray); font-size: 0.9em; margin-top: 5px;">
                        ${formatBytes(file.size)} • Uploaded ${new Date(file.uploadDate).toLocaleDateString()}
                        ${file.uploadedBy ? ` by ${file.uploadedBy.name}` : ''}
                    </p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-info" onclick="downloadFileById('${file.fileId}')">⬇️ Download</button>
                    <button class="btn btn-success" onclick="viewQRCode('${file.fileId}')">📱 QR</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load space files error:', error);
        document.getElementById('spaceFilesList').innerHTML = '<p class="loading">Failed to load files</p>';
    }
}

// Display members
function displayMembers(space) {
    const container = document.getElementById('membersList');
    
    const allMembers = [
        { ...space.owner, permissions: 'owner', status: 'active' },
        ...space.members
    ];

    if (allMembers.length === 0) {
        container.innerHTML = '<p class="loading">No members yet</p>';
        return;
    }

    container.innerHTML = allMembers.map(member => `
        <div class="member-item">
            <div class="member-info">
                <p style="font-weight: 600; color: var(--crisp-white);">${member.name || 'Anonymous'}</p>
                <p style="font-size: 0.9em;">${member.email}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="member-permission">${member.permissions}</span>
                ${member.permissions !== 'owner' ? `<button class="btn btn-danger" onclick="removeMember('${currentSpaceId}', '${member.email}')">Remove</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Invite member
async function inviteMember() {
    const email = document.getElementById('inviteMemberEmail').value.trim();
    const name = document.getElementById('inviteMemberName').value.trim();
    const permissions = document.getElementById('inviteMemberPermission').value;

    if (!email) {
        showToast('Please enter member email', 'error');
        return;
    }

    if (!currentSpaceId) {
        showToast('No space selected', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/spaces/${currentSpaceId}/invite`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ memberEmail: email, memberName: name, permissions })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to invite member');
        }

        showToast(`Invitation sent to ${email}! 📧`, 'success');
        
        // Clear form
        document.getElementById('inviteMemberEmail').value = '';
        document.getElementById('inviteMemberName').value = '';
        
        // Reload space details
        openSpaceDetails(currentSpaceId);

    } catch (error) {
        console.error('Invite member error:', error);
        showToast('Failed to invite member: ' + error.message, 'error');
    }
}

// Remove member
async function removeMember(spaceId, memberEmail) {
    if (!confirm(`Remove ${memberEmail} from this space?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/spaces/${spaceId}/members/${encodeURIComponent(memberEmail)}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error('Failed to remove member');
        }

        showToast('Member removed successfully', 'success');
        openSpaceDetails(spaceId);

    } catch (error) {
        console.error('Remove member error:', error);
        showToast('Failed to remove member', 'error');
    }
}

// Upload file to space
async function uploadToSpace(e) {
    const file = e.target.files[0];
    if (!file || !currentSpaceId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploaderEmail', currentUserEmail);
    formData.append('uploaderName', currentUserName);

    try {
        showToast('Uploading and encrypting...', 'success');

        const response = await fetch(`${API_URL}/spaces/${currentSpaceId}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Upload failed');
        }

        showToast(`File uploaded successfully! 🎉`, 'success');
        
        // Clear input
        document.getElementById('spaceFileInput').value = '';
        
        // Reload files
        loadSpaceFiles(currentSpaceId);
        
        // Switch to files tab
        switchDetailsTab('files');

    } catch (error) {
        console.error('Upload to space error:', error);
        showToast('Upload failed: ' + error.message, 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSharedSpaces();
});
