import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateRegisterForm, getPasswordStrength } from "../../utils/formValidation";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, UserCircle, ShieldCheck, Mail, Key } from "lucide-react";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const { register, verifyRegistrationOTP } = useAuth(); // Using real API context

  const [role, setRole] = useState("hospital");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    hospitalName: "",
    insuranceCompany: "",
    licenseNumber: "",
    address: "",
    bankAccountName: "",
    bankAccountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

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
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const formErrors = validateRegisterForm(formData, role);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(allTouched);
      return;
    }

    setLoading(true);

    // Map frontend specific fields to match backend schema expectations
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role.toUpperCase(),
    };

    if (role === "hospital") {
      payload.hospitalDetails = {
        registrationNumber: formData.licenseNumber,
        address: formData.address || "Pending Address",
        contactPerson: formData.name,
        bankDetails: {
          accountName: formData.bankAccountName,
          accountNumber: formData.bankAccountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
        }
      };
    } else if (role === "insurance") {
      payload.insuranceDetails = {
        companyName: formData.insuranceCompany,
        licenseNumber: formData.licenseNumber,
        supportEmail: formData.email,
      };
    }

    const result = await register(payload);

    setLoading(false);

    if (result.success) {
      if (result.requiresOTP) {
        setOtpEmail(result.email || formData.email);
        setStep(2);
        toast.info("Registration initiated. Please check your email for the verification code.");
      } else {
        toast.success("Account created successfully!");
        if (role === "hospital") {
          navigate("/hospital/dashboard");
        } else {
          navigate("/insurance/dashboard");
        }
      }
    } else {
      toast.error(result.error || "Registration failed. Please check details.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    const result = await verifyRegistrationOTP(otpEmail, otp);
    setLoading(false);

    if (result.success) {
      toast.success("Account verified and created successfully!");
      if (result.role === "HOSPITAL") {
        navigate("/hospital/dashboard");
      } else {
        navigate("/insurance/dashboard");
      }
    } else {
      toast.error(result.error || "Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans py-12">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-300/20 blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-300/20 blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg mx-auto p-4 sm:p-6"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl shadow-slate-200/50">
          {step === 1 ? (
             <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Join MediClaim
            </h1>
            <p className="text-slate-500 text-sm">
              Create an institutional account to start managing claims
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {/* Custom Segmented Control for Role Selection */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex relative w-full mb-8 shadow-inner">
              <button
                type="button"
                onClick={() => { setRole("hospital"); setErrors({}); }}
                className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${role === "hospital" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {role === "hospital" && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]" />
                )}
                Hospital
              </button>

              <button
                type="button"
                onClick={() => { setRole("insurance"); setErrors({}); }}
                className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${role === "insurance" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {role === "insurance" && (
                  <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl shadow-sm z-[-1]" />
                )}
                Insurance
              </button>
            </div>

            {/* Warning block since patients cannot self register */}
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-6">
              <p className="text-sm text-blue-700 leading-relaxed font-medium">
                Note: <span className="text-blue-800 font-bold">Patients cannot self-register.</span> Patient accounts must be initiated securely by an authorized Hospital agent during the onboarding process.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name / Contact Person</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserCircle className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Jane Doe"
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${touched.name && errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"}`}
                  />
                </div>
                {touched.name && errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Official Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="admin@institution.com"
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${touched.email && errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"}`}
                  />
                </div>
                {touched.email && errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Create Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${touched.password && errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"}`}
                  />
                </div>
                {formData.password && (
                  <div className="mt-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                          className={`h-full rounded-full ${passwordStrength.color}`}
                        />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-12 text-right">
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
                {touched.password && errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* Dynamic Institutional Fields */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={role}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:col-span-2 space-y-5 overflow-hidden"
                >
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      {role === "hospital" ? "Hospital Name" : "Company Name"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name={role === "hospital" ? "hospitalName" : "insuranceCompany"}
                        value={role === "hospital" ? formData.hospitalName : formData.insuranceCompany}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={role === "hospital" ? "Apollo Hospitals" : "HealthGuard Corp"}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${(role === "hospital" && touched.hospitalName && errors.hospitalName) ||
                            (role === "insurance" && touched.insuranceCompany && errors.insuranceCompany)
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                            : "border-slate-200"
                          }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Official License ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <ShieldCheck className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={role === "hospital" ? "HOS-12345-67890" : "INS-98765-43210"}
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${touched.licenseNumber && errors.licenseNumber ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-slate-200"}`}
                      />
                    </div>
                  </div>

                  {role === "hospital" && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hospital Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Street Address, City, State ZIP"
                          rows="2"
                          className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        ></textarea>
                      </div>
                      
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                        <div className="sm:col-span-2">
                          <h4 className="text-sm font-bold text-slate-800">Bank Details</h4>
                        </div>
                        <div>
                          <input
                            type="text"
                            name="bankAccountName"
                            value={formData.bankAccountName}
                            onChange={handleChange}
                            placeholder="Account Holder Name"
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={handleChange}
                            placeholder="Account Number"
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            placeholder="Bank Name (e.g. HDFC Bank)"
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleChange}
                            placeholder="IFSC Code"
                            className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Complete Registration"
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                type="button"
              >
                Sign in here
              </button>
            </p>
          </div>
          </>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="text-center mb-8">
                  <div className="mx-auto bg-blue-100 text-blue-600 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Verify Email
                  </h1>
                  <p className="text-slate-500 text-sm">
                    We sent a 6-digit code to <span className="font-semibold text-slate-800">{otpEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">Enter Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="block w-full py-4 text-center text-3xl tracking-[0.5em] font-mono border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="------"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </motion.button>
                </form>
                
                <div className="mt-8 text-center">
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                    Back to Registration
                  </button>
                </div>
              </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
