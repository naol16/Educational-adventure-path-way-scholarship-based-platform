'use client';

import { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Terminal, 
  Cpu, 
  AlertTriangle, 
  Info, 
  Bug,
  Loader2,
  Trash2,
  RefreshCcw,
  Activity,
  History,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulated system log stream
    const mockLogs = [
      { id: 1, level: 'info', service: 'AUTH-GATEWAY', message: 'Starting user verification for UID-284', timestamp: new Date().toISOString() },
      { id: 2, level: 'warn', service: 'PAYMENT-NODE', message: 'Slow payment system response (2500ms)', timestamp: new Date(Date.now() - 500000).toISOString() },
      { id: 3, level: 'error', service: 'VECTOR-DB', message: 'Profile update timed out for user #99', timestamp: new Date(Date.now() - 1200000).toISOString() },
      { id: 4, level: 'info', service: 'SYSTEM-DAEMON', message: 'System cleanup finished in 124ms', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { id: 5, level: 'debug', service: 'WEBSOCKET', message: 'Real-time connection check: PID-9421', timestamp: new Date(Date.now() - 2500000).toISOString() },
      { id: 6, level: 'info', service: 'AUTH-GATEWAY', message: 'Admin logged out successfully', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ];
    
    setLogs(mockLogs);
    setLoading(false);
  }, []);

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'error': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warn': return 'text-warning bg-warning/10 border-warning/20';
      case 'info': return 'text-primary bg-primary/10 border-primary/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         l.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || l.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Activity Logs</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Activity Logs</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
             <Database size={14} className="text-primary" /> Monitor platform activity and system health
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-border hover:bg-muted transition-all">
              <Trash2 className="mr-2" size={14} /> Clear Logs
           </Button>
           <Button className="primary-gradient text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              <RefreshCcw className="mr-2" size={14} /> Refresh
           </Button>
        </div>
      </div>

      {/* Health Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'CPU LOAD', value: '14.2%', icon: Cpu, color: 'text-primary' },
           { label: 'MEMORY', value: '428MB', icon: Activity, color: 'text-success' },
           { label: 'NETWORK', value: '124ms', icon: Zap, color: 'text-warning' },
           { label: 'UPTIME', value: '99.9%', icon: ShieldCheck, color: 'text-info' },
         ].map((m, i) => (
            <Card key={i} className="bg-card border-border rounded-2xl">
               <CardBody className="p-6 flex items-center justify-between">
                  <div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{m.label}</p>
                     <p className="text-xl font-black mt-1">{m.value}</p>
                  </div>
                  <m.icon className={m.color} size={20} />
               </CardBody>
            </Card>
         ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-8">
         <div className="flex gap-2 bg-muted/30 p-1 rounded-xl border border-border">
            {['all', 'info', 'warn', 'error', 'debug'].map((l) => (
               <button
                  key={l}
                  onClick={() => setLevelFilter(l)}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    levelFilter === l ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                  }`}
               >
                  {l}
               </button>
            ))}
         </div>
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH LOGS..."
              className="w-full bg-muted/30 border-border border rounded-xl py-3.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* Terminal View */}
      <Card className="bg-slate-950 border-none rounded-3xl overflow-hidden shadow-2xl">
         <CardBody className="p-0">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-white/5">
               <div className="flex gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
               </div>
               <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-white/20" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">system_node@astral-core</span>
               </div>
               <div />
            </div>

            {/* Log Stream */}
            <div className="p-8 font-mono space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
               <AnimatePresence>
                 {filteredLogs.map((log, idx) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-6 group hover:bg-white/5 p-2 rounded-lg transition-colors"
                    >
                       <span className="text-[10px] text-white/20 shrink-0 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       <Badge className={`text-[9px] font-black uppercase tracking-tighter shrink-0 border ${getLevelColor(log.level)}`}>
                          {log.level}
                       </Badge>
                       <span className="text-[10px] font-black text-primary uppercase shrink-0">[{log.service}]</span>
                       <span className="text-[11px] text-white/70 group-hover:text-white transition-colors">{log.message}</span>
                    </motion.div>
                 ))}
               </AnimatePresence>
               
               {filteredLogs.length === 0 && (
                  <div className="py-20 text-center opacity-20">
                     <History size={48} className="mx-auto mb-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Buffer empty or filter active</p>
                  </div>
               )}
            </div>
         </CardBody>
      </Card>
    </div>
  );
}
