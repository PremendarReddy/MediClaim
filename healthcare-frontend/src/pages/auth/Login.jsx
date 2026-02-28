import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClaim } from "../../context/ClaimContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useClaim();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "hospital",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    // Simulated login
    login({
      name: formData.email.split("@")[0],
      role: formData.role,
    });

    // Redirect based on role
    if (formData.role === "hospital") {
      navigate("/hospital/dashboard");
    } else if (formData.role === "patient") {
      navigate("/patient/dashboard");
    } else {
      navigate("/insurance/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Login to MediClaim
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Role Selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="hospital">Hospital</option>
              <option value="patient">Patient</option>
              <option value="insurance">Insurance Company</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}