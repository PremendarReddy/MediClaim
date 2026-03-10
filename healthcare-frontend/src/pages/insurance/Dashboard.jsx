import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

export default function InsuranceDashboard() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals/claims');
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Aggregations
  const totalClaims = claims.length;
  const approvedClaims = claims.filter((item) => item.status === "Approved").length;
  const pendingClaims = claims.filter((item) => item.status.includes("Pending")).length;
  const rejectedClaims = claims.filter((item) => item.status === "Rejected").length;

  const statusData = [
    { name: "Approved", value: approvedClaims },
    { name: "Pending", value: pendingClaims },
    { name: "Rejected", value: rejectedClaims },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  // Mock Trend since real creation dates might group up in one month
  const insuranceClaimsTrend = [
    { month: "Jan", claims: Math.max(10, totalClaims * 0.1) },
    { month: "Feb", claims: Math.max(15, totalClaims * 0.2) },
    { month: "Mar", claims: Math.max(25, totalClaims * 0.3) },
    { month: "Apr", claims: Math.max(20, totalClaims * 0.15) },
    { month: "May", claims: totalClaims },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Overview Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time statistics and processing queue for insurance claims.</p>
      </div>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Claims Received"
          value={totalClaims}
          color="text-indigo-600"
          icon="📥"
          bgColor="bg-indigo-50"
        />
        <StatCard
          title="Approved Claims"
          value={approvedClaims}
          color="text-emerald-600"
          icon="✅"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Pending Queue"
          value={pendingClaims}
          color="text-amber-500"
          icon="⏳"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Rejected Claims"
          value={rejectedClaims}
          color="text-rose-600"
          icon="❌"
          bgColor="bg-rose-50"
        />
      </div>

      {/* === CHART SECTION === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Status Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Claim Status Distribution
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                {d.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-400 rounded-full"></div> Volume Trend
          </h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={insuranceClaimsTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="claims" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* === RECENT ACTIVITY + QUICK ACTIONS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-teal-400 rounded-full"></div> Recently Submitted
            </h2>
            <button onClick={() => navigate("/insurance/claims")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All →</button>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-bold text-slate-500">No recent claim activity.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {claims
                .slice()
                .reverse()
                .slice(0, 5)
                .map((item) => (
                  <div key={item._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white transition-colors cursor-pointer" onClick={() => navigate(`/insurance/claims/${item._id}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-lg">
                        📄
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.patientId?.name || "Unknown Patient"}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">ID: {item._id.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="font-bold text-slate-800">₹{item.claimAmount?.toLocaleString()}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 rounded-3xl shadow-xl border border-indigo-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

          <h2 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            ⚡ Quick Actions
          </h2>

          <div className="space-y-3 relative z-10">
            <button onClick={() => navigate("/insurance/claims")} className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 transition-all flex items-center justify-between px-5">
              <span>Review Pending Claims</span>
              <span>→</span>
            </button>

            <button onClick={() => navigate("/insurance/claims")} className="w-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-100 font-bold py-3.5 rounded-xl hover:bg-emerald-500/30 transition-all flex items-center justify-between px-5">
              <span>View Approved Claims</span>
              <span>→</span>
            </button>

            <button className="w-full bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-100 font-bold py-3.5 rounded-xl hover:bg-purple-500/30 transition-all flex items-center justify-between px-5 mt-6">
              <span className="flex items-center gap-2">🤖 AI Risk Panel</span>
              <span>→</span>
            </button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}