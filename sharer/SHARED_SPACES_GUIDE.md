# 🌐 Shared Cloud Spaces - User Guide

## Welcome to Collaborative File Sharing!

Your SecureVault platform now includes **Shared Cloud Spaces** - a powerful feature that lets you create collaborative folders and share encrypted files with your team!

---

## ✨ What are Shared Spaces?

Shared Spaces are secure, collaborative folders where multiple users can:
- 📤 Upload encrypted files
- 📥 Download and decrypt files
- 👀 View all shared files
- 👥 Collaborate with team members
- 🔒 Maintain AES-256 encryption

---

## 🚀 Getting Started

### Step 1: Enter Your Information
When you first access the Shared Spaces section, you'll be prompted to enter:
- Your email address
- Your name (optional)

This information is stored locally and used to identify you as the owner/member of spaces.

### Step 2: Create Your First Space
1. Click the **"➕ Create Space"** button
2. Fill in the details:
   - **Space Name**: e.g., "Team Documents", "Project Files"
   - **Description**: Optional description
   - **Your Name**: Your display name
   - **Your Email**: Your email address
3. Click **"🚀 Create Space"**

🎉 Your shared space is now created!

---

## 📁 Managing Shared Spaces

### View Your Spaces
The Shared Spaces section has two tabs:
- **My Spaces**: Spaces you created (you're the owner)
- **Shared With Me**: Spaces where you're a member

Each space card shows:
- 📁 Space name and description
- 📄 Number of files
- 👥 Number of members
- 📅 Creation date
- 🏷️ Your role (Owner/Member)

---

## 👥 Inviting Team Members

### How to Invite:
1. Click on a space to open its details
2. Go to the **"👥 Members"** tab
3. Fill in the invitation form:
   - **Member Email**: Recipient's email
   - **Member Name**: Optional display name
   - **Permissions**: Choose access level:
     - **View Only**: Can only view files
     - **Download**: Can download files
     - **Upload**: Can upload new files
     - **Admin**: Full access (invite/remove members)
4. Click **"📧 Send Invitation"**

### What Happens Next:
-  The recipient receives a beautiful email invitation
- ✉️ Email contains:
  - Space details
  - Direct access link
  - List of features
  - Space ID for reference

---

## 📤 Uploading Files to Shared Spaces

### Method 1: Via Space Details
1. Open a space
2. Go to **"📤 Upload"** tab
3. Click **"Choose File"**
4. Select your file
5. File is automatically encrypted and uploaded

### Method 2: Drag & Drop
1. Open the upload tab
2. Drag files directly into the upload box
3. Files are instantly encrypted

### What's Included:
- ✅ AES-256 encryption
- ✅ QR code generation
- ✅ Uploader information
- ✅ Timestamp
- ✅ Access for all members

---

## 📥 Accessing Shared Files

### View Files:
1. Open any space
2. Go to **"📚 Files"** tab
3. See all encrypted files with:
   - File name
   - Size
   - Upload date
   - Uploader name

### Download Files:
- Click **"⬇️ Download"** to decrypt and download
- Click **"📱 QR"** to view/share QR code

### Security:
- All files remain encrypted in storage
- Decryption happens only during download
- Original file integrity maintained

---

## 🔐 Permissions System

### Permission Levels:

| Level | View Files | Download | Upload | Manage Members |
|-------|-----------|----------|---------|----------------|
| **View** | ✅ | ❌ | ❌ | ❌ |
| **Download** | ✅ | ✅ | ❌ | ❌ |
| **Upload** | ✅ | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Owner** | ✅ | ✅ | ✅ | ✅ |

### Notes:
- **Owner** cannot be removed
- Only **Owner** and **Admin** can invite members
- **Owner** can delete the entire space

---

## 👤 Managing Members

### View Members:
1. Open space details
2. Go to **"👥 Members"** tab
3. See all members with:
   - Name and email
   - Permission level
   - Status (active/pending)

### Remove Members:
- Click **"Remove"** next to any member (except owner)
- Confirm removal
- Member loses access immediately

### Change Permissions:
- Remove the member
- Re-invite with new permission level

---

## 📧 Email Invitations

### What Recipients Receive:

**Email Subject:** "You've been invited to a Shared Space!"

**Email Contains:**
- 🎉 Welcome message
- 📁 Space name and description
- 👤 Owner information
- 🆔 Space ID
- 🔗 Direct access link
- ✨ Feature list
- 🔒 Security information

**Design:**
- Professional dark theme
- Gradient styling
- Mobile-responsive
- Easy-to-click buttons

---

## 🗑️ Deleting Spaces

### How to Delete:
1. Go to space details
2. Click settings/delete option
3. Confirm deletion

### What Happens:
- ⚠️ **All files in the space are deleted**
- ⚠️ **All members lose access**
- ⚠️ **Action cannot be undone**
- ✅ Database cleanup automatic

---

## 🔍 Use Cases

### 1. **Team Collaboration**
```
Space: "Marketing Team"
Members: Marketing team members
Files: Campaigns, graphics, presentations
Permissions: Upload for all members
```

### 2. **Client Sharing**
```
Space: "Client Deliverables"
Members: Clients (view/download only)
Files: Project deliverables, reports
Permissions: View or Download only
```

### 3. **Department Storage**
```
Space: "HR Documents"
Members: HR staff (admin), Employees (view)
Files: Policies, forms, announcements
Permissions: Mixed levels
```

### 4. **Project Files**
```
Space: "Website Redesign"
Members: Developers, designers, managers
Files: Code, designs, documentation
Permissions: Upload for core team
```

---

## 🎯 Best Practices

### Security:
1. ✅ Use strong, unique space names
2. ✅ Grant minimum necessary permissions
3. ✅ Regularly review member list
4. ✅ Remove members who no longer need access
5. ✅ Use descriptive file names

### Organization:
1. 📁 Create separate spaces for different teams/projects
2. 📝 Add clear descriptions to spaces
3. 🏷️ Use consistent naming conventions
4. 🗂️ Organize files logically
5. 🧹 Clean up old files regularly

### Collaboration:
1. 👥 Invite only necessary members
2. 📧 Use proper email addresses
3. 💬 Add member names for clarity
4. 🔄 Keep spaces active and updated
5. 📣 Communicate space purposes

---

## 🐛 Troubleshooting

### Can't See Shared Spaces?
- Ensure you've entered your email
- Check browser console for errors
- Refresh the page
- Clear browser cache

### Invitation Email Not Received?
- Check spam/junk folder
- Verify email address is correct
- Wait a few minutes (email delivery can be slow)
- Resend invitation

### Can't Upload Files?
- Check your permission level (need "Upload" or higher)
- Verify file size (max 10MB)
- Ensure good internet connection
- Try refreshing the page

### Member Can't Access Space?
- Verify they clicked the invitation link
- Check their permission level
- Ensure they haven't been removed
- Ask them to check their email

---

## 📊 Technical Details

### Storage:
- Files: MongoDB database (encrypted)
- Encryption: AES-256-CBC
- Size Limit: 10MB per file
- Scalable: Unlimited spaces

### Security:
- Encryption: Yes (all files)
- Access Control: Role-based
- Authentication: Email-based (basic)
- HTTPS: Required for production

### Performance:
- Fast file encryption
- Efficient database queries
- Optimized for teams < 100 members
- Scales with MongoDB

---

## 🚀 Advanced Features (Coming Soon)

- 🔔 Real-time notifications
- 💬 Comments on files
- 📝 File versioning
- 🔍 Advanced search
- 📊 Usage analytics
- 🔗 Public sharing links
- ⏰ Expiring access
- 📱 Mobile app

---

## 💡 Tips & Tricks

1. **Quick Access**: Bookmark space URLs for faster access
2. **Email Templates**: Save invitation templates for consistency
3. **Bulk Uploads**: Upload multiple files one by one to a space
4. **QR Sharing**: Use QR codes for easy mobile access
5. **Regular Cleanup**: Delete old files to save storage

---

## 📞 Support

Need help?
- Check this guide first
- Review the main README.md
- Check browser console for errors
- Contact your system administrator

---

## 🎉 Enjoy Collaborative Secure File Sharing!

Your Shared Cloud Spaces feature is ready to use. Start creating spaces, inviting team members, and securely sharing encrypted files!

**Happy Collaborating! 🌟**
