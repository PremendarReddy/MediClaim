import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { Shield, Mail, Phone, MapPin, Building, Award } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();
    const ins = user?.insuranceDetails || {};

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
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Building className="w-5 h-5 text-slate-500" />
                            Company Contact Info
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
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{ins?.address || 'Corporate Address Not Configured'}</p>
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
                                <p className="font-mono text-lg text-slate-800 dark:text-slate-200">
                                    {ins?.registrationNumber || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
