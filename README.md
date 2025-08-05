# Drop24 - File Sharing App with Supabase

A full-stack file-sharing web application built with React, Express.js, MongoDB, and Supabase for authentication and file management.

## Features

- 🔐 **User Authentication**: Email/password signup and login with Supabase
- 📁 **File Upload**: Upload images, PDFs, documents, and other files
- 🔒 **Privacy Control**: Set files as public or private
- 👥 **User Management**: Users can only manage their own files
- 🗑️ **Auto-cleanup**: Files are automatically deleted after 24 hours
- 📱 **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 with Vite
- Supabase Client for authentication
- Axios for API requests
- Tailwind CSS for styling

### Backend
- Express.js with ES modules
- Supabase for authentication middleware
- MongoDB with Mongoose for file metadata
- Cloudinary for file storage
- Multer for file upload handling

## Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Supabase project
- Cloudinary account

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Drop24
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** to get your project URL and keys
3. **Important**: You need TWO different keys:
   - **Anon Key** (public): For frontend/client operations
   - **Service Role Key** (private): For backend/server operations
4. Enable Email authentication in **Authentication > Settings**

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
# Use the "anon" key (public key) for client-side operations
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
# Use the "service_role" key (private key) for server-side operations
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 5. Database Setup

The MongoDB schema will be automatically created when you first upload a file. The File model includes:

- `originalname`: Original file name
- `url`: Cloudinary URL
- `public_id`: Cloudinary public ID
- `userId`: Supabase user ID
- `visibility`: 'public' or 'private'
- `uploadedAt`: Upload timestamp
- `resource_type`: 'image' or 'raw'

### 6. Run the Application

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

### Authentication Required
- `POST /api/upload` - Upload a file
- `GET /api/my-files` - Get user's own files
- `DELETE /api/upload/:id` - Delete a file (owner only)
- `PATCH /api/upload/:id` - Update file visibility (owner only)

### Public
- `GET /api/files` - Get public files (and private files if authenticated)

## Security Features

- JWT token validation using Supabase
- User ownership verification for file operations
- Optional authentication for public file access
- Automatic token refresh and session management

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
