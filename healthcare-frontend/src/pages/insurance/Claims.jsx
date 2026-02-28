import { useState, useMemo } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import RiskBadge from "../../components/ui/RiskBadge";
import StatusBadge from "../../components/ui/StatusBadge";
import { useClaim } from "../../context/ClaimContext";
import { useNavigate } from "react-router-dom";

export default function InsuranceClaims() {
  const { healthRisk } = useClaim();
  const navigate = useNavigate();

  // Filters
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // Mock claims
  const claims = [
    {
      claimId: "CLM001",
      patient: "Rahul Kumar",
      amount: 45000,
      risk: healthRisk,
      status: "Under Review",
    },
    {
      claimId: "CLM002",
      patient: "Anjali Sharma",
      amount: 30000,
      risk: "Low",
      status: "Approved",
    },
    {
      claimId: "CLM003",
      patient: "Amit Verma",
      amount: 60000,
      risk: "High",
      status: "Pending",
    },
    {
      claimId: "CLM004",
      patient: "Priya Singh",
      amount: 52000,
      risk: "Medium",
      status: "Rejected",
    },
    {
      claimId: "CLM005",
      patient: "Rohan Mehta",
      amount: 20000,
      risk: "Low",
      status: "Approved",
    },
  ];

  // Filtering + Search + Sort
  const processedClaims = useMemo(() => {
    let filtered = [...claims];

    if (riskFilter !== "All") {
      filtered = filtered.filter((c) => c.risk === riskFilter);
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.patient.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) =>
      sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    );

    return filtered;
  }, [riskFilter, statusFilter, searchTerm, sortOrder, healthRisk]);

  // Pagination
  const totalPages = Math.ceil(processedClaims.length / itemsPerPage);
  const paginatedClaims = processedClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Summary counters
  const summary = {
    total: claims.length,
    high: claims.filter((c) => c.risk === "High").length,
    medium: claims.filter((c) => c.risk === "Medium").length,
    low: claims.filter((c) => c.risk === "Low").length,
  };

  return (
    <DashboardLayout role="insurance">
      <h1 className="text-2xl font-bold mb-6">Claim Requests</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Total Claims" value={summary.total} />
        <SummaryCard label="High Risk" value={summary.high} />
        <SummaryCard label="Medium Risk" value={summary.medium} />
        <SummaryCard label="Low Risk" value={summary.low} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">

        {/* Risk Filter */}
        {["All", "High", "Medium", "Low"].map((level) => (
          <button
            key={level}
            onClick={() => {
              setRiskFilter(level);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm ${
              riskFilter === level
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {level}
          </button>
        ))}

        {/* Status Filter */}
        <select
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="All">All Status</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
          <option value="Under Review">Under Review</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by Claim ID or Patient"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded-lg"
        />

        {/* Sort */}
        <button
          onClick={() =>
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
          }
          className="px-4 py-2 bg-gray-300 rounded-lg"
        >
          Sort ₹ {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Claim ID</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Risk</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClaims.map((claim) => (
              <tr
                key={claim.claimId}
                onClick={() =>
                  navigate(`/insurance/claims/${claim.claimId}`)
                }
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3">{claim.claimId}</td>
                <td className="p-3">{claim.patient}</td>
                <td className="p-3">₹{claim.amount}</td>
                <td className="p-3">
                  <RiskBadge level={claim.risk} />
                </td>
                <td className="p-3">
                  <StatusBadge status={claim.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-6 gap-3">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
          (page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}