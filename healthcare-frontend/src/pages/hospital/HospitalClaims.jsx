import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function HospitalClaims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals/claims');
      if (res.data.success) {
        // Augment deeply nested Claims with simulated AI Risk parameters (consistent with Insurer Views)
        const augmented = res.data.data.map(c => {
          let simulatedRisk = "LOW";
          if (c.totalAmount > 500000) simulatedRisk = "HIGH";
          else if (c.totalAmount > 100000) simulatedRisk = "MEDIUM";
          
          return { 
             ...c, 
             aiRiskScore: (c.aiRiskScore && c.aiRiskScore !== "PENDING") ? c.aiRiskScore : simulatedRisk 
          };
        });
        setClaims(augmented);
      }
    } catch (error) {
      toast.error("Failed to fetch claims");
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filterStatus === "All Status" || claim.status === filterStatus;
    const matchesSearch =
      claim.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim._id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Insurance Claims</h1>
          <p className="text-slate-500 mt-1">Track and manage reimbursement requests</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/hospital/create-claim")}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Initiate Claim
        </motion.button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 mb-1">Total Claims</p>
          <p className="text-3xl font-bold text-slate-800">
            {loading ? "..." : claims.length}
          </p>
        </div>
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-700 mb-1">Approved</p>
          <p className="text-3xl font-bold text-emerald-600">
            {loading ? "..." : claims.filter((c) => ["Approved", "Amount Released"].includes(c.status)).length}
          </p>
        </div>
        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
          <p className="text-sm font-semibold text-amber-700 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-amber-600">
            {loading ? "..." : claims.filter((c) => !["Approved", "Rejected", "Amount Released"].includes(c.status)).length}
          </p>
        </div>
        <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100">
          <p className="text-sm font-semibold text-rose-700 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-rose-600">
            {loading ? "..." : claims.filter((c) => c.status === "Rejected").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-400">🔍</span>
          </div>
          <input
            type="search"
            placeholder="Search by patient name or claim ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          />
        </div>
        <select
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-slate-700 min-w-[200px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All Status">All Status</option>
          <option value="Pending Documents">Pending Documents</option>
          <option value="Claim Initiated">Claim Initiated</option>
          <option value="Pre-Authorization Pending">Pre-Authorization Pending</option>
          <option value="Under Review">Under Review</option>
          <option value="Approved">Approved</option>
          <option value="Amount Released">Amount Released</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Claim ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patient Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Requested Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  AI Risk Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date Submitted
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="mt-2 text-slate-500 font-medium">Loading claims...</p>
                  </td>
                </tr>
              ) : filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <div className="text-5xl mb-4">📄</div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">No claims found</h3>
                    <p className="text-slate-500">There are no matching insurance claims in the system.</p>
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-slate-600">
                      {claim._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center font-bold text-xs mr-3">
                          {claim.patientId?.name?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {claim.patientId?.name || "Unknown Patient"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800">
                      ₹{claim.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${claim.aiRiskScore === "HIGH"
                            ? "bg-rose-100 text-rose-700"
                            : claim.aiRiskScore === "MEDIUM"
                              ? "bg-amber-100 text-amber-700"
                              : claim.aiRiskScore === "LOW"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {claim.aiRiskScore === "PENDING" ? "Pending" : claim.aiRiskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/hospital/claims/${claim._id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-bold text-sm px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
