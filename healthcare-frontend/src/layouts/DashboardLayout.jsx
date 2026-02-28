import Sidebar from "../components/ui/Sidebar";
import Navbar from "../components/ui/Navbar";
import { useClaim } from "../context/ClaimContext";
import { useState, useEffect } from "react";
import Toast from "../components/ui/Toast";

export default function DashboardLayout({ children, role }) {
  const { notifications } = useClaim();
  const [showToast, setShowToast] = useState(false);

  const latestNotification =
    notifications[notifications.length - 1];

  useEffect(() => {
    if (latestNotification) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />

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