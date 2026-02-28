import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useNavigate } from "react-router-dom";
import { useClaim } from "../../context/ClaimContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { claims = [], hospitalReports = [] } = useClaim();

  // === Derived Metrics ===
  const totalPatients = 128; // simulated
  const reportsUploaded = hospitalReports.length;

  const pendingClaims = claims.filter(
    (c) => c.status === "Pre-Authorization Pending"
  ).length;

  const alerts = claims.filter(
    (c) => c.status === "Rejected"
  ).length;

  // === Chart Data ===
  const monthlyAdmissions = [
    { month: "Jan", patients: 22 },
    { month: "Feb", patients: 18 },
    { month: "Mar", patients: 25 },
    { month: "Apr", patients: 20 },
    { month: "May", patients: 30 },
  ];

  const claimDistribution = [
    {
      name: "Approved",
      value: claims.filter((c) => c.status === "Approved").length,
    },
    {
      name: "Pending",
      value: claims.filter(
        (c) => c.status === "Pre-Authorization Pending"
      ).length,
    },
    {
      name: "Rejected",
      value: claims.filter((c) => c.status === "Rejected").length,
    },
  ];

  const COLORS = ["#16a34a", "#eab308", "#dc2626"];

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Hospital Dashboard</h1>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Patients" value={totalPatients} color="text-blue-600" />
        <StatCard title="Reports Uploaded" value={reportsUploaded} color="text-green-600" />
        <StatCard title="Pending Claims" value={pendingClaims} color="text-yellow-600" />
        <StatCard title="Alerts" value={alerts} color="text-red-600" />
      </div>

      {/* === CHART SECTION === */}
      <div className="grid grid-cols-2 gap-8 mb-10">

        {/* Monthly Admissions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Monthly Admissions</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyAdmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Claim Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Claim Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={claimDistribution}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
              >
                {claimDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === RECENT CLAIM ACTIVITY === */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-10">
        <h2 className="font-semibold mb-4">Recent Claim Activity</h2>

        {claims.length === 0 ? (
          <p className="text-sm text-gray-500">
            No claims created yet.
          </p>
        ) : (
          claims
            .slice(0, 5)
            .map((claim) => (
              <div key={claim.id} className="border-b py-2 text-sm">
                <p className="font-medium">{claim.patient}</p>
                <p className="text-gray-500">{claim.status}</p>
              </div>
            ))
        )}
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="font-semibold mb-4">Quick Actions</h2>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/hospital/patients")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Manage Patients
          </button>

          <button
            onClick={() => navigate("/hospital/claims")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            View Claims
          </button>

          <button
            onClick={() => navigate("/hospital/doctor-slots")}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
          >
            Manage Doctor Slots
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}