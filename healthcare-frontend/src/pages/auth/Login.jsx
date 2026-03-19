import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateLoginForm } from "../../utils/formValidation";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldCheck, User, Shield, X } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const { login, verify2FALogin } = useAuth(); // Using real API context

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (touched[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });

    const fieldErrors = validateLoginForm(formData);
    if (fieldErrors[name]) {
      setErrors({ ...errors, [name]: fieldErrors[name] });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const formErrors = validateLoginForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.requires2FA) {
       toast.info("Two-Factor Authentication required.");
       setTempToken(result.tempToken);
       setShow2FA(true);
       return;
    }

    if (result.success) {
      toast.success("Login successful!");
      const role = result.role.toLowerCase();
      if (role === "hospital") navigate("/hospital/dashboard");
      else if (role === "patient") navigate("/patient/dashboard");
      else if (role === "insurance") navigate("/insurance/dashboard");
      else if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
    } else {
      toast.error(result.error || "Failed to login. Please check credentials.");
    }
  };

  const handle2FASubmit = async () => {
     setLoading(true);
     const result = await verify2FALogin(tempToken, otpInput);
     setLoading(false);
     
     if (result.success) {
        setShow2FA(false);
        toast.success("Login successful!");
        const role = result.role.toLowerCase();
        if (role === "hospital") navigate("/hospital/dashboard");
        else if (role === "patient") navigate("/patient/dashboard");
        else if (role === "insurance") navigate("/insurance/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
        else navigate("/");
     } else {
        toast.error(result.error || "Invalid 2FA token.");
     }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-400/20 blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-indigo-400/20 blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-auto p-6"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-blue-900/5">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <Activity className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access your portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@company.com"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${touched.email && errors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200"
                    }`}
                />
              </div>
              {touched.email && errors.email && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</motion.p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 ${touched.password && errors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-slate-200"
                    }`}
                />
              </div>
              {touched.password && errors.password && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</motion.p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Create one now
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2FA Interception Modal */}
      <AnimatePresence>
        {show2FA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button onClick={() => setShow2FA(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                 <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Enter 2FA Code</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Open your Authenticator app and enter the 6-digit code.</p>
              </div>

              <div className="space-y-4">
                 <div>
                    <input 
                      type="text" 
                      placeholder="000000"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-2xl font-black py-4 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                 </div>
                 <button onClick={handle2FASubmit} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? "Verifying..." : "Sign In"}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
