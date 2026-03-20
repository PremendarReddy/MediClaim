import { useState, useEffect } from "react";
import { useClaim } from "../../context/ClaimContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, User, Settings, Bell, Search, Moon, Sun, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ toggleSidebar }) {
  const { notifications, markNotificationsRead } = useClaim();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Filter notifications by user role or "all"
  const userRole = user?.role || "patient";
  const roleNotifications = notifications.filter(
    (n) => n.roles?.includes("all") || n.roles?.includes(userRole) || !n.roles
  );
  
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleNotifications = () => {
    setOpenNotif(!openNotif);
    if (!openNotif && unreadCount > 0) {
      markNotificationsRead(user?.role || 'all');
      setOpenProfile(false);
    }
  };

  const handleProfileClick = () => {
    setOpenProfile(!openProfile);
    setOpenNotif(false);
  };


  return (
    <div className="flex justify-between items-center bg-white/80 backdrop-blur-md dark:bg-slate-900/80 dark:border-slate-800 px-6 py-4 shadow-sm border-b border-slate-200 z-40 sticky top-0 transition-colors w-full">

      <div className="flex items-center gap-4">
        {/* Hamburger Menu Toggle */}
        <button 
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search */}
        <div className="relative w-64 md:w-80 group hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search patients, claims, IDs..."
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all text-sm"
        />
      </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 sm:space-x-5 relative">

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 border-2 border-white dark:border-slate-900 w-3 h-3 rounded-full animate-pulse"></span>
            )}
          </button>

          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                    Notifications
                  </h4>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md">
                    {unreadCount} New
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto p-2">
                  {roleNotifications.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-slate-300 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">All caught up!</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications.</p>
                    </div>
                  ) : (
                    roleNotifications
                      .slice(-5)
                      .reverse()
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer group"
                        >
                          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {note.message}
                          </p>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Just now</span>
                        </div>
                      ))
                  )}
                </div>
                {roleNotifications.length > 0 && (
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button className="w-full text-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 py-2 transition-colors">
                      View All Notifications
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-700 dark:text-white leading-none">{user?.name || "User"}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 capitalize leading-none">{user?.role?.toLowerCase() || "Guest"}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </div>
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sm:hidden">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">
                    {user?.role?.toLowerCase() || "Guest"} Account
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    to={`/${user?.role?.toLowerCase() || 'patient'}/profile`}
                    onClick={() => setOpenProfile(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setOpenProfile(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Account Settings
                  </Link>
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
