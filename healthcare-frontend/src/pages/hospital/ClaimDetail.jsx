import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
export default function ClaimDetail() {
  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Claim Detail</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Claim Info */}
        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Claim Information</h2>
          <p><strong>Claim ID:</strong> CLM001</p>
          <p><strong>Patient:</strong> Rahul Kumar</p>
          <p><strong>Amount:</strong> ₹45,000</p>
          <div className="flex items-center space-x-3">
            <strong>Status:</strong>
            <StatusBadge status="Under Review" />
          </div>
        </div>

        {/* Risk Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">AI Risk Analysis</h2>
          <p className="text-yellow-600 font-bold">Risk Level: Medium</p>
          <p className="mt-2 text-sm text-gray-600">
            Billing exceeds average by 25%
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Claim Timeline</h2>
        <div className="space-y-4">
            {[
                { label: "Submitted", status: "done" },
                { label: "Under Hospital Review", status: "done" },
                { label: "Under Insurance Verification", status: "current" },
                { label: "Approved", status: "pending" },
                { label: "Amount Released", status: "pending" },
            ].map((step, index) => (
                <div key={index} className="flex items-center space-x-4">
                <div
                    className={`w-4 h-4 rounded-full ${
                    step.status === "done"
                        ? "bg-green-500"
                        : step.status === "current"
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    }`}
                />
                <span
                    className={`${
                    step.status === "current" ? "font-semibold text-blue-600" : ""
                    }`}
                >
                    {step.label}
                </span>
                </div>
            ))}
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Document Checklist</h2>
        <ul className="space-y-2 text-sm">
            <li className="text-green-600">✔ Claim Form</li>
            <li className="text-green-600">✔ Discharge Summary</li>
            <li className="text-red-600">✖ Pharmacy Bills Missing</li>
            <li className="text-green-600">✔ Investigation Reports</li>
        </ul>
      </div>

      <div className="mt-8 flex space-x-4">
        <button className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">
            Approve Claim
        </button>

        <button className="bg-yellow-500 text-white px-5 py-2 rounded-lg hover:bg-yellow-600">
            Request Documents
        </button>
      </div>
    </DashboardLayout>
  );
}