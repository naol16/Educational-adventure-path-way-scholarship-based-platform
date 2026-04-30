'use client';

import { useState, useEffect } from 'react';
import { 
  Banknote, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Loader2,
  Calendar,
  MoreVertical,
  Download,
  CreditCard,
  Wallet
} from 'lucide-react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetching from the counselor payout list which contains financial movements
        // In a full implementation, this might hit a /payments/admin list
        const response = await api.get('/counselors/admin/chapa-transactions');
        // If that endpoint isn't fully ready, we might need to fallback or combine
        setTransactions(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast.error('Failed to load transaction history');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.reference?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Payments</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Payments</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
             <CreditCard size={14} className="text-primary" /> Track all money coming in and going out
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-border hover:bg-muted transition-all">
              <Download className="mr-2" size={14} /> Download List
           </Button>
           <Button className="primary-gradient text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              Refresh
           </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-slate-900 border-none rounded-3xl overflow-hidden text-white group">
            <CardBody className="p-8 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400 group-hover:text-slate-900 transition-all">
                     <Wallet size={20} />
                  </div>
                  <Badge className="bg-emerald-400/10 text-emerald-400 border-emerald-400/20 font-black">+18%</Badge>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Volume (30D)</p>
                  <p className="text-3xl font-black mt-1">428,500 <span className="text-xs opacity-40">ETB</span></p>
               </div>
            </CardBody>
         </Card>
         <Card className="bg-card border-border rounded-3xl overflow-hidden group">
            <CardBody className="p-8 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                     <Clock size={20} />
                  </div>
                  <Badge variant="outline" className="font-black">Active</Badge>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate</p>
                  <p className="text-3xl font-black mt-1">94.2%</p>
               </div>
            </CardBody>
         </Card>
         <Card className="bg-card border-border rounded-3xl overflow-hidden group">
            <CardBody className="p-8 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-all">
                     <AlertCircle size={20} />
                  </div>
                  <Badge variant="outline" className="font-black text-warning">Attention</Badge>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Refund Requests</p>
                  <p className="text-3xl font-black mt-1">12</p>
               </div>
            </CardBody>
         </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-8">
         <div className="flex gap-2 bg-muted/30 p-1 rounded-xl border border-border">
            {['all', 'success', 'failed', 'pending'].map((s) => (
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
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH PAYMENTS..."
              className="w-full bg-muted/30 border-border border rounded-xl py-3.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/30 border-b border-border">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reference</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</th>
                     <th className="px-8 py-6 text-right"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                  <AnimatePresence>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((tx, idx) => (
                        <motion.tr 
                          key={tx.id || idx}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-muted/10 transition-colors group"
                        >
                           <td className="px-8 py-6">
                              <span className="text-xs font-mono font-black text-foreground group-hover:text-primary transition-colors">{tx.reference || tx.tx_ref}</span>
                           </td>
                           <td className="px-8 py-6">
                              <div>
                                 <p className="text-xs font-black uppercase">{tx.first_name} {tx.last_name}</p>
                                 <p className="text-[10px] text-muted-foreground font-medium">{tx.email}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                 <span className="text-sm font-black text-foreground">{tx.amount?.toLocaleString()}</span>
                                 <span className="text-[10px] font-black text-muted-foreground opacity-40">{tx.currency}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <Badge className={`text-[9px] font-black uppercase tracking-tighter ${
                                tx.status === 'success' ? 'bg-success/10 text-success border-success/20' : 
                                tx.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                'bg-warning/10 text-warning border-warning/20'
                              }`}>
                                 {tx.status}
                              </Badge>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                 <Calendar size={12} />
                                 {new Date(tx.created_at || tx.createdAt).toLocaleDateString()}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-muted">
                                 <MoreVertical size={16} />
                              </Button>
                           </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-32 text-center">
                           <Banknote size={48} className="mx-auto text-muted-foreground opacity-10 mb-6" />
                           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No payments found</p>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
