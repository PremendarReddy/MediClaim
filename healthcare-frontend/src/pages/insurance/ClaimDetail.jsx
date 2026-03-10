import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { runFraudDetection } from "../../services/agentService";

export default function InsuranceClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [showConfirm, setShowConfirm] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [fraudAnalysis, setFraudAnalysis] = useState(null);
  const [analyzingRisk, setAnalyzingRisk] = useState(false);

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  useEffect(() => {
    if (claim && !fraudAnalysis) {
      handleFraudAnalysis();
    }
  }, [claim]);

  const handleFraudAnalysis = async () => {
    setAnalyzingRisk(true);
    try {
      // Pass simulated age and past claims count for the ML demo
      const res = await runFraudDetection(45, claim.claimAmount, 2);
      if (res.success) {
        setFraudAnalysis(res.data.analysis);
      }
    } catch (error) {
      console.error("AI Fraud Check Failed", error);
    } finally {
      setAnalyzingRisk(false);
    }
  };

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hospitals/claims/${id}`);
      if (res.data.success) {
        setClaim(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load claim details");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (newStatus === 'Rejected' && !rejectReason.trim()) {
      toast.warning("A reason is mandatory for rejecting a claim.");
      return;
    }

    try {
      setUpdating(true);
      const res = await api.put(`/admin/claims/${id}/status`, {
        status: newStatus,
        comment: newStatus === 'Rejected' ? rejectReason : `Status updated to ${newStatus}`
      });
      if (res.data.success) {
        setClaim(res.data.data);
        toast.success(`Claim status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
      setShowConfirm(null);
      setRejectReason("");
    }
  };

  const verifyDocumentParams = async (docId, field, value) => {
    try {
      const payload = {};
      payload[field] = value;
      const res = await api.put(`/admin/claims/${id}/documents/${docId}/status`, payload);
      if (res.data.success) {
        setClaim(res.data.data);
        toast.success(`Document marked as ${field}: ${value}`);
      }
    } catch (error) {
      toast.error("Failed to update document status");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!claim) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-xl font-bold text-slate-800">Claim Not Found</h2>
          <button onClick={() => navigate("/insurance/claims")} className="mt-4 text-indigo-600 font-medium">← Back to Claims</button>
        </div>
      </DashboardLayout>
    )
  }

  // Simulated AI Risk Score if backend is missing
  const simulatedRisk = claim.riskScore || (claim.claimAmount > 500000 ? "High" : claim.claimAmount > 100000 ? "Medium" : "Low");

  // Simulated timeline since backend only provides createdAt and status right now.
  const timeline = [
    { id: 1, status: "Claim Initiated", date: new Date(claim.createdAt).toLocaleString(), isCompleted: true },
    { id: 2, status: "Under Review", date: claim.status !== "Claim Initiated" ? new Date().toLocaleString() : null, isCompleted: claim.status !== "Claim Initiated" },
    { id: 3, status: claim.status, date: ["Approved", "Rejected", "Pre-Authorized"].includes(claim.status) ? new Date().toLocaleString() : null, isCompleted: ["Approved", "Rejected", "Pre-Authorized"].includes(claim.status) }
  ];

  const hospitalReports = claim.documents || [];

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/insurance/claims")} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
          ←
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Claim Review</h1>
          <p className="text-slate-500 text-sm">Reviewing claim documentation for ID: <span className="font-mono">{claim._id.substring(0, 8).toUpperCase()}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Main Claim Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Information
            </h2>
            <StatusBadge status={claim.status} />
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Patient</p>
              <p className="font-bold text-slate-800 text-lg">{claim.patientId?.name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hospital</p>
              <p className="font-bold text-slate-800 text-lg">{claim.hospitalId?.name || "Connected Hospital"}</p>
              <p className="text-sm font-medium text-slate-500">{claim.hospitalId?.email || ""}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Disease / Procedure</p>
              <p className="font-bold text-slate-800 text-lg">{claim.disease}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requested Amount</p>
              <p className="text-3xl font-black text-indigo-600">₹{claim.claimAmount?.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        {/* AI Risk Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-slate-800 to-indigo-950 p-6 rounded-3xl shadow-lg border border-indigo-900 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

          <h2 className="font-bold text-indigo-200 mb-4 flex items-center gap-2 relative z-10 text-sm tracking-wider uppercase">
            🤖 AI Fraud & Risk Analysis
          </h2>

          {analyzingRisk ? (
            <div className="flex flex-col items-center justify-center flex-1 z-10">
              <span className="w-8 h-8 border-4 border-indigo-400 border-t-white rounded-full animate-spin mb-3"></span>
              <p className="text-sm font-medium text-indigo-200 animate-pulse">Running ML Models...</p>
            </div>
          ) : fraudAnalysis ? (
            <>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold shadow-inner fallback-blur-md">
                  {fraudAnalysis.riskLevel === "High" ? "🚨" : fraudAnalysis.riskLevel === "Medium" ? "⚠️" : "✅"}
                </div>
                <div>
                  <p className="font-black text-2xl tracking-tight leading-none mb-1">{fraudAnalysis.riskLevel} Risk</p>
                  <p className="text-indigo-200/80 text-xs font-bold uppercase tracking-wider">Confidence: {(fraudAnalysis.confidence * 100).toFixed(0)}%</p>
                </div>
              </div>

              <p className="text-sm text-indigo-100/90 leading-relaxed relative z-10 p-3 bg-white/5 rounded-xl border border-white/10 font-medium h-full overflow-y-auto hide-scrollbar">
                {fraudAnalysis.flags.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-1">
                    {fraudAnalysis.flags.map((flag, idx) => <li key={idx}>{flag}</li>)}
                  </ul>
                ) : (
                  "No anomalies detected. Amount matches expected ranges for this procedure type."
                )}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 z-10">
              <p className="text-sm font-medium text-indigo-300">Analysis Unavailable</p>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Documents and Checklist View */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-6 bg-amber-400 rounded-full"></div> Document Verification System
            </h2>
          </div>
          <div className="p-6">
            {hospitalReports.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-sm font-bold text-slate-400">No documents found attached to this claim.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hospitalReports.map((doc, idx) => (
                  <div key={doc._id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors gap-4">

                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">📄</div>
                      <div>
                        <p className="font-bold text-indigo-900">{doc.docType}</p>
                        <p className="text-xs text-slate-500 font-medium">{doc.remarks || "No remarks"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.received}
                          onChange={(e) => verifyDocumentParams(doc._id, 'received', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-sm font-bold text-slate-700">Received</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={doc.verified}
                          onChange={(e) => verifyDocumentParams(doc._id, 'verified', e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                          disabled={!doc.received}
                        />
                        <span className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition">Verified</span>
                      </label>

                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm hover:bg-indigo-700 shadow-sm transition">
                        View File ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-400 rounded-full"></div> Progress Timeline
          </h2>
          <div className="space-y-6 flex-1 py-4 px-2">
            {timeline.map((item, index) => (
              <div key={item.id} className="flex gap-4 relative">
                {/* Timeline Line Connector */}
                {index !== timeline.length - 1 && (
                  <div className={`absolute top-8 left-[11px] bottom-[-24px] w-0.5 ${item.isCompleted ? 'bg-indigo-200' : 'bg-slate-100'}`}></div>
                )}

                <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center -ml-1 mt-0.5 border-4 transition-colors ${item.isCompleted ? 'bg-indigo-600 border-indigo-100' : 'bg-white border-slate-200'
                  }`}>
                  {item.isCompleted && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                <div>
                  <p className={`font-bold ${item.isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{item.status}</p>
                  {item.date && <p className="text-xs font-bold text-slate-400 mt-1">{item.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-end">
        <span className="font-bold text-slate-400 uppercase text-xs tracking-wider mr-auto hidden sm:block">Decision Actions</span>

        <button
          disabled={["Approved", "Rejected"].includes(claim.status) || updating}
          onClick={() => setShowConfirm("Pre-Authorized")}
          className="px-6 py-3 rounded-xl font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Pre-Authorize
        </button>

        <button
          disabled={["Approved", "Rejected"].includes(claim.status) || updating}
          onClick={() => setShowConfirm("Pending-Docs")}
          className="px-6 py-3 rounded-xl font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Request Docs
        </button>

        <button
          disabled={["Approved", "Rejected"].includes(claim.status) || updating}
          onClick={() => setShowConfirm("Rejected")}
          className="px-6 py-3 rounded-xl font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Reject
        </button>

        <button
          disabled={["Approved", "Rejected"].includes(claim.status) || updating}
          onClick={() => setShowConfirm("Approved")}
          className="px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Approve Entire Claim
        </button>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 ${showConfirm === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {showConfirm === 'Rejected' ? '!' : '?'}
              </div>
              <h2 className="text-xl font-black text-slate-800 text-center mb-2">
                Confirm Decision
              </h2>
              <p className="text-center text-slate-500 font-medium mb-6">
                Are you sure you want to mark this claim as <span className="font-bold text-slate-700">{showConfirm === 'Pending-Docs' ? 'Pending Documents' : showConfirm}</span>?
              </p>

              {showConfirm === "Rejected" && (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason (Required) *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a detailed reason for the rejection..."
                    rows={3}
                    className="w-full border border-rose-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none font-medium text-slate-700"
                  />
                  {!rejectReason.trim() && (
                    <p className="text-xs text-rose-500 mt-2 font-bold">This field cannot be empty.</p>
                  )}
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => { setShowConfirm(null); setRejectReason(""); }}
                  disabled={updating}
                  className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => updateStatus(showConfirm === 'Pending-Docs' ? 'Pending' : showConfirm)}
                  disabled={updating || (showConfirm === "Rejected" && !rejectReason.trim())}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${showConfirm === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
                >
                  {updating && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}