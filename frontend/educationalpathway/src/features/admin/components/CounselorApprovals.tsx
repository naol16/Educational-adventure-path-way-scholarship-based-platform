'use client';

import { useState, useEffect } from 'react';
import { getPendingCounselors, updateCounselorVerification, deleteCounselor } from '../api/admin-api';
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
  Award,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const CounselorApprovals = () => {
  const [pendingCounselors, setPendingCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<any | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await getPendingCounselors();
      setPendingCounselors(data);
    } catch {
      toast.error('Failed to load pending applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAccept = async (id: number) => {
    setTargetId(id);
    setIsApproveModalOpen(true);
  };

  const confirmAccept = async () => {
    if (!targetId) return;
    try {
      await updateCounselorVerification(targetId, 'approved');
      toast.success('Counselor approved and activated');
      setPendingCounselors((prev: any[]) => prev.filter(c => c.id !== targetId));
      setSelectedCounselor(null);
    } catch {
      toast.error('Failed to approve counselor');
    } finally {
      setTargetId(null);
      setIsApproveModalOpen(false);
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
      setPendingCounselors((prev: any[]) => prev.filter(c => c.id !== targetId));
      setSelectedCounselor(null);
    } catch (error) {
      toast.error('Failed to reject counselor');
    } finally {
      setTargetId(null);
      setIsRejectModalOpen(false);
    }
  };

  const handleDelete = (id: number) => {
    setTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetId) return;
    try {
      await deleteCounselor(targetId);
      toast.success('Application deleted');
      setPendingCounselors((prev: any[]) => prev.filter(c => c.id !== targetId));
      setSelectedCounselor(null);
    } catch (error) {
      toast.error('Failed to delete application');
    } finally {
      setTargetId(null);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Scanning Applications</p>
      </div>
    );
  }

  return (
    <>
      {selectedCounselor ? (
        <div className="space-y-12 pb-24 max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between border-b border-border pb-8">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedCounselor(null)}
              className="h-10 px-0 hover:bg-transparent text-primary font-black uppercase text-xs tracking-widest flex items-center gap-2 group"
            >
              <div className="h-8 w-8 rounded-full border border-primary/20 flex items-center justify-center group-hover:bg-primary/5 transition-colors">←</div>
              Back to Queue
            </Button>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg flex items-center gap-2"
                onClick={() => handleDelete(selectedCounselor.id)}
              >
                <Trash2 size={14} /> Delete Application
              </Button>
              <Button 
                variant="outline"
                className="border-destructive/30 text-destructive font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg"
                onClick={() => handleReject(selectedCounselor.id)}
              >
                Reject
              </Button>
              <Button 
                className="primary-gradient text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 rounded-lg shadow-xl shadow-primary/20"
                onClick={() => handleAccept(selectedCounselor.id)}
              >
                Approve & Activate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8 space-y-12">
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Candidate Overview</h3>
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-2xl bg-muted overflow-hidden border-2 border-border">
                    {selectedCounselor.avatarUrl ? <img src={selectedCounselor.avatarUrl} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-3xl font-black">{selectedCounselor.name?.charAt(0)}</div>}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-foreground uppercase tracking-tighter">{selectedCounselor.name}</h2>
                    <p className="text-muted-foreground font-medium mt-1">{selectedCounselor.email}</p>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-8">
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Experience</p>
                  <p className="text-2xl font-black text-foreground">{selectedCounselor.yearsOfExperience || 0} Years</p>
                </div>
                <div className="p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Specialization</p>
                  <p className="text-lg font-black text-foreground truncate">{selectedCounselor.areasOfExpertise || 'General Counseling'}</p>
                </div>
              </div>

              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Identity Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'CV / Resume', url: selectedCounselor.cvUrl, icon: FileText },
                    { label: 'ID Card / Passport', url: selectedCounselor.idCardUrl, icon: ShieldCheck },
                    { label: 'Live Selfie', url: selectedCounselor.selfieUrl, icon: UserIcon },
                  ].map((doc, i) => (
                    doc.url && (
                      <a key={i} href={doc.url} target="_blank" className="flex items-center justify-between p-6 bg-card border border-border rounded-xl hover:border-primary transition-colors group">
                        <div className="flex items-center gap-4">
                          <doc.icon size={20} className="text-primary" />
                          <span className="text-xs font-black uppercase tracking-widest">{doc.label}</span>
                        </div>
                        <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-12 max-w-7xl mx-auto px-4">
          <div className="flex flex-col gap-4 border-b border-border pb-10">
            <h2 className="text-5xl font-black text-foreground uppercase tracking-tighter">Pending Approvals</h2>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60">
              Review and verify {pendingCounselors.length} new counselor applications
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pendingCounselors.length > 0 ? (
              pendingCounselors.map((c, idx) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedCounselor(c)}
                  className="group bg-card border border-border p-6 rounded-2xl hover:border-primary cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center font-black overflow-hidden">
                      {c.avatarUrl ? <img src={c.avatarUrl} className="h-full w-full object-cover" /> : c.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight group-hover:text-primary transition-colors">{c.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{c.organization || 'Independent'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block text-right">
                      <p className="text-[9px] font-black uppercase text-muted-foreground">Applied On</p>
                      <p className="text-xs font-bold">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 opacity-40">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-black uppercase">All Caught Up</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium">No pending applications in the queue.</p>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="Reject Application"
        description="Are you sure you want to permanently reject this counselor?"
        confirmText="Confirm Rejection"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Application Permanently"
        description="Are you absolutely sure? This will permanently remove this application and the user account from the system."
        confirmText="Yes, Delete Permanently"
      />

      <ConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={confirmAccept}
        title="Approve Counselor"
        description="Are you sure you want to approve this counselor and grant them full platform access?"
        confirmText="Yes, Approve Counselor"
      />
    </>
  );
};
