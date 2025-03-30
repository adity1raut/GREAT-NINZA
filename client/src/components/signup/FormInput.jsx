// src/components/signup/FormInput.js
import React from "react";

const FormInput = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  icon,
  showPasswordToggle,
  onTogglePasswordVisibility,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          id={name}
          className={`bg-gray-800 block w-full pl-10 pr-10 py-2 border ${
            error ? "border-red-500" : "border-gray-700"
          } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {showPasswordToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={onTogglePasswordVisibility}
              className="text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              {type === "password" ? "Show" : "Hide"}
            </button>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormInput;