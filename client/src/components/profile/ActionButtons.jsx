import React from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const ActionButtons = ({ onStartNewChat, onDeleteHistory, isDeleting = false }) => {
  return (
    <div className="mt-6 mb-8 flex flex-col sm:flex-row gap-4">
      <button
        onClick={onStartNewChat}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
      >
        <PlusCircle size={18} />
        <span>Start New Chat</span>
      </button>
      
      <button
        onClick={onDeleteHistory}
        disabled={isDeleting}
        className={`flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-colors ${
          isDeleting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <Trash2 size={18} className={isDeleting ? 'animate-pulse' : ''} />
        <span>{isDeleting ? 'Deleting...' : 'Delete All History'}</span>
      </button>
    </div>
  );
};

export default ActionButtons;