import React from "react";
import { ChevronDown, ChevronUp, Clock, Star, Trash2 } from "lucide-react";

const SearchHistory = ({
  searchHistory = [],
  isExpanded,
  onToggle,
  activeTab,
  onTabChange,
  onDeleteSearchItem,
  isDeleting = false
}) => {
  // Filter history based on active tab
  const filteredHistory = activeTab === 'recent' 
    ? [...searchHistory].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [...searchHistory].filter(item => item.starred).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // No history to display
  if (searchHistory.length === 0) {
    return (
      <div className="mt-6 p-6 bg-gray-900 rounded-lg">
        <h3 className="text-xl font-medium mb-4">Search History</h3>
        <p className="text-gray-400 text-center py-8">No search history available</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-xl font-medium">Search History</h3>
        <button 
          onClick={onToggle}
          className="text-gray-400 hover:text-white p-1"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="px-4 border-b border-gray-800">
            <div className="flex">
              <button
                className={`py-2 px-4 ${activeTab === 'recent' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => onTabChange('recent')}
              >
                <span className="flex items-center gap-2">
                  <Clock size={16} />
                  Recent
                </span>
              </button>
              <button
                className={`py-2 px-4 ${activeTab === 'starred' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
                onClick={() => onTabChange('starred')}
              >
                <span className="flex items-center gap-2">
                  <Star size={16} />
                  Starred
                </span>
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                {activeTab === 'starred' ? 'No starred items' : 'No search history'}
              </p>
            ) : (
              <ul className="divide-y divide-gray-800">
                {filteredHistory.map((item) => (
                  <li key={item.id} className="p-4 hover:bg-gray-800 transition-colors">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium truncate">{item.query}</p>
                        <p className="text-gray-400 text-sm mt-1">{formatDate(item.timestamp)}</p>
                      </div>
                      <button
                        onClick={() => onDeleteSearchItem(item.id)}
                        disabled={isDeleting}
                        className={`text-gray-400 hover:text-red-500 p-1 transition-colors ${
                          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title="Delete search item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchHistory;