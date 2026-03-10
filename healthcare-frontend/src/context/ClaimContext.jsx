import { createContext, useContext, useState, useEffect, useMemo } from "react";

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
      patientId: patientData.id,
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



  // ================= PATIENTS =================
  const [patients, setPatients] = useState(
    JSON.parse(localStorage.getItem("patients")) || []
  );

  const createPatient = (patientData) => {
    const newPatient = {
      id: "PAT" + Date.now(),
      ...patientData,
      status: "Pending", // Pending, Active, Discharged
      createdAt: new Date().toLocaleString(),
      documents: [],
      insurance: null,
    };

    setPatients((prev) => [newPatient, ...prev]);
    addNotification(`New patient added: ${patientData.name}`);
  };

  const updatePatient = (patientId, updates) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId
          ? { ...patient, ...updates }
          : patient
      )
    );
  };

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  // ================= DOCUMENTS =================
  const [documents, setDocuments] = useState(
    JSON.parse(localStorage.getItem("documents")) || []
  );

  const uploadDocument = (patientId, document) => {
    const newDoc = {
      id: "DOC" + Date.now(),
      patientId,
      ...document,
      uploadedAt: new Date().toLocaleString(),
      status: "Uploaded",
    };

    setDocuments((prev) => [newDoc, ...prev]);
    addNotification(`Document uploaded: ${document.name}`);
  };

  const updateDocumentStatus = (docId, status) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status } : doc
      )
    );
  };

  useEffect(() => {
    localStorage.setItem("documents", JSON.stringify(documents));
  }, [documents]);

  // ================= DOCTOR SLOTS =================
  const [doctorSlots, setDoctorSlots] = useState(
    JSON.parse(localStorage.getItem("doctorSlots")) || [
      {
        id: 1,
        doctorName: "Dr. Sharma",
        specialty: "Cardiology",
        date: "2026-03-15",
        time: "10:00-11:00",
        slotsFilled: 3,
        slotsTotal: 5,
      },
      {
        id: 2,
        doctorName: "Dr. Patel",
        specialty: "Neurology",
        date: "2026-03-16",
        time: "14:00-15:00",
        slotsFilled: 2,
        slotsTotal: 5,
      },
      {
        id: 3,
        doctorName: "Dr. Kumar",
        specialty: "Orthopedics",
        date: "2026-03-17",
        time: "11:00-12:00",
        slotsFilled: 5,
        slotsTotal: 5,
      },
    ]
  );

  const bookSlot = (patientId, slotId) => {
    setDoctorSlots((prev) =>
      prev.map((slot) =>
        slot.id === slotId
          ? { ...slot, slotsFilled: slot.slotsFilled + 1 }
          : slot
      )
    );
    addNotification(`Slot booked successfully`);
  };

  useEffect(() => {
    localStorage.setItem("doctorSlots", JSON.stringify(doctorSlots));
  }, [doctorSlots]);

  // ================= HOSPITAL BANK DETAILS =================
  const [hospitalBankDetails, setHospitalBankDetails] = useState(
    JSON.parse(localStorage.getItem("bankDetails")) || {
      accountName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    }
  );

  const updateBankDetails = (details) => {
    setHospitalBankDetails(details);
    addNotification("Bank details updated");
  };

  useEffect(() => {
    localStorage.setItem("bankDetails", JSON.stringify(hospitalBankDetails));
  }, [hospitalBankDetails]);

  // ================= INSURANCE COVERAGE =================
  const [insuranceCoverage] = useState(
    JSON.parse(localStorage.getItem("coverage")) || {
      totalLimit: 500000,
      usedAmount: 125000,
      claimsCount: 3,
      treatments: [
        {
          name: "Hospitalization",
          covered: true,
          limit: 300000,
        },
        {
          name: "Surgery",
          covered: true,
          limit: 200000,
        },
        {
          name: "Medication",
          covered: true,
          limit: 100000,
        },
        {
          name: "Diagnostic Tests",
          covered: true,
          limit: 50000,
        },
      ],
    }
  );

  // ================= DEMO / CHART DATA (move static arrays here for dynamic access) =================
  const [monthlyAdmissions, setMonthlyAdmissions] = useState(
    JSON.parse(localStorage.getItem("monthlyAdmissions")) || [
      { month: "Jan", patients: 22 },
      { month: "Feb", patients: 18 },
      { month: "Mar", patients: 25 },
      { month: "Apr", patients: 20 },
      { month: "May", patients: 30 },
    ]
  );

  useEffect(() => {
    localStorage.setItem("monthlyAdmissions", JSON.stringify(monthlyAdmissions));
  }, [monthlyAdmissions]);

  // ================= AI ANALYSIS =================
  const [aiAnalysisResults, setAiAnalysisResults] = useState(
    JSON.parse(localStorage.getItem("aiAnalysis")) || []
  );

  const createAiAnalysis = (analysisData) => {
    const newAnalysis = {
      id: "AI" + Date.now(),
      ...analysisData,
      createdAt: new Date().toLocaleString(),
      status: "Complete",
    };

    setAiAnalysisResults((prev) => [newAnalysis, ...prev]);
    addNotification(`AI Analysis completed`);
  };

  useEffect(() => {
    localStorage.setItem("aiAnalysis", JSON.stringify(aiAnalysisResults));
  }, [aiAnalysisResults]);

  // ================= INSURANCE VERIFICATION =================
  const [verificationRequests, setVerificationRequests] = useState(
    JSON.parse(localStorage.getItem("verificationRequests")) || []
  );

  const createVerificationRequest = (request) => {
    const newRequest = {
      id: "VER" + Date.now(),
      ...request,
      status: "Pending",
      createdAt: new Date().toLocaleString(),
    };

    setVerificationRequests((prev) => [newRequest, ...prev]);
    addNotification(`Verification request created`);
  };

  const updateVerificationStatus = (requestId, status, notes = "") => {
    setVerificationRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status, notes, updatedAt: new Date().toLocaleString() }
          : req
      )
    );
  };

  useEffect(() => {
    localStorage.setItem(
      "verificationRequests",
      JSON.stringify(verificationRequests)
    );
  }, [verificationRequests]);

  // ================= INSURANCE DEMO DATA =================
  const [insuranceClaimsMockData, setInsuranceClaimsMockData] = useState(
    JSON.parse(localStorage.getItem("insuranceClaimsMock")) || [
      {
        claimId: "CLM001",
        patient: "Rahul Kumar",
        amount: 45000,
        risk: "Medium",
        status: "Under Review",
      },
      {
        claimId: "CLM002",
        patient: "Anjali Sharma",
        amount: 30000,
        risk: "Low",
        status: "Approved",
      },
      {
        claimId: "CLM003",
        patient: "Amit Verma",
        amount: 60000,
        risk: "High",
        status: "Pending",
      },
      {
        claimId: "CLM004",
        patient: "Priya Singh",
        amount: 52000,
        risk: "Medium",
        status: "Rejected",
      },
      {
        claimId: "CLM005",
        patient: "Rohan Mehta",
        amount: 20000,
        risk: "Low",
        status: "Approved",
      },
    ]
  );

  const [insuranceClaimsTrend, setInsuranceClaimsTrend] = useState(
    JSON.parse(localStorage.getItem("insuranceClaimsTrend")) || [
      { month: "Jan", claims: 12 },
      { month: "Feb", claims: 19 },
      { month: "Mar", claims: 8 },
      { month: "Apr", claims: 15 },
      { month: "May", claims: 22 },
    ]
  );

  useEffect(() => {
    localStorage.setItem(
      "insuranceClaimsMock",
      JSON.stringify(insuranceClaimsMockData)
    );
  }, [insuranceClaimsMockData]);

  useEffect(() => {
    localStorage.setItem(
      "insuranceClaimsTrend",
      JSON.stringify(insuranceClaimsTrend)
    );
  }, [insuranceClaimsTrend]);

  // ================= COMPUTED VALUES FOR DASHBOARD =================
  const claimStatus = useMemo(() => {
    return claims.length > 0 ? claims[0]?.status : "No Claims";
  }, [claims]);

  const timeline = useMemo(() => {
    return claims.length > 0 ? claims[0]?.timeline || [] : [];
  }, [claims]);

  const healthRisk = useMemo(() => {
    if (!claims || claims.length === 0) return "Low";
    if (claims.some((c) => c.risk === "High")) return "High";
    if (claims.some((c) => c.risk === "Medium")) return "Medium";
    return "Low";
  }, [claims]);

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
        claimStatus,
        timeline,

        // Reports
        hospitalReports,
        addHospitalReport,

        // Tickets
        tickets,
        createTicket,
        updateTicketStatus,
        addTicketMessage,

        // Patients
        patients,
        createPatient,
        updatePatient,

        // Documents
        documents,
        uploadDocument,
        updateDocumentStatus,

        // Doctor Slots
        doctorSlots,
        bookSlot,

        // Hospital Bank Details
        hospitalBankDetails,
        updateBankDetails,

        // Insurance Coverage
        insuranceCoverage,

        // Insurance Demo Data
        insuranceClaimsMockData,
        setInsuranceClaimsMockData,
        insuranceClaimsTrend,
        setInsuranceClaimsTrend,

        // Demo chart data
        monthlyAdmissions,
        setMonthlyAdmissions,

        // Health & Risk
        healthRisk,

        // AI Analysis
        aiAnalysisResults,
        createAiAnalysis,

        // Insurance Verification
        verificationRequests,
        createVerificationRequest,
        updateVerificationStatus,
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaim() {
  return useContext(ClaimContext);
}