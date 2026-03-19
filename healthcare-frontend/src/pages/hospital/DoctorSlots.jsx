import { useState, useEffect } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PlusCircle } from "lucide-react";

export default function DoctorSlots() {
  const { user } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New Slot Form State
  const [newSlot, setNewSlot] = useState({
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    slotsTotal: 5
  });

  const fetchSlots = async () => {
    try {
        setLoading(true);
        const endpoint = user?.role?.toLowerCase() === 'hospital' ? '/hospitals/slots' : '/patients/slots';
        const res = await api.get(endpoint);
        if (res.data.success) {
            // Filter historical/expired slots dynamically based on current time
            const now = new Date();
            const validSlots = res.data.data.filter(slot => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}:00`);
                return slotDateTime >= now;
            });

            setDoctorSlots(validSlots);
            
            // For patients, we extract their booked slots from the data payload
            if (user?.role?.toLowerCase() === 'patient') {
                const myBookings = [];
                validSlots.forEach(slot => {
                    const isBooked = slot.bookedPatients?.find(bp => bp.patientId === user._id || bp.patientEmail === user.email);
                    if (isBooked) {
                         myBookings.push(slot);
                    }
                });
                setBookedSlots(myBookings);
            }
        }
    } catch(error) {
        toast.error("Failed to load doctor slots");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [user]);

  const handleBookSlot = async (slot) => {
    try {
        const res = await api.post(`/patients/slots/${slot._id || slot.id}/book`);
        if (res.data.success) {
            toast.success(`Appointment confirmed with Dr. ${slot.doctorName}`);
            fetchSlots();
            setSelectedSlot(null);
        }
    } catch(error) {
        toast.error(error.response?.data?.message || "Failed to book slot");
    }
  };

  const isSlotBooked = (slotId) => {
    return bookedSlots.some((b) => b._id === slotId || b.id === slotId);
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.doctorName || !newSlot.date || !newSlot.time) return toast.error("Please fill all required slot fields");

    try {
        const res = await api.post('/hospitals/slots', {
          ...newSlot,
          maxSlots: parseInt(newSlot.slotsTotal) || 5
        });
        if (res.data.success) {
            toast.success("Doctor slot created successfully!");
            setNewSlot({ doctorName: "", specialty: "", date: "", time: "", slotsTotal: 5 });
            setIsAdding(false);
            fetchSlots();
        }
    } catch(error) {
        console.error("SLOT CREATION ERROR TRACE:", error);
        toast.error(`${error.response?.data?.message || error.message || "Failed to create slot"}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">Consultation Schedules</h1>
           <p className="text-slate-500 mt-1">Manage and book specialist appointments</p>
        </div>
        {user?.role?.toLowerCase() === 'hospital' && (
           <button 
             onClick={() => setIsAdding(!isAdding)}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition flex items-center gap-2"
           >
             <PlusCircle className="w-5 h-5" />
             {isAdding ? "Cancel" : "Add Slot"}
           </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && user?.role?.toLowerCase() === 'hospital' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">Create New Doctor Schedule</h3>
              <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">Doctor Name</label>
                  <input type="text" value={newSlot.doctorName} onChange={(e) => setNewSlot({...newSlot, doctorName: e.target.value})} className="w-full rounded-xl border-indigo-200 py-2 px-3 text-sm focus:ring-indigo-500" placeholder="e.g. Sarah Jenkins" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">Specialty</label>
                  <input type="text" value={newSlot.specialty} onChange={(e) => setNewSlot({...newSlot, specialty: e.target.value})} className="w-full rounded-xl border-indigo-200 py-2 px-3 text-sm focus:ring-indigo-500" placeholder="e.g. Cardiology" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">Date</label>
                  <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({...newSlot, date: e.target.value})} className="w-full rounded-xl border-indigo-200 py-2 px-3 text-sm focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">Time</label>
                  <input type="time" value={newSlot.time} onChange={(e) => setNewSlot({...newSlot, time: e.target.value})} className="w-full rounded-xl border-indigo-200 py-2 px-3 text-sm focus:ring-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-indigo-800 mb-1">Total Slots</label>
                  <input type="number" min="1" value={newSlot.slotsTotal} onChange={(e) => setNewSlot({...newSlot, slotsTotal: e.target.value})} className="w-full rounded-xl border-indigo-200 py-2 px-3 text-sm focus:ring-indigo-500" required />
                </div>
                <div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition">Publish</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  const maxSlots = slot.maxSlots || slot.slotsTotal || 1;
                  const isFull = slot.slotsFilled >= maxSlots;
                  const alreadyBooked = isSlotBooked(slot._id || slot.id);
                  const isSelected = selectedSlot === (slot._id || slot.id);

                  return (
                    <motion.div
                      key={slot._id || slot.id}
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
                      onClick={() => setSelectedSlot(isSelected ? null : (slot._id || slot.id))}
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
                          {slot.slotsFilled}/{maxSlots} Booked
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
                        {isSelected && user?.role?.toLowerCase() === 'patient' && (
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

        {/* Sidebar Context */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl shadow-xl h-fit sticky top-6 text-white overflow-hidden relative">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

          {user?.role?.toLowerCase() === 'hospital' ? (
             <>
               <h2 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10"><div className="w-2 h-6 bg-blue-400 rounded-full"></div> Registered Patients</h2>
               {doctorSlots.length === 0 || doctorSlots.every(s => s.bookedPatients?.length === 0) ? (
                 <div className="text-center py-8 relative z-10">
                   <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                     <span className="text-2xl opacity-50">👥</span>
                   </div>
                   <p className="text-slate-400 text-sm">No patients have booked slots yet.</p>
                 </div>
               ) : (
                 <div className="space-y-4 relative z-10">
                   {doctorSlots.filter(s => s.bookedPatients?.length > 0).map(slot => (
                      <div key={slot._id} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                         <div className="flex justify-between items-center mb-3">
                           <p className="font-bold text-blue-300 text-sm">{slot.date} at {slot.time}</p>
                           <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{slot.doctorName}</span>
                         </div>
                         <div className="space-y-2">
                            {slot.bookedPatients.map((bp, i) => (
                               <div key={i} className="bg-black/20 p-2 rounded-lg text-sm flex items-center gap-2 border border-white/5">
                                 <span className="text-emerald-400">👤</span>
                                 <span className="text-slate-200 font-medium truncate">{bp.patientName}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   ))}
                 </div>
               )}
             </>
          ) : (
             <>
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
                       key={booking._id || booking.id}
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
             </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
