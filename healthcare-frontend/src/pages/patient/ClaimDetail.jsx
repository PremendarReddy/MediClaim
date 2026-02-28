import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { useClaim } from "../../context/ClaimContext";


export default function PatientClaimDetail() {
      const { claimStatus } = useClaim();
      const [selectedFile, setSelectedFile] = useState(null);
      
  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold mb-6">Claim Detail</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <p><strong>Claim ID:</strong> CLM001</p>
        <p><strong>Hospital:</strong> City Hospital</p>
        <p><strong>Amount:</strong> ₹45,000</p>
        <div className="flex items-center space-x-3 mt-2">
          <strong>Status:</strong>
          <StatusBadge status={claimStatus} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Claim Timeline</h2>
        <ul className="space-y-3">
          <li className="text-green-600">✔ Submitted</li>
          <li className="text-green-600">✔ Under Hospital Review</li>
          <li className="text-blue-600 font-medium">● Under Insurance Verification</li>
          <li className="text-gray-400">○ Approved</li>
          <li className="text-gray-400">○ Amount Released</li>
        </ul>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Missing Documents</h2>

        <ul className="space-y-2 text-sm mb-6">
            <li className="text-red-600">✖ Pharmacy Bills</li>
            <li className="text-red-600">✖ Investigation Reports</li>
        </ul>

        <h3 className="font-medium mb-3">Upload Documents</h3>

        <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
            <p className="text-gray-500 mb-4">
            Drag & drop files here or click to upload
            </p>

            <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block mx-auto text-sm text-gray-500"
            />

            {selectedFile && (
            <p className="mt-3 text-sm text-green-600">
                Selected: {selectedFile.name}
            </p>
            )}
        </div>

        <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
            Submit Documents
        </button>
        </div>
    </DashboardLayout>
  );
}