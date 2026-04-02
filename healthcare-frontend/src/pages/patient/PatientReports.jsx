import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getMedicalInsights } from "../../services/agentService";

export default function PatientReports() {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState("All");

  const [analyzing, setAnalyzing] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const navigate = useNavigate();

  const handleDownload = async (fileUrl, fileName) => {
    if (!fileUrl) {
       toast.error("No valid file URL available.");
       return;
    }
    if (fileUrl.startsWith('mock-storage://')) {
       toast.info(`Simulated download: ${fileUrl.replace('mock-storage://', '')}`);
       return;
    }
    try {
        toast.info("Initiating secure download...");
        // If fileUrl is fully qualified or relative, axios can handle it.
        const response = await api.get(fileUrl, { responseType: 'blob' });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', fileName || 'Document.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        // Fallback natively to window.open if CORS or strict headers block blob streams
        window.open(fileUrl, '_blank', 'noreferrer');
        toast.warning("File opened in new tab. Browser blocked native download.");
    }
  };

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        const medicalHistory = res.data.data?.patientDetails?.medicalHistory || [];
        
        // Build unified Reports array from the medical vault
        const vaultedDocs = medicalHistory.map(doc => ({
           ...doc,
           id: doc._id,
           type: doc.docType || 'General',
           name: doc.docName || doc.docType || 'Document',
           date: doc.uploadedDate || new Date(),
           fileUrl: doc.fileUrl,
           status: 'Verified' // Since it comes from the hospital
        }));
        
        // Try to optionally fetch claim docs if available
        let claimDocs = [];
        try {
           const claimsRes = await api.get('/patients/claims');
           if (claimsRes.data.success) {
               const vaultedUrls = vaultedDocs.map(d => d.fileUrl).filter(Boolean);
               claimDocs = claimsRes.data.data.flatMap(claim => 
                  (claim.documents || [])
                    .filter(doc => !vaultedUrls.includes(doc.fileUrl))
                    .map(doc => ({
                       ...doc,
                       id: doc._id,
                       type: doc.docType || 'General',
                       name: doc.docType || 'Claim Document', 
                       date: claim.createdAt,
                       doctorName: claim.hospitalId?.name,
                       status: doc.verified ? 'Verified' : (doc.received ? 'Received' : 'Uploaded')
                  }))
               );
           }
        } catch(e) { }

        setPatientData({ reports: [...vaultedDocs, ...claimDocs] });
      }
    } catch (error) {
      console.error("Failed to load patient claims for reports", error);
      toast.error("Could not load your medical reports");
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    "Blood Test",
    "X-Ray",
    "CT Scan",
    "Ultrasound",
    "ECG",
    "Discharge Summary",
    "Prescription",
    "Hospital Bill",
    "Other"
  ];

  const hospitalReports = patientData?.reports || [];

  const filteredReports = hospitalReports.filter(
    (report) => filterType === "All" || report.type === filterType
  );

  const handleAnalyzeReport = async (report) => {
    if (!report) return;
    setAnalyzing(true);
    setAiInsight(null);
    try {
      const simulatedText = `${report.name || report.title}. ${report.remarks || ''}`;
      const res = await getMedicalInsights(simulatedText);
      if (res.success) {
        setAiInsight(res.data);
        toast.success("AI Analysis Complete!");
      } else {
        toast.error("AI Analysis failed.");
      }
    } catch (err) {
      toast.error("AI service unavailable.");
    } finally {
      setAnalyzing(false);
    }
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Medical Vault</h1>
        <p className="text-slate-500">Securely view and manage your medical documentation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex overflow-x-auto hide-scrollbar">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("All")}
                className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterType === "All"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
              >
                All Documents
              </button>
              {reportTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterType === type
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reports Cards */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[400px]">
            {filteredReports.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-3xl mb-4 text-4xl shadow-sm border border-slate-100">
                  📄
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Reports Found</h3>
                <p className="text-slate-500 max-w-sm">No medical documents match your current filter criteria or none have been uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredReports.map((report) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ y: -5 }}
                      key={report._id || report.id}
                      onClick={() => {
                        setSelectedReport(report);
                        setAiInsight(null);
                      }}
                      className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${selectedReport?._id === report._id || selectedReport?.id === report.id
                        ? "border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-500/10"
                        : "border-slate-100 bg-white hover:border-indigo-300 hover:shadow-lg"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${report.status === "Normal" ? "bg-emerald-100 text-emerald-600" :
                            report.status === "Abnormal" ? "bg-rose-100 text-rose-600" :
                              "bg-indigo-100 text-indigo-600"
                            }`}>
                            {report.type === "Blood Test" ? "🩸" :
                              report.type === "X-Ray" ? "🩻" :
                                report.type === "Prescription" ? "💊" : "📑"}
                          </div>
                        </div>
                          <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${report.status === "Verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : report.status === "Received"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-indigo-100 text-indigo-700"
                            }`}
                        >
                          {report.status || "Completed"}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-lg mb-1 truncate">{report.name || report.title || "Report Document"}</p>
                        <p className="text-sm font-semibold text-slate-500 mb-3">{report.type || "General"}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span>📅</span>
                          {new Date(report.date || report.createdAt).toLocaleDateString()}
                        </div>
                        {report.doctorName && (
                          <>
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            <div className="flex items-center gap-1.5 truncate">
                              <span>👨‍⚕️</span> Dr. {report.doctorName.split(' ')[0]}
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Report Details Sidebar */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl h-fit sticky top-6 text-white overflow-hidden relative border border-slate-700">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          {selectedReport ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 mb-2">
                <div className="w-14 h-14 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                  📑
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white leading-tight">
                    {selectedReport.name || selectedReport.title}
                  </h2>
                  <p className="text-indigo-400 font-medium text-sm mt-1">{selectedReport.type}</p>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl border border-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300">📅</div>
                    <div>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Date Issued</p>
                      <p className="font-bold text-slate-200">{new Date(selectedReport.date || selectedReport.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedReport.doctorName && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300">👨‍⚕️</div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Consulting Doctor</p>
                        <p className="font-bold text-slate-200">Dr. {selectedReport.doctorName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport.department && (
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-300">🏥</div>
                      <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Department</p>
                        <p className="font-bold text-slate-200">{selectedReport.department}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReport.remarks && (
                  <div className="pt-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Clinical Remarks</p>
                    <p className="text-slate-300 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10">
                      "{selectedReport.remarks}"
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                       if (selectedReport.fileUrl && selectedReport.fileUrl.startsWith('mock-storage://')) {
                         toast.info(`Simulated view: ${selectedReport.fileUrl.replace('mock-storage://', '')}`);
                       } else if (selectedReport.fileUrl) {
                         window.open(selectedReport.fileUrl, '_blank', 'noreferrer');
                       } else {
                         toast.error('No valid file URL found.');
                       }
                    }}
                    className="flex-1 bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 border border-white/10 transition flex items-center justify-center gap-2"
                  >
                    <span>👁️</span> View
                  </button>
                  <button 
                    onClick={() => handleDownload(selectedReport.fileUrl, selectedReport.name || selectedReport.title || "Document")}
                    className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                  >
                    <span>📥</span> Download
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 border border-white/10 transition flex items-center justify-center gap-2">
                    <span>📤</span> Share
                  </button>
                  <button
                    onClick={() => toast.success("Report attached to active claim sequence.")}
                    className="w-full bg-emerald-500/20 text-emerald-400 font-bold py-3.5 rounded-xl hover:bg-emerald-500/30 border border-emerald-500/30 transition flex items-center justify-center gap-2"
                  >
                    <span>📎</span> Attach
                  </button>
                </div>
              </div>

              {/* AI Analysis Suggestion */}
              {!aiInsight ? (
                <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-5 mt-6 relative overflow-hidden group transition-all hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl -mr-10 -mt-10 group-hover:bg-purple-500/30 transition-all"></div>
                  <div className="flex items-center gap-3 mb-2 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-500/40">✨</div>
                    <p className="font-bold text-white tracking-wide">AI Document Analysis</p>
                  </div>
                  <p className="text-xs font-medium text-purple-200 mb-3 relative z-10 leading-relaxed max-w-[90%]">
                    Decode complex medical jargon and get a simplified summary of this report.
                  </p>
                  <button
                    onClick={() => handleAnalyzeReport(selectedReport)}
                    disabled={analyzing}
                    className="text-sm text-white font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all w-fit relative z-10 flex items-center gap-2 border border-white/10 disabled:opacity-50"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Instantly"} <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 mt-6 shadow-inner relative">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center text-white shadow-md">🧠</div>
                      <div>
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-sm">Medical Consensus</h4>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{aiInsight.diagnosis || "General Evaluation"}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${aiInsight.riskFactor === 'HIGH' ? 'bg-rose-100 text-rose-700' : aiInsight.riskFactor === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      Risk: {aiInsight.riskFactor || 'LOW'}
                    </span>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-indigo-100 dark:border-white/10">
                      {aiInsight.aiSummary || aiInsight.insight || "Analysis complete."}
                    </p>

                    {aiInsight.extractedMetrics?.keywordsFound?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Detected Indicators</p>
                        <div className="flex flex-wrap gap-2">
                           {aiInsight.extractedMetrics.keywordsFound.map((kw, i) => (
                              <span key={i} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                                {kw}
                              </span>
                           ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-20 relative z-10">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700">
                <span className="text-4xl opacity-50">🔍</span>
              </div>
              <p className="font-bold text-xl text-slate-300 mb-2">Detailed View</p>
              <p className="text-slate-500 text-sm max-w-[200px] mx-auto">Select a document from your vault to view its detailed analysis.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
