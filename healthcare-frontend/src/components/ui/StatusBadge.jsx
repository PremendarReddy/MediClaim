export default function StatusBadge({ status }) {
  const base = "px-3 py-1 text-xs font-medium rounded-full";

  const styles = {
    "Under Review": "bg-yellow-100 text-yellow-700",
    "Amount Released": "bg-indigo-100 text-indigo-700",
    "Approved": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
    "Pending": "bg-blue-100 text-blue-700",
  };

  return (
    <span className={`${base} ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}
