import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { useClaim } from "../../context/ClaimContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { useNavigate } from "react-router-dom";

export default function AIAnalysis() {


  

    const navigate = useNavigate();

    
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const { updateHealthRisk } = useClaim();
  const handleAnalyze = () => {
    if (!file) return;

    setLoading(true);

    // Simulate AI processing
    setTimeout(() => {
        const newResult = {
        id: Date.now(),
        fileName: file.name,
        date: new Date().toLocaleString(),
        summary:
            "Patient hemoglobin is slightly below normal range. Mild anemia suspected. Further iron profile recommended.",
        metrics: [
            { name: "Hemoglobin", value: 10.5 },
            { name: "RBC Count", value: 4.1 },
            { name: "WBC Count", value: 7.0 },
        ],
        risk: "Medium",
        };
        updateHealthRisk(newResult.risk);
setResult(newResult);
setHistory((prev) => [newResult, ...prev]);
      setLoading(false);
    }, 2000);
  };

  return (
    <DashboardLayout role="patient">

        <button
    onClick={() => navigate("/insurance/claims")}
    >
    Go To Insurance
    </button>
      <h1 className="text-2xl font-bold mb-6">AI Report Analysis</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl">

        {/* Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Medical Report
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full border rounded-lg px-3 py-2"
          />

          {file && (
            <p className="mt-2 text-sm text-green-600">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          Analyze Report
        </button>

        {/* Loading */}
        {loading && (
          <p className="mt-4 text-blue-600">
            Analyzing report using AI...
          </p>
        )}

        {/* Result */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h2 className="font-semibold mb-2">AI Summary</h2>
              <p className="text-sm text-gray-700">
                {result.summary}
              </p>
            </div>

            {/* Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h2 className="font-semibold mb-3">Extracted Metrics</h2>
              <ul className="space-y-2">
                {result.metrics.map((metric, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span>{metric.name}</span>
                    <span
                      className={`font-medium ${
                        metric.status === "Low"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {metric.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chart Visualization */}
            <div className="bg-white p-4 rounded-lg border mt-6">
            <h2 className="font-semibold mb-4">Metric Visualization</h2>

            <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                <BarChart data={result.metrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>
            {/* Risk Indicator */}
            <div className="bg-yellow-50 p-4 rounded-lg border">
              <h2 className="font-semibold mb-2">Health Risk Level</h2>
              <p className="text-yellow-700 font-medium">
                {result.risk} Risk
              </p>
            </div>

          </div>
        )}
      </div>

      {/* Analysis History */}
{history.length > 0 && (
  <div className="mt-10 bg-white p-6 rounded-xl shadow-sm border">
    <h2 className="text-lg font-semibold mb-4">
      Analysis History
    </h2>

    <div className="space-y-3">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => setResult(item)}
          className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between"
        >
          <div>
            <p className="font-medium">{item.fileName}</p>
            <p className="text-sm text-gray-500">{item.date}</p>
          </div>

          <span className="text-blue-600 text-sm font-medium">
            View
          </span>
        </div>
      ))}
    </div>
  </div>
)}
    </DashboardLayout>
  );
}