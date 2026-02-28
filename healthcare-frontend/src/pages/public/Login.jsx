import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <button
          onClick={() => navigate("/hospital/dashboard")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
        >
          Login as Hospital
        </button>

        <button
          onClick={() => navigate("/patient/dashboard")}
          className="w-full bg-green-600 text-white py-2 rounded-lg"
        >
          Login as Patient
        </button>
        <button
          onClick={() => navigate("/insurance/dashboard")}
          className="w-full bg-purple-600 text-white py-2 rounded-lg"
        >
          Login as Insurance
        </button>
      </div>
    </div>
  );
}