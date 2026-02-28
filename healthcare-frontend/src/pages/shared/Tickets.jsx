import DashboardLayout from "../../layouts/DashboardLayout";
import { useClaim } from "../../context/ClaimContext";
import { useState } from "react";

export default function Tickets({ role }) {
  const { tickets, createTicket, updateTicketStatus } = useClaim();

  const [form, setForm] = useState({
    subject: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    createTicket({
      subject: form.subject,
      message: form.message,
      raisedBy: role,
    });

    setForm({ subject: "", message: "" });
  };

  return (
    <DashboardLayout role={role}>
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      {/* Raise Ticket */}
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
        <h2 className="font-semibold mb-4">All Tickets</h2>

        {tickets.length === 0 ? (
          <p className="text-sm text-gray-500">
            No tickets available.
          </p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
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
                  onClick={() =>
                    updateTicketStatus(ticket.id, "Resolved")
                  }
                  className="mt-2 bg-green-600 text-white px-3 py-1 rounded-lg"
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