// src/components/signup/FileUpload.js
import React from "react";
import { Upload } from "lucide-react";

const FileUpload = ({ selectedFile, onChange }) => {
  return (
    <div>
      <label htmlFor="pdfUpload" className="block text-sm font-medium text-gray-300">
        Upload College Document (PDF)
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="mt-1 flex items-center">
          <label
            htmlFor="pdfUpload"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
          >
            <Upload size={16} className="mr-2" />
            {selectedFile ? selectedFile.name : "Select PDF to upload"}
          </label>
          <input
            id="pdfUpload"
            name="pdfUpload"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={onChange}
          />
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-400">
        You can upload PDFs from your mobile or laptop
      </p>
    </div>
  );
};

export default FileUpload;