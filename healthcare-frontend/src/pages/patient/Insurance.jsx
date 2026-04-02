import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import api from "../../api/axios";

export default function PatientInsurance() {
  const [selectedTab, setSelectedTab] = useState("coverage");
  const [insuranceData, setInsuranceData] = useState({
    company: "Loading...",
    insuranceId: "...",
    policyNumber: "...",
    status: "Loading...",
    totalLimit: 0,
    usedAmount: 0,
  });



  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    try {
      const res = await api.get('/auth/profile');
      let limit = 0;
      let usedFromClaims = 0;
      let insDetails = null;

      if (res.data.success) {
        insDetails = res.data.data.patientDetails?.insuranceDetails;
        if (insDetails) {
          limit = Number(insDetails.coverageAmount) || 0;
        }
      }

      // Fetch authentic claims arrays dynamically to sum actual usage parameters instead of stagnant DB values
      try {
        const claimsRes = await api.get('/patients/claims');
        if (claimsRes.data.success) {
           const claims = claimsRes.data.data;
           usedFromClaims = claims
              .filter(c => ["Approved", "Amount Released"].includes(c.status))
              .reduce((acc, c) => acc + (c.approvedAmount || c.totalAmount || 0), 0);
        }
      } catch (e) {
        console.error("Could not fetch claims for usage calculation", e);
      }

      if (insDetails && (insDetails.providerId || insDetails.providerName || insDetails.policyNumber || insDetails.isCustomProvider)) {
          const newData = {
            company: insDetails.providerName || insDetails.customProviderName || "N/A",
            insuranceId: insDetails.memberId || "N/A",
            policyNumber: insDetails.policyNumber || "N/A",
            status: "Active",
            totalLimit: limit,
            usedAmount: usedFromClaims,
            validUpto: insDetails.validUpto ? new Date(insDetails.validUpto).toLocaleDateString() : "N/A",
            insuranceDocuments: insDetails.insuranceDocuments || [],
            coverageBreakdown: insDetails.coverageBreakdown || []
          };
          setInsuranceData(newData);
      } else {
          setInsuranceData({
            company: "No insurance detailed specified",
            insuranceId: "Unregistered",
            policyNumber: "Unregistered",
            status: "Uninsured",
            totalLimit: 0,
            usedAmount: 0,
            validUpto: "N/A",
            insuranceDocuments: [],
            coverageBreakdown: []
          });
      }

    } catch(err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const remainingCoverage = insuranceData.totalLimit - insuranceData.usedAmount;
  const usagePercentage = insuranceData.totalLimit > 0 ? (insuranceData.usedAmount / insuranceData.totalLimit) * 100 : 0;



  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">Your Insurance</h1>
        <p className="text-slate-500 mt-1">Manage your active policies and track remaining coverage limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {/* Insurance Summary Card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

            <div className="flex flex-wrap justify-between items-start gap-4 mb-8 relative z-10">
              <div>
                <p className="text-indigo-200/80 text-sm font-bold tracking-wider uppercase mb-1">Insurance Provider</p>
                <p className="text-3xl font-black heading-font">{insuranceData.company}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {insuranceData.status} Policy
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <div>
                <p className="text-indigo-200/70 text-xs font-bold uppercase mb-1">Policy Number</p>
                <p className="text-lg font-bold font-mono tracking-tight">{insuranceData.policyNumber}</p>
              </div>
              <div>
                <p className="text-indigo-200/70 text-xs font-bold uppercase mb-1">Member ID</p>
                <p className="text-lg font-bold font-mono tracking-tight">{insuranceData.insuranceId}</p>
              </div>
              <div>
                <p className="text-indigo-200/70 text-xs font-bold uppercase mb-1">Total Coverage</p>
                <p className="text-xl font-black tracking-tight text-indigo-300">₹{insuranceData.totalLimit.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          {/* Coverage Overview */}
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Coverage Utilization
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-400 uppercase tracking-wider text-xs">Used Coverage</p>
                <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">💳</div>
              </div>
              <p className="text-3xl font-black text-rose-500 mb-2">₹{insuranceData.usedAmount.toLocaleString()}</p>
              <p className="text-sm font-medium text-slate-500">Based on past approved claims</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl shadow-sm text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <p className="font-bold text-emerald-100 uppercase tracking-wider text-xs">Available Balance</p>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">💰</div>
              </div>
              <p className="text-3xl font-black mb-2 relative z-10">₹{remainingCoverage.toLocaleString()}</p>
              <p className="text-sm font-medium text-emerald-100 relative z-10">Remaining limit for the cycle</p>
            </motion.div>
          </div>

          {/* Usage Progress Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Annual Policy Utilization</h3>
                {insuranceData.status === "Uninsured" ? (
                    <p className="text-sm text-rose-500 font-bold mt-1">No claimable funds available.</p>
                ) : (
                    <p className="text-sm text-slate-500 mt-1">You have consumed {usagePercentage.toFixed(1)}% of your limit</p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 tracking-wider">AVAILABLE</span>
                <p className={`font-black text-xl ${insuranceData.status === "Uninsured" ? "text-rose-500" : "text-indigo-600"}`}>
                   {insuranceData.status === "Uninsured" ? "0%" : `${(100 - usagePercentage).toFixed(1)}%`}
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-4 mb-4 relative overflow-hidden p-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: insuranceData.status === "Uninsured" ? '0%' : `${Math.min(usagePercentage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full transition-all bg-gradient-to-r relative ${usagePercentage > 80 ? 'from-amber-400 to-rose-500' : 'from-indigo-400 to-indigo-600'}`}
              >
                <div className="absolute inset-0 bg-white/20 overflow-hidden">
                  <div className="w-full h-full bg-white/30 -skew-x-[45deg] animate-[shimmer_2s_infinite]"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
            {/* Mobile/Sidebar Tabs Layout */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setSelectedTab("coverage")}
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${selectedTab === "coverage" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700 bg-slate-50"
                  }`}
              >
                Coverage
                {selectedTab === "coverage" && <motion.div layoutId="insTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
              </button>

              <button
                onClick={() => setSelectedTab("details")}
                className={`flex-1 py-4 text-sm font-bold transition-all relative ${selectedTab === "details" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700 bg-slate-50"
                  }`}
              >
                Details
                {selectedTab === "details" && <motion.div layoutId="insTab" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px] hide-scrollbar">
              <AnimatePresence mode="wait">
                {/* Treatment Coverage Tab */}
                {selectedTab === "coverage" && (
                  <motion.div key="coverage" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xs">📋</div>
                      Treatment Eligibility
                    </h3>
                    {insuranceData.coverageBreakdown && insuranceData.coverageBreakdown.length > 0 ? (
                        insuranceData.coverageBreakdown.map((treatment, idx) => (
                           <div
                             key={idx}
                             className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center group cursor-pointer hover:border-indigo-100 transition-colors"
                           >
                              <div className="flex-1 pr-4">
                                <p className="font-bold text-slate-800 text-sm">{treatment.sectionName}</p>
                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase">
                                  Limit: <span className="text-slate-600">₹{treatment.limit?.toLocaleString() || "0"}</span>
                                </p>
                              </div>
                              <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                                ✓
                              </span>
                           </div>
                        ))
                    ) : (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                            <p className="text-sm font-semibold text-slate-500">No segmented coverage limits have been registered for this policy.</p>
                        </div>
                    )}
                  </motion.div>
                )}



                {/* Insurance Details Tab */}
                {selectedTab === "details" && (
                  <motion.div key="detailsView" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center mb-6">
                      <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3">🏢</div>
                      <p className="font-black text-slate-800 text-lg">{insuranceData.company}</p>
                      <p className="text-sm font-bold text-indigo-500 tracking-wider">ACTIVE POLICY</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provider</span>
                        <span className="font-bold text-slate-800 text-right">{insuranceData.company}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Member ID</span>
                        <span className="font-bold text-slate-800 font-mono text-right">{insuranceData.insuranceId}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Policy No.</span>
                        <span className="font-bold text-slate-800 font-mono text-right">{insuranceData.policyNumber}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-3 mt-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valid Upto</span>
                        <span className="font-bold text-slate-800 text-right">{insuranceData.validUpto}</span>
                      </div>
                      <div className="pt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Policy Documents</span>
                        {insuranceData.insuranceDocuments && insuranceData.insuranceDocuments.length > 0 ? (
                            <div className="space-y-2">
                               {insuranceData.insuranceDocuments.map((doc, idx) => (
                                 <a 
                                   key={idx} 
                                   href={doc.fileUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-xl hover:bg-indigo-100 transition-colors group"
                                 >
                                    <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-500">📄</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm text-indigo-900 group-hover:text-indigo-700">{doc.docName || "Insurance Document"}</p>
                                        <p className="text-xs text-indigo-400 font-mono">{new Date(doc.uploadedDate).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-indigo-500 font-bold text-xs bg-white px-2 py-1 rounded-full shadow-sm">View ↗</span>
                                 </a>
                               ))}
                            </div>
                        ) : (
                           <p className="text-sm text-slate-500 font-medium bg-slate-50 p-4 rounded-xl border border-slate-100 border-dashed text-center">No physical documents uploaded yet.</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
