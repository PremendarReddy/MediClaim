import { useState } from "react";
import { useClaim } from "../../context/ClaimContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const {
    notifications,
    unreadCount,
    markNotificationsRead,
    user,
    logout,
    darkMode,
    setDarkMode,
  } = useClaim();

  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();

  const toggleNotifications = () => {
    setOpenNotif(!openNotif);
    markNotificationsRead();
  };

  return (
    <div className="flex justify-between items-center bg-white dark:bg-gray-900 dark:text-white px-6 py-3 shadow-sm border-b relative">

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="border rounded-lg px-3 py-1 dark:bg-gray-800 dark:border-gray-700"
      />

      {/* Right Section */}
      <div className="flex items-center space-x-6 relative">

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xl"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative text-xl"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {openNotif && (
            <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border z-50 animate-fadeIn">
              <h4 className="font-semibold mb-3">
                Notifications
              </h4>

              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No notifications
                </p>
              ) : (
                notifications
                  .slice(-5)
                  .reverse()
                  .map((note) => (
                    <p
                      key={note.id}
                      className="text-sm mb-2 border-b pb-1"
                    >
                      {note.message}
                    </p>
                  ))
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <div
            onClick={() => setOpenProfile(!openProfile)}
            className="w-8 h-8 bg-gray-400 rounded-full cursor-pointer"
          ></div>

          {openProfile && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border animate-fadeIn">
              <p className="text-sm mb-2">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Role: {user?.role}
              </p>

              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full bg-red-600 text-white py-1 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}