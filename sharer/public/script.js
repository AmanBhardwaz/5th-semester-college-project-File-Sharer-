const API_URL = 'http://localhost:3000/api';

// DOM Elements
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadProgress = document.getElementById('uploadProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const qrCode = document.getElementById('qrCode');
const fileName = document.getElementById('fileName');
const fileId = document.getElementById('fileId');
const downloadUrl = document.getElementById('downloadUrl');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const sendEmailBtn = document.getElementById('sendEmailBtn');
const recipientEmail = document.getElementById('recipientEmail');
const emailModal = document.getElementById('emailModal');
const closeEmailModal = document.getElementById('closeEmailModal');
const modalSendEmailBtn = document.getElementById('modalSendEmailBtn');
const modalRecipientEmail = document.getElementById('modalRecipientEmail');
const emailSendingProgress = document.getElementById('emailSendingProgress');
const filesList = document.getElementById('filesList');
const refreshBtn = document.getElementById('refreshBtn');
const toast = document.getElementById('toast');

// Event Listeners
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadBox.addEventListener('click', () => fileInput.click());
uploadAnotherBtn.addEventListener('click', resetUpload);
copyUrlBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadFile);
refreshBtn.addEventListener('click', loadFiles);
sendEmailBtn.addEventListener('click', sendEmailFromResult);
modalSendEmailBtn.addEventListener('click', sendEmailFromModal);
closeEmailModal.addEventListener('click', () => emailModal.style.display = 'none');

// Drag and drop
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

// Upload file
async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Show progress
    uploadProgress.style.display = 'block';
    uploadBox.style.display = 'none';
    resultSection.style.display = 'none';

    try {
        // Simulate progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                progressFill.style.width = progress + '%';
                progressText.textContent = `Uploading and encrypting... ${progress}%`;
            }
        }, 200);

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        clearInterval(progressInterval);

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();

        // Complete progress
        progressFill.style.width = '100%';
        progressText.textContent = 'Upload complete! 100%';

        // Show result
        setTimeout(() => {
            displayResult(data);
            loadFiles(); // Refresh file list
        }, 500);

    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
        resetUpload();
    }
}

// Display upload result
function displayResult(data) {
    uploadProgress.style.display = 'none';
    resultSection.style.display = 'block';

    qrCode.src = data.qrCode;
    fileName.textContent = data.originalName;
    fileId.textContent = data.fileId;
    downloadUrl.value = data.downloadUrl;
    recipientEmail.value = ''; // Clear email input

    // Store for download and email
    downloadBtn.dataset.fileId = data.fileId;
    sendEmailBtn.dataset.fileId = data.fileId;
}

// Reset upload
function resetUpload() {
    uploadBox.style.display = 'block';
    uploadProgress.style.display = 'none';
    resultSection.style.display = 'none';
    fileInput.value = '';
    recipientEmail.value = '';
    progressFill.style.width = '0%';
}

// Copy URL to clipboard
function copyToClipboard() {
    downloadUrl.select();
    document.execCommand('copy');
    showToast('Download URL copied to clipboard!', 'success');
}

// Download file
async function downloadFile() {
    const fileIdValue = downloadBtn.dataset.fileId;
    if (!fileIdValue) return;

    try {
        window.location.href = `${API_URL}/download/${fileIdValue}`;
        showToast('Downloading file...', 'success');
    } catch (error) {
        showToast('Download failed: ' + error.message, 'error');
    }
}

// Load files list
async function loadFiles() {
    try {
        filesList.innerHTML = '<p class="loading">Loading files...</p>';

        const response = await fetch(`${API_URL}/files`);
        if (!response.ok) {
            throw new Error('Failed to load files');
        }

        const data = await response.json();
        displayFilesList(data.files);

    } catch (error) {
        console.error('Load files error:', error);
        filesList.innerHTML = '<p class="loading">Failed to load files</p>';
    }
}

// Display files list
function displayFilesList(files) {
    if (files.length === 0) {
        filesList.innerHTML = '<p class="loading">No files uploaded yet</p>';
        return;
    }

    filesList.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="file-icon">📄</div>
            <div class="file-info">
                <h4>${file.originalName}</h4>
                <p><strong>File ID:</strong> ${file.fileId}</p>
                <p><strong>Size:</strong> ${formatBytes(file.size)}</p>
                <p><strong>Uploaded:</strong> ${new Date(file.uploadDate).toLocaleString()}</p>
            </div>
            <div class="file-actions">
                <button class="btn btn-email" onclick="showEmailModal('${file.fileId}')">📨 Email</button>
                <button class="btn btn-info" onclick="downloadFileById('${file.fileId}')">⬇️ Download</button>
                <button class="btn btn-success" onclick="viewQRCode('${file.fileId}')">📱 QR Code</button>
                <button class="btn btn-danger" onclick="deleteFile('${file.fileId}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Download file by ID
function downloadFileById(fileIdValue) {
    window.location.href = `${API_URL}/download/${fileIdValue}`;
    showToast('Downloading file...', 'success');
}

// Send email from result section
async function sendEmailFromResult() {
    const email = recipientEmail.value.trim();
    const fileIdValue = sendEmailBtn.dataset.fileId;

    if (!email) {
        showToast('Please enter recipient email address', 'error');
        recipientEmail.focus();
        return;
    }

    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        recipientEmail.focus();
        return;
    }

    await sendEmail(fileIdValue, email);
}

