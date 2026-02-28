import { BrowserRouter, Routes, Route } from "react-router-dom";
import HospitalDashboard from "../pages/hospital/Dashboard";
import ClaimDetail from "../pages/hospital/ClaimDetail";
import PatientDashboard from "../pages/patient/Dashboard";
import PatientClaims from "../pages/patient/Claims";
import PatientClaimDetail from "../pages/patient/ClaimDetail";
import InsuranceDashboard from "../pages/insurance/Dashboard";
import InsuranceClaims from "../pages/insurance/Claims";
import InsuranceClaimDetail from "../pages/insurance/ClaimDetail";
import Home from "../pages/public/Home";
import AddPatient from "../pages/hospital/AddPatient";
import PatientInsurance from "../pages/patient/Insurance";
import AIAnalysis from "../pages/patient/AIAnalysis";
import HospitalPatients from "../pages/hospital/Patients";
import PatientDetail from "../pages/hospital/PatientDetail";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Tickets from "../pages/shared/Tickets";


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
        <Route path="/hospital/claims/:id" element={<ClaimDetail />} />
        <Route path="/patient/dashboard" element={<PatientDashboard />} />
        <Route path="/patient/claims" element={<PatientClaims />} />
        <Route path="/patient/claims/:id" element={<PatientClaimDetail />} />
        <Route path="/insurance/dashboard" element={<InsuranceDashboard />} />
        <Route path="/insurance/claims" element={<InsuranceClaims />} />
        <Route path="/insurance/claims/:id" element={<InsuranceClaimDetail />} />
        <Route path="/hospital/add-patient" element={<AddPatient />} />
        <Route path="/patient/insurance" element={<PatientInsurance />} />
        <Route path="/patient/ai-analysis" element={<AIAnalysis />} />
        <Route path="/hospital/patients" element={<HospitalPatients />} />
        <Route path="/hospital/patients/:id" element={<PatientDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/patient/tickets"
          element={<Tickets role="patient" />}
        />
        <Route
          path="/hospital/tickets"
          element={<Tickets role="hospital" />}
        />
        <Route
          path="/insurance/tickets"
          element={<Tickets role="insurance" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

