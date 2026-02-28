import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useClaim } from "../../context/ClaimContext";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const {
    claimStatus,
    healthRisk,
    hospitalReports,
    timeline,
  } = useClaim();

  const recentReports = hospitalReports.slice(0, 3);

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold mb-6">
        Patient Dashboard
      </h1>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Claim Status"
          value={claimStatus}
          color="text-blue-600"
        />
        <StatCard
          title="Health Risk"
          value={healthRisk}
          color="text-red-600"
        />
        <StatCard
          title="Reports Uploaded"
          value={hospitalReports.length}
          color="text-green-600"
        />
        <StatCard
          title="Timeline Updates"
          value={timeline.length}
          color="text-purple-600"
        />
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid grid-cols-2 gap-8">

        {/* Recent Reports */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Recent Medical Reports
          </h2>

          {recentReports.length === 0 ? (
            <p className="text-sm text-gray-500">
              No reports available yet.
            </p>
          ) : (
            recentReports.map((report) => (
              <div
                key={report.id}
                className="border-b py-2 text-sm"
              >
                <p className="font-medium">{report.name}</p>
                <p className="text-gray-500">
                  {report.date}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Insurance Overview */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Insurance Overview
          </h2>

          <p className="text-sm mb-2">
            <strong>Current Claim Status:</strong>{" "}
            {claimStatus}
          </p>

          <p className="text-sm mb-2">
            <strong>Coverage Limit:</strong> ₹2,00,000
          </p>

          <p className="text-sm mb-2">
            <strong>Used Amount:</strong> ₹45,000
          </p>

          <p className="text-sm text-gray-500">
            Remaining Coverage: ₹1,55,000
          </p>
        </div>

        {/* Upcoming Appointment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Upcoming Appointment
          </h2>

          <p className="text-sm">
            <strong>Date:</strong> 15 March 2026
          </p>
          <p className="text-sm">
            <strong>Doctor:</strong> Dr. Sharma
          </p>
          <p className="text-sm text-gray-500">
            Status: Confirmed
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/patient/ai-analysis")}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Analyze Medical Report
            </button>

            <button
              onClick={() => navigate("/insurance/claims")}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              View Claim Status
            </button>

            <button
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
            >
              Upload Insurance Documents
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}