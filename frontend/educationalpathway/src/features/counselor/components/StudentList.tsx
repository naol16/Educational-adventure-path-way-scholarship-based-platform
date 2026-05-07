'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getBookedStudents, getUsersByRole } from '@/features/admin/api/admin-api';
import { Card, CardBody, Button } from '@/components/ui';
import { Loader2, ExternalLink, User as UserIcon, Mail, Calendar, MessageCircle, ChevronRight, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/providers/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { getCounselorStudents, CounselorStudent } from '../api/counselor-api';

export const StudentList = () => {
  const [students, setStudents] = useState<CounselorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const data = await getCounselorStudents();
        setStudents(data);
      } catch (error) {
        console.error('Failed to load students:', error);
        toast.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [user]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Roster...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <AnimatePresence mode="popLayout">
        {students.length > 0 ? (
          students.map((student, index) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group rounded-2xl border-border bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                <CardBody className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      <div className="h-16 w-16 primary-gradient rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20 group-hover:scale-105 transition-transform duration-500">
                        {student.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-4 border-card rounded-full" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-black text-xl text-foreground group-hover:text-primary transition-colors">
                        {student.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> {student.email}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> 
                          <span className="opacity-60">Last Booking:</span> 
                          <span className="text-foreground">{new Date(student.lastBookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Status</p>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-all ${
                        student.lastBookingStatus === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        student.lastBookingStatus === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' :
                        'bg-muted text-muted-foreground border-border'
                      }`}>
                        {student.lastBookingStatus}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push(`/dashboard/counselor/chat?userId=${student.studentId}`)}
                        className="h-12 w-12 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group-hover:bg-primary/5"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-muted/5 rounded-[32px] border-2 border-dashed border-border"
          >
            <div className="relative mx-auto w-24 h-24 mb-6">
              <UserIcon className="h-24 w-24 text-muted-foreground/10" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground/30" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Mentorship Roster Empty</h3>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">Your mentorship list will appear here once students book a professional session with you.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
