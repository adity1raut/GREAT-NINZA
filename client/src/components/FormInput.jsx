
import React from "react";
import { Eye, EyeOff } from "lucide-react";

const FormInput = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  showPassword,
  onTogglePassword,
  autoComplete,
}) => {
  return (
    <div className="group">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {name}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={18} className="text-gray-500 group-focus-within:text-blue-400" />
        </div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`appearance-none block w-full pl-10 pr-10 py-3 border ${
            error ? "border-red-500" : "border-gray-700"
          } bg-gray-800 rounded-lg placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
          placeholder={placeholder}
        />
        {(name === "Password" || name === "Confirm Password") && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={onTogglePassword}
              className="text-gray-500 hover:text-gray-300 focus:outline-none transition-colors duration-200"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400 flex items-center">
          <span className="mr-1">•</span> {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;