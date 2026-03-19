import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Calendar, HeartPulse, FileText, Phone, MapPin, AlertCircle, Fingerprint, Activity } from "lucide-react";

export default function Profile() {
    const { user } = useAuth();
    const pd = user?.patientDetails || {};

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white dark:border-slate-800 shadow-md">
                            <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 mt-2">
                            <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{user?.name}</h1>
                            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 shadow-sm">
                                    Active Patient Record
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 gap-2 shadow-sm border border-slate-200 dark:border-slate-600">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Born: {pd?.dateOfBirth ? new Date(pd.dateOfBirth).toLocaleDateString() : 'N/A'}
                                </span>
                                {pd?.bloodGroup && (
                                   <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-400 gap-2 shadow-sm">
                                       <HeartPulse className="w-3.5 h-3.5" />
                                       Type {pd.bloodGroup}
                                   </span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Security & System Info */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Fingerprint className="w-5 h-5 text-indigo-500" />
                                Registration Profile
                            </h2>
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Government Tag ({pd?.governmentId?.type || 'N/A'})</p>
                                    <p className="font-mono text-sm text-slate-800 dark:text-slate-200 font-bold">{pd?.governmentId?.number || 'Pending Assignment'}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Biological Gender</p>
                                    <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">{pd?.gender || 'Unspecified'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 border border-indigo-400 shadow-md text-white relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                             <h2 className="text-lg font-bold mb-4 flex items-center gap-2 relative z-10">
                                 <FileText className="w-5 h-5 text-white/80" />
                                 Active Policy
                             </h2>
                             <div className="space-y-4 relative z-10">
                                 <div>
                                     <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Host Provider ID</p>
                                     <p className="font-mono text-xl font-bold">{pd?.insuranceDetails?.providerId || 'Not Configured'}</p>
                                 </div>
                                 <div className="bg-black/20 p-3 rounded-xl border border-white/10 mt-2">
                                     <p className="text-xs text-indigo-200 font-semibold mb-1">Policy Identity Key</p>
                                     <p className="font-medium tracking-wide">{pd?.insuranceDetails?.policyNumber || 'Pending Configuration'}</p>
                                 </div>
                             </div>
                        </div>
                    </motion.div>

                    {/* Contact Logistics */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Contact Logistics
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-600/50">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                       <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Email Binding</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{user?.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-600/50">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                       <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Direct Phone</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{pd?.phoneNumber || '+1 (555) 000-0000'}</p>
                                    </div>
                                </div>
                                <div className="md:col-span-2 flex items-start gap-4 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-600/50">
                                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                       <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Fixed Address</p>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-1">{pd?.address || 'No residential address provided during onboarding phase.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Overrides */}
                        <div className="bg-rose-50 dark:bg-rose-900/10 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/30 relative overflow-hidden">
                            <h2 className="text-lg font-bold text-rose-800 dark:text-rose-400 mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Emergency Protocols
                            </h2>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-rose-100 dark:border-rose-800/50 flex flex-col md:flex-row items-center gap-6 justify-between">
                                 <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Primary Override Contact</p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{pd?.emergencyContact?.name || 'Unspecified'}</p>
                                    <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{pd?.emergencyContact?.relation || 'Relation Unbound'}</p>
                                 </div>
                                 <div className="bg-rose-100 dark:bg-rose-900/30 px-6 py-3 rounded-xl w-full md:w-auto text-center border border-rose-200 dark:border-rose-800">
                                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase mb-1">Emergency Dispatch</p>
                                    <p className="font-mono text-lg font-bold text-rose-900 dark:text-rose-100 tracking-wider">{pd?.emergencyContact?.phone || 'N/A'}</p>
                                 </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
