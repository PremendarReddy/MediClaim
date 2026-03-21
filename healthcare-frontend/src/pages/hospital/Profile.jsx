import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Building2, Mail, MapPin, Hash, Activity, FileText } from "lucide-react";
import api from "../../api/axios";

export default function Profile() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalPatients: 0, activeClaims: 0 });

    useEffect(() => {
        const fetchStats = async () => {
             try {
                 const [patientsRes, claimsRes] = await Promise.all([
                     api.get('/hospitals/patients'),
                     api.get('/hospitals/claims')
                 ]);
                 
                 const totalPatients = patientsRes.data?.count || patientsRes.data?.data?.length || 0;
                 const allClaims = claimsRes.data?.data || [];
                 const activeClaims = allClaims.filter(c => c.status === "Pending" || c.status === "Submitted").length;

                 setStats({
                     totalPatients,
                     activeClaims
                 });
             } catch (err) {
                 console.error("Failed to fetch hospital stats natively", err);
             }
        };
        fetchStats();
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{user?.name}</h1>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Verified Hospital Provider
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Registration Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Hash className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Registration Number</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{user?.hospitalDetails?.registrationNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Email Address</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{user?.hospitalDetails?.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30 shadow-sm text-center">
                            <Activity className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.totalPatients}</p>
                            <p className="text-sm text-indigo-600/80 dark:text-indigo-400 mt-1 font-medium">Total Patients Managed</p>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30 shadow-sm text-center">
                            <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                            <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.activeClaims}</p>
                            <p className="text-sm text-orange-600/80 dark:text-orange-400 mt-1 font-medium">Active Claims Under Review</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
