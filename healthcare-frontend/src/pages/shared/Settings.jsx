import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useClaim } from "../../context/ClaimContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { User, Mail, Phone, Lock, Bell, Moon, Shield, LogOut, CheckCircle, Settings as SettingsIcon, X, Eye, EyeOff } from "lucide-react";

export default function Settings() {
  const { user, logout, login, updateUserLocal } = useAuth(); // login to reset context if needed
  const { darkMode, setDarkMode } = useClaim();
  
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.patientDetails?.phoneNumber || user?.phone || "",
  });

  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [preferences, setPreferences] = useState({
    emailNotif: true,
    pushNotif: true,
    twoFactor: user?.twoFactorEnabled || false,
  });

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const res = await api.put('/auth/profile', { name: formData.name, phone: formData.phone });
        if (res.data.success) {
            updateUserLocal({ 
                name: formData.name, 
                phone: formData.phone,
                patientDetails: { ...user?.patientDetails, phoneNumber: formData.phone } 
            });
            toast.success("Profile updated successfully!");
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword || !passData.newPassword) return toast.error("Please fill all password fields");
    setPassLoading(true);
    try {
        const res = await api.put('/auth/change-password', passData);
        if (res.data.success) {
            toast.success("Password updated successfully!");
            setPassData({ currentPassword: "", newPassword: "" });
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
        setPassLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (preferences.twoFactor) {
        // Disable
        try {
            const res = await api.post('/auth/2fa/disable');
            if (res.data.success) {
                setPreferences((prev) => ({ ...prev, twoFactor: false }));
                updateUserLocal({ twoFactorEnabled: false });
                toast.info("Two-Factor Authentication disabled");
            }
        } catch (err) {
            toast.error("Failed to disable 2FA");
        }
    } else {
        // Enable
        try {
            const res = await api.post('/auth/2fa/generate');
            if (res.data.success) {
                setQrCode(res.data.qrCodeUrl);
                setShow2FAModal(true);
            }
        } catch (err) {
            toast.error("Failed to initiate 2FA setup");
        }
    }
  };

  const verify2FASetup = async () => {
      try {
          const res = await api.post('/auth/2fa/verify', { token: otpInput });
          if (res.data.success) {
              toast.success("Robust 2FA Enabled Successfully!");
              setPreferences((prev) => ({ ...prev, twoFactor: true }));
              updateUserLocal({ twoFactorEnabled: true });
              setShow2FAModal(false);
              setOtpInput("");
          }
      } catch (err) {
          toast.error("Invalid Authenticator Token");
      }
  };

  return (
    <DashboardLayout role={user?.role?.toLowerCase()}>
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your personal information, security, and preferences seamlessly.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Personal Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-indigo-500" />
                Personal Information
              </h2>
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-indigo-200 dark:shadow-none"
                  >
                    {loading ? (
                       <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Block */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Lock className="w-6 h-6 text-rose-500" />
                Security
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                            type={showCurrentPass ? "text" : "password"}
                            value={passData.currentPassword}
                            onChange={(e) => setPassData({...passData, currentPassword: e.target.value})}
                            className="block w-full px-3 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCurrentPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                            type={showNewPass ? "text" : "password"}
                            value={passData.newPassword}
                            onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                            className="block w-full px-3 pr-10 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showNewPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                 </div>
                 <div className="flex justify-end pt-2">
                     <button type="submit" disabled={passLoading} className="w-full sm:w-auto bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold transition-all">
                        {passLoading ? "Updating..." : "Update Password"}
                     </button>
                 </div>
              </form>
            </div>
          </motion.div>

          {/* Right Column: Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-emerald-500" />
                Preferences
              </h2>
              
              <div className="space-y-6">
                 {/* Email Notif */}
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Bell className="w-4 h-4" /> Email Alerts</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive claim updates</p>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({...p, emailNotif: !p.emailNotif}))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${preferences.emailNotif ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.emailNotif ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </button>
                 </div>

                 {/* Dark Mode */}
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Toggle appearance</p>
                    </div>
                    <button 
                      onClick={() => {
                          setDarkMode(!darkMode);
                          localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
                      }}
                      className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </button>
                 </div>

                 {/* 2FA */}
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Shield className="w-4 h-4" /> Two-Factor Auth</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Require OTP upon login</p>
                    </div>
                    <button 
                      onClick={handleToggle2FA}
                      className={`w-12 h-6 rounded-full transition-colors relative ${preferences.twoFactor ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.twoFactor ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </button>
                 </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-8 border border-rose-100 dark:border-rose-900/30">
              <h2 className="text-xl font-bold text-rose-800 dark:text-rose-400 mb-2 flex items-center gap-2">
                Danger Zone
              </h2>
              <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mb-6">Logging out requires re-authentication on your next visit.</p>
              <button 
                onClick={logout} 
                className="w-full flex justify-center items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-rose-200 dark:shadow-none"
              >
                <LogOut className="w-5 h-5" />
                Sign Out Securely
              </button>
            </div>

          </motion.div>
        </div>
      </div>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-6">
                 <Shield className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Enable 2FA</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Scan this QR Code with Google Authenticator or Authy.</p>
              </div>

              {qrCode ? (
                 <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl flex justify-center mb-6 border border-slate-100 dark:border-slate-700">
                     <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
                 </div>
              ) : (
                 <div className="h-48 flex justify-center items-center">Loading Code...</div>
              )}

              <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">Enter 6-Digit Verification Code</label>
                    <input 
                      type="text" 
                      placeholder="000000"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full text-center tracking-[0.5em] text-2xl font-black py-4 rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                    />
                 </div>
                 <button onClick={verify2FASetup} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all">
                    Verify & Enable
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}
