import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loading from "../components/ui/Loading";
import ProtectedRoute from "../components/auth/ProtectedRoute";

const HospitalDashboard = lazy(() => import("../pages/hospital/Dashboard"));
const ClaimDetail = lazy(() => import("../pages/hospital/ClaimDetail"));
const PatientDashboard = lazy(() => import("../pages/patient/Dashboard"));
const PatientClaims = lazy(() => import("../pages/patient/Claims"));
const PatientClaimDetail = lazy(() => import("../pages/patient/ClaimDetail"));
const InsuranceDashboard = lazy(() => import("../pages/insurance/Dashboard"));
const InsuranceClaims = lazy(() => import("../pages/insurance/Claims"));
const InsuranceClaimDetail = lazy(() => import("../pages/insurance/ClaimDetail"));
const InsuranceAnalytics = lazy(() => import("../pages/insurance/Analytics"));
const Home = lazy(() => import("../pages/public/Home"));
const AddPatient = lazy(() => import("../pages/hospital/AddPatient"));
const PatientInsurance = lazy(() => import("../pages/patient/Insurance"));
const AIAnalysis = lazy(() => import("../pages/patient/AIAnalysis"));
const HospitalPatients = lazy(() => import("../pages/hospital/Patients"));
const PatientDetail = lazy(() => import("../pages/hospital/PatientDetail"));
const PatientReports = lazy(() => import("../pages/patient/PatientReports"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const Tickets = lazy(() => import("../pages/shared/Tickets"));
const Settings = lazy(() => import("../pages/shared/Settings"));
const HospitalClaims = lazy(() => import("../pages/hospital/HospitalClaims"));
const DoctorSlots = lazy(() => import("../pages/hospital/DoctorSlots"));
const CreateClaim = lazy(() => import("../pages/hospital/CreateClaim"));
const HospitalProfile = lazy(() => import("../pages/hospital/Profile"));
const PatientProfile = lazy(() => import("../pages/patient/Profile"));
const InsuranceProfile = lazy(() => import("../pages/insurance/Profile"));


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Hospital Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hospital']} />}>
            <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
            <Route path="/hospital/profile" element={<HospitalProfile />} />
            <Route path="/hospital/claims" element={<HospitalClaims />} />
            <Route path="/hospital/claims/:id" element={<ClaimDetail />} />
            <Route path="/hospital/create-claim" element={<CreateClaim />} />
            <Route path="/hospital/add-patient" element={<AddPatient />} />
            <Route path="/hospital/doctor-slots" element={<DoctorSlots />} />
            <Route path="/hospital/patients" element={<HospitalPatients />} />
            <Route path="/hospital/patients/:id" element={<PatientDetail />} />
            <Route path="/hospital/tickets" element={<Tickets role="hospital" />} />
          </Route>

          {/* Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/patient/reports" element={<PatientReports />} />
            <Route path="/patient/claims" element={<PatientClaims />} />
            <Route path="/patient/claims/:id" element={<PatientClaimDetail />} />
            <Route path="/patient/book-appointment" element={<DoctorSlots />} />
            <Route path="/patient/insurance" element={<PatientInsurance />} />
            <Route path="/patient/ai-analysis" element={<AIAnalysis />} />
            <Route path="/patient/tickets" element={<Tickets role="patient" />} />
          </Route>

          {/* Insurance Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['insurance', 'admin']} />}>
            <Route path="/insurance/dashboard" element={<InsuranceDashboard />} />
            <Route path="/insurance/profile" element={<InsuranceProfile />} />
            <Route path="/insurance/claims" element={<InsuranceClaims />} />
            <Route path="/insurance/claims/:id" element={<InsuranceClaimDetail />} />
            <Route path="/insurance/analytics" element={<InsuranceAnalytics />} />
            <Route path="/insurance/tickets" element={<Tickets role="insurance" />} />
          </Route>

          {/* Shared Authenticated Routes */}
          <Route element={<ProtectedRoute allowedRoles={['hospital', 'patient', 'insurance', 'admin']} />}>
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

