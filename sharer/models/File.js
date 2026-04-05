const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: true
  },
  encryptedName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  encryptedData: {
    type: Buffer,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  qrCode: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  // Shared Space Integration
  sharedSpace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SharedSpace',
    default: null
  },
  uploadedBy: {
    email: String,
    name: String
  }
});

module.exports = mongoose.model('File', fileSchema);
