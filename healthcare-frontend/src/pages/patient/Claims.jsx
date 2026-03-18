import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import StatusBadge from "../../components/ui/StatusBadge";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientClaims() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    file: null,
  });

  useEffect(() => {
    fetchPatientClaims();
  }, []);

  const fetchPatientProfile = async () => {
    // Optional: grab patient _id to filter claims accurately.
    // For mock purpose we grab all claims and filter by email.
  };

  const fetchPatientClaims = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients/claims');
      if (res.data.success) {
        setClaims(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch claims:", error);
      toast.error("Could not load your insurance claims.");
    } finally {
      setLoading(false);
    }
  };

  const requiredDocuments = [
    "ID Proof (Aadhaar/PAN/DL)",
    "Policy/Health Card",
    "Doctor's Prescriptions",
    "Hospital Discharge Summary",
    "Bills & Receipts",
    "Investigation Reports",
    "Ambulance Receipt",
    "Bank Details (for reimbursement)",
  ];

  const handleDocumentUpload = (e) => {
    e.preventDefault();
    if (!uploadForm.documentType || !uploadForm.file || !selectedClaim) {
      toast.warning("Please fill all fields");
      return;
    }

    // Mock API Call
    toast.success(`Successfully uploaded ${uploadForm.documentType}`);
    setUploadForm({ documentType: "", file: null });
    setShowUploadModal(false);
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Insurance Claims</h1>
        <p className="text-slate-500">Track and manage your medical reimbursement requests.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Claims</p>
          <p className="text-4xl font-bold text-slate-800">{claims.length}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 shadow-sm">
          <p className="text-sm font-bold text-emerald-600/80 uppercase tracking-wider mb-2">Approved</p>
          <p className="text-4xl font-bold text-emerald-600">
            {claims.filter((c) => ["Approved", "Amount Released"].includes(c.status)).length}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
          <p className="text-sm font-bold text-amber-600/80 uppercase tracking-wider mb-2">Pending</p>
          <p className="text-4xl font-bold text-amber-600">
            {claims.filter((c) => c.status.includes("Pending") || c.status === "Claim Initiated").length}
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
          <p className="text-sm font-bold text-indigo-600/80 uppercase tracking-wider mb-2">Under Review</p>
          <p className="text-4xl font-bold text-indigo-600">
            {claims.filter((c) => c.status === "Under Review").length}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Claims List */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Active Requests
          </h2>

          <AnimatePresence>
            {claims.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6 text-4xl shadow-inner border border-slate-100">
                  📄
                </div>
                <p className="text-xl font-bold text-slate-800 mb-2">No Active Claims</p>
                <p className="text-slate-500 max-w-sm mx-auto">You do not have any active insurance claims linked to your email address at this time.</p>
              </div>
            ) : (
              claims.map((claim) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={claim._id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-indigo-100">
                        🏥
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg mb-1">{claim.hospitalId?.name || "Connected Hospital"}</p>
                        <p className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 w-fit">ID: {claim._id.substring(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2">
                      <p className="text-2xl font-black text-slate-800">₹{claim.totalAmount?.toLocaleString()}</p>
                      <StatusBadge status={claim.status} />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim);
                        setShowUploadModal(true);
                      }}
                      className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition flex items-center gap-2"
                    >
                      <span>📤</span> Upload Docs
                    </button>
                    <button
                      onClick={() => navigate(`/patient/claims/${claim._id}`)}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-100 hover:border-indigo-200 transition flex items-center gap-2"
                    >
                      View Details <span>→</span>
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Required Documents Section */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <div className="w-2 h-6 bg-emerald-400 rounded-full"></div> 📋 Required Documents
            </h2>
            <p className="text-sm font-medium text-slate-300 mb-6 relative z-10 leading-relaxed">
              To ensure swift processing of your claims via the AI Verification Agent, please ensure these documents are readily available.
            </p>

            <div className="space-y-3 relative z-10">
              {requiredDocuments.map((doc, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                  key={doc}
                  className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5 hover:bg-white/15 transition cursor-default"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0">✓</div>
                  <span className="text-sm text-slate-200 font-medium">{doc}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal (Framer Motion) */}
      <AnimatePresence>
        {showUploadModal && selectedClaim && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full mx-auto border border-slate-100"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto text-indigo-600 shadow-inner">
                📤
              </div>

              <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">
                Upload Document
              </h2>
              <p className="text-slate-500 text-sm text-center mb-8 font-mono bg-slate-50 py-1 rounded-lg border border-slate-100">
                Target: {selectedClaim._id.substring(0, 12)}...
              </p>

              <form onSubmit={handleDocumentUpload} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Document Classification
                  </label>
                  <select
                    value={uploadForm.documentType}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        documentType: e.target.value,
                      })
                    }
                    className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:ring-0 transition-colors font-medium text-slate-700 bg-slate-50 appearance-none cursor-pointer"
                    required
                  >
                    <option value="">-- Select Type --</option>
                    {requiredDocuments.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Secure File Selection
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file: e.target.files[0],
                        })
                      }
                      className="w-full border-2 border-slate-200 border-dashed rounded-xl px-4 py-6 text-sm text-center text-slate-500 font-medium hover:bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer file:hidden"
                      required
                    />
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <span className="text-2xl mb-2">📁</span>
                      <span className="text-sm font-bold text-slate-600">{uploadForm.file ? uploadForm.file.name : "Click or drag to select"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 mt-8 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-white text-slate-700 font-bold py-3.5 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                    disabled={!uploadForm.file || !uploadForm.documentType}
                  >
                    Secure Upload
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
