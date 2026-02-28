import DashboardLayout from "../../layouts/DashboardLayout";
import { useClaim } from "../../context/ClaimContext";
import { useNavigate } from "react-router-dom";

export default function HospitalClaims() {
  const { claims } = useClaim();
  const navigate = useNavigate();

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Claim Tracking</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {claims.length === 0 ? (
          <p className="text-gray-500">No claims created yet.</p>
        ) : (
          claims.map((claim) => (
            <div
              key={claim.id}
              className="border p-4 rounded-lg mb-4 cursor-pointer hover:bg-gray-50"
              onClick={() =>
                navigate(`/hospital/claims/${claim.id}`)
              }
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{claim.patient}</p>
                  <p className="text-sm text-gray-500">
                    {claim.status}
                  </p>
                </div>
                <div className="font-semibold">
                  ₹{claim.amount}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}