'use client';

import { useEffect, useState } from 'react';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Search, 
    Filter, 
    ExternalLink,
    Banknote,
    User,
    ArrowUpRight,
    Loader2,
    Check,
    CreditCard,
    Zap,
    History,
    MoreVertical
} from 'lucide-react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminPayoutsPage() {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/counselors/admin/payouts');
            setPayouts(res.data?.data || res.data || []);
        } catch (error) {
            toast.error("Failed to load payout requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleAction = async (payoutId: number, action: 'approve' | 'reject') => {
        setProcessingId(payoutId);
        try {
            await api.patch(`/counselors/admin/payouts/${payoutId}/status`, {
                status: action === 'approve' ? 'approved' : 'rejected',
                adminNote: action === 'approve' ? 'Processed via Admin Dashboard' : 'Rejected by Admin'
            });
            toast.success(`Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            fetchPayouts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to process payout");
        } finally {
            setProcessingId(null);
        }
    };

    const filteredPayouts = payouts.filter(p => statusFilter === 'all' || p.status === statusFilter);
    const pendingCount = payouts.filter(p => p.status === 'pending').length;

    if (loading) {
        return (
          <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Payouts</p>
          </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Payouts</h2>
                    <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
                        <Banknote size={14} className="text-primary" /> Review and approve money transfers to counselors
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${pendingCount > 0 ? 'bg-warning/5 border-warning/20' : 'bg-muted/30 border-border'}`}>
                        <Clock className={pendingCount > 0 ? 'text-warning' : 'text-muted-foreground'} size={18} />
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Pending Requests</p>
                            <p className={`text-xl font-black leading-none ${pendingCount > 0 ? 'text-warning' : 'text-foreground'}`}>{pendingCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 bg-muted/30 p-1 rounded-xl border border-border">
                    {['all', 'pending', 'approved', 'completed', 'rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                statusFilter === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Payout List - Horizontal Style */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                    {filteredPayouts.length > 0 ? (
                        filteredPayouts.map((payout, idx) => (
                            <motion.div
                                key={payout.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group bg-card border border-border p-6 rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-8"
                            >
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="h-16 w-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <span className="text-foreground font-black text-2xl group-hover:text-primary transition-colors">
                                            {payout.counselor?.user?.name?.charAt(0) || 'C'}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-foreground text-2xl tracking-tighter group-hover:text-primary transition-colors flex items-center gap-3 uppercase">
                                            {payout.counselor?.user?.name || 'Unknown Counselor'}
                                            <Badge className={`text-[8px] font-black uppercase tracking-tighter ${
                                                payout.status === 'pending' ? 'bg-warning/10 text-warning border-warning/20' :
                                                payout.status === 'approved' || payout.status === 'completed' ? 'bg-success/10 text-success border-success/20' :
                                                'bg-destructive/10 text-destructive border-destructive/20'
                                            }`}>
                                                {payout.status}
                                            </Badge>
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                            <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                <CreditCard size={12} className="opacity-50 text-primary" /> {payout.payoutDetails?.accountNumber || payout.payoutDetails?.phoneNumber || 'No ID'}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                <User size={12} className="opacity-50 text-primary" /> {payout.payoutDetails?.accountHolderName || 'N/A'}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                <History size={12} className="opacity-50 text-primary" /> Requested {new Date(payout.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 shrink-0 border-t lg:border-t-0 pt-6 lg:pt-0 border-border/50">
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Total Payout</p>
                                        <p className="text-2xl font-black text-foreground">{payout.amount?.toLocaleString()} <span className="text-[10px]">ETB</span></p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {payout.status === 'pending' ? (
                                            <>
                                                <Button 
                                                    variant="outline"
                                                    className="h-12 w-12 p-0 border-destructive/30 text-destructive hover:bg-destructive/5 rounded-xl"
                                                    onClick={() => handleAction(payout.id, 'reject')}
                                                    disabled={processingId === payout.id}
                                                >
                                                    <XCircle size={20} />
                                                </Button>
                                                <Button 
                                                    className="primary-gradient text-white h-12 px-6 rounded-xl shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all font-black uppercase text-[10px] tracking-widest"
                                                    onClick={() => handleAction(payout.id, 'approve')}
                                                    isLoading={processingId === payout.id}
                                                >
                                                    <Check size={16} className="mr-2" /> Approve
                                                </Button>
                                            </>
                                        ) : (
                                            <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center">
                                                <ExternalLink size={18} className="text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center">
                           <CreditCard size={48} className="mx-auto text-muted-foreground opacity-10 mb-6" />
                           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Queue cleared. No active requests detected.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
