import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { useClaim } from "../../context/ClaimContext";


export default function AddPatient() {
  const [step, setStep] = useState(1);
  const [hasInsurance, setHasInsurance] = useState(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [status, setStatus] = useState(null);
  const [showOTPModal, setShowOTPModal] = useState(false);

  const [billItems, setBillItems] = useState([
    { description: "", amount: "" },
  ]);

  const insuranceCompanies = [
    "Star Health",
    "HDFC Ergo",
    "ICICI Lombard",
    "Bajaj Allianz",
    "Others",
  ];

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = () => {
    setShowOTPModal(true);
  };

  const confirmOTP = () => {
  const patientData = {
    name: "New Patient",
    totalAmount,
  };
  const { createClaim } = useClaim();

  createClaim(patientData);
  setStatus("Pre-Authorization Pending");
  setShowOTPModal(false);
};

  const addBillItem = () => {
    setBillItems([...billItems, { description: "", amount: "" }]);
  };

  const updateBillItem = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;
    setBillItems(updated);
  };

  const totalAmount = billItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Patient Onboarding</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-3xl">

        {/* Progress Indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= s ? "bg-blue-600 text-white" : "bg-gray-300"}
              `}
            >
              {s}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <Input label="Full Name" />
            <Input label="Email" />
            <Input label="Phone Number" />
            <Input label="Admission Date" type="date" />
            <button onClick={nextStep} className="btn-primary">
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">

            <div>
              <label className="block font-medium mb-2">
                Does patient have insurance?
              </label>
              <div className="space-x-6">
                <label>
                  <input
                    type="radio"
                    onChange={() => setHasInsurance(true)}
                  /> Yes
                </label>
                <label>
                  <input
                    type="radio"
                    onChange={() => setHasInsurance(false)}
                  /> No
                </label>
              </div>
            </div>

            {hasInsurance && (
              <div className="space-y-4">
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  onChange={(e) => setInsuranceCompany(e.target.value)}
                >
                  <option value="">Select Company</option>
                  {insuranceCompanies.map((c, i) => (
                    <option key={i}>{c}</option>
                  ))}
                </select>

                <Input label="Insurance ID" />
                <input type="file" className="w-full border rounded-lg px-3 py-2" />

                {insuranceCompany === "Others" && (
                  <>
                    <Input label="Insurance Company Phone" />
                    <Input label="Insurance Company Email" />
                  </>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={nextStep} className="btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <Input label="Doctor Assigned" />
            <Input label="Ward / Room Number" />
            <Input label="Diagnosis Summary" />

            <div className="flex justify-between">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={nextStep} className="btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* STEP 4 — BILL BREAKDOWN */}
        {step === 4 && (
          <div className="space-y-6">

            <h2 className="font-semibold">Bill Breakdown</h2>

            {billItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                <input
                  placeholder="Description"
                  className="flex-1 border rounded-lg px-3 py-2"
                  value={item.description}
                  onChange={(e) =>
                    updateBillItem(index, "description", e.target.value)
                  }
                />
                <input
                  placeholder="Amount"
                  type="number"
                  className="w-32 border rounded-lg px-3 py-2"
                  value={item.amount}
                  onChange={(e) =>
                    updateBillItem(index, "amount", e.target.value)
                  }
                />
              </div>
            ))}

            <button
              onClick={addBillItem}
              className="text-blue-600 text-sm"
            >
              + Add Line Item
            </button>

            <div className="text-right font-semibold">
              Total: ₹{totalAmount}
            </div>

            <div className="flex justify-between">
              <button onClick={prevStep} className="btn-secondary">Back</button>
              <button onClick={handleSubmit} className="btn-primary">
                Send OTP Request
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className="mt-6">
            <strong>Status:</strong> <StatusBadge status={status} />
          </div>
        )}
      </div>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">OTP Verification</h2>
            <p className="text-sm text-gray-600 mb-4">
              OTP sent to patient for insurance consent.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowOTPModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmOTP}
                className="btn-primary"
              >
                Confirm OTP
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Input({ label, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        className="w-full border rounded-lg px-3 py-2"
        required
      />
    </div>
  );
}