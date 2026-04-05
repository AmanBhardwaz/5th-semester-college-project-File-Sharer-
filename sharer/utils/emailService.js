const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send file link via email
async function sendFileLink(recipientEmail, fileData, downloadUrl) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: '🔐 Secure File Shared with You',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              border-radius: 15px;
              color: white;
            }
            .content {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 10px;
              margin-top: 20px;
            }
            .file-info {
              background: #f8f9ff;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #667eea;
            }
            .file-info p {
              margin: 8px 0;
            }
            .download-btn {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .qr-section {
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              background: #f8f9ff;
              border-radius: 8px;
            }
            .qr-section img {
              max-width: 200px;
              border: 3px solid #667eea;
              border-radius: 8px;
              padding: 10px;
              background: white;
            }
            .security-note {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #999;
              margin-top: 30px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0;">🔐 Secure File Shared</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone has shared an encrypted file with you</p>
          </div>

          <div class="content">
            <h2>📄 File Details</h2>
            
            <div class="file-info">
              <p><strong>📎 File Name:</strong> ${fileData.originalName}</p>
              <p><strong>📊 File Size:</strong> ${formatBytes(fileData.size)}</p>
              <p><strong>🔑 File ID:</strong> ${fileData.fileId}</p>
              <p><strong>📅 Uploaded:</strong> ${new Date(fileData.uploadDate).toLocaleString()}</p>
            </div>

            <h3>🔽 Download Options</h3>
            
            <p>Click the button below to download and decrypt the file:</p>
            <a href="${downloadUrl}" class="download-btn">⬇️ Download File</a>

            <div class="qr-section">
              <h4>Or Scan QR Code</h4>
              <img src="${fileData.qrCode}" alt="QR Code" />
              <p style="margin-top: 10px; color: #666;">Scan with your mobile device</p>
            </div>

            <div class="security-note">
              <strong>🔒 Security Information:</strong><br>
              This file has been encrypted using AES-256 encryption. The file will be automatically decrypted when you download it. Your data is secure!
            </div>

            <p><strong>Download URL:</strong><br>
            <code style="background: #f5f5f5; padding: 8px; border-radius: 4px; display: inline-block; word-break: break-all;">${downloadUrl}</code></p>

            <div class="footer">
              <p>This is an automated email from Secure File Upload System</p>
              <p>If you did not expect this email, please ignore it.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Format bytes helper
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = {
  sendFileLink,
  sendSpaceInvitation
};

// Send shared space invitation
async function sendSpaceInvitation(recipientEmail, spaceData, spaceUrl) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: 'You have been invited to a Shared Space!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #000000;
            }
            .container {
              background: linear-gradient(135deg, #1A50FF 0%, #D600FF 100%);
              padding: 30px;
              border-radius: 15px;
              color: white;
            }
            .content {
              background: #0A0A0A;
              color: #FFFFFF;
              padding: 30px;
              border-radius: 10px;
              margin-top: 20px;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .space-info {
              background: rgba(26, 80, 255, 0.1);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #1A50FF;
            }
            .space-info h3 {
              color: #1A50FF;
              margin-bottom: 10px;
            }
            .space-info p {
              margin: 8px 0;
              color: #CCCCCC;
            }
            .access-btn {
              display: inline-block;
              background: linear-gradient(135deg, #1A50FF 0%, #D600FF 100%);
              color: white;
              padding: 15px 40px;
              text-decoration: none;
              border-radius: 50px;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 10px 30px rgba(26, 80, 255, 0.4);
            }
            .features {
              background: rgba(0, 204, 153, 0.1);
              border-left: 4px solid #00CC99;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .features ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .features li {
              color: #CCCCCC;
              margin: 5px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              margin-top: 30px;
              font-size: 0.9em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 style="margin: 0;">🎉 Shared Space Invitation</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You've been invited to collaborate!</p>
          </div>

          <div class="content">
            <h2 style="color: #FFFFFF;">Welcome to SecureVault!</h2>
            
            <p>You've been invited to join a shared space where you can securely upload, view, and manage encrypted files with your team.</p>

            <div class="space-info">
              <h3>📁 Space Details</h3>
              <p><strong>Space Name:</strong> ${spaceData.name}</p>
              <p><strong>Description:</strong> ${spaceData.description || 'No description provided'}</p>
              <p><strong>Owner:</strong> ${spaceData.owner.name} (${spaceData.owner.email})</p>
              <p><strong>Space ID:</strong> ${spaceData.spaceId}</p>
            </div>

            <div style="text-align: center;">
              <a href="${spaceUrl}" class="access-btn">🚀 Access Shared Space</a>
            </div>

            <div class="features">
              <strong style="color: #00CC99;">✨ What you can do:</strong>
              <ul>
                <li>📤 Upload encrypted files securely</li>
                <li>📥 Download and decrypt shared files</li>
                <li>👀 View all files in the shared space</li>
                <li>🔒 All files protected with AES-256 encryption</li>
                <li>📱 Generate QR codes for easy sharing</li>
              </ul>
            </div>

            <p style="margin-top: 25px; color: #CCCCCC;">
              <strong>Space URL:</strong><br>
              <code style="background: rgba(255, 255, 255, 0.05); padding: 8px; border-radius: 4px; display: inline-block; word-break: break-all; color: #1A50FF;">${spaceUrl}</code>
            </p>

            <div class="footer">
              <p>This is an automated invitation from SecureVault</p>
              <p>If you did not expect this invitation, please ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };

  } catch (error) {
    console.error('Space invitation email error:', error);
    throw new Error(`Failed to send invitation: ${error.message}`);
  }
}
