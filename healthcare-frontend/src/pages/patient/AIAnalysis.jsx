import { useState, useRef, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { getMedicalInsights, generalChat } from "../../services/agentService";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AIAnalysis() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState("chat");
  const [chatMode, setChatMode] = useState("policy");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [claimsData, setClaimsData] = useState([]);
  const [profileData, setProfileData] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Hello! I'm your AI MediClaim Agent. I can help you with:\n• Understanding your medical reports\n• Analyzing claim documents\n• Answering insurance questions\n• Checking claim eligibility\n\nWhat would you like help with?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [claimsRes, profileRes] = await Promise.all([
          api.get('/patients/claims'),
          api.get('/auth/profile')
        ]);
        if (claimsRes.data.success) {
          setClaimsData(claimsRes.data.data);
        }
        if (profileRes.data.success) {
          setProfileData(profileRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch AI context data", err);
      }
    };
    fetchData();
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);

    try {
      // Simulate reading the file text by just passing the file name for the NLP mock
      const simulatedFileContentText = `Patient uploaded a document named ${file.name}. It contains test results for glucose and blood pressure.`;

      const agentResponse = await getMedicalInsights(simulatedFileContentText);

      if (agentResponse.success) {
        const { diagnosis, riskFactor, aiSummary, extractedMetrics } = agentResponse.data;

        const newResult = {
          id: Date.now(),
          fileName: file.name,
          date: new Date().toLocaleString(),
          summary: aiSummary,
          metrics: extractedMetrics.keywordsFound.map(kw => ({
            name: kw.charAt(0).toUpperCase() + kw.slice(1),
            value: Math.floor(Math.random() * 100) + 50 // Simulation value for chart
          })),
          risk: riskFactor,
          recommendations: [
            `Diagnosis classified as: ${diagnosis}`,
            "Please consult your primary physician regarding these findings.",
            "Upload further historical reports for a deeper trend analysis."
          ],
        };

        setHistory((prev) => [newResult, ...prev]);
        setResult(newResult);
        setFile(null);
        toast.success("Document analyzed successfully!");

        // Add bot message
        const botMsg = {
          id: messages.length + 1,
          type: "bot",
          text: `I've analyzed your report: ${newResult.fileName}. ${newResult.summary}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        toast.error("AI Analysis failed.");
      }
    } catch (error) {
      console.error("Agent 3 Error", error);
      toast.error("Failed to analyze document.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const currentInput = inputMessage;
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: currentInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      // Build an Omni-Context payload containing all patient information regardless of active tab
      const coverageInfo = profileData?.patientDetails?.insuranceDetails;
      const provider = coverageInfo?.isCustomProvider ? coverageInfo?.customProviderName : coverageInfo?.providerName;

      const policyContext = (coverageInfo && provider) ? {
        providerName: provider,
        coverageLimit: coverageInfo.coverageAmount,
        policyExpiry: coverageInfo.validUpto,
        isCustomProvider: coverageInfo.isCustomProvider
      } : "No active policy registered.";

      const masterContext = {
        activeMode: chatMode,
        policyData: policyContext,
        claimsData: claimsData || [],
        documentsData: profileData?.patientDetails?.medicalHistory || []
      };

      const contextPayload = JSON.stringify(masterContext);

      const agentResponse = await generalChat(chatMode, currentInput, contextPayload);

      if (agentResponse.success) {
        let botText = typeof agentResponse.data === 'string'
          ? agentResponse.data
          : agentResponse.data.queryAnswer || "I've processed your query.";

        // Add Bot message
        const botMsg = {
          id: Date.now() + 1,
          type: "bot",
          text: botText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      console.error("Agent 5 Error", error);
      const errorMsg = {
        id: Date.now() + 1,
        type: "bot",
        text: "I'm sorry, I'm having trouble connecting to the insurance knowledge base right now.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-600/30">✨</div>
            Nexus AI Agent
          </h1>
          <p className="text-slate-500">Your personal healthcare and insurance assistant.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 border-r border-slate-100 pr-6 space-y-2">
          <button
            onClick={() => setSelectedTab("chat")}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${selectedTab === "chat"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
          >
            <span>💬</span> Intelligent Chat
          </button>
          <button
            onClick={() => setSelectedTab("analyze")}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${selectedTab === "analyze"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
          >
            <span>📊</span> Document Analysis
          </button>
          <button
            onClick={() => setSelectedTab("history")}
            className={`w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 ${selectedTab === "history"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
              : "text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
              }`}
          >
            <span>📜</span> Query History
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {/* Chat Agent Tab */}
            {selectedTab === "chat" && (
              <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-[600px] bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">

                {/* Mode Selector Header */}
                <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-center overflow-x-auto hide-scrollbar">
                  <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex inline-flex text-xs font-bold min-w-max">
                    <button onClick={() => setChatMode('claims')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${chatMode === 'claims' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <span>📋</span> Claims Assistance
                    </button>
                    <button onClick={() => setChatMode('policy')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${chatMode === 'policy' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <span>🛡️</span> Policy Details
                    </button>
                    <button onClick={() => setChatMode('medical')} className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${chatMode === 'medical' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>
                      <span>🩺</span> Medical Help
                    </button>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                  {messages.map((msg) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${msg.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                        {msg.type === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 text-sm shadow-sm z-10">✨</div>
                        )}
                        <div
                          className={`px-5 py-3.5 rounded-2xl shadow-sm ${msg.type === "user"
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-white text-slate-800 rounded-bl-sm border border-slate-100"
                            }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-2 font-medium ${msg.type === "user" ? "text-indigo-200 text-right" : "text-slate-400"}`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {loading && selectedTab === "chat" && (
                    <div className="flex justify-start">
                      <div className="flex items-end gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 text-sm shadow-sm z-10">✨</div>
                        <div className="px-5 py-4 rounded-2xl rounded-bl-sm bg-white border border-slate-100 flex gap-1 items-center">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <form onSubmit={handleSendMessage} className="relative mt-2">
                    <input
                      type="text"
                      placeholder={chatMode === 'claims' ? "Ask about your claim status or required documents..." : chatMode === 'medical' ? "Describe your symptoms or medication..." : "Ask what's covered under your policy..."}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      disabled={loading}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-4 pr-16 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || loading}
                      className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition flex items-center justify-center disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-md"
                    >
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </form>

                  {/* Suggested prompts underneath */}
                  <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-2">
                    {["What's my claim status?", "Required documents?", "Explain my coverage"].map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setInputMessage(prompt);
                          setTimeout(() => handleSendMessage({ preventDefault: () => { } }), 100);
                        }}
                        className="text-xs font-bold whitespace-nowrap px-4 py-2 bg-slate-100 text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Report Analysis Tab */}
            {selectedTab === "analyze" && (
              <motion.div key="analyze" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors rounded-2xl p-10 text-center relative group cursor-pointer bg-slate-50 hover:bg-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>

                    <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 relative z-10 text-indigo-500 group-hover:scale-110 transition-transform">
                      📄
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 relative z-10">Upload Medical Document</h3>
                    <p className="text-slate-500 text-sm mb-6 relative z-10 max-w-sm mx-auto">Upload PDF, JPG, or PNG files of prescriptions, blood tests, or discharge summaries for AI extraction.</p>

                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    {file && (
                      <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold relative z-10">
                        <span>📎</span> {file.name}
                      </div>
                    )}
                    {!file && (
                      <button className="bg-white text-slate-700 border border-slate-200 px-6 py-2 rounded-xl text-sm font-bold relative z-10 pointer-events-none group-hover:bg-slate-50">
                        Browse Files
                      </button>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleAnalyze}
                      disabled={!file || loading}
                      className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Extracting Insights...</>
                      ) : "▶ Analyze Document"}
                    </button>
                  </div>
                </div>

                {result && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                        <div className="w-2 h-6 bg-indigo-400 rounded-full"></div> 📋 Executive Summary
                      </h2>
                      <p className="text-indigo-100 leading-relaxed font-medium relative z-10 text-lg">
                        "{result.summary}"
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recommendations */}
                      {result.recommendations && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">✅</div>
                            AI Recommendations
                          </h3>
                          <ul className="space-y-4">
                            {result.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm font-medium text-slate-600 flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-emerald-500 font-bold shrink-0">→</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Metrics Chart */}
                      {result.metrics && (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">📊</div>
                            Extracted Vital Metrics
                          </h3>
                          <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={result.metrics} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  cursor={{ fill: '#f8fafc' }}
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* History Tab */}
            {selectedTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Past Analyses</h2>
                {history.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6 text-4xl shadow-inner border border-slate-100">
                      📜
                    </div>
                    <p className="font-bold text-xl text-slate-800 mb-2">No History Yet</p>
                    <p className="text-slate-500 text-sm">Upload documents in the Analysis tab to view past insights here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="p-5 border border-slate-100 rounded-2xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white"
                        onClick={() => {
                          setResult(analysis);
                          setSelectedTab("analyze");
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-lg shadow-sm">📑</div>
                            <div>
                              <p className="font-bold text-slate-800">{analysis.fileName}</p>
                              <p className="text-xs font-bold text-slate-400 mt-1">{analysis.date}</p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.risk === "Low"
                              ? "bg-emerald-100 text-emerald-700"
                              : analysis.risk === "Medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                              }`}
                          >
                            Risk: {analysis.risk}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}
