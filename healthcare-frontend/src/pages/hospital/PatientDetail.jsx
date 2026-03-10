import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import StatusBadge from "../../components/ui/StatusBadge";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [patientClaims, setPatientClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("info");
  const [uploading, setUploading] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: "",
    type: "",
    remarks: "",
  });

  useEffect(() => {
    fetchPatientData();
  }, [id]);

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

  const handleReportUpload = (e) => {
    e.preventDefault();
    if (!reportForm.name || !reportForm.type) {
      toast.warning("Please fill required fields");
      return;
    }

    setUploading(true);
    // Mock upload delay for now
    setTimeout(() => {
      setReportForm({ name: "", type: "", remarks: "" });
      setUploading(false);
      setSelectedTab("reports");
      toast.success(`Mock: Report "${reportForm.name}" uploaded successfully`);
    }, 1000);
  };

  const handleStatusUpdate = (newStatus) => {
    // Mocking update for now
    setPatient({ ...patient, status: newStatus });
    toast.success(`Mock: Patient status updated to ${newStatus}`);
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
              value={patient.status || "Active"}
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

              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
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
                      </select>
                    </div>
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
              <div className="bg-white border rounded-2xl border-slate-200 p-8 text-center shadow-inner">
                <div className="text-5xl mb-4">📁</div>
                <h3 className="font-bold text-slate-800 text-lg mb-1">Secure Medical Vault</h3>
                <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                  No encrypted medical documents have been vaulted for this patient yet. Use the tool above to attach a record.
                </p>
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
                            ₹{claim.claimAmount?.toLocaleString()}
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
    </DashboardLayout>
  );
}