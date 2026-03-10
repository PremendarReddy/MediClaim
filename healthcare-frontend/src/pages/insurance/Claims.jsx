import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function InsuranceClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals/claims');
      if (res.data.success) {
        // Augment with simulated AI risk score if missing
        const augmented = res.data.data.map(c => {
          let simulatedRisk = "Low";
          if (c.claimAmount > 500000) simulatedRisk = "High";
          else if (c.claimAmount > 100000) simulatedRisk = "Medium";
          return { ...c, risk: c.riskScore || simulatedRisk };
        });
        setClaims(augmented);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  // Filtering + Search + Sort
  const processedClaims = useMemo(() => {
    let filtered = [...claims];

    if (riskFilter !== "All") {
      filtered = filtered.filter((c) => c.risk === riskFilter);
    }

    if (statusFilter !== "All") {
      if (statusFilter === "Pending") {
        filtered = filtered.filter((c) => c.status.includes("Pending") || c.status === "Claim Initiated");
      } else {
        filtered = filtered.filter((c) => c.status === statusFilter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.patientId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) =>
      sortOrder === "asc" ? a.claimAmount - b.claimAmount : b.claimAmount - a.claimAmount
    );

    return filtered;
  }, [riskFilter, statusFilter, searchTerm, sortOrder, claims]);

  // Pagination
  const totalPages = Math.ceil(processedClaims.length / itemsPerPage) || 1;
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
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Claim Requests</h1>
          <p className="text-slate-500 mt-1">Review, authorize, and investigate medical claims.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SummaryCard label="Total Requests" value={summary.total} icon="📬" color="text-indigo-600" bg="bg-indigo-50" />
            <SummaryCard label="High Risk" value={summary.high} icon="🚨" color="text-rose-600" bg="bg-rose-50" />
            <SummaryCard label="Medium Risk" value={summary.medium} icon="⚠️" color="text-amber-600" bg="bg-amber-50" />
            <SummaryCard label="Low Risk" value={summary.low} icon="✅" color="text-emerald-600" bg="bg-emerald-50" />
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Filters Bar */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">

              <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                {["All", "High", "Medium", "Low"].map((level) => (
                  <button
                    key={level}
                    onClick={() => { setRiskFilter(level); setCurrentPage(1); }}
                    className={`px-4 py-2 font-bold text-sm rounded-lg transition-all ${riskFilter === level
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    {level === "All" ? "All Risks" : level}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 items-center">
                <select
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="border border-slate-200 bg-white font-bold text-sm text-slate-700 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Auth</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search ID or Patient..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="border border-slate-200 bg-white font-medium text-sm text-slate-700 px-4 py-2.5 pl-10 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-64"
                  />
                  <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  Amount {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Information</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient & Hospital</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Requested Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">AI Risk</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedClaims.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-500 font-medium">No claims match your filters.</td>
                    </tr>
                  ) : (
                    paginatedClaims.map((claim) => (
                      <tr
                        key={claim._id}
                        onClick={() => navigate(`/insurance/claims/${claim._id}`)}
                        className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{claim.disease || "Medical Procedure"}</p>
                          <p className="text-xs font-bold text-slate-400 font-mono mt-1">ID: {claim._id.substring(0, 8).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">{claim.patientId?.name || "Unknown Patient"}</p>
                          <p className="text-xs font-bold text-slate-500 mt-1">{claim.hospitalId?.name || "Connected Hospital"}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-lg font-black text-slate-800">₹{claim.claimAmount?.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${claim.risk === 'High' ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-[0_0_10px_rgba(244,63,94,0.3)]' :
                              claim.risk === 'Medium' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}>
                            {claim.risk} Risk
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={claim.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${currentPage === page
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, icon, color, bg }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 relative overflow-hidden group hover:border-indigo-100 transition-colors">
      <div className={`w-14 h-14 rounded-2xl ${bg} ${color} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <p className={`text-3xl font-black ${color}`}>{value}</p>
      </div>
      <div className={`absolute top-0 right-0 w-24 h-24 ${bg} rounded-full blur-2xl -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity`}></div>
    </motion.div>
  );
}