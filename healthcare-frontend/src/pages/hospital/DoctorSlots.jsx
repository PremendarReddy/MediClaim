import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function DoctorSlots() {
  const [slots, setSlots] = useState([
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "12:00 PM", available: true },
  ]);

  const toggleSlot = (index) => {
    const updated = [...slots];
    updated[index].available = !updated[index].available;
    setSlots(updated);
  };

  return (
    <DashboardLayout role="hospital">
      <h1 className="text-2xl font-bold mb-6">Doctor Slot Management</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex justify-between items-center border p-3 rounded-lg mb-3"
          >
            <p>{slot.time}</p>
            <button
              onClick={() => toggleSlot(index)}
              className={`px-4 py-1 rounded-lg text-white ${
                slot.available
                  ? "bg-green-600"
                  : "bg-red-600"
              }`}
            >
              {slot.available ? "Available" : "Booked"}
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}