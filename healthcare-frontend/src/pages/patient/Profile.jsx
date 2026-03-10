import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Calendar, HeartPulse, FileText, Phone } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();
    const pd = user?.patientDetails || {};

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-slate-800 shadow-md">
                            <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 mt-2">
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{user?.name}</h1>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Active Patient
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 gap-2">
                                    <Calendar className="w-3 h-3" />
                                    DOB: {pd?.dateOfBirth ? new Date(pd.dateOfBirth).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" />
                            Personal Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">+1 (555) 000-0000</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-500" />
                            Insurance Policy
                        </h2>
                        <div className="space-y-4">
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-100 dark:border-purple-800/30">
                                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold uppercase tracking-wider mb-1">Provider ID</p>
                                <p className="font-mono text-lg text-slate-800 dark:text-slate-200">
                                    {pd?.insuranceDetails?.providerId || 'Not Configured'}
                                </p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">Policy Number</p>
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                    {pd?.insuranceDetails?.policyNumber || 'Pending'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
