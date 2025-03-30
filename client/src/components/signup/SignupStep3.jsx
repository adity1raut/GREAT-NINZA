import React from "react";
import FormInput from "../FormInput";
import { Lock } from "lucide-react";

const SignupStep3 = ({ 
  formData, 
  handleChange, 
  errors, 
  showPassword, 
  showConfirmPassword, 
  setShowPassword, 
  setShowConfirmPassword 
}) => {
  return (
    <div className="space-y-5">
      <FormInput
        id="password"
        name="Password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        placeholder="Create a secure password"
        error={errors.password}
        icon={Lock}
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
        autoComplete="new-password"
      />

      <FormInput
        id="confirmPassword"
        name="Confirm Password"
        type={showConfirmPassword ? "text" : "password"}
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        icon={Lock}
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
    </div>
  );
};

export default SignupStep3;