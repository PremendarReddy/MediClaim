import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { validateAddPatientForm, validateOTP } from "../../utils/formValidation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function AddPatient() {
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPatient, setNewPatient] = useState(null);
  const [insuranceCompanies, setInsuranceCompanies] = useState([]);

  useEffect(() => {
    const fetchInsuranceCompanies = async () => {
      try {
        const res = await api.get('/hospitals/insurance-companies');
        if (res.data.success) {
          setInsuranceCompanies(res.data.data);
        }
      } catch (error) {
        toast.error("Failed to fetch insurance providers");
      }
    };
    fetchInsuranceCompanies();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    aadhar: "",
    gender: "",
    address: "",
    otp: "",
    insuranceProvider: "",
    policyNumber: "",
    memberId: "",
    insuranceDocument: null,
  });

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));

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

  const handleSendOTP = async (e) => {
    e.preventDefault();

    const formErrors = validateAddPatientForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setTouched({ name: true, email: true, phone: true });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/hospitals/patients/send-otp', { email: formData.email, phone: formData.phone });
      if (response.data.success) {
        toast.success(`Verification code sent to ${formData.email} and ${formData.phone}.`);
        setStep(2);
        setOtpError("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const otpValidationError = validateOTP(formData.otp);
    if (otpValidationError) {
      setOtpError(otpValidationError);
      return;
    }

    setLoading(true);

    try {
      
      let insuranceDetailsPayload = undefined;
      
      if (formData.insuranceProvider) {
         const selectedProvider = insuranceCompanies.find(c => c._id === formData.insuranceProvider);
         insuranceDetailsPayload = {
            providerId: formData.insuranceProvider,
            providerName: selectedProvider ? selectedProvider.name : "",
            policyNumber: formData.policyNumber,
            memberId: formData.memberId,
         };
      }

      const patientDetailsPayload = {
        phoneNumber: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        aadhar: formData.aadhar,
        ...(insuranceDetailsPayload && { insuranceDetails: insuranceDetailsPayload })
      };

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('otp', formData.otp);
      submitData.append('patientDetails', JSON.stringify(patientDetailsPayload));

      if (formData.insuranceDocument) {
          submitData.append('insuranceDocument', formData.insuranceDocument);
      }

      // Execute the real API call to the backend
      const response = await api.post('/hospitals/patients', submitData);

      if (response.data.success) {
        setStatus("Approved");
        setNewPatient(response.data.data);
        toast.success(`Patient ${formData.name} registered successfully`);
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create patient account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patient Onboarding</h1>
          <p className="text-slate-500 mt-1">Register new patients securely to the MediClaim network</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-3xl relative overflow-hidden">
        {/* Progress Indicator */}
        <div className="mb-10 relative z-10">
          <div className="flex justify-between mb-4">
            {["Enter Details", "Verify OTP", "Confirm"].map((stepName, idx) => (
              <div
                key={idx}
                className={`flex-1 text-center text-sm transition-all duration-300 ${idx < step - 1
                  ? "text-emerald-600 font-bold"
                  : idx === step - 1
                    ? "text-blue-600 font-bold"
                    : "text-slate-400 font-medium"
                  }`}
              >
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 border-2 transition-colors ${idx < step - 1 ? "bg-emerald-50 border-emerald-500 text-emerald-600" : idx === step - 1 ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  {idx < step - 1 ? '✓' : idx + 1}
                </div>
                {stepName}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 absolute top-4 -z-10 left-0 right-0">
            <motion.div
              className="bg-blue-600 h-1.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1 — PATIENT DETAILS FORM */}
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSendOTP}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2">
                Patient Demographics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="John Doe"
                    className={`w-full border rounded-xl py-2.5 px-3 transition-colors ${touched.name && errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="john@example.com"
                    className={`w-full border rounded-xl py-2.5 px-3 transition-colors ${touched.email && errors.email
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    className={`w-full border rounded-xl py-2.5 px-3 transition-colors ${touched.phone && errors.phone
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2`}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Government ID (Aadhar)
                  </label>
                  <input
                    type="text"
                    name="aadhar"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="XXXX XXXX XXXX"
                    className={`w-full border rounded-xl py-2.5 px-3 transition-colors ${touched.aadhar && errors.aadhar
                      ? "border-red-300 focus:ring-red-500"
                      : "border-slate-200 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2`}
                  />
                  {touched.aadhar && errors.aadhar && (
                    <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.aadhar}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Residential Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full residential address"
                  className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3 resize-none"
                  rows="3"
                ></textarea>
              </div>

              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mt-8">
                Insurance Details <span className="text-slate-400 font-medium text-sm">(Optional)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Insurance Provider
                  </label>
                  <select
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3 bg-white"
                  >
                    <option value="">No Insurance / Cash Patient</option>
                    {insuranceCompanies.map(company => (
                       <option key={company._id} value={company._id}>{company.name}</option>
                    ))}
                  </select>
                </div>

                {formData.insuranceProvider && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Policy Number
                      </label>
                      <input
                        type="text"
                        name="policyNumber"
                        value={formData.policyNumber}
                        onChange={handleInputChange}
                        placeholder="POL-12345678"
                        className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Member ID
                      </label>
                      <input
                        type="text"
                        name="memberId"
                        value={formData.memberId}
                        onChange={handleInputChange}
                        placeholder="MEM-87654321"
                        className="w-full border border-slate-200 focus:ring-blue-500 focus:outline-none focus:ring-2 rounded-xl py-2.5 px-3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Attach Insurance Card / Policy
                      </label>
                      <input
                        type="file"
                        name="insuranceDocument"
                        onChange={handleInputChange}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-xl p-1"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <div className="text-blue-500 text-xl">ℹ️</div>
                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                  An OTP will be generated and dispatched securely to the patient's registered email and mobile number to verify the onboarding process.
                </p>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed font-bold transition-all"
                >
                  {loading ? "Initializing..." : "Proceed & Send OTP"}
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 2 — OTP VERIFICATION */}
          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6 max-w-md mx-auto py-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  ✉️
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Authorization</h2>
                <p className="text-slate-500 text-sm">
                  We've sent a secure one-time passcode to <br />
                  <strong className="text-slate-800">{formData.email}</strong> and <strong className="text-slate-800">{formData.phone}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-center">
                  Enter 6-digit Code
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="1 2 3 4 5 6"
                  maxLength="6"
                  className={`w-full border-2 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[0.5em] transition bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${otpError ? "border-red-300 text-red-600" : "border-slate-200 text-slate-800"
                    }`}
                />
                {otpError && (
                  <p className="text-red-500 text-sm mt-3 text-center font-medium bg-red-50 py-2 rounded-lg">{otpError}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtpError("");
                  }}
                  className="w-1/3 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl hover:bg-slate-50 transition font-bold shadow-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed font-bold shadow-lg transition"
                >
                  {loading ? "Authenticating..." : "Authorize Record"}
                </button>
              </div>

              <div className="text-center mt-6 text-sm">
                <span className="text-slate-500">Didn't receive the email? </span>
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-bold"
                  onClick={handleSendOTP}
                >
                  Click to resend
                </button>
              </div>
            </motion.form>
          )}

          {/* STEP 3 — SUCCESS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-8 py-8"
            >
              <div>
                <div className="inline-flex item-center justify-center w-24 h-24 bg-emerald-100/50 text-emerald-500 rounded-full mb-6 relative">
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full animate-ping opacity-20"></div>
                  <p className="text-5xl mt-5">✓</p>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                  Verification Complete
                </h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                  The medical profile for {formData.name} has been successfully secured in the system.
                </p>
                {newPatient?.tmpPassword && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto mt-4 text-center shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Patient Login Credentials</p>
                    <p className="text-sm text-slate-700 mb-1">Email: <strong>{newPatient.email}</strong></p>
                    <p className="text-sm text-slate-700">Password: <span className="font-mono bg-white px-2 py-1 rounded border border-amber-200 font-bold ml-1">{newPatient.tmpPassword}</span></p>
                    <p className="text-xs text-amber-700 mt-2 font-medium">Please securely provide these to the patient</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-w-md mx-auto text-left shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 border-b border-slate-200 pb-2">Record Overview</h3>
                <div className="grid grid-cols-3 gap-y-4 text-sm">
                  <div className="text-slate-500 font-medium">Patient API ID</div>
                  <div className="col-span-2 text-slate-900 font-mono truncate">{newPatient?._id || "NEW-RECORD"}</div>

                  <div className="text-slate-500 font-medium">Primary Name</div>
                  <div className="col-span-2 text-slate-900 font-bold">{formData.name}</div>

                  <div className="text-slate-500 font-medium">Contact Auth</div>
                  <div className="col-span-2 text-slate-900">{formData.email}</div>

                  <div className="text-slate-500 font-medium">System Status</div>
                  <div className="col-span-2">
                    <StatusBadge status={status || "Approved"} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 max-w-md mx-auto pt-4">
                <button
                  onClick={() => window.location.href = "/hospital/patients"}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 px-5 py-3.5 rounded-xl hover:bg-slate-50 font-bold transition shadow-sm"
                >
                  View Directory
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      name: "", email: "", phone: "", dateOfBirth: "", aadhar: "", gender: "", address: "", otp: "", insuranceProvider: "", policyNumber: "", memberId: "", insuranceDocument: null
                    });
                    setStatus(null);
                    setNewPatient(null);
                  }}
                  className="flex-1 bg-blue-600 text-white px-5 py-3.5 rounded-xl hover:bg-blue-700 font-bold transition shadow-md shadow-blue-500/20"
                >
                  Add Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
