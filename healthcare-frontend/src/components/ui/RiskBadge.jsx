export default function RiskBadge({ level }) {
  const base = "px-3 py-1 text-xs font-semibold rounded-full";

  const styles = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  return (
    <span className={`${base} ${styles[level] || "bg-gray-100 text-gray-600"}`}>
      {level} Risk
    </span>
  );
}