import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";

export default function HospitalPatients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const patients = [
    {
      id: "P001",
      name: "Rahul Kumar",
      insurance: "Yes",
      status: "Approved",
    },
    {
      id: "P002",
      name: "Anjali Sharma",
      insurance: "No",
      status: "Pending",
    },
    {
      id: "P003",
      name: "Amit Verma",
      insurance: "Yes",
      status: "Approved",
    },
  ];

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Patients</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search Patient..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded-lg mb-6"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Patient ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Insurance</th>
              <th className="p-3">Account Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                onClick={() =>
                  navigate(`/hospital/patients/${patient.id}`)
                }
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3">{patient.id}</td>
                <td className="p-3">{patient.name}</td>
                <td className="p-3">{patient.insurance}</td>
                <td className="p-3">
                  <StatusBadge status={patient.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}