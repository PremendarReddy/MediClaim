import DashboardLayout from "../../layouts/DashboardLayout";
import DataTable from "../../components/ui/DataTable";
import { useNavigate } from "react-router-dom";


const patientClaims = [
  { claimId: "CLM001", hospital: "City Hospital", amount: "₹45,000", status: "Under Review" },
  { claimId: "CLM002", hospital: "Apollo Clinic", amount: "₹30,000", status: "Approved" },
];

export default function PatientClaims() {
  const navigate = useNavigate();

  return (
    <DashboardLayout role="patient">
      <h1 className="text-2xl font-bold mb-6">My Claims</h1>

      <DataTable
        columns={["Claim ID", "Hospital", "Amount", "Status"]}
        data={patientClaims}
        onRowClick={(row) => navigate(`/patient/claims/${row.claimId}`)}
      />
    </DashboardLayout>
  );
}