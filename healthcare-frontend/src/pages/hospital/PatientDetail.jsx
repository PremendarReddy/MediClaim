import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useClaim } from "../../context/ClaimContext";
import StatusBadge from "../../components/ui/StatusBadge";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    updateClaimStatus,
    claimStatus,
    addHospitalReport,
  } = useClaim();

  const [remarks, setRemarks] = useState("");
  const [nextCheckup, setNextCheckup] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Report Handler (now using global context)
  const handleReportUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const newReport = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleString(),
      patientId: id,
    };

    addHospitalReport(newReport);
    setShowUploadModal(false);
  };

  // Initiate Claim
  const handleInitiateClaim = () => {
    updateClaimStatus("Submitted");
    navigate("/insurance/claims");
  };

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">
        Patient Details – {id}
      </h1>

      <div className="grid grid-cols-2 gap-6">

        {/* Basic Info */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Basic Information</h2>
          <p><strong>Name:</strong> Rahul Kumar</p>
          <p><strong>Age:</strong> 32</p>
          <p><strong>Insurance:</strong> Yes</p>
          <p><strong>Admission Date:</strong> 12 Feb 2026</p>
          <p>
            <strong>Claim Status:</strong>{" "}
            <StatusBadge status={claimStatus} />
          </p>
        </div>

        {/* Medical Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="font-semibold mb-4">Medical Management</h2>

          {/* Remarks */}
          <div className="mb-4">
            <label className="block font-medium mb-1">
              Doctor Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              rows="3"
              placeholder="Enter doctor remarks..."
            />
          </div>

          {/* Next Checkup */}
          <div>
            <label className="block font-medium mb-1">
              Next Check-up Date
            </label>
            <input
              type="date"
              value={nextCheckup}
              onChange={(e) => setNextCheckup(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex space-x-4">
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Upload Report
        </button>

        <button
          onClick={handleInitiateClaim}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          Initiate Insurance Claim
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="font-semibold mb-4">Upload Medical Report</h2>

            <input
              type="file"
              onChange={handleReportUpload}
              className="w-full border rounded-lg px-3 py-2"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}