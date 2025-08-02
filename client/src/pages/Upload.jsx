// Upload.jsx
import React, { useState } from 'react';
import api from '../api';

const Upload = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [customName, setCustomName] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', 'public');
    if (customName.trim()) {
      formData.append('customName', customName.trim()); // ✅ Add custom name if provided
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
        onUpload(); // 🔄 Refetch file list
      } else {
        alert('Upload succeeded, but no file info returned.');
      }
    } catch (err) {
      console.error('Upload error:', err.response?.data || err.message);
      alert('Upload failed:'+ (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleUpload} className="flex flex-col gap-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
      <input
        type="text"
        placeholder="Custom file name (optional)"
        value={customName}
        onChange={(e) => setCustomName(e.target.value)}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
      >
        Upload
      </button>
    </form>
  );
};

export default Upload;
