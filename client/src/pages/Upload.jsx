// Upload.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const Upload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/zip', 'application/x-rar-compressed'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size must be less than 50MB');
      setFile(null);
      return;
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('File type not supported. Please upload images, documents, or archives.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to upload files');
      return;
    }
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);
    if (customName.trim()) {
      formData.append('customName', customName.trim());
    }

    try {
      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data && res.data.originalname) {
        alert('Upload successful: ' + res.data.originalname);
        setFile(null);
        setCustomName('');
        setVisibility('public');
        onUpload(); // 🔄 Refetch file list
      } else {
        setError('Upload succeeded, but no file info returned.');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please sign in to upload files</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select File
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.zip,.rar"
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 mt-1">
          Max size: 50MB. Supported: Images, PDFs, Documents, Archives
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Name (optional)
        </label>
        <input
          type="text"
          placeholder="Enter custom file name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Visibility
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="public">Public - Anyone can view</option>
          <option value="private">Private - Only you can view</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : 'Upload File'}
      </button>
    </form>
  );
};

export default Upload;
