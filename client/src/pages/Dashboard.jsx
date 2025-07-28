// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import api from '../api';
import Upload from './Upload';
import FileList from './FileList';

const Dashboard = () => {
  const [files, setFiles] = useState([]);

  // Initial fetch
  const fetchFiles = async () => {
    try {
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <Upload onUpload={fetchFiles} />
      <FileList files={files} setFiles={setFiles} />
    </div>
  );
};

export default Dashboard;
