import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#16a34a", "#eab308", "#dc2626"];

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    reportsUploaded: 0,
    pendingClaims: 0,
    alerts: 0
  });
  const [claims, setClaims] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Patients
      const patientsRes = await api.get('/hospitals/patients');

      // In a real expanded API we'd fetch actual claims for this hospital.
      // For now, we mock some activity as placeholder until Hospital Claims route is built

      setStats({
        totalPatients: patientsRes.data.count || patientsRes.data.data?.length || 0,
        reportsUploaded: Math.floor(Math.random() * 50) + 10,
        pendingClaims: 8,
        alerts: 2
      });

      // Mock recent activity feed since actual API claims endpoint might not be populated in this DB yet
      setClaims([
        { id: "CLM-992", patient: "John Doe", status: "AI Verified", time: "10 mins ago", type: "Discharge" },
        { id: "CLM-991", patient: "Sarah Smith", status: "Fraud Check", time: "1 hour ago", type: "Surgery" },
        { id: "CLM-990", patient: "Mike Ross", status: "Approved", time: "3 hours ago", type: "Consultation" },
        { id: "CLM-989", patient: "Emma Stone", status: "Needs Docs", time: "5 hours ago", type: "Pharmacy" }
      ]);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      setLoading(false);
    }
  };

  // Mock charts for dashboard visual purposes
  const monthlyAdmissions = [
    { month: "Jan", patients: 12 },
    { month: "Feb", patients: 19 },
    { month: "Mar", patients: 15 },
    { month: "Apr", patients: 25 },
    { month: "May", patients: 22 },
  ];

  const claimDistribution = [
    { name: "Approved", value: 45 },
    { name: "Pending", value: 25 },
    { name: "Rejected", value: 10 },
  ];

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Hospital Command Center</h1>
          <p className="text-slate-500 mt-1">Manage your patients, track claims, and monitor analytics.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/hospital/add-patient")}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Add Patient
        </motion.button>
      </div>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Registered Patients"
          value={loading ? "..." : stats.totalPatients}
          color="text-indigo-600 dark:text-indigo-400"
          icon="👥"
          delay={0.1}
        />
        <StatCard
          title="Uploaded Reports"
          value={loading ? "..." : stats.reportsUploaded}
          color="text-emerald-600 dark:text-emerald-400"
          icon="📄"
          delay={0.2}
        />
        <StatCard
          title="Pending Auth"
          value={loading ? "..." : stats.pendingClaims}
          color="text-amber-500 dark:text-amber-400"
          icon="⏳"
          delay={0.3}
        />
        <StatCard
          title="Critical Alerts"
          value={loading ? "..." : stats.alerts}
          color="text-rose-500 dark:text-rose-400"
          icon="🚨"
          delay={0.4}
        />
      </div>

      {/* === CHART SECTION === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Monthly Admissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6">Monthly Admissions</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyAdmissions}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="patients" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Claim Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6">Claim Success Distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={claimDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
              >
                {claimDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {claimDistribution.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* === RECENT CLAIM ACTIVITY === */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Claim Processing</h2>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-50 rounded-xl" />
              ))}
            </div>
          ) : claims.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">📄</div>
              <p className="text-slate-600 font-medium">No claims initiated yet.</p>
              <p className="text-sm text-slate-400 mt-1">Add a patient to start your first claim</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-slate-100 z-0"></div>
              {claims.map((claim, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  key={claim.id}
                  className="flex gap-4 relative z-10 group"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center shrink-0 bg-slate-50 text-xl overflow-hidden group-hover:scale-110 transition-transform">
                    {claim.status === "AI Verified" ? "✨" : claim.status === "Fraud Check" ? "🛡️" : claim.status === "Approved" ? "✅" : "⚠️"}
                  </div>
                  <div className="bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl p-4 flex-1 transition-colors flex justify-between items-center cursor-pointer">
                    <div>
                      <p className="font-bold text-slate-800 text-sm mb-0.5">
                        {claim.patient} <span className="font-mono text-xs text-slate-400 font-normal ml-2">{claim.id}</span>
                      </p>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span className={
                          claim.status === "AI Verified" ? "text-indigo-600" :
                            claim.status === "Fraud Check" ? "text-amber-500" :
                              claim.status === "Approved" ? "text-emerald-500" : "text-rose-500"
                        }>{claim.status}</span> • {claim.type}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{claim.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* === QUICK ACTIONS === */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] rounded-full bg-blue-500/20 blur-3xl mix-blend-screen pointer-events-none"></div>

          <h2 className="text-lg font-bold mb-6 text-slate-100 relative z-10">Action Center</h2>

          <div className="space-y-4 relative z-10">
            <button
              onClick={() => navigate("/hospital/patients")}
              className="w-full bg-white/10 hover:bg-white/20 text-white py-3.5 px-4 rounded-xl flex items-center justify-between transition-colors border border-white/10"
            >
              <span className="font-medium text-sm">Patient Directory</span>
              <span>→</span>
            </button>

            <button
              onClick={() => navigate("/hospital/claims")}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 px-4 rounded-xl flex items-center justify-between transition-colors shadow-lg shadow-blue-500/30"
            >
              <span className="font-medium text-sm">Review Active Claims</span>
              <span>→</span>
            </button>

            <button
              onClick={() => navigate("/hospital/doctor-slots")}
              className="w-full bg-white/5 hover:bg-white/10 text-white py-3.5 px-4 rounded-xl flex items-center justify-between transition-colors border border-white/5"
            >
              <span className="font-medium text-sm">Manage Doctor Slots</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}