// Show email modal
let currentFileIdForEmail = null;
function showEmailModal(fileIdValue) {
    currentFileIdForEmail = fileIdValue;
    modalRecipientEmail.value = '';
    emailSendingProgress.style.display = 'none';
    emailModal.style.display = 'flex';
    modalRecipientEmail.focus();
}

// Send email from modal
async function sendEmailFromModal() {
    const email = modalRecipientEmail.value.trim();

    if (!email) {
        showToast('Please enter recipient email address', 'error');
        modalRecipientEmail.focus();
        return;
    }

    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        modalRecipientEmail.focus();
        return;
    }

    await sendEmail(currentFileIdForEmail, email);
}

// Send email function
async function sendEmail(fileIdValue, email) {
    if (!fileIdValue) {
        showToast('File ID not found', 'error');
        return;
    }

    try {
        // Show sending progress
        emailSendingProgress.style.display = 'block';
        sendEmailBtn.disabled = true;
        modalSendEmailBtn.disabled = true;

        const response = await fetch(`${API_URL}/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: fileIdValue,
                recipientEmail: email
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || 'Failed to send email');
        }

        showToast(`Email sent successfully to ${email}! ✅`, 'success');
        
        // Clear input and close modal
        recipientEmail.value = '';
        modalRecipientEmail.value = '';
        emailModal.style.display = 'none';

    } catch (error) {
        console.error('Email error:', error);
        showToast('Email sending failed: ' + error.message, 'error');
    } finally {
        emailSendingProgress.style.display = 'none';
        sendEmailBtn.disabled = false;
        modalSendEmailBtn.disabled = false;
    }
}

// Validate email format
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Download file by ID
function downloadFileById(fileIdValue) {
    window.location.href = `${API_URL}/download/${fileIdValue}`;
    showToast('Downloading file...', 'success');
}

// View QR code
async function viewQRCode(fileIdValue) {
    try {
        const response = await fetch(`${API_URL}/file/${fileIdValue}`);
        if (!response.ok) {
            throw new Error('Failed to load file info');
        }

        const data = await response.json();

        // Display in result section
        uploadBox.style.display = 'none';
        uploadProgress.style.display = 'none';
        resultSection.style.display = 'block';

        qrCode.src = data.qrCode;
        fileName.textContent = data.originalName;
        fileId.textContent = data.fileId;
        downloadUrl.value = `${API_URL}/download/${data.fileId}`;
        downloadBtn.dataset.fileId = data.fileId;
        sendEmailBtn.dataset.fileId = data.fileId;
        recipientEmail.value = ''; // Clear email input

        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
        showToast('Failed to load QR code: ' + error.message, 'error');
    }
}

// Delete file
async function deleteFile(fileIdValue) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/file/${fileIdValue}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        showToast('File deleted successfully!', 'success');
        loadFiles(); // Refresh list

    } catch (error) {
        showToast('Delete failed: ' + error.message, 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Load files on page load
window.addEventListener('DOMContentLoaded', () => {
    loadFiles();
    
    // Smooth scroll for hero CTA
    document.querySelector('.hero-cta')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('upload').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    });
    
    // Add entrance animations with stagger
    const sections = document.querySelectorAll('.glass-container, .files-section');
    sections.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        setTimeout(() => {
            el.style.transition = 'all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 300 + 800); // Delay after hero loads
    });
    
    // Add particle effect on hero (optional)
    createParticleEffect();
});

// Create subtle particle effect
function createParticleEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(26, 80, 255, 0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${5 + Math.random() * 10}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        hero.appendChild(particle);
    }
    
    // Add CSS animation if not exists
    if (!document.querySelector('#particle-animations')) {
        const style = document.createElement('style');
        style.id = 'particle-animations';
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.6; }
                25% { transform: translateY(-20px) translateX(10px); opacity: 1; }
                50% { transform: translateY(-40px) translateX(-10px); opacity: 0.8; }
                75% { transform: translateY(-20px) translateX(5px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}
