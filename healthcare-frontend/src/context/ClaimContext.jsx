import { createContext, useContext, useState, useEffect, useMemo } from "react";
import api from "../api/axios";

const ClaimContext = createContext();

export function ClaimProvider({ children }) {
  // ================= AUTH =================
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // ================= DARK MODE =================
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) || false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));

    if (darkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("bg-gray-900");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-gray-900");
    }
  }, [darkMode]);

  // ================= NOTIFICATIONS =================
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/notifications')
        .then(res => {
          if (res.data.success) setNotifications(res.data.data);
        })
        .catch(err => console.error("Failed to load notifications", err));
    } else {
      setNotifications([]);
    }
  }, [user]);

  const addNotification = async (message, targetRoles = ['all']) => {
    try {
      const roles = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
      await api.post('/notifications', { message, targetRoles: roles });
      
      // Optimistically fetch latest to ensure synchronization if user is logged in
      if (user) {
        const res = await api.get('/notifications');
        if (res.data.success) setNotifications(res.data.data);
      }
    } catch (error) {
      console.error("Error pushing notification:", error);
    }
  };

  const markNotificationsRead = async () => {
    try {
      if (!user) return;
      await api.put('/notifications/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error("Error marking reads:", error);
    }
  };

  // ================= COMPUTED VALUES FOR DASHBOARD (MIGRATED API) =================
  // All remaining entities like tickets, patients, documents, slots, insurance claims, and hospital bank details
  // are now purely driven via specific Axios /api/ fetches within the individual frontend Page components.
  // This central context is now acting purely as the Auth, Notification, and Theme Provider.

  // ================= PROVIDER =================
  return (
    <ClaimContext.Provider
      value={{
        // Auth
        user,
        login,
        logout,

        // Dark Mode
        darkMode,
        setDarkMode,

        // Notifications
        notifications,
        addNotification,
        markNotificationsRead,
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  return useContext(ClaimContext);
}
