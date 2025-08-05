// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import Upload from './Upload';
import FileList from './FileList';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [myFiles, setMyFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('public');
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();

  // Fetch public files (available to all users)
  const fetchPublicFiles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching public files:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's own files (requires authentication)
  const fetchMyFiles = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const res = await api.get('/my-files');
      setMyFiles(res.data);
    } catch (err) {
      console.error('Error fetching user files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicFiles();
    if (user) {
      fetchMyFiles();
    }
  }, [user]);

  const handleUpload = () => {
    fetchPublicFiles();
    if (user) {
      fetchMyFiles();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setMyFiles([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Drop24</h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    Welcome, {user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-600">
                  Please sign in to upload files
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Upload onUpload={handleUpload} />
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('public')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'public'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Public Files
                  </button>
                  {user && (
                    <button
                      onClick={() => setActiveTab('private')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'private'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      My Files ({myFiles.length})
                    </button>
                  )}
                </nav>
              </div>

              {/* File List */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading files...</p>
                  </div>
                ) : (
                  <FileList 
                    files={activeTab === 'public' ? files : myFiles} 
                    setFiles={activeTab === 'public' ? setFiles : setMyFiles}
                    isOwnFiles={activeTab === 'private'}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
