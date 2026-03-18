import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useClaim } from "../../context/ClaimContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { User, Mail, Phone, Lock, Bell, Moon, Shield, LogOut, CheckCircle, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useClaim();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [preferences, setPreferences] = useState({
    emailNotif: true,
    pushNotif: true,
    twoFactor: false,
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      toast.success("Profile updated successfully!");
    }, 1000);
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.info("Preference updated");
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
                    <p className="text-xs text-slate-400 mt-2">Email cannot be changed.</p>
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
              <div className="space-y-4">
                 <button onClick={() => toast.info("Password reset link sent to registered email")} className="w-full sm:w-auto bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold transition-all">
                    Reset Password
                 </button>
              </div>
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
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Receive claim updates via email</p>
                    </div>
                    <button 
                      onClick={() => handleToggle('emailNotif')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${preferences.emailNotif ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                    >
                      <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.emailNotif ? 'translate-x-6' : 'translate-x-0'}`}></span>
                    </button>
                 </div>

                 {/* Dark Mode */}
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><Moon className="w-4 h-4" /> Dark Mode</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Toggle dashboard appearance</p>
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
                      onClick={() => handleToggle('twoFactor')}
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
    </DashboardLayout>
  );
}
