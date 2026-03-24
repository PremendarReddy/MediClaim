import DashboardLayout from "../../layouts/DashboardLayout";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function Tickets({ role }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    subject: "",
    message: "",
    targetRole: "INSURANCE"
  });

  useEffect(() => {
    fetchTickets();
  }, [role]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      // Exclusively Patients view Sent Tickets, all other roles default to the global Inbox
      const url = role === 'patient' ? '/tickets/my' : '/tickets';

      const response = await api.get(url);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      toast.error("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;

    try {
      const response = await api.post('/tickets', {
        subject: form.subject,
        message: form.message,
        raisedByRole: role.toUpperCase(),
        targetRole: form.targetRole,
      });
      if (response.data.success) {
        toast.success("Support ticket submitted.");
        setForm({ subject: "", message: "" });
        fetchTickets();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create ticket.");
    }
  };

  const handleResolve = async (id) => {
    try {
      const response = await api.put(`/tickets/${id}/resolve`);
      if (response.data.success) {
        toast.success("Ticket marked as resolved.");
        fetchTickets();
      }
    } catch (error) {
      toast.error("Failed to resolve ticket.");
    }
  };

  return (
    <DashboardLayout role={role}>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      {/* Raise Ticket (Restricted ONLY to Patients) */}
      {role === "patient" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="font-semibold mb-4">Raise Ticket</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            
            <select
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 font-medium"
              required
            >
              <option value="INSURANCE">Route To: Insurance Provider</option>
              <option value="HOSPITAL">Route To: My Connected Hospital</option>
            </select>

            <textarea
              placeholder="Describe your issue"
              value={form.message}
              onChange={(e) =>
                setForm({ ...form, message: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Submit Ticket
            </button>
          </form>
        </div>
      )}

      {/* Ticket List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="font-semibold mb-4 text-slate-800">
          {role === 'patient' ? 'My Raised Tickets' : 'Tickets from Patients'}
        </h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-500">
              No tickets available.
            </p>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket._id}
              className="border p-4 rounded-lg mb-4"
            >
              <p className="font-semibold">{ticket.subject}</p>
              <p className="text-sm text-gray-600 mb-2">
                {ticket.message}
              </p>
              <p className="text-sm">
                Status:{" "}
                <span className="font-medium">
                  {ticket.status}
                </span>
              </p>

            {role !== "patient" && ticket.status === "Open" && (
                <button
                  onClick={() => handleResolve(ticket._id)}
                  className="mt-2 text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-200"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
