'use client';

import { useState, useEffect } from 'react';
import { getAllCounselors, updateCounselorVerification } from '../api/admin-api';
import { Button, ConfirmModal, Badge } from '@/components/ui';
import { 
  Loader2, 
  Check, 
  X, 
  FileText, 
  User as UserIcon, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Banknote, 
  DollarSign,
  Eye,
  EyeOff,
  History,
  TrendingUp,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { adminPayoutCounselor } from '../api/admin-api';
import api from '@/lib/api';

export const CounselorManagement = () => {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<any | null>(null);

  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [isPayoutProcessing, setIsPayoutProcessing] = useState(false);
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(false);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const data = await getAllCounselors();
      setCounselors(data);
    } catch {
      toast.error('Failed to load counselor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselors();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await updateCounselorVerification(id, 'verified');
      toast.success('Counselor accepted and verified');
      if (selectedCounselor && selectedCounselor.id === id) {
        setSelectedCounselor({ ...selectedCounselor, verificationStatus: 'verified' });
      }
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to accept counselor');
    }
  };

  const handleReject = async (id: number) => {
    setTargetId(id);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!targetId) return;
    try {
      await updateCounselorVerification(targetId, 'rejected');
      toast.success('Counselor application rejected');
      if (selectedCounselor && selectedCounselor.id === targetId) {
        setSelectedCounselor({ ...selectedCounselor, verificationStatus: 'rejected' });
      }
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to reject counselor');
    } finally {
      setTargetId(null);
      setIsRejectModalOpen(false);
    }
  };

  const handleToggleVisibility = async (id: number, currentVisibility: boolean) => {
    setIsVisibilityLoading(true);
    try {
      await api.patch(`/counselors/admin/${id}/visibility`, { isVisible: !currentVisibility });
      toast.success(`Counselor is now ${!currentVisibility ? 'visible' : 'hidden'} to students`);
      
      if (selectedCounselor && selectedCounselor.id === id) {
        setSelectedCounselor({ ...selectedCounselor, isVisible: !currentVisibility });
      }
      
      // Update local state
      setCounselors(prev => prev.map(c => c.id === id ? { ...c, isVisible: !currentVisibility } : c));
    } catch (error) {
      toast.error('Failed to update visibility');
    } finally {
      setIsVisibilityLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedCounselor) return;
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0 || amount > Number(selectedCounselor.pendingBalance)) {
      toast.error('Invalid payout amount or insufficient balance');
      return;
    }
    setIsPayoutProcessing(true);
    try {
      await adminPayoutCounselor(selectedCounselor.id, amount);
      toast.success('Payout processed successfully!');
      
      const newBalance = Number(selectedCounselor.pendingBalance) - amount;
      setSelectedCounselor({ ...selectedCounselor, pendingBalance: newBalance });
      setPayoutAmount('');
      fetchCounselors();
    } catch (error) {
      toast.error('Failed to process payout.');
    } finally {
      setIsPayoutProcessing(false);
    }
  };

  const handleReview = (counselor: any) => {
    setSelectedCounselor(counselor);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Counselors</p>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedCounselor) {
    return (
      <div className="space-y-12 pb-24 max-w-6xl mx-auto px-4">
        {/* Header Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <Button 
               variant="ghost" 
               onClick={() => setSelectedCounselor(null)}
               className="h-10 px-0 hover:bg-transparent text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">←</div>
              Back to List
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-4">
              {selectedCounselor.profileImageUrl ? (
                <img 
                  src={selectedCounselor.profileImageUrl} 
                  alt={selectedCounselor.name} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-primary font-black">
                  {selectedCounselor.name?.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">{selectedCounselor.name}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2 opacity-60 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-primary" /> Counselor Review
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {selectedCounselor.verificationStatus === 'pending' ? (
                <>
                  <Button 
                    variant="outline"
                    className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg hover:bg-destructive/5"
                    onClick={() => handleReject(selectedCounselor.id)}
                  >
                    Reject Application
                  </Button>
                  <Button 
                    className="primary-gradient text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                    onClick={() => handleAccept(selectedCounselor.id)}
                  >
                    Verify & Approve
                  </Button>
                </>
             ) : (
                <div className="flex items-center gap-4">
                   <Button
                      variant="outline"
                      className={`font-black uppercase tracking-widest text-[10px] px-6 h-12 rounded-lg transition-all ${selectedCounselor.isVisible ? 'border-success/30 text-success' : 'border-warning/30 text-warning'}`}
                      onClick={() => handleToggleVisibility(selectedCounselor.id, selectedCounselor.isVisible)}
                      isLoading={isVisibilityLoading}
                   >
                      {selectedCounselor.isVisible ? <><Eye size={14} className="mr-2" /> Publicly Visible</> : <><EyeOff size={14} className="mr-2" /> Hidden From Students</>}
                   </Button>
                   <div className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest border h-12 flex items-center ${
                     selectedCounselor.verificationStatus === 'verified' ? 'bg-success/5 text-success border-success/20' : 'bg-destructive/5 text-destructive border-destructive/20'
                   }`}>
                     Status: {selectedCounselor.verificationStatus}
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-16">
            {/* Biography Section */}
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                 <UserIcon size={16} /> Candidate Biography
              </h3>
              <div className="p-8 bg-muted/30 border border-border/50 rounded-2xl italic text-lg leading-relaxed text-foreground/80 font-medium">
                "{selectedCounselor.bio || 'No professional biography provided.'}"
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Experience</p>
                    <p className="text-3xl font-black text-foreground">{selectedCounselor.yearsOfExperience || 0} Years</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Hourly Rate</p>
                    <p className="text-3xl font-black text-foreground">{selectedCounselor.hourlyRate || 0} <span className="text-sm">ETB</span></p>
                 </div>
                 <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Rating</p>
                    <div className="flex items-center justify-end gap-2 text-3xl font-black text-foreground">
                       <Award className="text-primary" size={24} />
                       {selectedCounselor.rating || '5.0'}
                    </div>
                 </div>
              </div>
            </section>

            {/* Financial & Payout Section */}
            {selectedCounselor.verificationStatus === 'verified' && (
              <section className="space-y-6 pt-8 border-t border-border/40">
                 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                    <Banknote size={16} /> Financial Overview
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col justify-between overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <TrendingUp size={80} />
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Total Revenue Generated</p>
                       <p className="text-4xl font-black mt-2">{Number(selectedCounselor.totalEarned || 0).toLocaleString()} <span className="text-xs text-slate-400">ETB</span></p>
                    </div>
                    <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col justify-between">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary">Withdrawable Balance</p>
                       <div className="mt-2">
                         <p className="text-4xl font-black text-foreground">{Number(selectedCounselor.pendingBalance || 0).toLocaleString()} <span className="text-xs text-muted-foreground">ETB</span></p>
                       </div>
                       
                       <div className="mt-6 flex flex-col sm:flex-row gap-3">
                         <input 
                           type="number"
                           className="h-10 bg-background border border-border rounded-lg px-3 text-sm flex-1 w-full font-bold"
                           placeholder="Amount to payout"
                           value={payoutAmount}
                           max={selectedCounselor.pendingBalance || 0}
                           onChange={(e) => setPayoutAmount(e.target.value)}
                         />
                         <Button 
                           isLoading={isPayoutProcessing}
                           disabled={isPayoutProcessing || !payoutAmount || Number(payoutAmount) <= 0 || Number(payoutAmount) > Number(selectedCounselor.pendingBalance)}
                           onClick={handleProcessPayout}
                           className="h-10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap bg-success hover:bg-success/90 text-white px-6"
                         >
                           Settle Payout
                         </Button>
                       </div>
                    </div>
                 </div>
              </section>
            )}

            {/* Employment & Academic Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-border/40">
               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <Briefcase size={16} /> Work Info
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Current Position</span>
                        <p className="text-lg font-bold mt-1 uppercase tracking-tight">{selectedCounselor.currentPosition || 'N/A'}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organization</span>
                        <p className="text-lg font-bold mt-1 uppercase tracking-tight">{selectedCounselor.organization || 'N/A'}</p>
                     </div>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <GraduationCap size={16} /> Education
                  </h3>
                  <div className="space-y-6">
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Highest Degree</span>
                        <p className="text-lg font-bold mt-1 uppercase tracking-tight">{selectedCounselor.highestEducationLevel || 'N/A'}</p>
                     </div>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">University</span>
                        <p className="text-lg font-bold mt-1 uppercase tracking-tight">{selectedCounselor.universityName || 'N/A'}</p>
                     </div>
                  </div>
               </section>
            </div>
          </div>

          {/* Verification Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <section className="space-y-8">
               <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity & Contact</h3>
                  <div className="pt-4 space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><Mail size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Email Address</p>
                           <p className="text-sm font-bold">{selectedCounselor.email}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground"><MapPin size={18} /></div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-muted-foreground">Location</p>
                           <p className="text-sm font-bold uppercase">{selectedCounselor.city}, {selectedCounselor.countryOfResidence}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-8 border-t border-border/40">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                     <ShieldCheck size={16} /> Documents
                  </h3>
                  <div className="space-y-4">
                     {[
                        { label: 'Professional CV', url: selectedCounselor.cvUrl || selectedCounselor.documentUrl, icon: FileText, color: 'text-primary' },
                        { label: 'Identity Card', url: selectedCounselor.idCardUrl, icon: UserIcon, color: 'text-warning' },
                        { label: 'Persona Selfie', url: selectedCounselor.selfieUrl, icon: Check, color: 'text-success' },
                        { label: 'Certificates', url: selectedCounselor.certificateUrls, icon: Award, color: 'text-purple-500' }
                     ].map((doc, i) => (
                        doc.url && (
                           <div key={i} className="group flex flex-col p-6 bg-muted/10 border border-border/40 rounded-xl hover:border-primary/50 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                 <doc.icon className={doc.color} size={24} />
                                 <div className="flex items-center gap-2">
                                    <a href={doc.url} target="_blank" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View</a>
                                    <span className="text-muted-foreground opacity-20">|</span>
                                    <a href={doc.url} download className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Download</a>
                                 </div>
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest mt-4">{doc.label}</span>
                              <span className="text-[9px] text-muted-foreground mt-1 font-bold">Encrypted Asset • SECURE</span>
                           </div>
                        )
                     ))}
                  </div>
               </div>
            </section>
          </div>
        </div>

        <ConfirmModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirm={confirmReject}
          title="Reject Counselor"
          description="Confirm rejection of this applicant. This action cannot be undone easily."
          confirmText="Reject Application"
        />
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Counselors</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Vetting and managing {counselors.length} platform experts
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Network Status</span>
           <div className="flex items-center gap-6 text-[10px] font-black font-mono uppercase">
              <span className="flex items-center gap-2 bg-warning/5 text-warning px-3 py-1 rounded-md border border-warning/10"><div className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" /> {counselors.filter(c => c.verificationStatus === 'pending').length} Pending</span>
              <span className="flex items-center gap-2 bg-success/5 text-success px-3 py-1 rounded-md border border-success/10"><div className="h-1.5 w-1.5 rounded-full bg-success" /> {counselors.filter(c => c.verificationStatus === 'verified').length} Verified</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {counselors.length > 0 ? (
          counselors.map((counselor, idx) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => handleReview(counselor)}
              className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 cursor-pointer transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-8"
            >
              <div className="flex items-center gap-6 flex-1">
                 <div className="h-16 w-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {counselor.profileImageUrl ? (
                      <img src={counselor.profileImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-foreground font-black text-2xl">{counselor.name?.charAt(0) || 'A'}</span>
                    )}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-black text-foreground text-2xl tracking-tighter group-hover:text-primary transition-colors flex items-center gap-3">
                      {counselor.name}
                      {counselor.verificationStatus === 'verified' && <ShieldCheck size={20} className="text-success" />}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                       <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest"><Mail size={12} className="opacity-50 text-primary" /> {counselor.email}</span>
                       <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest"><Briefcase size={12} className="opacity-50 text-primary" /> {counselor.currentPosition || 'Platform Expert'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-12 shrink-0 border-t lg:border-t-0 pt-6 lg:pt-0 border-border/50">
                 <div className="hidden xl:block text-right">
                    <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Generated</p>
                    <p className="text-lg font-black text-foreground">{Number(counselor.totalEarned || 0).toLocaleString()} <span className="text-[10px]">ETB</span></p>
                 </div>
                 
                 <div className="flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                       counselor.verificationStatus === 'verified' ? 'bg-success/5 text-success border-success/20' : 
                       counselor.verificationStatus === 'rejected' ? 'bg-destructive/5 text-destructive border-destructive/20' : 
                       'bg-warning/5 text-warning border-warning/20'
                     }`}>
                       <span className={`h-1.5 w-1.5 rounded-full ${counselor.verificationStatus === 'verified' ? 'bg-success' : counselor.verificationStatus === 'rejected' ? 'bg-destructive' : 'bg-warning'}`} />
                       {counselor.verificationStatus}
                    </span>
                    {!counselor.isVisible && counselor.verificationStatus === 'verified' && (
                       <span className="text-[8px] font-black uppercase text-warning text-center">Hidden from Public</span>
                    )}
                 </div>

                 <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                    <ExternalLink size={18} className="text-muted-foreground group-hover:text-white" />
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center">
            <div className="h-20 w-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30 border border-border/50">
              <UserIcon size={32} />
            </div>
            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Queue Empty</h3>
            <p className="text-muted-foreground text-sm font-medium mt-2">No active applications require review at this time.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Are you sure you want to permanently reject this counselor?"
        confirmText="Confirm Rejection"
      />
    </div>
  );
};
