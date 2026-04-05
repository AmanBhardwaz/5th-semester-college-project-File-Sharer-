require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const QRCode = require('qrcode');
const File = require('./models/File');
const SharedSpace = require('./models/SharedSpace');
const { encryptFile, decryptFile, generateFileId } = require('./utils/encryption');
const { sendFileLink, sendSpaceInvitation } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching for development
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Serve index.html for root route FIRST (before static middleware)
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes

// Upload and encrypt file
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique file ID
    const fileId = generateFileId();

    // Encrypt the file
    const { iv, encryptedData } = encryptFile(req.file.buffer);

    // Generate QR code with file ID and download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/download/${fileId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);

    // Save to database
    const newFile = new File({
      originalName: req.file.originalname,
      encryptedName: `encrypted_${fileId}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      encryptedData: encryptedData,
      iv: iv,
      fileId: fileId,
      qrCode: qrCodeDataUrl
    });

    await newFile.save();

    res.json({
      success: true,
      message: 'File uploaded and encrypted successfully',
      fileId: fileId,
      originalName: req.file.originalname,
      qrCode: qrCodeDataUrl,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

// Get file info
app.get('/api/file/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ fileId: req.params.fileId }).select('-encryptedData');
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadDate: file.uploadDate,
      qrCode: file.qrCode,
      fileId: file.fileId
    });

  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ error: 'Failed to retrieve file info' });
  }
});

// Download and decrypt file
app.get('/api/download/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ fileId: req.params.fileId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Decrypt the file
    const decryptedData = decryptFile(file.encryptedData, file.iv);

    // Send the decrypted file
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.send(decryptedData);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Get all files (metadata only)
app.get('/api/files', async (req, res) => {
  try {
    const files = await File.find().select('-encryptedData').sort({ uploadDate: -1 });
    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Delete file
app.delete('/api/file/:fileId', async (req, res) => {
  try {
    const result = await File.deleteOne({ fileId: req.params.fileId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Send file link via email
app.post('/api/send-email', async (req, res) => {
  try {
    const { fileId, recipientEmail } = req.body;

    if (!fileId || !recipientEmail) {
      return res.status(400).json({ error: 'File ID and recipient email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Get file info
    const file = await File.findOne({ fileId: fileId });
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${fileId}`;

    // Prepare file data for email
    const fileData = {
      originalName: file.originalName,
      size: file.size,
      fileId: file.fileId,
      uploadDate: file.uploadDate,
      qrCode: file.qrCode
    };

    // Send email
    const result = await sendFileLink(recipientEmail, fileData, downloadUrl);

    res.json({
      success: true,
      message: `File link sent successfully to ${recipientEmail}`,
      messageId: result.messageId
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

// ==================== SHARED SPACE ENDPOINTS ====================

// Create new shared space
app.post('/api/spaces/create', async (req, res) => {
  try {
    const { name, description, ownerEmail, ownerName } = req.body;

    if (!name || !ownerEmail) {
      return res.status(400).json({ error: 'Space name and owner email are required' });
    }

    // Generate unique space ID
    const spaceId = generateFileId();

    const newSpace = new SharedSpace({
      name,
      description: description || '',
      spaceId,
      owner: {
        email: ownerEmail,
        name: ownerName || 'Anonymous'
      },
      members: [],
      files: []
    });

    await newSpace.save();

    res.json({
      success: true,
      message: 'Shared space created successfully',
      space: {
        spaceId: newSpace.spaceId,
        name: newSpace.name,
        description: newSpace.description,
        owner: newSpace.owner,
        createdAt: newSpace.createdAt
      }
    });

  } catch (error) {
    console.error('Create space error:', error);
    res.status(500).json({ error: 'Failed to create shared space', details: error.message });
  }
});

// Get shared space details
app.get('/api/spaces/:spaceId', async (req, res) => {
  try {
    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId })
      .populate('files');
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    res.json({ space });

  } catch (error) {
    console.error('Get space error:', error);
    res.status(500).json({ error: 'Failed to retrieve shared space' });
  }
});

// Add member to shared space
app.post('/api/spaces/:spaceId/invite', async (req, res) => {
  try {
    const { memberEmail, memberName, permissions } = req.body;

    if (!memberEmail) {
      return res.status(400).json({ error: 'Member email is required' });
    }

    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId });
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    // Check if member already exists
    const existingMember = space.members.find(m => m.email === memberEmail);
    if (existingMember) {
      return res.status(400).json({ error: 'Member already has access to this space' });
    }

    // Add new member
    space.members.push({
      email: memberEmail,
      name: memberName || 'Guest',
      permissions: permissions || 'view',
      status: 'pending'
    });

    await space.save();

    // Send invitation email
    try {
      const inviteUrl = `${req.protocol}://${req.get('host')}/space/${space.spaceId}`;
      await sendSpaceInvitation(memberEmail, space, inviteUrl);
    } catch (emailError) {
      console.error('Email invitation error:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: `Invitation sent to ${memberEmail}`,
      space: {
        spaceId: space.spaceId,
        name: space.name,
        members: space.members
      }
    });

  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({ error: 'Failed to invite member', details: error.message });
  }
});

