// FileList.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

const getDownloadUrl = (file) => {
  const [prefix, suffix] = file.url.split('/upload/');
  const [prefix2, suffix2] = file.url.split('/drop24/');
  return `${prefix}/upload/fl_attachment/drop24/${suffix2}`;
};

function FileList({ files, setFiles, isOwnFiles = false }) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');

  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this file?');
    if (!confirm) return;

    try {
      setDeleting(id);
      setError('');
      await api.delete(`/upload/${id}`);
      setFiles(files.filter(file => file._id !== id));
      alert('File deleted successfully');
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError('Failed to delete file: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  const handleVisibilityChange = async (fileId, newVisibility) => {
    try {
      setUpdating(fileId);
      setError('');
      const response = await api.patch(`/upload/${fileId}`, {
        visibility: newVisibility
      });
      
      // Update the file in the list
      setFiles(files.map(file => 
        file._id === fileId ? { ...file, visibility: newVisibility } : file
      ));
      
      alert('Visibility updated successfully');
    } catch (err) {
      console.error('Failed to update visibility:', err);
      setError('Failed to update visibility: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const canManageFile = (file) => {
    return user && file.userId === user.id;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {isOwnFiles ? '📁 My Files' : '📁 Public Files'}
      </h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {files.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {isOwnFiles ? 'You haven\'t uploaded any files yet.' : 'No files available.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file._id} className="bg-white rounded-lg shadow-md p-4 relative border">
              {/* Visibility Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  file.visibility === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {file.visibility}
                </span>
              </div>

              {/* File Name */}
              <a
                href={
                  file.url.includes('/raw/')
                    ? file.url + '?fl_attachment'
                    : file.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all font-medium"
              >
                {file.originalname}
              </a>

              {/* File Info */}
              <p className="text-xs text-gray-400 mt-2">
                Uploaded: {new Date(file.uploadedAt).toLocaleString()}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Download Button */}
                <a
                  href={getDownloadUrl(file)}
                  download={file.originalname}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded transition"
                >
                  Download
                </a>

                {/* Visibility Toggle (only for own files) */}
                {canManageFile(file) && (
                  <select
                    value={file.visibility}
                    onChange={(e) => handleVisibilityChange(file._id, e.target.value)}
                    disabled={updating === file._id || deleting === file._id}
                    className="text-xs px-2 py-1 border rounded bg-white disabled:opacity-50"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                )}

                {/* Delete Button (only for own files) */}
                {canManageFile(file) && (
                  <button
                    onClick={() => handleDelete(file._id)}
                    disabled={updating === file._id || deleting === file._id}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-xs px-3 py-1 rounded transition"
                  >
                    {deleting === file._id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>

              {/* Loading indicators */}
              {(updating === file._id || deleting === file._id) && (
                <div className="mt-2 text-xs text-gray-500">
                  {updating === file._id ? 'Updating...' : 'Deleting...'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileList;
