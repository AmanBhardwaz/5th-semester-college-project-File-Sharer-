# 🔐 Secure File Upload with Encryption & QR Code

A full-stack web application that allows users to upload files with automatic **AES-256 encryption** and **QR code generation** for easy sharing and downloading.

## ✨ Features

- **File Upload**: Drag & drop or click to upload files
- **AES-256 Encryption**: All files are encrypted before storage
- **QR Code Generation**: Auto-generate QR codes for encrypted files
- **Email Sharing**: Send download links directly to recipient's email
- **Secure Download**: Decrypt files automatically on download
- **File Management**: View, download, and delete uploaded files
- **Modern UI**: Beautiful, responsive interface
- **MongoDB Storage**: Encrypted files stored in database

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- Multer (File upload)
- Crypto (AES-256 encryption)
- QRCode (QR generation)

### Frontend
- HTML5
- CSS3 (Modern gradients & animations)
- Vanilla JavaScript (No frameworks)

## 📋 Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:

**Windows:**
```bash
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

Or run MongoDB manually:
```bash
mongod
```

### 3. Configure Environment Variables

The `.env` file is already created with default settings:
- PORT: 3000
- MONGODB_URI: mongodb://localhost:27017/file-encryption-db
- ENCRYPTION_KEY: (32 characters for AES-256)

**For Email Functionality (Optional):**

To enable email sending, update the `.env` file with your email credentials:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Secure File Upload <your-email@gmail.com>
```

**Getting Gmail App Password:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Use this password in the `EMAIL_PASSWORD` field

**Alternative Email Services:**
- For Outlook: `EMAIL_SERVICE=outlook`
- For Yahoo: `EMAIL_SERVICE=yahoo`
- For custom SMTP: Modify `utils/emailService.js`

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 5. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 How to Use

1. **Upload a File**:
   - Click "Choose File" or drag & drop a file
   - File gets encrypted automatically
   - QR code is generated

2. **View QR Code**:
   - Scan the QR code with your phone
   - Share the QR code or download URL

3. **Share via Email**:
   - Enter recipient's email address
   - Click "Send Email" button
   - Recipient gets a beautiful email with:
     - File details
     - Download link
     - QR code
     - Security information

4. **Download File**:
   - Click "Download" button
   - File is decrypted automatically
   - Original file is restored

4. **Manage Files**:
   - View all uploaded files
   - Download any file
   - Delete files you no longer need

## 🔒 Security Features

- **AES-256 Encryption**: Military-grade encryption
- **Unique IV**: Each file has a unique initialization vector
- **Secure Storage**: Encrypted data stored in MongoDB
- **No Plain Text**: Original files never stored unencrypted

## 📁 Project Structure

```
project/
├── models/
│   └── File.js           # MongoDB schema
├── utils/
│   └── encryption.js     # Encryption/decryption functions
├── public/
│   ├── index.html        # Frontend HTML
│   ├── styles.css        # Styling
│   └── script.js         # Frontend JavaScript
├── server.js             # Express server
├── .env                  # Environment variables
├── package.json          # Dependencies
└── README.md             # This file
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and encrypt file |
| GET | `/api/file/:fileId` | Get file metadata |
| GET | `/api/download/:fileId` | Download and decrypt file |
| POST | `/api/send-email` | Send file link via email |
| GET | `/api/files` | Get all files list |
| DELETE | `/api/file/:fileId` | Delete file |

## 🎨 Screenshots

The application features:
- Modern gradient background (Purple theme)
- Drag & drop file upload
- Real-time upload progress
- QR code display
- Responsive file cards
- Toast notifications

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running
- Check if the connection string in `.env` is correct

**Email Configuration Error:**
- Check your email credentials in `.env`
- Ensure 2FA is enabled and app password is generated
- For Gmail, enable "Less secure app access" if using regular password (not recommended)
- Check if your email service is supported

**Port Already in Use:**
- Change PORT in `.env` file
- Or kill the process using port 3000

**File Upload Fails:**
- Check file size (max 10MB)
- Ensure proper permissions

## 📝 License

ISC

## 👨‍💻 Author

Built with ❤️ using Node.js and MongoDB

---

**Happy Encrypting! 🔐**
