import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";

export default function PatientInsurance() {
  const [insuranceData, setInsuranceData] = useState(null);
  const [editing, setEditing] = useState(false);

  const insuranceCompanies = [
    "Star Health",
    "HDFC Ergo",
    "ICICI Lombard",
    "Bajaj Allianz",
    "Others",
  ];

  const [formData, setFormData] = useState({
    company: "",
    insuranceId: "",
    phone: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setInsuranceData(formData);
    setEditing(false);
  };

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold mb-6">Insurance Details</h1>

      {!insuranceData || editing ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium mb-1">
                Insurance Company
              </label>
              <select
                name="company"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Select Company</option>
                {insuranceCompanies.map((company, index) => (
                  <option key={index} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Insurance ID
              </label>
              <input
                type="text"
                name="insuranceId"
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            {formData.company === "Others" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Insurance Company Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Insurance Company Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Insurance Documents
              </label>
              <input
                type="file"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
              Save Insurance Details
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border max-w-xl">
          <h2 className="text-lg font-semibold mb-4">
            Insurance Summary
          </h2>

          <p><strong>Company:</strong> {insuranceData.company}</p>
          <p><strong>Insurance ID:</strong> {insuranceData.insuranceId}</p>

          <div className="mt-3">
            <strong>Status:</strong>{" "}
            <StatusBadge status="Under Review" />
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            Edit Details
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}