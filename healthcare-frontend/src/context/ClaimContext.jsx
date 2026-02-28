import { createContext, useContext, useState, useEffect } from "react";

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
  const [notifications, setNotifications] = useState(
    JSON.parse(localStorage.getItem("notifications")) || []
  );

  const [unreadCount, setUnreadCount] = useState(
    JSON.parse(localStorage.getItem("unreadCount")) || 0
  );

  const addNotification = (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      date: new Date().toLocaleString(),
    };

    setNotifications((prev) => [...prev, newNotification]);
    setUnreadCount((prev) => prev + 1);
  };

  const markNotificationsRead = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("unreadCount", JSON.stringify(unreadCount));
  }, [unreadCount]);

  // ================= CLAIMS (MULTI-CLAIM ENGINE) =================
  const [claims, setClaims] = useState(
    JSON.parse(localStorage.getItem("claims")) || []
  );

  const createClaim = (patientData) => {
    const newClaim = {
      id: "CLM" + Date.now(),
      patient: patientData.name,
      hospital: user?.name || "Hospital",
      amount: patientData.totalAmount,
      status: "Pre-Authorization Pending",
      risk: patientData.risk || "Low",
      timeline: [
        {
          status: "Claim Initiated",
          date: new Date().toLocaleString(),
        },
      ],
    };

    setClaims((prev) => [newClaim, ...prev]);
    addNotification(`Claim created for ${patientData.name}`);
  };

  const updateClaimStatus = (claimId, newStatus) => {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === claimId
          ? {
              ...claim,
              status: newStatus,
              timeline: [
                ...claim.timeline,
                {
                  status: newStatus,
                  date: new Date().toLocaleString(),
                },
              ],
            }
          : claim
      )
    );

    addNotification(`Claim ${claimId} updated to ${newStatus}`);
  };

  useEffect(() => {
    localStorage.setItem("claims", JSON.stringify(claims));
  }, [claims]);

  // ================= HOSPITAL REPORTS =================
  const [hospitalReports, setHospitalReports] = useState(
    JSON.parse(localStorage.getItem("reports")) || []
  );

  const addHospitalReport = (report) => {
    setHospitalReports((prev) => [report, ...prev]);
    addNotification(`New report uploaded: ${report.name}`);
  };

  useEffect(() => {
    localStorage.setItem("reports", JSON.stringify(hospitalReports));
  }, [hospitalReports]);

  // ================= TICKETS =================
  const [tickets, setTickets] = useState(
    JSON.parse(localStorage.getItem("tickets")) || []
  );

  const createTicket = (ticket) => {
    const newTicket = {
      id: Date.now(),
      subject: ticket.subject,
      status: "Open",
      raisedBy: ticket.raisedBy,
      messages: [
        {
          sender: ticket.raisedBy,
          text: ticket.message,
          time: new Date().toLocaleString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    addNotification(`New ticket: ${ticket.subject}`);
  };

  const addTicketMessage = (ticketId, message, sender) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              messages: [
                ...ticket.messages,
                {
                  sender,
                  text: message,
                  time: new Date().toLocaleString(),
                },
              ],
            }
          : ticket
      )
    );
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus }
          : ticket
      )
    );

    addNotification(`Ticket ${ticketId} marked ${newStatus}`);
  };

  useEffect(() => {
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }, [tickets]);

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
        unreadCount,
        addNotification,
        markNotificationsRead,

        // Claims
        claims,
        createClaim,
        updateClaimStatus,

        // Reports
        hospitalReports,
        addHospitalReport,

        // Tickets
        tickets,
        createTicket,
        updateTicketStatus,
        addTicketMessage,
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  return useContext(ClaimContext);
}