import React from "react";
import FormInput from "../FormInput";
import { Mail } from "lucide-react";

const SignupStep2 = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-5">
      <FormInput
        id="otp"
        name="OTP"
        type="text"
        value={formData.otp}
        onChange={handleChange}
        placeholder="Enter the OTP sent to your email"
        error={errors.otp}
        icon={Mail}
      />
    </div>
  );
};

export default SignupStep2;