import React from "react";
import FormInput from "../FormInput";
import { Mail, User } from "lucide-react";

const SignupStep1 = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-5">
      <FormInput
        id="name"
        name="Full Name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name"
        error={errors.name}
        icon={User}
      />

      <FormInput
        id="email"
        name="Email Address"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="youremail@example.com"
        error={errors.email}
        icon={Mail}
        autoComplete="email"
      />
    </div>
  );
};

export default SignupStep1;