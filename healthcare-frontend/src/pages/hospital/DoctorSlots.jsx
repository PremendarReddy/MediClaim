import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Mock Data for Doctor Slots
const MOCK_SLOTS = [
  { id: "S1", doctorName: "Sarah Jenkins", specialty: "Cardiology", date: "2024-05-15", time: "10:00 AM", slotsFilled: 4, slotsTotal: 5 },
  { id: "S2", doctorName: "Michael Chen", specialty: "Neurology", date: "2024-05-15", time: "02:30 PM", slotsFilled: 2, slotsTotal: 6 },
  { id: "S3", doctorName: "Emily Parker", specialty: "Pediatrics", date: "2024-05-16", time: "09:00 AM", slotsFilled: 8, slotsTotal: 8 },
  { id: "S4", doctorName: "Robert Wilson", specialty: "Orthopedics", date: "2024-05-16", time: "11:15 AM", slotsFilled: 1, slotsTotal: 4 },
  { id: "S5", doctorName: "Lisa Thompson", specialty: "General Medicine", date: "2024-05-17", time: "01:00 PM", slotsFilled: 3, slotsTotal: 10 },
];

export default function DoctorSlots() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState(MOCK_SLOTS);
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("bookedSlots");
    if (saved) {
      try {
        setBookedSlots(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse booked slots");
      }
    }
  }, []);

  const handleBookSlot = (slot) => {
    if (slot.slotsFilled < slot.slotsTotal) {
      // Mock Booking Logic
      const updatedSlots = doctorSlots.map(s =>
        s.id === slot.id ? { ...s, slotsFilled: s.slotsFilled + 1 } : s
      );
      setDoctorSlots(updatedSlots);

      const newBooked = [...bookedSlots, { ...slot, bookedAt: new Date().toLocaleString(), _bookingId: Date.now().toString() }];
      setBookedSlots(newBooked);
      localStorage.setItem("bookedSlots", JSON.stringify(newBooked));

      toast.success(`Appointment confirmed with Dr. ${slot.doctorName}`);
      setSelectedSlot(null);
    }
  };

  const isSlotBooked = (slotId) => {
    return bookedSlots.some((b) => b.id === slotId);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Book Doctor Appointment</h1>
        <p className="text-slate-500 mt-1">Schedule consultations with available specialists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Slots */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><div className="w-2 h-6 bg-blue-500 rounded-full"></div> Available Consultants</h2>

            {doctorSlots.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">🥼</div>
                <p className="font-bold text-slate-700">No Specialists Available</p>
                <p className="text-sm text-slate-500">Check back later for open consultation slots.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {doctorSlots.map((slot) => {
                  const isFull = slot.slotsFilled >= slot.slotsTotal;
                  const alreadyBooked = isSlotBooked(slot.id);
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <motion.div
                      key={slot.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`border-2 rounded-2xl p-5 cursor-pointer transition-all overflow-hidden ${isSelected
                          ? "border-blue-500 bg-blue-50/30 shadow-md"
                          : isFull
                            ? "border-slate-100 bg-slate-50 opacity-75"
                            : "border-slate-100 hover:border-blue-200 hover:shadow-sm bg-white"
                        }`}
                      onClick={() => setSelectedSlot(isSelected ? null : slot.id)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isFull ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                            {slot.doctorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-lg text-slate-800">
                              Dr. {slot.doctorName}
                            </p>
                            <p className="text-sm font-semibold text-blue-600">
                              {slot.specialty}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${isFull ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                          {slot.slotsFilled}/{slot.slotsTotal} Booked
                        </span>
                      </div>

                      <div className="flex gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100 w-fit">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">📅</span>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</p>
                            <p className="font-bold text-slate-800 text-sm">{slot.date}</p>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">⏰</span>
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</p>
                            <p className="font-bold text-slate-800 text-sm">{slot.time}</p>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            className="pt-4 border-t border-slate-200/60"
                          >
                            {alreadyBooked ? (
                              <button
                                disabled
                                className="w-full bg-emerald-100 text-emerald-700 font-bold py-3 rounded-xl cursor-default flex items-center justify-center gap-2"
                              >
                                <span>✓</span> Appointment Confirmed
                              </button>
                            ) : isFull ? (
                              <button
                                disabled
                                className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-xl cursor-not-allowed"
                              >
                                Session Fully Booked
                              </button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={(e) => { e.stopPropagation(); handleBookSlot(slot); }}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                Reserve Session
                              </motion.button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Booked Slots Sidebar */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl h-fit sticky top-6 text-white overflow-hidden relative">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10"><div className="w-2 h-6 bg-emerald-400 rounded-full"></div> My Bookings</h2>

          {bookedSlots.length === 0 ? (
            <div className="text-center py-8 relative z-10">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <span className="text-2xl opacity-50">📅</span>
              </div>
              <p className="text-slate-400 text-sm">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4 relative z-10">
              {bookedSlots.map((booking) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={booking._bookingId}
                  className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 hover:bg-white/15 transition"
                >
                  <p className="font-bold text-lg text-white">
                    Dr. {booking.doctorName}
                  </p>
                  <p className="text-sm font-medium text-emerald-400 mb-3">
                    {booking.specialty}
                  </p>
                  <div className="bg-black/20 rounded-xl p-3 flex justify-between items-center border border-black/10">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">📅</span>
                      <p className="font-bold text-sm text-slate-200">{booking.date}</p>
                    </div>
                    <div className="w-px h-4 bg-white/10"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">⏰</span>
                      <p className="font-bold text-sm text-slate-200">{booking.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}