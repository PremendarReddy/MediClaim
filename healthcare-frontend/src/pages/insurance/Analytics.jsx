import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import api from "../../api/axios";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import { toast } from "react-toastify";

// Beautiful color palettes
const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];
const RISK_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/hospitals/claims');
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Derive Metrics
  const totalClaims = claims.length;
  const approvedClaims = claims.filter(c => ["Approved", "Amount Released"].includes(c.status)).length;
  const totalPayout = claims.filter(c => ["Approved", "Amount Released"].includes(c.status)).reduce((acc, c) => acc + (c.approvedAmount || c.totalAmount || 0), 0);
  const avgProcessingTime = "2.4 Days"; // Mock metric until timestamp diffing implemented
  
  // Aggregate Risk Level Breakdown
  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, PENDING: 0 };
  claims.forEach(c => {
    const risk = c.aiRiskScore || "PENDING";
    if (riskCounts[risk] !== undefined) {
      riskCounts[risk]++;
    }
  });

  const riskData = [
    { name: "Low Risk", value: riskCounts.LOW || Math.max(1, totalClaims * 0.6) }, // Fallbacks for visual demo if DB is empty
    { name: "Medium Risk", value: riskCounts.MEDIUM || Math.max(1, totalClaims * 0.3) },
    { name: "High Risk", value: riskCounts.HIGH || 1 }
  ];

  // Aggregate Status Breakdown
  const statusData = [
    { name: "Paid/Approved", value: approvedClaims },
    { name: "Pending", value: claims.filter(c => !["Approved", "Amount Released", "Rejected"].includes(c.status)).length },
    { name: "Rejected", value: claims.filter(c => c.status === "Rejected").length }
  ];

  // Mock Trend Data (Since timestamps might all be today for demo data)
  const trendData = [
    { month: "Jan", claims: 45, payout: 1200000 },
    { month: "Feb", claims: 52, payout: 1500000 },
    { month: "Mar", claims: 38, payout: 950000 },
    { month: "Apr", claims: 65, payout: 2100000 },
    { month: "May", claims: Math.max(totalClaims, 72), payout: Math.max(totalPayout, 2800000) }
  ];

  const diseaseDistribution = [
    { name: "Cardiology", value: 35 },
    { name: "Orthopedics", value: 25 },
    { name: "Neurology", value: 15 },
    { name: "Oncology", value: 10 },
    { name: "Others", value: 15 },
  ];

  if (loading) {
    return (
      <DashboardLayout role="insurance">
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="insurance">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 leading-tight">Platform Analytics</h1>
        <p className="text-slate-500 font-medium mt-1">Deep-dive into coverage metrics, fraud prevention, and financial distributions.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Payout Yield" value={`₹${totalPayout.toLocaleString()}`} color="text-emerald-600" icon="💰" bgColor="bg-emerald-50" />
        <StatCard title="Approval Rate" value={`${totalClaims ? ((approvedClaims / totalClaims) * 100).toFixed(1) : 0}%`} color="text-blue-600" icon="📈" bgColor="bg-blue-50" />
        <StatCard title="Avg Processing" value={avgProcessingTime} color="text-indigo-600" icon="⚡" bgColor="bg-indigo-50" />
        <StatCard title="Total Claims" value={totalClaims} color="text-purple-600" icon="📄" bgColor="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Financial Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-400 rounded-full"></div> Capital Dispersal Trend
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPayout" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value/100000}L`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Payout']}
                />
                <Area type="monotone" dataKey="payout" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPayout)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Fraud Risk Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h2 className="font-bold text-white mb-2 flex items-center gap-2 relative z-10">
            🤖 AI Risk Distribution
          </h2>
          <p className="text-xs text-slate-400 mb-6 relative z-10">Model confidence spread over total claims</p>
          <div className="h-[220px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs font-bold text-slate-300 relative z-10">
            {riskData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: RISK_COLORS[index % RISK_COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Status Breakdown Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Claim Lifecycle Status
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} width={110} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 6, 6, 0]} maxBarSize={30}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Disease Categorization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-amber-400 rounded-full"></div> Procedural Frequency (Macro)
          </h2>
          <div className="h-[250px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diseaseDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {diseaseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
