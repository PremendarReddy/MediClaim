import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  // Document Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [docType, setDocType] = useState("ID Proof");
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const fetchClaimDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/hospitals/claims/${id}`);
      if (res.data.success) {
        setClaim(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch claim details");
      // Fallback for demo if route doesn't exist
      if (error.response?.status === 404) {
        toast.error("Claim not found.")
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Assuming a PUT or PATCH endpoint exists
      const res = await api.put(`/hospitals/claims/${id}`, { status: newStatus });
      if (res.data.success) {
        setClaim(prev => ({ ...prev, status: newStatus }));
        toast.success(`Claim status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !docType) {
      toast.warning("Please select a document type and a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("docType", docType);
    formData.append("file", uploadFile);

    setIsUploading(true);
    try {
      const res = await api.put(`/hospitals/claims/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        toast.success(`${docType} successfully attached to claim.`);
        setClaim(res.data.data); // Replace claim state with updated object (includes new status if verified)
        setUploadFile(null);
        setDocType("ID Proof");
      }
    } catch (error) {
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!claim) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Claim Not Found</h2>
          <p className="text-slate-500 mb-6">The insurance claim you are looking for does not exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate("/hospital/claims")}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            ← Back to Claims
          </button>
        </div>
      </DashboardLayout>
    );
  }

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
            <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Claim Summary
          </h1>
          <p className="text-slate-500 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200">
            ID: {claim._id}
          </p>
        </div>
        <button
          onClick={() => navigate("/hospital/claims")}
          className="text-slate-500 font-semibold hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">

          {/* Claim Info */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-500 rounded-full"></div> Information
            </h2>

            <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Patient Name</p>
                <p className="font-bold text-lg text-slate-800">{claim.patientId?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Amount Requested</p>
                <p className="font-bold text-2xl text-slate-800">₹{claim.totalAmount?.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-semibold text-slate-500 mb-2">Claim Status</p>
                <StatusBadge status={claim.status} />
              </div>
            </div>

            {/* Document Status Breakdown */}
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Document Status
            </h3>

            {claim.documents && claim.documents.length > 0 ? (
              <div className="space-y-4">
                {claim.documents.map((doc, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-slate-100 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">📄</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{doc.docType}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.remarks || "No remarks"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {doc.received ? (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">Received</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg border border-slate-300">Awaiting</span>
                      )}

                      {doc.verified && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">Verified ✅</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-sm font-bold text-slate-400">No documents attached.</p>
              </div>
            )}

            {/* Missing Document Uploader (Only if not verified/approved) */}
            {claim.status === "Pending Documents" && (
                <div className="mt-6 border border-amber-200 bg-amber-50 rounded-2xl p-6">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                     <span className="text-amber-500">⚠️</span> Missing Mandatory Documents
                  </h4>
                  <p className="text-sm text-amber-700 mb-4">
                     This claim is blocked. Attach the required documents to automatically push the status to <b>Initiated</b>.
                  </p>

                  <ul className="mb-6 space-y-2">
                    {missingDocuments.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm font-bold text-amber-900 bg-amber-100/50 px-3 py-2 rounded-lg border border-amber-200/50">
                            <span className="text-amber-600">❌</span> {doc}
                        </li>
                    ))}
                  </ul>
                  
                  <form onSubmit={handleDocumentUpload} className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="w-full sm:w-1/3">
                          <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Doc Type</label>
                          <select 
                             value={docType} 
                             onChange={(e) => setDocType(e.target.value)}
                             className="w-full border border-amber-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-amber-500 font-medium text-slate-700 bg-white"
                          >
                              <option value="Claim Form">Claim Form</option>
                              <option value="ID Proof">ID Proof</option>
                              <option value="Policy Card">Policy Card</option>
                              <option value="Prescription">Prescription</option>
                              <option value="Discharge Summary">Discharge Summary</option>
                              <option value="Pharmacy Bill">Pharmacy Bill</option>
                              <option value="Investigation Report">Investigation Report</option>
                              <option value="NEFT Details">NEFT Details</option>
                          </select>
                      </div>
                      <div className="w-full sm:w-2/3">
                         <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">File</label>
                         <input 
                             type="file" 
                             onChange={(e) => setUploadFile(e.target.files[0])}
                             className="w-full border border-amber-300 rounded-lg py-2 px-3 focus:outline-none bg-white font-medium text-slate-600 text-sm"
                         />
                      </div>
                      <button 
                         type="submit" 
                         disabled={isUploading}
                         className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-sm transition disabled:opacity-60 whitespace-nowrap"
                      >
                         {isUploading ? "Uploading..." : "Attach"}
                      </button>
                  </form>
                </div>
            )}
          </motion.div>

          {/* Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Lifecycle Timeline
            </h2>

            <div className="space-y-6 relative pl-4">
              {/* Line */}
              <div className="absolute left-6 top-2 bottom-6 w-0.5 bg-slate-100"></div>

              {['Claim Initiated'].map((step, index) => (
                <div key={index} className="flex items-start space-x-6 relative z-10">
                  <div className="w-5 h-5 mt-1 rounded-full bg-blue-500 border-4 border-blue-100 shadow-sm" />
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                    <p className="font-bold text-slate-800">{step}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">{new Date(claim.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}

              {claim.status !== 'Claim Initiated' && (
                <div className="flex items-start space-x-6 relative z-10">
                  <div className="w-5 h-5 mt-1 rounded-full bg-emerald-500 border-4 border-emerald-100 shadow-sm" />
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex-1">
                    <p className="font-bold text-slate-800">{claim.status}</p>
                    <p className="text-sm font-medium text-slate-500 mt-1">{new Date(claim.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Risk Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
              <div className="w-2 h-6 bg-amber-400 rounded-full"></div> AI Risk Intelligence
            </h2>

            <div className="bg-black/20 rounded-2xl p-5 border border-white/5 relative z-10">
              <p className="text-sm font-semibold text-slate-400 mb-1">Assessment Level</p>
              <p className={`font-black text-2xl tracking-wide ${claim.aiRiskScore?.level === 'High' ? 'text-rose-400' :
                claim.aiRiskScore?.level === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                {claim.aiRiskScore?.level || "Pending Scan"}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-sm font-medium text-slate-300 leading-relaxed">
                  {claim.aiRiskScore?.reason || "Neural analysis of medical documentation and billing trajectory is pending."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Panel */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-rose-500 rounded-full"></div> Admin Actions
            </h2>

            <div className="space-y-3">
              <button
                disabled={claim.status !== "Claim Initiated"}
                onClick={() => handleStatusUpdate("Under Review")}
                className="w-full bg-amber-500 text-white font-bold px-5 py-3 rounded-xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Acknowledge & Sync
              </button>

              <button
                disabled={["Approved", "Amount Released", "Rejected"].includes(claim.status)}
                onClick={() => handleStatusUpdate("Approved")}
                className="w-full bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Approve Dispersal
              </button>

              <button
                disabled={["Approved", "Amount Released", "Rejected"].includes(claim.status)}
                onClick={() => handleStatusUpdate("Rejected")}
                className="w-full bg-rose-600 text-white font-bold px-5 py-3 rounded-xl hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Deny Request
              </button>
            </div>
          </div>
        </div>
      </div>
          </>
        );
      })()}
    </DashboardLayout>
  );
}
