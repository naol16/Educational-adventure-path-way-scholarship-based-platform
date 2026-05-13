'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getUserById, 
  deactivateUser, 
  activateUser, 
  deleteUser,
  updateCounselorVerification 
} from '../api/admin-api';
import { 
  Loader2, 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Globe, 
  Phone,
  User,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Trash2,
  AlertCircle,
  Award
} from 'lucide-react';
import { Button, Card, CardBody, Badge, ConfirmModal } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export const UserDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [actionType, setActionType] = useState<'deactivate' | 'activate' | 'delete' | 'approve' | 'reject' | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getUserById(Number(id));
      setUser(data);
    } catch {
      toast.error('Identity not found in registry');
      router.push('/dashboard/admin/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleAction = (type: any) => {
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!user || !actionType) return;
    
    try {
      if (actionType === 'deactivate') {
        await deactivateUser(user.id);
        toast.success(`User access restricted`);
      } else if (actionType === 'activate') {
        await activateUser(user.id);
        toast.success(`User access restored`);
      } else if (actionType === 'delete') {
        await deleteUser(user.id);
        toast.success(`User record purged`);
        router.push('/dashboard/admin/users');
        return;
      } else if (actionType === 'approve') {
        await updateCounselorVerification(user.counselor.id, 'verified');
        toast.success(`Counselor verified`);
      } else if (actionType === 'reject') {
        await updateCounselorVerification(user.counselor.id, 'rejected');
        toast.success(`Counselor rejected`);
      }
      fetchUser();
    } catch (error) {
      toast.error('Protocol failure: Action could not be completed');
    } finally {
      setIsConfirmModalOpen(false);
      setActionType(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Neural Registry</p>
      </div>
    );
  }

  if (!user) return null;

  const isCounselor = user.role === 'counselor';
  const isStudent = user.role === 'student';

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-border pb-12">
        <div className="space-y-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
          </button>
          <div className="flex items-center gap-6">
             <div className={`h-24 w-24 rounded-3xl flex items-center justify-center text-4xl font-black shadow-2xl ${
                isCounselor ? 'bg-blue-500 text-white' : 
                isStudent ? 'bg-emerald-500 text-white' : 
                'bg-slate-500 text-white'
             }`}>
                {user.name?.charAt(0)}
             </div>
             <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl md:text-4xl font-black text-foreground uppercase tracking-tighter leading-none">{user.name || user.fullName}</h1>
                  <Badge className={`text-[10px] font-black uppercase ${user.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    {user.isActive ? 'Active' : 'Blocked'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-widest opacity-60">
                   <span className="flex items-center gap-2"><Mail size={12} className="text-primary" /> {user.email}</span>
                   <span className="flex items-center gap-2"><User size={12} className="text-primary" /> ID: {user.id}</span>
                   <span className="flex items-center gap-2"><Clock size={12} className="text-primary" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           <Button 
             variant="outline" 
             className={`h-14 px-8 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${user.isActive ? 'text-amber-500 border-amber-500/30' : 'text-emerald-500 border-emerald-500/30'}`}
             onClick={() => handleAction(user.isActive ? 'deactivate' : 'activate')}
           >
             {user.isActive ? <Lock className="mr-2" size={16} /> : <Unlock className="mr-2" size={16} />}
             {user.isActive ? 'Block Access' : 'Restore Access'}
           </Button>
           <Button 
             variant="outline" 
             className="h-14 px-8 rounded-lg border-destructive/30 text-destructive font-black uppercase text-[10px] tracking-widest hover:bg-destructive/5"
             onClick={() => handleAction('delete')}
           >
             <Trash2 className="mr-2" size={16} /> Purge Record
           </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Left Column: Data Sections */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Role Specific Hero Data */}
          <div className="grid md:grid-cols-3 gap-6">
             {isCounselor && user.counselor && (
               <>
                 <Card className="bg-blue-500/5 border-blue-500/10 rounded-2xl p-8 space-y-4">
                    <Briefcase className="text-blue-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-blue-700/60 uppercase tracking-widest">Experience</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.counselor.yearsOfExperience || 0} Years</p>
                    </div>
                 </Card>
                 <Card className="bg-blue-500/5 border-blue-500/10 rounded-2xl p-8 space-y-4">
                    <Award className="text-blue-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-blue-700/60 uppercase tracking-widest">Rate</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.counselor.hourlyRate || 0} ETB/hr</p>
                    </div>
                 </Card>
                 <Card className="bg-blue-500/5 border-blue-500/10 rounded-2xl p-8 space-y-4">
                    <Globe className="text-blue-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-blue-700/60 uppercase tracking-widest">Status</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.counselor.verificationStatus}</p>
                    </div>
                 </Card>
               </>
             )}
             {isStudent && user.student && (
               <>
                 <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-2xl p-8 space-y-4">
                    <GraduationCap className="text-emerald-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-emerald-700/60 uppercase tracking-widest">Academic Level</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.student.academicStatus || 'Student'}</p>
                    </div>
                 </Card>
                 <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-2xl p-8 space-y-4">
                    <MapPin className="text-emerald-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-emerald-700/60 uppercase tracking-widest">Residing In</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.student.countryOfResidence || 'Unknown'}</p>
                    </div>
                 </Card>
                 <Card className="bg-emerald-500/5 border-emerald-500/10 rounded-2xl p-8 space-y-4">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <div>
                       <p className="text-[8px] font-black text-emerald-700/60 uppercase tracking-widest">Onboarded</p>
                       <p className="text-xl font-black uppercase tracking-tight">{user.student.isOnboarded ? 'Complete' : 'Pending'}</p>
                    </div>
                 </Card>
               </>
             )}
          </div>

          {/* Main Info Blocks */}
          <div className="space-y-12">
             {/* Counselor Details */}
             {isCounselor && user.counselor && (
               <div className="space-y-12">
                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                       <FileText size={16} /> Professional Background
                    </h3>
                    <div className="bg-card border border-border p-8 rounded-2xl space-y-8">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Biography</p>
                          <p className="text-sm font-medium leading-relaxed text-foreground/80">{user.counselor.bio || 'No bio provided.'}</p>
                       </div>
                       <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-border/50">
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Areas of Expertise</p>
                             <div className="flex flex-wrap gap-2">
                                {(user.counselor.areasOfExpertise?.split(',') || ['Counseling']).map((a: string) => (
                                  <Badge key={a} variant="secondary" className="text-[10px] font-bold uppercase">{a.trim()}</Badge>
                                ))}
                             </div>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Education</p>
                             <p className="text-sm font-black uppercase">{user.counselor.highestEducationLevel || 'Professional'}</p>
                             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{user.counselor.universityName || 'Global University'}</p>
                          </div>
                       </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                       <Globe size={16} /> Operational Data
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="bg-card border border-border p-8 rounded-2xl space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Contact Info</p>
                          <div className="space-y-3">
                             <p className="text-xs font-black uppercase flex items-center gap-3"><Phone size={14} className="text-primary" /> {user.counselor.phoneNumber || 'Not provided'}</p>
                             <p className="text-xs font-black uppercase flex items-center gap-3"><MapPin size={14} className="text-primary" /> {user.counselor.city}, {user.counselor.countryOfResidence}</p>
                          </div>
                       </div>
                       <div className="bg-card border border-border p-8 rounded-2xl space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Session Details</p>
                          <div className="space-y-3">
                             <p className="text-xs font-black uppercase flex items-center gap-3"><Clock size={14} className="text-primary" /> {user.counselor.sessionDuration} Minute Sessions</p>
                             <p className="text-xs font-black uppercase flex items-center gap-3"><ShieldCheck size={14} className="text-primary" /> {user.counselor.consultationModes || 'Video/Audio'}</p>
                          </div>
                       </div>
                    </div>
                  </section>
               </div>
             )}

             {/* Student Details */}
             {isStudent && user.student && (
               <div className="space-y-12">
                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                       <GraduationCap size={16} /> Academic Profile
                    </h3>
                    <div className="bg-card border border-border p-8 rounded-2xl space-y-12">
                       <div className="grid md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Current Institution</p>
                             <p className="text-lg font-black uppercase tracking-tight">{user.student.currentUniversity || 'N/A'}</p>
                          </div>
                          <div className="space-y-4">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Field of Study</p>
                             <p className="text-lg font-black uppercase tracking-tight text-primary">{user.student.fieldOfStudy || 'General'}</p>
                          </div>
                       </div>
                       <div className="grid md:grid-cols-3 gap-8 pt-12 border-t border-border/50">
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">GPA</p>
                             <p className="text-xl font-black">{user.student.calculatedGpa || 'N/A'}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Graduation</p>
                             <p className="text-xl font-black">{user.student.graduationYear || 'N/A'}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Funding Needs</p>
                             <p className="text-xl font-black uppercase">{user.student.fundingRequirement || 'Self-Funded'}</p>
                          </div>
                       </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                       <Globe size={16} /> Application Preferences
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="bg-card border border-border p-8 rounded-2xl space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Target Countries</p>
                          <div className="flex flex-wrap gap-2">
                             {(user.student.preferredCountries?.split(',') || ['Global']).map((c: string) => (
                               <Badge key={c} variant="outline" className="text-[10px] font-black uppercase border-primary/20 text-primary">{c.trim()}</Badge>
                             ))}
                          </div>
                       </div>
                       <div className="bg-card border border-border p-8 rounded-2xl space-y-4">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Preferred Mode</p>
                          <p className="text-sm font-black uppercase">{user.student.studyMode || 'Full-Time / On-Campus'}</p>
                       </div>
                    </div>
                  </section>
               </div>
             )}
          </div>
        </div>

        {/* Right Column: Moderation & Documents */}
        <div className="lg:col-span-4 space-y-12">
           <section className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <ShieldCheck size={16} /> Moderation
             </h3>
             <Card className="bg-slate-900 border-none rounded-2xl overflow-hidden text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <ShieldCheck size={120} />
                </div>
                <CardBody className="p-8 space-y-8 relative z-10">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Security Status</p>
                      <p className="text-3xl font-black uppercase tracking-tighter">{user.isActive ? 'Active Protocol' : 'Restricted'}</p>
                   </div>

                   <div className="space-y-4">
                      {isCounselor && (
                         <>
                           <Button 
                             disabled={user.counselor.verificationStatus === 'verified'}
                             className="w-full h-14 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white border-none font-black uppercase text-[10px] tracking-widest"
                             onClick={() => handleAction('approve')}
                           >
                             Approve Identity
                           </Button>
                           <Button 
                             disabled={user.counselor.verificationStatus === 'rejected'}
                             className="w-full h-14 rounded-lg bg-white/10 hover:bg-white/20 text-white border-none font-black uppercase text-[10px] tracking-widest"
                             onClick={() => handleAction('reject')}
                           >
                             Reject Application
                           </Button>
                         </>
                      )}
                      
                      <Button 
                        className={`w-full h-14 rounded-lg border-none font-black uppercase text-[10px] tracking-widest text-white ${
                          user.isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                        }`}
                        onClick={() => handleAction(user.isActive ? 'deactivate' : 'activate')}
                      >
                        {user.isActive ? 'Restrict Access' : 'Restore Access'}
                      </Button>
                   </div>
                   
                   <p className="text-[9px] font-medium opacity-40 leading-relaxed italic">
                      "All administrative actions are logged in the system audit registry with high priority."
                   </p>
                </CardBody>
             </Card>
           </section>

           <section className="space-y-6">
             <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                <FileText size={16} /> Digital Vault
             </h3>
             <div className="space-y-4">
                {isCounselor && (
                   <>
                     {user.counselor.cvUrl && (
                        <DocumentLink href={user.counselor.cvUrl} label="Professional CV" type="PDF" />
                     )}
                     {user.counselor.idCardUrl && (
                        <DocumentLink href={user.counselor.idCardUrl} label="Identity Document" type="IMG" />
                     )}
                   </>
                )}
                {isStudent && (
                   <>
                     {user.student.cvUrl && (
                        <DocumentLink href={user.student.cvUrl} label="Student CV" type="PDF" />
                     )}
                     {user.student.transcriptUrl && (
                        <DocumentLink href={user.student.transcriptUrl} label="Academic Transcript" type="PDF" />
                     )}
                     {user.student.idCardUrl && (
                        <DocumentLink href={user.student.idCardUrl} label="Student ID" type="IMG" />
                     )}
                   </>
                )}
                {!((isCounselor && (user.counselor.cvUrl || user.counselor.idCardUrl)) || (isStudent && (user.student.cvUrl || user.student.transcriptUrl || user.student.idCardUrl))) && (
                   <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl opacity-30">
                      <AlertCircle size={32} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Documents Uploaded</p>
                   </div>
                )}
             </div>
           </section>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        title={`${actionType?.charAt(0).toUpperCase()}${actionType?.slice(1)} Protocol`}
        description={`Are you sure you want to execute the ${actionType} action for ${user.name}? This cannot be undone via standard UI.`}
        confirmText="Confirm Execution"
      />
    </div>
  );
};

const DocumentLink = ({ href, label, type }: { href: string, label: string, type: string }) => (
  <a 
    href={href} 
    target="_blank" 
    className="flex items-center justify-between p-6 bg-card border border-border rounded-2xl group hover:border-primary/50 transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
        {type}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</p>
        <p className="text-xs font-bold truncate max-w-[180px]">View Document</p>
      </div>
    </div>
    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
      <ChevronRight size={14} />
    </div>
  </a>
);

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <ArrowLeft className={`${className} rotate-180`} size={size} />
);
