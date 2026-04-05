const mongoose = require('mongoose');

const sharedSpaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  spaceId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Anonymous'
    }
  },
  members: [{
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'Guest'
    },
    permissions: {
      type: String,
      enum: ['view', 'download', 'upload', 'admin'],
      default: 'view'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    }
  }],
  files: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File'
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowUploads: {
      type: Boolean,
      default: true
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
sharedSpaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SharedSpace', sharedSpaceSchema);
