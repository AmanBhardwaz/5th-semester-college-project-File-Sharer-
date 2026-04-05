# Email Setup Guide

## 📧 How to Configure Email Sending

To enable the email sharing feature, you need to configure your email credentials in the `.env` file.

### For Gmail Users (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security
   - Enable 2-Step Verification

2. **Generate App Password**
   - In Google Account, go to Security
   - Under "Signing in to Google", select "2-Step Verification"
   - Scroll down and click "App passwords"
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env File**
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_FROM=Secure File Upload <your-email@gmail.com>
   ```

### For Outlook/Hotmail Users

1. **Update .env File**
   ```env
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-password
   EMAIL_FROM=Secure File Upload <your-email@outlook.com>
   ```

### For Yahoo Users

1. **Generate App Password**
   - Go to Yahoo Account Security
   - Generate app password for "Other App"
   
2. **Update .env File**
   ```env
   EMAIL_SERVICE=yahoo
   EMAIL_USER=your-email@yahoo.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=Secure File Upload <your-email@yahoo.com>
   ```

### Testing Email Feature

1. **Restart the server** after updating `.env`:
   ```bash
   npm start
   ```

2. **Upload a file** on the website

3. **Enter recipient email** and click "Send Email"

4. **Check inbox** - The recipient should receive a beautiful HTML email with:
   - File details
   - Download link
   - QR code
   - Security information

### Email Template Features

The email includes:
- ✅ Professional gradient header
- 📄 Complete file information (name, size, ID, date)
- 🔽 Direct download button
- 📱 Embedded QR code for mobile scanning
- 🔒 Security notice about AES-256 encryption
- 💻 Copy-paste download URL
- 📧 Clean, responsive HTML design

### Troubleshooting

**Error: "Authentication failed"**
- Double-check email and password in `.env`
- For Gmail, ensure you're using App Password, not regular password
- Make sure 2FA is enabled for Gmail

**Error: "Connection timeout"**
- Check your internet connection
- Some networks block email ports (587, 465)
- Try using a different email service

**Error: "Invalid email address"**
- The system validates email format
- Ensure recipient email is properly formatted

**Email not received**
- Check spam/junk folder
- Verify email service configuration
- Check server logs for errors

### Security Notes

- ⚠️ Never commit your `.env` file to version control
- 🔑 Use app-specific passwords instead of main passwords
- 🔒 Keep your credentials secure
- 📧 Emails contain download links - share responsibly

### Custom SMTP Configuration

If you want to use a custom SMTP server, edit `utils/emailService.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

---

**Need help?** Check the main README.md for more information.
