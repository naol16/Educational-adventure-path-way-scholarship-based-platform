'use client';

import { useState, useEffect } from 'react';
import { 
  getUpcomingBookings, 
  updateBookingStatus,
  getCounselorSlots,
  createCounselorSlots,
  deleteCounselorSlot,
  updateCounselorSlot,
  joinSession
} from '../api/counselor-api';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  X, 
  Loader2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Video,
  Plus,
  Trash2,
  CalendarPlus,
  Edit2,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { Button, Card, CardBody, Input } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const BookingManager = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'bookings' | 'slots'>('bookings');
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  
  // Slot Form State
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('10:00');
  const [isCreatingSlot, setIsCreatingSlot] = useState(false);

  // Modals State
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  
  const [slotToEdit, setSlotToEdit] = useState<any>(null);
  const [editSlotDate, setEditSlotDate] = useState('');
  const [editSlotStart, setEditSlotStart] = useState('');
  const [editSlotEnd, setEditSlotEnd] = useState('');
  const [isUpdatingSlot, setIsUpdatingSlot] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookings') {
        const data = await getUpcomingBookings();
        setBookings(Array.isArray(data) ? data : data.data || []);
      } else {
        const data = await getCounselorSlots();
        setSlots(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateBookingStatus(id, status);
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (error) {
      toast.error(`Failed to update booking status`);
    }
  };

  const handleJoinMeeting = async (booking: any) => {
    setJoiningId(booking.id);
    try {
      // Use the joinSession API which returns the meetingLink and ensures status is 'started'
      const res = await joinSession(booking.id);
      const meetingLink = res.data?.meetingLink || res.meetingLink || booking.meetingLink;
      
      if (!meetingLink) {
        toast.error("Meeting link not available");
        return;
      }

      toast.success("Joining session...");
      
      // If it's a full URL, redirect. If it's just a roomId/channel, use our internal meeting page
      if (meetingLink.startsWith('http')) {
        window.open(meetingLink, '_blank');
      } else {
        router.push(`/dashboard/meeting/${meetingLink}`);
      }
    } catch (error) {
      console.error("Join error:", error);
      toast.error("Failed to join session");
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlotDate) return toast.error("Please select a date");
    if (!newSlotStart || !newSlotEnd) return toast.error("Please provide start and end times");
    
    setIsCreatingSlot(true);
    try {
      // Backend expects date, startTime (HH:mm), and endTime (HH:mm)
      await createCounselorSlots([{
        date: newSlotDate,
        startTime: newSlotStart,
        endTime: newSlotEnd
      }]);
      
      toast.success("Availability slot created");
      fetchData();
      setNewSlotDate('');
    } catch (error: any) {
      // Extract the exact validation error message from the backend if it exists
      const backendError = error.response?.data?.errors?.[0]?.msg 
        || error.response?.data?.message 
        || "Failed to create slot";
      toast.error(backendError);
    } finally {
      setIsCreatingSlot(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!slotToDelete) return;
    try {
      await deleteCounselorSlot(slotToDelete);
      toast.success("Slot deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete slot");
    } finally {
      setSlotToDelete(null);
    }
  };

  const handleEditClick = (slot: any) => {
    setSlotToEdit(slot);
    // Parse the ISO string to get local date/time for the inputs
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    
    // Format YYYY-MM-DD
    setEditSlotDate(start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0'));
    
    // Format HH:mm
    setEditSlotStart(String(start.getHours()).padStart(2, '0') + ':' + String(start.getMinutes()).padStart(2, '0'));
    setEditSlotEnd(String(end.getHours()).padStart(2, '0') + ':' + String(end.getMinutes()).padStart(2, '0'));
  };

  const handleUpdateSlot = async () => {
    if (!slotToEdit) return;
    if (!editSlotDate || !editSlotStart || !editSlotEnd) return toast.error("Please fill all fields");

    setIsUpdatingSlot(true);
    try {
      // Backend update requires full ISO strings for startTime and endTime
      const startTime = new Date(`${editSlotDate}T${editSlotStart}:00`).toISOString();
      const endTime = new Date(`${editSlotDate}T${editSlotEnd}:00`).toISOString();
      
      await updateCounselorSlot(slotToEdit.id, {
        startTime,
        endTime
      });
      toast.success("Slot updated successfully");
      setSlotToEdit(null);
      fetchData();
    } catch (error: any) {
      const backendError = error.response?.data?.errors?.[0]?.msg 
        || error.response?.data?.message 
        || "Failed to update slot";
      toast.error(backendError);
    } finally {
      setIsUpdatingSlot(false);
    }
  };

  const getStudentName = (booking: any) =>
    booking.student?.name ||
    booking.student?.user?.name ||
    booking.Student?.name ||
    booking.Student?.user?.name ||
    booking.Student?.User?.name ||
    booking.studentName ||
    'Student';

  const getStudentEmail = (booking: any) =>
    booking.student?.email ||
    booking.student?.user?.email ||
    booking.Student?.email ||
    booking.Student?.user?.email ||
    booking.Student?.User?.email ||
    booking.studentEmail ||
    '';

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Booking Center</h1>
          <p className="text-muted-foreground font-medium">Manage your consultations and schedule availability.</p>
        </div>
        
        <div className="flex p-1 bg-muted/50 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'bookings' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Session Requests
          </button>
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'slots' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Manage Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Synchronizing Schedule...</p>
        </div>
      ) : activeTab === 'bookings' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {bookings.map((booking, idx) => {
              const studentName = getStudentName(booking);
              const studentEmail = getStudentEmail(booking);
              const startTime = booking.startTime || booking.slot?.startTime;
              const endTime = booking.endTime || booking.slot?.endTime;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group bg-card border border-border rounded-3xl overflow-hidden transition-all duration-300 hover:border-primary/30"
                >
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        booking.status === 'confirmed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                        booking.status === 'started' ? 'bg-primary/5 text-primary border-primary/10' :
                        booking.status === 'cancelled' ? 'bg-destructive/5 text-destructive border-destructive/10' : 
                        'bg-amber-500/5 text-amber-500 border-amber-500/10'
                      }`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground/40">#{booking.id.toString().slice(-4)}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center font-black text-primary text-xl">
                        {studentName.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-black text-foreground">{studentName}</h3>
                        <p className="text-xs text-muted-foreground font-medium">{studentEmail || 'Global Applicant'}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-border/50">
                      <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        <Calendar size={16} className="text-primary/60" />
                        <span className="text-xs">
                          {startTime ? new Date(startTime).toLocaleDateString(undefined, { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          }) : 'Date TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                        <Clock size={16} className="text-primary/60" />
                        <span className="text-xs">
                          {startTime && endTime 
                            ? `${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                            : 'Time TBD'}
                        </span>
                      </div>
                      {(booking.status === 'confirmed' || booking.status === 'started') && booking.meetingLink && (
                        <div 
                          className="flex items-center gap-3 text-emerald-500 font-bold cursor-pointer hover:text-emerald-400 transition-colors group/link"
                          onClick={() => handleJoinMeeting(booking)}
                        >
                          <Video size={16} />
                          <span className="text-[10px] truncate max-w-[180px] flex-1">{booking.meetingLink}</span>
                          <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                      {booking.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="border-border text-foreground rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {(booking.status === 'confirmed' || booking.status === 'started') && (
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleJoinMeeting(booking)}
                            isLoading={joiningId === booking.id}
                            className="w-full primary-gradient text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                          >
                            <Video size={14} className="mr-2" /> 
                            {booking.status === 'started' ? 'Re-Join Session' : 'Start Session'}
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            className="w-full border-border text-destructive hover:bg-destructive/5 rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                          >
                            Cancel Session
                          </Button>
                        </div>
                      )}

                      {booking.status === 'started' && (
                        <Button
                          onClick={() => handleStatusUpdate(booking.id, 'awaiting_confirmation')}
                          className="w-full mt-2 bg-emerald-500 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest"
                        >
                          <CheckCircle2 size={14} className="mr-2" /> Mark Finished
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {bookings.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-3xl">
              <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No pending sessions</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Create Slot Form */}
          <div className="lg:col-span-1 space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-black flex items-center gap-2">
                <CalendarPlus className="text-primary" /> Create New Slot
              </h3>
              <p className="text-xs text-muted-foreground font-medium">Add available time windows for students to book.</p>
            </div>

            <div className="space-y-6 bg-muted/20 p-8 rounded-3xl border border-border/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">Select Date</label>
                <Input 
                  type="date" 
                  value={newSlotDate} 
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="h-14 rounded-2xl bg-background border-border font-bold"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">Start Time</label>
                  <Input 
                    type="time" 
                    value={newSlotStart} 
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">End Time</label>
                  <Input 
                    type="time" 
                    value={newSlotEnd} 
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="h-14 rounded-2xl bg-background border-border font-bold"
                  />
                </div>
              </div>
              <Button
                onClick={handleCreateSlot}
                isLoading={isCreatingSlot}
                disabled={!newSlotDate}
                className="w-full h-14 primary-gradient text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              >
                Add Availability Slot
              </Button>
            </div>
          </div>

          {/* Slots List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Active Slots ({slots.length})</h3>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {slots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group flex items-center justify-between p-5 bg-card border border-border/50 rounded-2xl hover:border-primary/40 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black">
                          {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mt-0.5">
                          <Clock size={12} />
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        slot.status === 'booked' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 'bg-muted text-muted-foreground'
                      }`}>
                        {slot.status}
                      </span>
                      {slot.status !== 'booked' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(slot)}
                            className="p-2.5 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setSlotToDelete(slot.id)}
                            className="p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {slots.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                  <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No slots defined</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {slotToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border border-border overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-6">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto text-destructive">
                  <AlertTriangle size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black">Delete Slot?</h3>
                  <p className="text-muted-foreground text-sm font-medium">This action cannot be undone. Are you sure you want to remove this availability slot?</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs"
                    onClick={() => setSlotToDelete(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs"
                    onClick={handleDeleteSlot}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Slot Modal */}
      <AnimatePresence>
        {slotToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-3xl border border-border overflow-hidden shadow-2xl"
            >
              <div className="p-8 space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    <Edit2 className="text-primary" size={24} /> Edit Slot
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">Update the date and time for this availability slot.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">Select Date</label>
                    <Input 
                      type="date" 
                      value={editSlotDate} 
                      onChange={(e) => setEditSlotDate(e.target.value)}
                      className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">Start Time</label>
                      <Input 
                        type="time" 
                        value={editSlotStart} 
                        onChange={(e) => setEditSlotStart(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-foreground ml-1">End Time</label>
                      <Input 
                        type="time" 
                        value={editSlotEnd} 
                        onChange={(e) => setEditSlotEnd(e.target.value)}
                        className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-12 font-black uppercase tracking-widest text-xs"
                    onClick={() => setSlotToEdit(null)}
                    disabled={isUpdatingSlot}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 primary-gradient text-white rounded-xl h-12 font-black uppercase tracking-widest text-xs"
                    onClick={handleUpdateSlot}
                    isLoading={isUpdatingSlot}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

