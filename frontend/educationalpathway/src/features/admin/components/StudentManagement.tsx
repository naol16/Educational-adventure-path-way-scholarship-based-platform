'use client';

import { useState, useEffect } from 'react';
import { User } from '@/features/auth/types';
import { getAllUsers, deleteUser, getUserById } from '../api/admin-api';

import { Button, Card, CardBody, Badge, ConfirmModal } from '@/components/ui';
import { 
  Loader2, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Trash2, 
  User as UserIcon, 
  Mail, 
  GraduationCap, 
  MapPin, 
  Calendar,
  FileText,
  ShieldCheck,
  TrendingUp,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const StudentManagement = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      // Filter for students. In a real app, this should be done on the backend.
      const filtered = data.filter(user => user.role === 'student');
      setStudents(filtered);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewProfile = async (student: any) => {
    setIsProfileLoading(true);
    try {
      const fullData = await getUserById(student.id);
      setSelectedStudent(fullData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Failed to load full student profile');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await deleteUser(studentToDelete);
      toast.success('Student account deleted');
      if (selectedStudent?.id === studentToDelete) setSelectedStudent(null);
      fetchStudents();
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setStudentToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Students</p>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedStudent) {
    const studentData = selectedStudent.studentProfile || selectedStudent;
    
    return (
      <div className="space-y-12 pb-24 max-w-6xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <Button 
               variant="ghost" 
               onClick={() => setSelectedStudent(null)}
               className="h-10 px-0 hover:bg-transparent text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">←</div>
              Back to List
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl">
                {selectedStudent.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedStudent.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2 opacity-60 flex items-center gap-2">
                   <TrendingUp size={12} className="text-primary" /> Active Student Account
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg hover:bg-destructive/5"
                onClick={() => handleDelete(selectedStudent.id)}
              >
                Delete Account
              </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Profile Area */}
          <div className="lg:col-span-8 space-y-16">
            {/* Academic Summary */}
            <section className="space-y-8">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <GraduationCap size={16} /> Academic Info
               </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Cumulative GPA</p>
                    <p className="text-3xl font-black text-foreground">{studentData.calculatedGpa || studentData.gpa || 'N/A'}</p>
                 </div>
                 <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Education Level</p>
                    <p className="text-xl font-black text-foreground truncate uppercase">{studentData.academicStatus || studentData.currentEducationLevel || 'Undergraduate'}</p>
                 </div>
                 <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Target Intake</p>
                    <p className="text-xl font-black text-foreground uppercase">{studentData.intakeSeason || 'N/A'}</p>
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Institution</span>
                 <p className="text-xl font-bold">{studentData.highSchool || studentData.currentUniversity || 'Not specified'}</p>
              </div>
            </section>

            {/* Preferences & Interests */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-border/40">
               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <Globe size={16} /> Interested Countries
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {studentData.countryInterest ? (
                        studentData.countryInterest.split(',').map((c: string) => (
                           <span key={c} className="px-3 py-1 bg-muted border border-border rounded-md text-[10px] font-black uppercase tracking-tighter">{c.trim()}</span>
                        ))
                     ) : (
                        <span className="text-sm font-bold opacity-40 italic">Global search active</span>
                     )}
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <FileText size={16} /> Field of Study
                  </h3>
                  <p className="text-lg font-bold">{studentData.fieldOfStudy || 'Not specified'}</p>
               </section>
            </div>

            {/* Progress / Activity - MOCKED for design */}
            <section className="space-y-8 pt-8 border-t border-border/40">
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <TrendingUp size={16} /> Activity
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center text-success"><ShieldCheck size={20} /></div>
                        <div>
                           <p className="text-sm font-bold">Identity Verification</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-black">Verified via Govt ID</p>
                        </div>
                     </div>
                     <Badge className="bg-success/10 text-success border-success/20">PASSED</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><FileText size={20} /></div>
                        <div>
                           <p className="text-sm font-bold">Document Uploads</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-black">
                              {[studentData.transcriptUrl, studentData.cvUrl, studentData.degreeCertificateUrl, studentData.languageCertificateUrl].filter(Boolean).length}/4 documents
                           </p>
                        </div>
                     </div>
                     <Badge variant="outline">
                        {[studentData.transcriptUrl, studentData.cvUrl, studentData.degreeCertificateUrl, studentData.languageCertificateUrl].filter(Boolean).length === 4 ? 'COMPLETE' : 'INCOMPLETE'}
                     </Badge>
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
               <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Contact Info</h3>
                  <div className="pt-4 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Mail size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Direct Email</p>
                           <p className="text-sm font-bold">{selectedStudent.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><MapPin size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Location</p>
                           <p className="text-sm font-bold">{studentData.city || 'N/A'}, {studentData.nationality || studentData.countryOfResidence || 'N/A'}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-8 border-t border-border/40">
                   <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                      <FileText size={16} /> Documents
                   </h3>
                  <div className="space-y-3">
                     {[
                       { name: 'Transcript (Original)', url: studentData.transcriptUrl },
                       { name: 'CV / Resume', url: studentData.cvUrl },
                       { name: 'Degree Certificate', url: studentData.degreeCertificateUrl },
                       { name: 'Language Proficiency', url: studentData.languageCertificateUrl }
                     ].map((doc, i) => (
                        <div key={i} className={`p-4 rounded-xl border border-border/40 flex items-center justify-between group hover:border-primary/50 transition-colors ${!doc.url && 'opacity-30'}`}>
                           <div className="flex items-center gap-3">
                              <FileText size={18} className={doc.url ? 'text-primary' : 'text-muted-foreground'} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{doc.name}</span>
                           </div>
                           {doc.url ? (
                              <a href={doc.url} target="_blank" className="text-[10px] font-black text-primary hover:underline">VIEW</a>
                           ) : (
                              <span className="text-[9px] font-bold text-muted-foreground">MISSING</span>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            </section>
          </div>
        </div>

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Account"
          description="Confirm permanent deletion of this student account. All associated data will be purged."
          confirmText="Confirm Purge"
        />
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Students</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Managing {students.length} scholars on the platform
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-4 w-full lg:w-auto">
           <div className="relative w-full lg:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
               <input 
                 type="text" 
                 placeholder="SEARCH USERS..."
                 className="w-full bg-muted/30 border-border border rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Grid - Horizontal List Style */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => {
              const profile = student.studentProfile || {};
              const docCount = [profile.transcriptUrl, profile.cvUrl, profile.degreeCertificateUrl, profile.languageCertificateUrl].filter(Boolean).length;
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  layout
                  onClick={() => handleViewProfile(student)}
                  className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 cursor-pointer transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-8"
                >
                  <div className="flex items-center gap-6 flex-1">
                     <div className="h-16 w-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                        <span className="text-foreground font-black text-2xl group-hover:text-primary transition-colors">{student.name?.charAt(0) || 'S'}</span>
                     </div>
                     <div className="min-w-0">
                        <h3 className="font-black text-foreground text-2xl tracking-tighter group-hover:text-primary transition-colors flex items-center gap-3">
                          {student.name}
                          {docCount === 4 && <ShieldCheck size={20} className="text-success" />}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                           <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                             <Mail size={12} className="opacity-50 text-primary" /> {student.email}
                           </span>
                           <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                             <GraduationCap size={12} className="opacity-50 text-primary" /> {profile.academicStatus || 'Undergraduate'}
                           </span>
                           <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                             <MapPin size={12} className="opacity-50 text-primary" /> {profile.nationality || 'Not Specified'}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center gap-12 shrink-0 border-t lg:border-t-0 pt-6 lg:pt-0 border-border/50">
                     <div className="hidden xl:block text-right">
                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Scholar Score</p>
                        <p className="text-lg font-black text-foreground">{profile.calculatedGpa || profile.gpa || '3.5'} <span className="text-[10px]">GPA</span></p>
                     </div>
                     
                     <div className="flex flex-col gap-2 min-w-[120px]">
                        <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                           docCount === 4 ? 'bg-success/5 text-success border-success/20' : 
                           docCount > 0 ? 'bg-warning/5 text-warning border-warning/20' : 
                           'bg-muted text-muted-foreground border-border'
                         }`}>
                           <span className={`h-1.5 w-1.5 rounded-full ${docCount === 4 ? 'bg-success' : docCount > 0 ? 'bg-warning' : 'bg-muted-foreground'}`} />
                           {docCount === 4 ? 'Complete' : docCount > 0 ? 'In Progress' : 'Incomplete'}
                        </span>
                        <p className="text-[8px] font-black uppercase text-muted-foreground text-center">{docCount}/4 Documents</p>
                     </div>

                     <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                        <Eye size={18} className="text-muted-foreground group-hover:text-white" />
                     </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center">
              <UserIcon size={48} className="mx-auto text-muted-foreground opacity-20 mb-6" />
              <h3 className="text-xl font-black uppercase tracking-tight">Registry Entry Not Found</h3>
              <p className="text-muted-foreground text-sm font-medium mt-2">No students match your current filter parameters.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete User"
        description="This will permanently delete the student and all associated records."
        confirmText="Yes, Confirm"
      />
    </div>
  );
};
