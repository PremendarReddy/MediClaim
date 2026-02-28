import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClaim } from "../../context/ClaimContext";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useClaim();

  const [role, setRole] = useState("hospital");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hospitalName: "",
    insuranceCompany: "",
    licenseNumber: "",
    policyNumber: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Simulated registration → auto login
    login({
      name: formData.name,
      role: role,
    });

    if (role === "hospital") {
      navigate("/hospital/dashboard");
    } else if (role === "patient") {
      navigate("/patient/dashboard");
    } else {
      navigate("/insurance/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-[420px]">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="hospital">Hospital</option>
              <option value="patient">Patient</option>
              <option value="insurance">Insurance Company</option>
            </select>
          </div>

          {/* Common Fields */}
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Role Specific Fields */}

          {role === "hospital" && (
            <>
              <input
                type="text"
                name="hospitalName"
                placeholder="Hospital Name"
                required
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="licenseNumber"
                placeholder="Hospital License Number"
                required
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </>
          )}

          {role === "patient" && (
            <>
              <input
                type="text"
                name="policyNumber"
                placeholder="Insurance Policy Number (optional)"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </>
          )}

          {role === "insurance" && (
            <>
              <input
                type="text"
                name="insuranceCompany"
                placeholder="Company Name"
                required
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
              <input
                type="text"
                name="licenseNumber"
                placeholder="Insurance License ID"
                required
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              />
            </>
          )}

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}