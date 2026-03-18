import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PatientClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  // Document Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState("Claim Form");
  const [uploading, setUploading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    fetchClaimData();
  }, [id]);

  const fetchClaimData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/patients/claims`);
      if (res.data.success) {
        // Fallback filter since no direct /patients/claims/:id exists yet
        const myClaim = res.data.data.find(c => c._id === id);
        if (myClaim) {
          setClaim(myClaim);
        } else {
          toast.error("Claim not found");
          navigate("/patient/claims");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch claim details");
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      // Mock File Upload directly sending to backend
      const payload = {
        docType: docType,
        fileUrl: `mock-patient-storage://${selectedFile.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: selectedFile.name
      };

      const res = await api.put(`/patients/claims/${claim._id}/documents`, payload);
      if (res.data.success) {
        toast.success("Document uploaded successfully for review");
        setSelectedFile(null);
        setClaim(res.data.data); // Update local claim state with new doc
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSendOTP = async () => {
    try {
      const res = await api.post(`/patients/claims/${claim._id}/send-otp`);
      if (res.data.success) {
        setOtpSent(true);
        toast.success("OTP sent to your registered email");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.warning("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpVerifying(true);
    try {
      const res = await api.put(`/patients/claims/${claim._id}/approve`, { otp });
      if (res.data.success) {
        toast.success("Claim submitted successfully to Insurance Provider");
        setClaim(res.data.data); // Update local status to Submitted
        setOtpSent(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid or Expired OTP");
    } finally {
      setOtpVerifying(false);
    }
  };

  if (loading || !claim) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Generate timeline states based on claim status
  const getTimelineClass = (statusMatch, isPast) => {
    if (isPast) return "text-emerald-600 font-bold flex items-center gap-2";
    if (claim.status === statusMatch || (statusMatch === 'Pending' && claim.status.includes('Pending'))) return "text-indigo-600 font-black flex items-center gap-2 bg-indigo-50 p-2 rounded-xl -ml-2";
    return "text-slate-400 font-medium flex items-center gap-2";
  };
  const getIcon = (isPast, isActive) => {
    if (isPast) return "✅";
    if (isActive) return "⏳";
    return "○";
  };

  const statuses = ["Claim Initiated", "Pending Authorization", "Under Review", "Approved", "Amount Released"];
  const currentIndex = statuses.findIndex(s =>
    claim.status === s || (s === 'Pending Authorization' && claim.status.includes('Pending')) || (s === 'Claim Initiated' && claim.status === 'Intiated')
  );

  const isFinalized = claim.status === 'Approved' || claim.status === 'Amount Released';

  return (
    <DashboardLayout>
      {/* Calculate Missing Documents locally for UI rendering */}
      {(() => {
        const requiredDocs = [
            'Claim Form', 'ID Proof', 'Policy Card',
            'Prescription', 'Discharge Summary', 'Pharmacy Bill',
            'Investigation Report', 'NEFT Details'
        ];
        
        const docAliasMap = {
            'Aadhaar Card (Patient ID)': 'ID Proof',
            'PAN Card (Tax ID)': 'ID Proof',
            'Insurance Policy Copy': 'Policy Card',
            'Diagnostic Report': 'Investigation Report',
            'Radiology (X-Ray/MRI/CT)': 'Investigation Report',
            'Blood Test': 'Investigation Report',
            'X-Ray': 'Investigation Report',
            'CT Scan': 'Investigation Report',
            'Ultrasound': 'Investigation Report',
            'ECG': 'Investigation Report',
            'Hospital Bill': 'Pharmacy Bill',
            'Doctor\'s Prescription': 'Prescription',
            'Diagnostic Reports (Blood/Urine)': 'Investigation Report',
            'X-Ray / MRI / CT Scans': 'Investigation Report',
            'Pharmacy Bills': 'Pharmacy Bill'
        };

        const providedDocs = claim?.documents?.map(d => docAliasMap[d.docType] || d.docType) || [];
        const missingDocuments = requiredDocs.filter(reqDoc => !providedDocs.includes(reqDoc));

        return (
          <>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/patient/claims")} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-sm">
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Claim Detail</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">ID: {claim._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <div className="flex flex-wrap justify-between items-start gap-4 mb-8 relative z-10">
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Claim Overview</p>
                <h2 className="text-2xl font-bold text-slate-800">{claim.disease || "Medical Procedure"}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Requested</p>
                <p className="text-3xl font-black text-slate-800">₹{claim.totalAmount?.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hospital</p>
                <p className="font-bold text-slate-800 truncate">{claim.hospitalId?.name || "Connected Hospital"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Patient</p>
                <p className="font-bold text-slate-800 truncate">{claim.patientId?.name || "Self"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Current Status</p>
                <StatusBadge status={claim.status} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Submission Date</p>
                <p className="font-bold text-slate-800 truncate">{new Date(claim.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-8 relative z-10 border-t border-slate-100 pt-8">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Attached Documents
              </h3>
              
              {claim.documents && claim.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {claim.documents.map((doc, idx) => (
                    <div key={idx} className="flex flex-col justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-indigo-300 transition">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">📄</div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{doc.docType}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{doc.remarks || "Uploaded by Hospital"}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                        <div className="flex gap-2">
                          {doc.verified ? (
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">Verified ✅</span>
                          ) : doc.received ? (
                            <span className="px-2 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md">Received ⏳</span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md">Awaiting</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            if (doc.fileUrl && doc.fileUrl.startsWith('mock-storage://')) {
                              toast.info(`Simulated view of document: ${doc.docType}. (File: ${doc.fileUrl.replace('mock-storage://', '')})`);
                            } else if (doc.fileUrl) {
                              window.open(doc.fileUrl, '_blank', 'noreferrer');
                            } else {
                              toast.error('No valid file URL found.');
                            }
                          }}
                          className="text-indigo-600 font-bold text-xs hover:text-indigo-800 transition px-3 py-1 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                        >
                          View File ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <p className="text-sm font-bold text-slate-400">No documents attached yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> Claim Processing Timeline
            </h2>
            <div className="pl-4 border-l-2 border-indigo-100 space-y-8 relative">
              {statuses.map((statusTitle, idx) => {
                const isPast = currentIndex > idx;
                const isActive = currentIndex === idx;

                return (
                  <div key={statusTitle} className="relative">
                    <div className={`absolute -left-[25px] w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ring-4 ring-white ${isPast ? "bg-emerald-500 text-white" : isActive ? "bg-indigo-600 text-white animate-pulse" : "bg-slate-200 text-slate-400"
                      }`}>
                      {isPast ? "✓" : isActive ? "⏳" : idx + 1}
                    </div>
                    <div className={`pl-2 ${isActive ? "-mt-1" : ""}`}>
                      <p className={`font-bold ${isPast ? "text-emerald-700" : isActive ? "text-indigo-700 text-lg" : "text-slate-500"}`}>
                        {statusTitle}
                      </p>
                      {isActive && (
                        <p className="text-sm font-medium text-slate-500 mt-1">
                          Currently being processed by the system.
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          {(claim.status === 'Pending Documents' || claim.status === 'Initiated' || claim.status === 'Pending Patient Consent') ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-rose-50 to-orange-50 p-6 rounded-3xl shadow-sm border border-rose-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>

              <h2 className="text-lg font-bold text-rose-900 mb-2 flex items-center gap-2 relative z-10">
                <div className="w-2 h-6 bg-rose-500 rounded-full"></div> Action Required
              </h2>
              <p className="text-sm font-medium text-rose-700/80 mb-6 relative z-10">
                The insurance provider requires additional verification documents to proceed.
              </p>

              <ul className="space-y-3 text-sm mb-6 relative z-10 bg-white/50 p-4 rounded-2xl border border-white">
                {requiredDocs.map(reqDoc => {
                  const uploaded = providedDocs.includes(reqDoc);
                  
                  // Find the actual document to check verified/received status
                  let verified = false;
                  let received = false;
                  if (uploaded) {
                    const docObj = claim.documents?.find(d => (docAliasMap[d.docType] || d.docType) === reqDoc);
                    if (docObj) {
                      verified = docObj.verified;
                      received = docObj.received;
                    }
                  }

                  return (
                    <li key={reqDoc} className="flex items-center justify-between font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className={verified ? "text-emerald-500" : uploaded ? "text-emerald-500" : "text-rose-500"}>
                          {verified ? "✓" : uploaded ? "✓" : "✖"}
                        </span>
                        {reqDoc}
                      </div>
                      {uploaded ? (
                        <div className="flex gap-2">
                          {verified ? (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">Verified</span>
                          ) : received ? (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">Received</span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md">Awaiting Review</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md">Missing</span>
                      )}
                    </li>
                  )
                })}
              </ul>

              <h3 className="font-bold text-slate-800 mb-3 relative z-10">Secure Upload Portal</h3>

              <div className={`transition-opacity ${isFinalized ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="mb-4 relative z-10">
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    disabled={isFinalized}
                    className="w-full bg-white border border-rose-200 rounded-xl py-2 px-3 text-sm font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    <option value="Aadhaar Card (Patient ID)">Aadhaar Card (Patient ID)</option>
                    <option value="" disabled>-- Document Category --</option>
                    <option value="Aadhaar / Voter ID">Aadhaar / Voter ID</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Insurance Policy Copy">Insurance Policy Copy</option>
                    <option value="Hospital Admission Note">Hospital Admission Note</option>
                    <option value="Doctor Prescription">Doctor's Prescription</option>
                    <option value="Diagnostic Report">Diagnostic Report</option>
                    <option value="Radiology (X-Ray/MRI/CT)">Radiology (X-Ray/MRI/CT)</option>
                    <option value="Surgery / OT Notes">Surgery / Operation Notes</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Pharmacy & Consumable Bills">Pharmacy & Consumable Bills</option>
                    <option value="Pre-Authorization Form">Pre-Authorization Form</option>
                    <option value="Claim Form">Claim Form (Filled)</option>
                    <option value="Other Medical Record">Other Medical Record</option>
                  </select>
                </div>

                <div className="bg-white border-2 border-dashed border-rose-200 hover:border-rose-400 transition-colors p-6 rounded-2xl text-center relative z-10 mb-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-xl mx-auto mb-3 group-hover:bg-rose-100 transition-colors">
                    📤
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-1">
                    Drag & drop files here
                  </p>
                  <p className="text-xs font-medium text-slate-400 mb-4 px-4 leading-relaxed">
                    Or click to browse. Max 5MB per file (PDF, JPG).
                  </p>

                  <input
                    type="file"
                    disabled={isFinalized}
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="opacity-0 absolute inset-0 cursor-pointer disabled:cursor-not-allowed"
                  />

                  {selectedFile && (
                    <div className="bg-rose-50 p-2 rounded-xl text-xs font-bold text-rose-700 border border-rose-100 truncate">
                      Selected: {selectedFile.name}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleDocumentSubmit}
                  disabled={!selectedFile || uploading || isFinalized}
                  className="w-full bg-slate-900 text-white font-bold px-5 py-3.5 rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition disabled:opacity-50 relative z-10 mb-4"
                >
                  {uploading ? "Uploading..." : isFinalized ? "Upload Locked" : "Upload Document"}
                </button>
              </div>

              <div className="border-t border-rose-200 pt-4 mt-2 relative z-10">
                {(claim.status === 'Initiated') ? (
                  !otpSent ? (
                    <button
                      onClick={handleSendOTP}
                      className="w-full bg-indigo-600 text-white font-bold px-5 py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition"
                    >
                      Review & Submit Claim
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-indigo-800">Enter OTP sent to your email to approve submission:</p>
                      <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full border border-indigo-200 rounded-xl py-3 px-4 text-center font-mono text-lg font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpVerifying}
                        className="w-full bg-emerald-600 text-white font-bold px-5 py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition disabled:opacity-50"
                      >
                        {otpVerifying ? "Verifying..." : "Verify & Approve Claim"}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="text-center p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-100">
                    Claim Submitted to Insurance ✅
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl shadow-sm border border-emerald-100 relative overflow-hidden">
              <div className="w-16 h-16 bg-white text-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
                ✨
              </div>
              <h2 className="text-xl font-bold text-emerald-900 text-center mb-2">No Actions Needed</h2>
              <p className="text-sm font-medium text-emerald-700/80 text-center">
                All necessary documentation has been collected. Sit back while we process the rest.
              </p>
            </motion.div>
          )}
        </div>
      </div>
          </>
        );
      })()}
    </DashboardLayout>
  );
}
