import React, { useState, useRef } from 'react';
import { Send, Loader2, FileUp, FileText, FileX } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Base URL for API calls
const BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_URL}/upload-pdf`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);
      const data = await res.json();
      toast.success(`PDF uploaded: ${data.message || 'Success'}`);
      setUploadStatus(data.message || data.error);
    } catch (error) {
      toast.error(`Error uploading PDF: ${error.message}`);
      setUploadStatus(`Error uploading PDF: ${error.message}`);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!query) return;

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `query=${encodeURIComponent(query)}`,
      });
      if (!res.ok) throw new Error(`Chat failed with status: ${res.status}`);
      const data = await res.json();
      setChatResponse(data.response || data.error);
      toast.success('Message sent successfully');
      setQuery('');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setChatResponse(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${BASE_URL}/delete-all-data`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Delete failed with status: ${res.status}`);
      const data = await res.json();
      toast.info('All data cleared');
      setDeleteStatus(data.message || data.error);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      setDeleteStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <ToastContainer 
        position="top-right" 
        theme="dark" 
        autoClose={3000} 
      />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold">PDF Upload and Chat</h2>
        </div>

        {/* Upload PDF */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".pdf" 
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                setFile(selectedFile);
              }}
              className="hidden"
              id="pdf-upload"
            />
            <label 
              htmlFor="pdf-upload" 
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
            >
              <FileUp className="mr-2" /> Upload PDF
            </label>
            
            {file && (
              <div className="flex items-center bg-green-600 text-white px-3 py-2 rounded-lg">
                <FileText className="mr-2" />
                <span className="mr-2 truncate max-w-[100px]">
                  {file.name}
                </span>
                <button 
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="hover:text-red-300"
                >
                  <FileX size={16} />
                </button>
              </div>
            )}

            <button
              onClick={handleUpload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Confirm Upload
            </button>
          </div>
          {uploadStatus && <p className="mt-2 text-sm text-gray-400">{uploadStatus}</p>}
        </div>

        {/* Chat */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex space-x-4 mb-4">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
            <button
              onClick={handleChat}
              disabled={isLoading || !query.trim()}
              className={`p-3 rounded-lg ${
                isLoading || !query.trim()
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          {chatResponse && (
            <div className="bg-gray-900 p-3 rounded-lg text-gray-300">
              {chatResponse}
            </div>
          )}
        </div>

        {/* Delete All Data */}
        <div className="p-6">
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition"
          >
            Delete All Data
          </button>
          {deleteStatus && <p className="mt-2 text-sm text-gray-400">{deleteStatus}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;


