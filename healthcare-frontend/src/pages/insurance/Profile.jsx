import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { Shield, Mail, Phone, MapPin, Building, Award, Edit3 } from "lucide-react";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function Profile() {
    const { user } = useAuth();
    const ins = user?.insuranceDetails || {};

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        address: ins?.address || '',
        registrationNumber: ins?.registrationNumber || ''
    });

    const handleSave = async () => {
        try {
            setSaving(true);
            const res = await api.put('/auth/profile', {
                insuranceDetails: form
            });
            if (res.data.success) {
                toast.success("Profile updated securely");
                setIsEditing(false);
                setTimeout(() => window.location.reload(), 800);
            }
        } catch (error) {
            toast.error("Failed to merge updates");
        } finally {
            setSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-slate-800 shadow-md">
                            <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 mt-2">
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{user?.name}</h1>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                    <Award className="w-3 h-3 mr-1" /> Licensed Insurance Provider
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm relative">
                        
                        <div className="absolute top-6 right-6">
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg hover:text-slate-700 transition">Cancel</button>
                                    <button onClick={handleSave} disabled={saving} className="text-xs font-bold text-white bg-indigo-600 px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition">
                                        {saving ? "..." : "Save"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Building className="w-5 h-5 text-slate-500" />
                            Provider Logistics
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Claims Support Email</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Headquarters</p>
                                    {isEditing ? (
                                        <input 
                                            className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 mt-1 dark:bg-slate-800 border-none outline-none rounded px-2 py-1 flex-1 w-full"
                                            value={form.address}
                                            onChange={(e) => setForm({...form, address: e.target.value})}
                                            placeholder="Enter Address"
                                        />
                                    ) : (
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{ins?.address || 'Corporate Address Not Configured'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            Registrar Information
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur p-4 rounded-xl border border-white/40 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Company Registration Number</p>
                                {isEditing ? (
                                    <input 
                                        className="font-mono text-lg text-slate-800 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-900/50 outline-none rounded p-2 focus:ring-2 focus:ring-indigo-300 w-full"
                                        value={form.registrationNumber}
                                        onChange={(e) => setForm({...form, registrationNumber: e.target.value})}
                                        placeholder="Enter Reg Number"
                                    />
                                ) : (
                                    <p className="font-mono text-lg font-black text-slate-800 dark:text-slate-200">
                                        {ins?.registrationNumber || 'N/A'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
