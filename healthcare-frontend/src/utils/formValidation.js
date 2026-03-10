// ================= EMAIL VALIDATION =================
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email format";
  return "";
};

// ================= PHONE VALIDATION =================
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  if (!phone) return "Phone number is required";
  if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
    return "Phone must be 10 digits";
  }
  return "";
};

// ================= PASSWORD VALIDATION =================
export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return "";
};

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "bg-gray-200" };
  if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (password.length < 10) return { level: 2, label: "Fair", color: "bg-yellow-500" };
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
    return { level: 3, label: "Strong", color: "bg-green-500" };
  }
  return { level: 2, label: "Fair", color: "bg-yellow-500" };
};

// ================= AADHAR VALIDATION =================
export const validateAadhar = (aadhar) => {
  const aadharRegex = /^[0-9]{12}$/;
  if (!aadhar) return "";
  if (!aadharRegex.test(aadhar.replace(/\s/g, ""))) {
    return "Aadhar must be 12 digits";
  }
  return "";
};

// ================= NAME VALIDATION =================
export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters";
  return "";
};

// ================= LICENSE VALIDATION =================
export const validateLicense = (license) => {
  if (!license) return "License number is required";
  if (license.trim().length < 5) return "License must be at least 5 characters";
  return "";
};

// ================= OTP VALIDATION =================
export const validateOTP = (otp) => {
  if (!otp) return "OTP is required";
  if (!/^\d{6}$/.test(otp)) return "OTP must be 6 digits";
  return "";
};

// ================= FORM VALIDATOR (Multi-field) =================
export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(formData.email)) {
    // Email is valid, no error
  } else {
    errors.email = validateEmail(formData.email);
  }

  if (!formData.password) {
    errors.password = "Password is required";
  }

  return errors;
};

export const validateRegisterForm = (formData, role) => {
  const errors = {};

  // Common fields
  errors.name = validateName(formData.name);
  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);

  // Role-specific fields
  if (role === "hospital") {
    if (!formData.hospitalName) {
      errors.hospitalName = "Hospital name is required";
    }
    errors.licenseNumber = validateLicense(formData.licenseNumber);
  } else if (role === "insurance") {
    if (!formData.insuranceCompany) {
      errors.insuranceCompany = "Company name is required";
    }
    errors.licenseNumber = validateLicense(formData.licenseNumber);
  }

  // Remove empty error entries
  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v !== "")
  );
};

export const validateAddPatientForm = (formData) => {
  const errors = {};

  errors.name = validateName(formData.name);
  errors.email = validateEmail(formData.email);
  errors.phone = validatePhone(formData.phone);
  errors.aadhar = validateAadhar(formData.aadhar);

  return Object.fromEntries(
    Object.entries(errors).filter(([, v]) => v !== "")
  );
};
