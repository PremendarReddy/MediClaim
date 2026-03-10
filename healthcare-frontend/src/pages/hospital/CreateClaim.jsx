import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { processClaim, verifyDocuments } from "../../services/agentService";

export default function CreateClaim() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [insuranceCompanies, setInsuranceCompanies] = useState([]);

    // OTP Modal State
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpSending, setOtpSending] = useState(false);

    const [formData, setFormData] = useState({
        patientId: "",
        insuranceCompanyId: "",
        amount: "",
        diagnosis: "",
        treatment: "",
        documents: []
    });

    useEffect(() => {
        fetchPatients();
        fetchInsuranceCompanies();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await api.get('/hospitals/patients');
            if (res.data.success) {
                setPatients(res.data.data);
            }
        } catch (err) {
            toast.error("Failed to fetch registered patients");
        }
    };

    const fetchInsuranceCompanies = async () => {
        try {
            const res = await api.get('/hospitals/insurance-companies');
            if (res.data.success) {
                setInsuranceCompanies(res.data.data);
            }
        } catch (err) {
            toast.error("Failed to fetch insurance companies. " + (err.response?.data?.message || err.message));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDocumentAdd = () => {
        setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, { docType: 'Discharge Summary', file: null, name: '' }]
        }));
    };

    const handleDocumentChange = (index, field, value) => {
        const updatedDocs = [...formData.documents];
        if (field === 'file') {
            updatedDocs[index].name = value.name;
        }
        updatedDocs[index][field] = value;
        setFormData(prev => ({ ...prev, documents: updatedDocs }));
    };

    const handleDocumentRemove = (index) => {
        const updatedDocs = formData.documents.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, documents: updatedDocs }));
    };

    const handleInitiateClick = async (e) => {
        e.preventDefault();

        if (!formData.patientId || !formData.insuranceCompanyId || !formData.amount || !formData.diagnosis || !formData.treatment) {
            toast.error("Please fill all required fields");
            return;
        }

        if (formData.documents.some(doc => !doc.file || !doc.docType)) {
            toast.error("Please complete all document entries or remove empty ones.");
            return;
        }

        // Trigger OTP send
        setOtpSending(true);
        try {
            const res = await api.post(`/hospitals/patients/${formData.patientId}/send-consent-otp`);
            if (res.data.success) {
                toast.success("Consent OTP sent to the patient.");
                setShowOTPModal(true);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send Consent OTP. Cannot proceed.");
        } finally {
            setOtpSending(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!otp || otp.length < 6) {
            toast.warning("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            // Mock file upload to URLs.
            const processedDocuments = formData.documents.map(doc => ({
                docType: doc.docType,
                fileUrl: `mock-storage://${doc.name.replace(/\s+/g, '-').toLowerCase()}`,
                remarks: `Uploaded by hospital: ${doc.name}`
            }));

            const payload = {
                patientId: formData.patientId,
                insuranceCompanyId: formData.insuranceCompanyId,
                totalAmount: Number(formData.amount),
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                documents: processedDocuments,
                otp: otp
            };

            const res = await api.post('/hospitals/claims', payload);

            if (res.data.success) {
                const claimId = res.data.data._id;

                // Trigger AI Agents asynchronously in the background
                toast.info("Triggering AI Claim Verification...");
                Promise.all([
                    processClaim(claimId),
                    verifyDocuments(claimId)
                ]).then(() => {
                    toast.success("AI Validation Complete. Claim sent to Insurance.");
                }).catch(() => {
                    toast.warning("Claim initiated, but AI validation delayed.");
                });

                navigate("/hospital/claims");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit claim. Invalid OTP?");
        } finally {
            setLoading(false);
            setShowOTPModal(false);
            setOtp("");
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Initiate New Claim</h1>
                    <p className="text-slate-500 mt-1">Submit a new insurance claim on behalf of a registered patient.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl relative"
            >
                <form onSubmit={handleInitiateClick} className="space-y-8">

                    {/* Section 1: Parties Selection */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Parties Selection</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Registered Patient *</label>
                                <select
                                    name="patientId"
                                    value={formData.patientId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700 transition"
                                >
                                    <option value="">-- Select Patient --</option>
                                    {patients.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} (ID: {p._id.slice(-6)})</option>
                                    ))}
                                </select>
                                {patients.length === 0 && (
                                    <p className="mt-2 text-sm text-yellow-600 font-medium">No patients found. Please register a patient first.</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Insurance Provider *</label>
                                <select
                                    name="insuranceCompanyId"
                                    value={formData.insuranceCompanyId}
                                    onChange={handleInputChange}
                                    className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium text-slate-700 transition"
                                >
                                    <option value="">-- Select Insurance Provider --</option>
                                    {insuranceCompanies.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                                {insuranceCompanies.length === 0 && (
                                    <p className="mt-2 text-sm text-yellow-600 font-medium">No active insurance providers available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Medical Details */}
                    <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Medical & Treatment Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Diagnosis *</label>
                                <input
                                    type="text"
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Acute Appendicitis, Viral Fever"
                                    className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Treatment Administered *</label>
                                <textarea
                                    name="treatment"
                                    value={formData.treatment}
                                    onChange={handleInputChange}
                                    placeholder="Describe the medical procedures, medications, or surgeries provided..."
                                    rows="3"
                                    className="w-full border border-slate-300 rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Claim Amount (₹) *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-bold">₹</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="250000"
                                        min="1"
                                        className="w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-lg font-bold text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Documents Upload */}
                    <div className="bg-emerald-50/30 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex justify-between items-center mb-4 border-b border-emerald-200 pb-2">
                            <h2 className="text-lg font-bold text-slate-800">Hospital Documents</h2>
                            <button
                                type="button"
                                onClick={handleDocumentAdd}
                                className="bg-emerald-100 text-emerald-700 font-bold py-1 px-4 rounded-lg text-sm hover:bg-emerald-200 transition"
                            >
                                + Add Document
                            </button>
                        </div>

                        {formData.documents.length === 0 ? (
                            <div className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center bg-white">
                                <p className="text-slate-500">No documents added. Click to add Discharge Summary, Bills, etc.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.documents.map((doc, index) => (
                                    <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                                        <div className="w-full md:w-1/3">
                                            <select
                                                value={doc.docType}
                                                onChange={(e) => handleDocumentChange(index, 'docType', e.target.value)}
                                                className="w-full border border-slate-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium text-slate-700"
                                            >
                                                <option value="Discharge Summary">Discharge Summary</option>
                                                <option value="Pharmacy Bill">Pharmacy Bill</option>
                                                <option value="Investigation Report">Investigation Report</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <input
                                                type="file"
                                                onChange={(e) => handleDocumentChange(index, 'file', e.target.files[0])}
                                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all cursor-pointer"
                                            />
                                        </div>
                                        <div className="w-full md:w-auto flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => handleDocumentRemove(index)}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                                title="Remove Document"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/hospital/claims')}
                            className="px-6 py-3 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={otpSending || patients.length === 0}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all text-lg"
                        >
                            {otpSending ? "Sending OTP..." : "Initiate Claim"}
                        </motion.button>
                    </div>
                </form>

                {/* OTP Verification Modal */}
                <AnimatePresence>
                    {showOTPModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100"
                            >
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                        🔐
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Patient Consent Required</h3>
                                    <p className="text-slate-500 text-sm mt-2 font-medium">
                                        An OTP has been sent to the patient's registered email. Please enter it below to confirm their consent and submit the claim.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full border-2 border-slate-200 rounded-2xl py-4 px-4 text-center text-2xl tracking-[0.5em] font-mono font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all"
                                        maxLength="6"
                                    />

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowOTPModal(false)}
                                            className="flex-1 py-3 px-4 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading || otp.length < 6}
                                            className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition disabled:opacity-50"
                                        >
                                            {loading ? "Submitting..." : "Verify & Submit"}
                                        </button>
                                    </div>
                                    <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">
                                        (Dev mode: use 123456)
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DashboardLayout>
    );
}
