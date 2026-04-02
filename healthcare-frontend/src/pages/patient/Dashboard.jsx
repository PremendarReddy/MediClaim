import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatCard from "../../components/cards/StatCard";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({ healthRisk: "Analyzing...", expenses: [] });

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);

      const [claimsRes, profileRes, slotsRes] = await Promise.all([
        api.get('/patients/claims'),
        api.get('/auth/profile'),
        api.get('/patients/slots')
      ]);

      if (claimsRes.data.success && profileRes.data.success && slotsRes.data.success) {
        const liveProfile = profileRes.data.data;
        const allSlots = slotsRes.data.data;
        const myBookedSlots = allSlots.filter(s => s.bookedPatients.some(p => p.patientId === user?._id || p.patientId === user?.id));

        try {
            const analyticsRes = await api.get('/patients/analytics');
            if(analyticsRes.data.success) {
                setAnalytics(analyticsRes.data.data);
            }
        } catch(e) { console.error("Analytics pull failed."); }

        let checkupDate = liveProfile.patientDetails?.nextCheckupDate;
        if (checkupDate && new Date(checkupDate) < new Date(new Date().setHours(0,0,0,0))) {
             checkupDate = "Not Scheduled";
        }

        setPatientData({ 
           ...user, 
           claims: claimsRes.data.data,
           contextStatus: liveProfile.patientDetails?.status || "Active",
           nextCheckup: checkupDate || "Not Scheduled",
           bookedSlots: myBookedSlots
        });
      }
    } catch (error) {
      console.error("Failed to load patient data", error);
      toast.error("Could not load your dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const activeClaims = patientData?.claims?.filter(c => !["Approved", "Amount Released", "Rejected"].includes(c.status)).length || 0;
  const healthRisk = analytics.healthRisk;
  const reportsCount = patientData?.claims?.reduce((acc, c) => acc + (c.documents?.length || 0), 0) || 0;

  // Dynamic Insurance Data
  const coverageLimit = Number(patientData?.patientDetails?.insuranceDetails?.coverageAmount) || 0;
  const totalUtilized = patientData?.claims?.filter(c => ["Approved", "Amount Released"].includes(c.status)).reduce((acc, c) => acc + (c.approvedAmount || c.totalAmount || 0), 0) || 0;
  const availableRemaining = Math.max(0, coverageLimit - totalUtilized);
  const utilizationPercentage = coverageLimit > 0 ? Math.min(100, (totalUtilized / coverageLimit) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {patientData?.name?.split(' ')[0] || user?.name || "Patient"} 👋
          </h1>
          <p className="text-slate-500">Track your health data and insurance claims from one place.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 w-fit">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg">
            {patientData?.contextStatus === 'Discharged' ? '🏠' : patientData?.contextStatus === 'Pending' ? '⏳' : '🏥'}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Account Status</p>
            <p className="font-bold text-slate-800 text-sm">{patientData?.contextStatus}</p>
          </div>
        </div>
      </div>

      {/* === KPI CARDS === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Active Claims" value={activeClaims} color="text-indigo-600" icon="📊" delay={0.1} />
        <StatCard title="Health Risk" value={healthRisk} color="text-amber-500" icon="❤️" delay={0.2} />
        <StatCard title="Reports Uploaded" value={reportsCount} color="text-emerald-600" icon="📑" delay={0.3} />
        <StatCard title="Upcoming Appts" value={patientData?.bookedSlots?.length || 0} color="text-purple-600" icon="🏥" delay={0.4} />
      </div>

      {/* === MAIN CONTENT GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          {/* Insurance Overview */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Insurance Coverage
            </h2>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div className="bg-black/20 p-5 rounded-2xl border border-white/10">
                <p className="text-sm font-medium text-indigo-200 mb-1">Coverage Limit</p>
                <p className="font-bold text-3xl">₹{coverageLimit.toLocaleString()}</p>
              </div>
              <div className="bg-black/20 p-5 rounded-2xl border border-white/10">
                <p className="text-sm font-medium text-indigo-200 mb-1">Total Utilized</p>
                <p className="font-bold text-3xl">₹{totalUtilized.toLocaleString()}</p>
              </div>
              <div className="col-span-2 bg-indigo-950/50 p-5 rounded-2xl border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-indigo-200 mb-1">Available Remaining</p>
                  <p className="font-bold text-2xl text-emerald-400">₹{availableRemaining.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full border-4 border-indigo-700 border-t-emerald-400 transform rotate-45 flex items-center justify-center bg-indigo-900 shadow-inner">
                  <span className="text-xs font-bold -rotate-45">{Math.round(100 - utilizationPercentage)}%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Health Expenses Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-teal-500 rounded-full"></div> Health Expenses (YTD)
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.expenses.length > 0 ? analytics.expenses : [{ month: "Jan", cost: 0 }]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="cost" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Reports */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Medical Documents
              </h2>
              <button onClick={() => navigate("/patient/reports")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition">View All</button>
            </div>

            {reportsCount === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-50 text-2xl flex items-center justify-center rounded-2xl mx-auto mb-3 text-slate-400">📄</div>
                <p className="font-bold text-slate-600">No Medical Documents</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">Hospitals will upload your medical reports, bills, and prescriptions here securely.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientData?.claims?.map(c => c.documents).flat().filter(Boolean).slice(0, 3).map((report, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer group">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">🏥</div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-slate-800 text-sm truncate">{report.docType}</p>
                      <p className="text-xs text-slate-500 font-medium truncate">Synced securely via connected hospital</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (report.fileUrl && report.fileUrl.startsWith('mock-storage://')) {
                          toast.info(`Simulated view: ${report.fileUrl.replace('mock-storage://', '')}`);
                        } else if (report.fileUrl) {
                          window.open(report.fileUrl, '_blank', 'noreferrer');
                        } else {
                          toast.error('No valid file URL found.');
                        }
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition shrink-0"
                    >
                      View ↗
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Upcoming Appointment */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">

            <h2 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-rose-500 rounded-full"></div> Next Consultation
            </h2>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 mb-4 relative z-10">
              <p className="text-sm font-bold text-rose-800 mb-1">Scheduled Date</p>
              <p className="text-xs font-semibold text-rose-600/70 mb-3 ml-0.5">Assigned by your Hospital</p>

              <div className="bg-white rounded-xl p-3 border border-rose-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-700 text-sm">
                  📅 {patientData?.nextCheckup !== "Not Scheduled" ? new Date(patientData?.nextCheckup).toLocaleDateString() : 'None Scheduled'}
                </div>
                {patientData?.nextCheckup !== "Not Scheduled" && (
                  <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></div>
                )}
              </div>
            </div>
            <p className="text-xs font-medium text-slate-500 px-1 text-center">Contact your hospital for rescheduling</p>
          </motion.div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-6">
            <h2 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
              <div className="w-2 h-6 bg-slate-800 rounded-full"></div> Tools
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/patient/ai-analysis")}
                className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition flex items-center justify-between group"
              >
                <span>AI Medical Analysis</span>
                <span className="opacity-50 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                onClick={() => navigate("/patient/claims")}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition flex items-center justify-between group"
              >
                <span>View Active Claims</span>
                <span className="opacity-50 group-hover:opacity-100 transition">→</span>
              </button>

              <button
                onClick={() => navigate("/patient/book-appointment")}
                className="w-full bg-white text-slate-700 border-2 border-slate-200 font-bold py-3 px-4 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-between group"
              >
                <span>Book Doctor Appointment</span>
                <span className="opacity-50 group-hover:opacity-100 transition">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
