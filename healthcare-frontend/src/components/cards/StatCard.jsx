import { motion } from "framer-motion";

export default function StatCard({ title, value, color, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)" }}
      className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-slate-100 dark:to-slate-700/50 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110"></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className="text-slate-500 dark:text-slate-400 font-bold tracking-wider text-xs uppercase mb-3">{title}</h3>
          <p className={`text-4xl font-black ${color} tracking-tight`}>{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${color.replace('text-', 'bg-')}`}>
            <span className={`text-xl ${color}`}>{icon}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}