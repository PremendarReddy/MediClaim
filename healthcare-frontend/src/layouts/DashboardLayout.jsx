import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/ui/Navbar";
import { useClaim } from "../context/ClaimContext";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Toast from "../components/ui/Toast";

export default function DashboardLayout({ children, role }) {
  const { notifications, user } = useClaim();
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const latestNotification =
    notifications[notifications.length - 1];

  useEffect(() => {
    if (latestNotification) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setShowToast(true);
      // Clear previous timeout if exists
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      // Set new timeout
      toastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
    
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [latestNotification]);

  // Determine layout role:
  // 1. explicit `role` prop
  // 2. infer from current route pathname (so /insurance/* uses insurance menu)
  // 3. logged-in user's role
  // 4. default to 'patient'
  const { pathname } = useLocation();

  const inferRoleFromPath = (path) => {
    if (!path) return null;
    if (path.startsWith("/insurance")) return "insurance";
    if (path.startsWith("/hospital")) return "hospital";
    if (path.startsWith("/patient")) return "patient";
    if (path.startsWith("/admin")) return "admin";
    return null;
  };

  const layoutRole = role || inferRoleFromPath(pathname) || user?.role || "patient";

  return (
    <div className="flex min-h-screen">
      <Sidebar role={layoutRole} />

      <div className="flex-1 bg-gray-100">
        <Navbar />
        <div className="p-6">{children}</div>

        {showToast && latestNotification && (
          <Toast message={latestNotification.message} />
        )}
      </div>
    </div>
  );
}