export default function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-gray-500 text-sm mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}