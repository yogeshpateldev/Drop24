// FileList.jsx
import React from 'react';
import api from '../api';

const getDownloadUrl = (file) => {
  const [prefix, suffix] = file.url.split('/upload/');
  const filename = encodeURIComponent(file.originalname); // Make sure spaces etc are safe
  return `${prefix}/upload/fl_attachment:${filename}/${suffix}`;
};

function FileList({ files, setFiles }) {
  const handleDelete = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this file?');
    if (!confirm) return;

    try {
      await api.delete(`/upload/${id}`);
      setFiles(files.filter(file => file._id !== id)); // 🗑️ update list
      alert('File deleted');
    } catch (err) {
      console.error('Failed to delete file:', err);
      alert('Failed to delete file');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">📁 Public Files</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length > 0 ? (
          files.filter(file => file.url).map((file) => (
            <div key={file._id} className="bg-white rounded-lg shadow-md p-4 relative">
              <a
                href={
                  file.url.includes('/raw/')
                    ? file.url + '?fl_attachment' // already raw → add download param
                    : file.url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {file.originalname}
              </a>

              <p className="text-sm text-gray-500 mt-1">
                Visibility: {file.visibility}
              </p>
              <p className="text-xs text-gray-400">
                Uploaded: {new Date(file.uploadedAt).toLocaleString()}
              </p>

              <div className="flex justify-between items-center mt-2">
                {/* ✅ Download Button */}

                <a
                  href={getDownloadUrl(file)}
                  download={file.originalname}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1 rounded"
                >
                  Download
                </a>


                {/* 🗑️ Delete Button */}
                <button
                  onClick={() => handleDelete(file._id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No files available.</p>
        )}
      </div>
    </div>
  );
}

export default FileList;