// Upload file to shared space
app.post('/api/spaces/:spaceId/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId });
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    // Generate unique file ID
    const fileId = generateFileId();

    // Encrypt the file
    const { iv, encryptedData } = encryptFile(req.file.buffer);

    // Generate QR code
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${fileId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl);

    // Save file to database
    const newFile = new File({
      originalName: req.file.originalname,
      encryptedName: `encrypted_${fileId}`,
      mimeType: req.file.mimetype,
      size: req.file.size,
      encryptedData: encryptedData,
      iv: iv,
      fileId: fileId,
      qrCode: qrCodeDataUrl,
      sharedSpace: space._id,
      uploadedBy: {
        email: req.body.uploaderEmail || 'anonymous',
        name: req.body.uploaderName || 'Anonymous'
      }
    });

    await newFile.save();

    // Add file to space
    space.files.push(newFile._id);
    await space.save();

    res.json({
      success: true,
      message: 'File uploaded to shared space successfully',
      fileId: fileId,
      originalName: req.file.originalname,
      spaceId: space.spaceId,
      qrCode: qrCodeDataUrl,
      downloadUrl: downloadUrl
    });

  } catch (error) {
    console.error('Space upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to shared space', details: error.message });
  }
});

// Get files in shared space
app.get('/api/spaces/:spaceId/files', async (req, res) => {
  try {
    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId })
      .populate('files');
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    // Return file metadata (without encrypted data)
    const files = space.files.map(file => ({
      fileId: file.fileId,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      uploadDate: file.uploadDate,
      uploadedBy: file.uploadedBy,
      qrCode: file.qrCode
    }));

    res.json({ files });

  } catch (error) {
    console.error('Get space files error:', error);
    res.status(500).json({ error: 'Failed to retrieve space files' });
  }
});

// Get all spaces for a user
app.get('/api/spaces/user/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;

    // Find spaces where user is owner or member
    const ownedSpaces = await SharedSpace.find({ 'owner.email': userEmail });
    const memberSpaces = await SharedSpace.find({ 'members.email': userEmail });

    res.json({
      ownedSpaces,
      memberSpaces,
      total: ownedSpaces.length + memberSpaces.length
    });

  } catch (error) {
    console.error('Get user spaces error:', error);
    res.status(500).json({ error: 'Failed to retrieve user spaces' });
  }
});

// Remove member from shared space
app.delete('/api/spaces/:spaceId/members/:email', async (req, res) => {
  try {
    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId });
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    // Remove member
    space.members = space.members.filter(m => m.email !== req.params.email);
    await space.save();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Delete shared space
app.delete('/api/spaces/:spaceId', async (req, res) => {
  try {
    const space = await SharedSpace.findOne({ spaceId: req.params.spaceId });
    
    if (!space) {
      return res.status(404).json({ error: 'Shared space not found' });
    }

    // Delete all files in the space
    await File.deleteMany({ _id: { $in: space.files } });

    // Delete the space
    await SharedSpace.deleteOne({ spaceId: req.params.spaceId });

    res.json({
      success: true,
      message: 'Shared space deleted successfully'
    });

  } catch (error) {
    console.error('Delete space error:', error);
    res.status(500).json({ error: 'Failed to delete shared space' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email service configured: ${process.env.EMAIL_SERVICE || 'Not configured'}`);
});
