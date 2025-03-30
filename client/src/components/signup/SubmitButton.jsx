import React from "react";
import { ArrowRight } from "lucide-react";

const SubmitButton = ({ isLoading, label, icon }) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white ${
        isLoading ? "bg-indigo-800" : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 transform hover:scale-[1.02]`}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          <span className="flex items-center">
            {icon}
            {label}
          </span>
          <span className="absolute right-3 inset-y-0 flex items-center">
            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </span>
        </>
      )}
    </button>
  );
};

export default SubmitButton;