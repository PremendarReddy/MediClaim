import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import RiskBadge from "../../components/ui/RiskBadge";
import { useClaim } from "../../context/ClaimContext";

export default function InsuranceClaimDetail() {
  const {
    claimStatus: status,
    updateClaimStatus,
    healthRisk,
    timeline,
    hospitalReports,
  } = useClaim();

  const [notification, setNotification] = useState("");
  const [showConfirm, setShowConfirm] = useState(null);
  const [docChecklist, setDocChecklist] = useState({
    dischargeSummary: false,
    pharmacyBills: false,
    investigationReports: false,
  });

  const updateStatus = (newStatus) => {
    updateClaimStatus(newStatus);
    setShowConfirm(null);
    setNotification(`Claim status updated to ${newStatus}`);
  };

  return (
    <DashboardLayout role="insurance">
      <h1 className="text-2xl font-bold mb-6">Claim Review</h1>

      {notification && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {notification}
        </div>
      )}

      {/* Claim Info */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <p><strong>Claim ID:</strong> CLM001</p>
          <p><strong>Patient:</strong> Rahul Kumar</p>
          <p><strong>Hospital:</strong> City Hospital</p>
          <p><strong>Amount:</strong> ₹45,000</p>

          <div className="flex items-center space-x-3 mt-3">
            <strong>Status:</strong>
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Risk Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-2">AI Risk Analysis</h2>
          <RiskBadge level={healthRisk} />
          <p className="text-sm text-gray-600 mt-2">
            Billing exceeds historical average by 25%
          </p>
        </div>
      </div>

      {/* Hospital Uploaded Reports */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="font-semibold mb-4">Hospital Reports</h2>

        {hospitalReports.length === 0 ? (
          <p className="text-sm text-gray-500">
            No reports uploaded yet.
          </p>
        ) : (
          hospitalReports.map((report) => (
            <div
              key={report.id}
              className="border p-3 rounded-lg mb-2"
            >
              <p className="font-medium">{report.name}</p>
              <p className="text-sm text-gray-500">
                {report.date}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Document Verification Checklist */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="font-semibold mb-4">
          Document Verification
        </h2>

        {Object.keys(docChecklist).map((doc) => (
          <div key={doc} className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={docChecklist[doc]}
              onChange={() =>
                setDocChecklist({
                  ...docChecklist,
                  [doc]: !docChecklist[doc],
                })
              }
              className="mr-2"
            />
            <span className="capitalize">{doc}</span>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Claim Timeline
        </h2>

        {timeline.length === 0 ? (
          <p className="text-sm text-gray-500">
            No status updates yet.
          </p>
        ) : (
          <div className="space-y-3">
            {timeline.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4"
              >
                <div className="w-4 h-4 rounded-full bg-blue-600" />
                <div>
                  <p className="font-medium">{item.status}</p>
                  <p className="text-sm text-gray-500">
                    {item.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          disabled={status === "Approved" || status === "Rejected"}
          onClick={() => setShowConfirm("Approved")}
          className={`px-5 py-2 rounded-lg text-white ${
            status === "Approved" || status === "Rejected"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Approve Claim
        </button>

        <button
          disabled={status === "Approved" || status === "Rejected"}
          onClick={() => setShowConfirm("Pending")}
          className={`px-5 py-2 rounded-lg text-white ${
            status === "Approved" || status === "Rejected"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          Request Documents
        </button>

        <button
          disabled={status === "Approved" || status === "Rejected"}
          onClick={() => setShowConfirm("Rejected")}
          className={`px-5 py-2 rounded-lg text-white ${
            status === "Approved" || status === "Rejected"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Reject Claim
        </button>

        <button
            onClick={() => updateClaimStatus("Pre-Authorized")}
            className="bg-purple-600 text-white px-5 py-2 rounded-lg"
            >
            Approve Pre-Authorization
        </button>
      </div>


      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">
              Confirm {showConfirm}?
            </h2>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={() => updateStatus(showConfirm)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}