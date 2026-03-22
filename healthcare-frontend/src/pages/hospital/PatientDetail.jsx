import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [patientClaims, setPatientClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("info");
  const [reportForm, setReportForm] = useState({
    name: "",
    type: "",
    remarks: "",
    file: null,
  });
  const [uploading, setUploading] = useState(false);

  // Insurance Addition States
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [insuranceProviders, setInsuranceProviders] = useState([]);
  const [insuranceSubmitting, setInsuranceSubmitting] = useState(false);
  const [insuranceForm, setInsuranceForm] = useState({
    providerId: "",
    policyNumber: "",
    validUpto: "",
    coverageAmount: "",
    memberId: "",
    isCustomProvider: false,
    customProviderName: "",
    customProviderEmail: "",
    customProviderPhone: "",
  });

  useEffect(() => {
    fetchPatientData();
    fetchInsuranceProviders();
  }, [id]);

  const fetchInsuranceProviders = async () => {
    try {
        const res = await api.get('/hospitals/insurance-companies');
        if (res.data.success) {
            setInsuranceProviders(res.data.data);
        }
    } catch (error) {
        console.warn("Failed to fetch insurance providers for modal");
    }
  };

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      // We assume an endpoint to fetch a single patient exists, or we filter from the main list.
      // Easiest is to fetch all hospital patients and find this ID for now until single endpoint is robust.
      const res = await api.get('/hospitals/patients');
      if (res.data.success) {
        const foundUser = res.data.data.find(p => p._id === id);
        if (foundUser) {
          setPatient(foundUser);
        } else {
          toast.error("Patient not found in your hospital records");
        }
      }

      // Fetch claims for this patient
      const claimsRes = await api.get('/hospitals/claims');
      if (claimsRes.data.success) {
        const pClaims = claimsRes.data.data.filter(c => c.patientId?._id === id);
        setPatientClaims(pClaims);
      }
    } catch (error) {
      toast.error("Failed to fetch patient details");
    } finally {
      setLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportForm.name || !reportForm.type || !reportForm.file) {
      toast.warning("Please fill all required fields and select a file.");
      return;
    }

    setUploading(true);
    try {
      // Create FormData to hold the file
      const uploadData = new FormData();
      uploadData.append('docType', reportForm.type);
      uploadData.append('file', reportForm.file);
      
      // Axios handles multipart/form-data headers automatically when sending FormData
      const res = await api.post(`/hospitals/patients/${patient._id}/documents`, uploadData);
      
      if (res.data.success) {
        // Optimistically update patient data locally to show new doc immediately
        const updatedPatient = { ...patient };
        if(!updatedPatient.patientDetails) updatedPatient.patientDetails = {};
        if(!updatedPatient.patientDetails.medicalHistory) updatedPatient.patientDetails.medicalHistory = [];
        
        // ensure we make a new array reference so React detects the state change
        updatedPatient.patientDetails.medicalHistory = [
             ...updatedPatient.patientDetails.medicalHistory,
             res.data.data
        ];
        
        setPatient(updatedPatient);

        toast.success(`Report "${reportForm.name}" uploaded to secure vault`);
        setReportForm({ name: "", type: "", remarks: "", file: null });
        setSelectedTab("reports");
        
        // Reset file input element manually if needed, or let React handle it via state
        const fileInput = document.getElementById("report-file-upload");
        if(fileInput) fileInput.value = "";
      }
    } catch (error) {
       toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
       setUploading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const res = await api.put(`/hospitals/patients/${patient._id}`, { status: newStatus });
      if (res.data.success) {
        setPatient(res.data.data);
        toast.success(`Patient status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleCheckupUpdate = async (newDate) => {
    try {
      const res = await api.put(`/hospitals/patients/${patient._id}`, { nextCheckupDate: newDate });
      if (res.data.success) {
        setPatient(res.data.data);
        toast.success(`Next checkup scheduled for ${newDate}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update checkup date");
    }
  };

  const handleLinkInsurance = async (e) => {
    e.preventDefault();
    if (!insuranceForm.isCustomProvider && !insuranceForm.providerId) {
      toast.warning("Please select an insurance provider");
      return;
    }
    if (insuranceForm.isCustomProvider && !insuranceForm.customProviderName) {
      toast.warning("Please enter the custom provider name");
      return;
    }
    if (!insuranceForm.policyNumber || !insuranceForm.coverageAmount) {
      toast.warning("Policy Number and Coverage Amount are mandatory");
      return;
    }

    setInsuranceSubmitting(true);
    try {
      let insuranceDetails = { ...insuranceForm, insuranceDocuments: [] };
      
      // Auto-populate providerName if it's a platform provider
      if (!insuranceDetails.isCustomProvider) {
         const provider = insuranceProviders.find(p => p._id === insuranceDetails.providerId);
         if (provider) {
             insuranceDetails.providerName = provider.insuranceDetails?.companyName || provider.name;
         }
      }

      // Convert coverageAmount to number
      insuranceDetails.coverageAmount = Number(insuranceDetails.coverageAmount);
      insuranceDetails.balanceAmount = insuranceDetails.coverageAmount;

      const res = await api.put(`/hospitals/patients/${patient._id}`, { insuranceDetails });
      if (res.data.success) {
          setPatient(res.data.data);
          toast.success("Insurance linked successfully!");
          setShowInsuranceModal(false);
          setInsuranceForm({
              providerId: "", policyNumber: "", validUpto: "", coverageAmount: "", memberId: "",
              isCustomProvider: false, customProviderName: "", customProviderEmail: "", customProviderPhone: ""
          });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to link insurance");
    } finally {
      setInsuranceSubmitting(false);
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

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Patient Not Found</h2>
          <p className="text-slate-500 mb-6">The patient record you are looking for does not exist or you don't have permission to view it.</p>
          <button
            onClick={() => navigate("/hospital/patients")}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            ← Back to Directory
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {patient.name?.charAt(0) || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-slate-500 font-mono mt-1 w-fit bg-slate-100 px-2 py-0.5 rounded text-sm border border-slate-200">
              ID: {patient._id}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/hospital/patients")}
          className="text-slate-500 font-semibold hover:text-slate-800 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm transition"
        >
          ← Back
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl">📧</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email</p>
            <p className="font-bold text-slate-800 truncate">{patient.email}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl">📱</div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</p>
            <p className="font-bold text-slate-800">{patient.patientDetails?.phoneNumber || "N/A"}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl">📌</div>
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
            <select
              value={patient.patientDetails?.status || patient.status || "Active"}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              className="w-full font-bold text-slate-800 border-none bg-slate-50 rounded-lg px-2 py-1 focus:ring-0 cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 border border-slate-200 rounded-2xl p-6 bg-slate-50">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">DOB</p>
          <p className="font-bold text-slate-800">{patient.patientDetails?.dateOfBirth ? new Date(patient.patientDetails.dateOfBirth).toLocaleDateString() : "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Gender</p>
          <p className="font-bold text-slate-800">{patient.patientDetails?.gender || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Aadhar</p>
          <p className="font-mono font-bold text-slate-800">{patient.patientDetails?.aadhar || "N/A"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Registered On</p>
          <p className="font-bold text-slate-800 text-sm">{new Date(patient.createdAt).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Next Checkup</p>
          <input 
             type="date" 
             value={patient.patientDetails?.nextCheckupDate ? new Date(patient.patientDetails.nextCheckupDate).toISOString().split('T')[0] : patient.nextCheckupDate || ""} 
             onChange={(e) => handleCheckupUpdate(e.target.value)}
             className="font-bold text-slate-800 text-sm bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-8 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setSelectedTab("info")}
            className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none ${selectedTab === "info"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            Core Information
          </button>
          <button
            onClick={() => setSelectedTab("reports")}
            className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none ${selectedTab === "reports"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            Reports & Medical Docs
          </button>
          <button
            onClick={() => setSelectedTab("claims")}
            className={`px-8 py-4 font-bold text-sm transition-all focus:outline-none flex items-center gap-2 ${selectedTab === "claims"
                ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
          >
            Insurance Claims
            {patientClaims.length > 0 && <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-xs">{patientClaims.length}</span>}
          </button>
        </div>

        <div className="p-8">
          {/* Information Tab */}
          {selectedTab === "info" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Patient Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Residential Address</p>
                    <p className="font-bold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 mt-1">
                      {patient.patientDetails?.address || "Address not provided during onboarding."}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-semibold mb-1">Account State</p>
                    <div className="mt-2">
                      <StatusBadge status={patient.status || "Active"} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 mt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Quick Connectivity</h3>
                <div className="flex flex-col sm:flex-row gap-4 border border-blue-200 p-2 rounded-xl bg-white w-fit shadow-sm">
                  <button
                    onClick={() => setSelectedTab("reports")}
                    className="flex-1 text-center font-bold px-6 py-2.5 bg-slate-50 text-slate-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition"
                  >
                    📄 Upload Diagnostic Report
                  </button>
                  <button
                    onClick={() => navigate('/hospital/create-claim')}
                    className="flex-1 text-center font-bold px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
                  >
                    💼 Initiate New Claim
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-2 h-6 bg-indigo-500 rounded-full"></div> Insurance Overview</h3>
                {patient.patientDetails?.insuranceDetails && (patient.patientDetails.insuranceDetails.providerId || patient.patientDetails.insuranceDetails.providerName || patient.patientDetails.insuranceDetails.policyNumber || patient.patientDetails.insuranceDetails.isCustomProvider) ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-slate-500 font-semibold mb-1">Provider & Policy</p>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 mt-1">
                          <p className="font-bold text-slate-800">{patient.patientDetails.insuranceDetails.providerName || "N/A"}</p>
                          <p className="text-slate-500 font-mono text-xs mt-1">Policy: {patient.patientDetails.insuranceDetails.policyNumber || "N/A"}</p>
                          <p className="text-slate-500 font-mono text-xs mt-0.5">Valid Upto: {patient.patientDetails.insuranceDetails.validUpto ? new Date(patient.patientDetails.insuranceDetails.validUpto).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-500 font-semibold mb-1">Financials & Documents</p>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 mt-1 h-full">
                           <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Coverage Limit</p>
                           <p className="text-lg font-black text-indigo-600 mb-2">₹{(patient.patientDetails.insuranceDetails.coverageAmount || 0).toLocaleString()}</p>
                           
                           {/* Policy Document Links */}
                           {patient.patientDetails.insuranceDetails.insuranceDocuments?.length > 0 && (
                             <div className="pt-2 border-t border-slate-100">
                                {patient.patientDetails.insuranceDetails.insuranceDocuments.map((doc, idx) => (
                                  <a key={idx} href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 font-bold block mb-1">
                                    📄 {doc.docName || "View Policy Document"}
                                  </a>
                                ))}
                             </div>
                           )}
                        </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex flex-col items-start gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                       <p className="text-sm text-slate-500 font-medium">No insurance details were provided during registration. The patient is considered Uninsured.</p>
                       <button 
                           onClick={() => setShowInsuranceModal(true)}
                           className="bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-200 hover:text-emerald-800 transition shadow-sm text-sm flex items-center gap-2"
                       >
                           <span className="text-lg leading-none">+</span> Link Insurance Profile
                       </button>
                   </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Reports Tab */}
          {selectedTab === "reports" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Upload Form */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Attach Diagnostics</h3>
                <form onSubmit={handleReportUpload} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Report Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={reportForm.name}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, name: e.target.value })
                        }
                        placeholder="e.g., Fasting Blood Sugar"
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Document Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={reportForm.type}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, type: e.target.value })
                        }
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                      >
                        <option value="">-- Choose Category --</option>
                        <option value="Blood Test">Blood Investigation</option>
                        <option value="X-Ray">Radiology (X-Ray)</option>
                        <option value="CT Scan">CT Scan Result</option>
                        <option value="Ultrasound">Sonography</option>
                        <option value="ECG">Cardiology (ECG/ECHO)</option>
                        <option value="Discharge Summary">Discharge Protocol</option>
                        <option value="Prescription">Medical Prescription</option>
                        <option value="Hospital Bill">Hospital Bill (Invoice)</option>
                        <option value="Other">Other Document</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="report-file-upload">
                      Select File <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="report-file-upload"
                      type="file"
                      onChange={(e) =>
                        setReportForm({ ...reportForm, file: e.target.files[0] })
                      }
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer border border-slate-200 rounded-lg p-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Clinical Remarks
                    </label>
                    <textarea
                      value={reportForm.remarks}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, remarks: e.target.value })
                      }
                      placeholder="Doctor's notes or specific findings..."
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={uploading}
                      className="bg-blue-600 text-white px-8 py-2.5 font-bold rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition shadow-md shadow-blue-500/20"
                    >
                      {uploading ? "Processing..." : "Vault Document"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Documents List */}
              <div className="bg-white border rounded-2xl border-slate-200 p-8 shadow-inner">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2"><div className="w-2 h-6 bg-slate-800 rounded-full"></div> Secure Medical Vault</h3>
                   <span className="text-sm font-semibold text-slate-500">{patient.patientDetails?.medicalHistory?.length || 0} Files Vaulted</span>
                </div>
                
                {(!patient.patientDetails?.medicalHistory || patient.patientDetails.medicalHistory.length === 0) ? (
                  <div className="text-center py-6">
                    <div className="text-5xl mb-4">📁</div>
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                      No encrypted medical documents have been vaulted for this patient yet. Use the tool above to attach a record.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                     {patient.patientDetails.medicalHistory.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-xl hover:bg-slate-100 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-lg flex items-center justify-center text-xl">📄</div>
                              <div>
                                 <p className="font-bold text-slate-700 text-sm">{doc.docType || "Report"}</p>
                                 <a 
                                    href={doc.fileUrl || "#"} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-xs text-blue-500 hover:text-blue-700 font-mono mt-0.5 inline-block truncate max-w-[200px] sm:max-w-xs md:max-w-md"
                                 >
                                    View Document ↗
                                 </a>
                              </div>
                           </div>
                           <span className="text-xs font-semibold text-slate-400">
                             {doc.uploadedDate 
                               ? new Date(doc.uploadedDate).toLocaleDateString() 
                               : (doc._id ? new Date(parseInt(doc._id.substring(0,8), 16) * 1000).toLocaleDateString() : new Date().toLocaleDateString())
                             }
                           </span>
                        </div>
                     ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Claims Tab */}
          {selectedTab === "claims" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Associated Insurance Claims</h3>
                <button
                  onClick={() => navigate("/hospital/create-claim")}
                  className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition shadow-md shadow-blue-500/20"
                >
                  + Create New Claim
                </button>
              </div>

              {patientClaims.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
                  <div className="text-4xl mb-3">🧾</div>
                  <p className="text-slate-800 font-bold mb-1">No Claims Initiated</p>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto">
                    There are currently no active or historic insurance claims linked to this patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientClaims.map((claim) => (
                    <div
                      key={claim._id}
                      className="border border-slate-200 rounded-2xl p-5 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition shadow-sm"
                      onClick={() =>
                        navigate(`/hospital/claims/${claim._id}`)
                      }
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex justify-center items-center text-xl">
                            📄
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 font-mono text-sm tracking-wide">ID: {claim._id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              Initiated on {new Date(claim.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <p className="font-extrabold text-xl text-slate-800 mb-1">
                            ₹{claim.totalAmount?.toLocaleString()}
                          </p>
                          <StatusBadge status={claim.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Insurance Overlay Modal */}
      <AnimatePresence>
        {showInsuranceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 my-8"
            >
              <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">🛡️</div>
                  Link Patient Insurance
                </h3>
                <button onClick={() => setShowInsuranceModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
              </div>

              <form onSubmit={handleLinkInsurance} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Insurance Provider *</label>
                    <select
                      value={insuranceForm.isCustomProvider ? "OTHER" : insuranceForm.providerId}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "OTHER") {
                          setInsuranceForm({ ...insuranceForm, isCustomProvider: true, providerId: "" });
                        } else {
                          setInsuranceForm({ ...insuranceForm, isCustomProvider: false, providerId: val });
                        }
                      }}
                      className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white transition text-slate-700 font-medium"
                    >
                      <option value="">-- Select Provider --</option>
                      {insuranceProviders.map(provider => (
                        <option key={provider._id} value={provider._id}>{provider.insuranceDetails?.companyName || provider.name}</option>
                      ))}
                      <option value="OTHER">Other (Custom Provider)</option>
                    </select>
                  </div>

                  {insuranceForm.isCustomProvider && (
                    <div className="md:col-span-2 p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-5 shadow-inner">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                         <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span> Custom Provider Details
                      </p>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company Name *</label>
                        <input type="text" placeholder="e.g., Global Health Insurance Ltd." required value={insuranceForm.customProviderName} onChange={(e) => setInsuranceForm({ ...insuranceForm, customProviderName: e.target.value })} className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider Email</label>
                          <input type="email" placeholder="claims@globalhealth.com" value={insuranceForm.customProviderEmail} onChange={(e) => setInsuranceForm({ ...insuranceForm, customProviderEmail: e.target.value })} className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Provider Phone</label>
                          <input type="text" placeholder="+1 800-123-4567" value={insuranceForm.customProviderPhone} onChange={(e) => setInsuranceForm({ ...insuranceForm, customProviderPhone: e.target.value })} className="w-full border border-slate-300 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-100">
                         ℹ️ Note: An email request will be sent to the custom provider to verify this claim when initiated.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Policy Number *</label>
                    <input type="text" required value={insuranceForm.policyNumber} onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })} className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Member ID</label>
                    <input type="text" value={insuranceForm.memberId} onChange={(e) => setInsuranceForm({ ...insuranceForm, memberId: e.target.value })} className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Coverage Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold font-mono">₹</span>
                      <input type="number" min="0" required value={insuranceForm.coverageAmount} onChange={(e) => setInsuranceForm({ ...insuranceForm, coverageAmount: e.target.value })} className="w-full border border-slate-300 rounded-xl py-3 pl-8 pr-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition font-mono font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valid Upto</label>
                    <input type="date" value={insuranceForm.validUpto} onChange={(e) => setInsuranceForm({ ...insuranceForm, validUpto: e.target.value })} className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition text-slate-600" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                  <button type="button" onClick={() => setShowInsuranceModal(false)} className="px-6 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition">Cancel</button>
                  <button type="submit" disabled={insuranceSubmitting} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 transition">
                    {insuranceSubmitting ? "Linking..." : "Attach Profile"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
