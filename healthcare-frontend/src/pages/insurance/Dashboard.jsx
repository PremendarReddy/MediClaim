import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useClaim } from "../../context/ClaimContext";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function InsuranceDashboard() {
  const { claimStatus, timeline, hospitalReports } = useClaim();

  // === Mock Derived Data (Simulating Real Backend Aggregation) ===
  const totalClaims = timeline.length;
  const approvedClaims = timeline.filter(
    (item) => item.status === "Approved"
  ).length;
  const pendingClaims = timeline.filter(
    (item) => item.status === "Pending"
  ).length;
  const rejectedClaims = timeline.filter(
    (item) => item.status === "Rejected"
  ).length;

  const statusData = [
    { name: "Approved", value: approvedClaims },
    { name: "Pending", value: pendingClaims },
    { name: "Rejected", value: rejectedClaims },
  ];

  const monthlyTrend = [
    { month: "Jan", claims: 12 },
    { month: "Feb", claims: 19 },
    { month: "Mar", claims: 8 },
    { month: "Apr", claims: 15 },
    { month: "May", claims: 22 },
  ];

  const COLORS = ["#16a34a", "#eab308", "#dc2626"];

  return (
    <DashboardLayout role="insurance">
      <h1 className="text-2xl font-bold mb-6">
        Insurance Dashboard
      </h1>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Claims"
          value={totalClaims}
          color="text-blue-600"
        />
        <StatCard
          title="Approved"
          value={approvedClaims}
          color="text-green-600"
        />
        <StatCard
          title="Pending"
          value={pendingClaims}
          color="text-yellow-600"
        />
        <StatCard
          title="Rejected"
          value={rejectedClaims}
          color="text-red-600"
        />
      </div>

      {/* === CHART SECTION === */}
      <div className="grid grid-cols-2 gap-8 mb-10">

        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Claim Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Monthly Claim Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="claims" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* === RECENT ACTIVITY + QUICK ACTIONS === */}
      <div className="grid grid-cols-2 gap-8">

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Recent Activity
          </h2>

          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">
              No recent claim activity.
            </p>
          ) : (
            timeline
              .slice(-5)
              .reverse()
              .map((item) => (
                <div
                  key={item.id}
                  className="border-b py-2 text-sm"
                >
                  <p className="font-medium">
                    {item.status}
                  </p>
                  <p className="text-gray-500">
                    {item.date}
                  </p>
                </div>
              ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
              Review Pending Claims
            </button>

            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
              View Approved Claims
            </button>

            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">
              Risk Analysis Panel
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}