# Drop24 - File Sharing App

A full-stack file-sharing web application built with React, Express.js, MongoDB, and JWT authentication.

## Features

- 🔐 **Simple Authentication**: Username/password registration and login
- 👤 **Username Support**: Users can login with either username or email
- 📁 **File Upload**: Upload images, PDFs, documents, and other files
- 🔒 **Privacy Control**: Set files as public or private
- 👥 **User Management**: Users can only manage their own files
- 🗑️ **Auto-cleanup**: Files are automatically deleted after 24 hours
- 📱 **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with Vite
- JWT for authentication
- Axios for API requests
- Tailwind CSS for styling

### Backend
- Express.js with ES modules
- JWT authentication middleware
- MongoDB with Mongoose for data storage
- Cloudinary for file storage
- Multer for file upload handling
- bcryptjs for password hashing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Drop24
```

### 2. Frontend Setup

```bash
cd client
npm install
```

### 3. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Database Setup

The MongoDB schemas will be automatically created when you first use the app:

**User Model:**
- `username`: Unique username (3-20 characters)
- `email`: Unique email address
- `password`: Hashed password (min 6 characters)
- `createdAt`: Account creation timestamp

**File Model:**
- `originalname`: Original file name
- `url`: Cloudinary URL
- `public_id`: Cloudinary public ID
- `userId`: Reference to User model
- `visibility`: 'public' or 'private'
- `uploadedAt`: Upload timestamp
- `resource_type`: 'image' or 'raw'

### 5. Run the Application

#### Development Mode

Frontend:
```bash
cd client
npm run dev
```

Backend:
```bash
cd server
npm start
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (username or email)
- `GET /api/auth/me` - Get current user

### Authentication Required
- `POST /api/upload` - Upload a file
- `GET /api/my-files` - Get user's own files
- `DELETE /api/upload/:id` - Delete a file (owner only)
- `PATCH /api/upload/:id` - Update file visibility (owner only)

### Public
- `GET /api/files` - Get public files (and private files if authenticated)

## Authentication Features

- **Simple Registration**: Username, email, and password
- **Flexible Login**: Use username or email to sign in
- **JWT Tokens**: Secure authentication with 7-day token expiration
- **Password Hashing**: Secure password storage with bcrypt
- **Session Management**: Automatic token refresh and session persistence

## Security Features

- JWT token validation
- Password hashing with bcrypt
- User ownership verification for file operations
- Optional authentication for public file access
- Automatic token management

## File Management

- Files are stored in Cloudinary with organized folder structure
- Automatic cleanup after 24 hours using cron jobs
- Support for various file types (images, documents, archives)
- Custom file naming option
- Public/private visibility control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
