'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Zap, 
  GraduationCap, 
  ShieldCheck, 
  Settings,
  TrendingUp,
  AlertCircle,
  Banknote,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, Badge } from '@/components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats, AdminStats, getAllUsers, getAllCounselors } from '../api/admin-api';
import Link from 'next/link';

export const GeneralAnalysis = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingCounselors, setPendingCounselors] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, usersData, counselorsData] = await Promise.all([
          getAdminStats(),
          getAllUsers(1, 5),
          getAllCounselors()
        ]);
        
        setStats(statsData);
        setRecentUsers(usersData.slice(0, 5));
        setPendingCounselors(statsData.pendingCounselors);
      } catch (error) {
        console.error('Failed to fetch command center data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsConfig = [
    { 
      label: 'TOTAL USERS', 
      value: stats?.totalUsers.toString() || '0', 
      icon: Users, 
      color: 'primary',
      trend: '+12% growth',
      description: 'Active accounts on platform'
    },
    { 
      label: 'STUDENTS', 
      value: stats?.students.toString() || '0', 
      icon: GraduationCap, 
      color: 'success',
      trend: '89% completion',
      description: 'Educational path seekers'
    },
    { 
      label: 'COUNSELORS', 
      value: stats?.counselors.toString() || '0', 
      icon: ShieldCheck, 
      color: 'info',
      trend: pendingCounselors + ' pending',
      description: 'Verified industry experts'
    },
    { 
      label: 'NET REVENUE', 
      value: stats?.totalRevenue.toLocaleString() || '0', 
      icon: Banknote, 
      color: 'warning',
      trend: 'ETB Total',
      description: 'Platform transaction volume'
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Command Protocol</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background pb-20">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-info/5 rounded-full blur-[140px] -z-10" />

      {/* Header Section */}
      <div className="pt-12 pb-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-border pb-12">
          <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 text-primary"
             >
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Live Platform Intelligence</span>
             </motion.div>
             <h1 className="text-5xl lg:text-8xl font-black text-foreground uppercase tracking-tighter leading-none">Admin Home</h1>
             <p className="text-muted-foreground max-w-xl text-sm font-medium leading-relaxed">
               Welcome back. Use this page to manage users, counselors, and platform payments in real-time.
             </p>
          </div>

          <div className="flex gap-4">
             <Button variant="outline" className="h-14 px-8 rounded-2xl border-border font-black uppercase text-[10px] tracking-widest hover:bg-muted transition-all">
                <Lock className="mr-2" size={16} /> Security Audit
             </Button>
             <Button className="primary-gradient h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                <Zap className="mr-2" size={16} /> Quick Actions
             </Button>
          </div>
        </div>
      </div>

      {/* Critical Alerts Bar */}
      {pendingCounselors > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
           <Link href="/dashboard/admin/counselors" className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl group hover:bg-amber-500/20 transition-all">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                    <AlertCircle size={20} />
                 </div>
                 <div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700">Needs Attention: Counselor Approval</p>
                    <p className="text-sm font-bold text-amber-900">{pendingCounselors} counselors are waiting to be approved.</p>
                 </div>
              </div>
              <ArrowRight className="text-amber-500 group-hover:translate-x-2 transition-transform" size={20} />
           </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {statsConfig.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-card border border-border p-8 rounded-3xl hover:border-primary/50 transition-all duration-500 relative overflow-hidden"
          >
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                <stat.icon size={120} />
             </div>
             <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                   <div className={`p-3 rounded-2xl bg-muted border border-border group-hover:bg-primary group-hover:text-white transition-colors duration-500`}>
                      <stat.icon size={20} />
                   </div>
                   <Badge className="bg-success/10 text-success border-success/20 font-black text-[8px] uppercase tracking-tighter">{stat.trend}</Badge>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mb-1">{stat.label}</p>
                   <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
                   <p className="text-[10px] font-bold text-muted-foreground mt-4 opacity-40">{stat.description}</p>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Main Control Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* System Logs / Recent Activity */}
         <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Activity size={16} /> Recent Activity
               </h3>
               <Button variant="ghost" className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary">View All</Button>
            </div>

            <div className="space-y-4">
               {recentUsers.map((user, i) => (
                  <motion.div 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-6 bg-muted/20 border border-border/50 rounded-2xl hover:border-primary/30 transition-all group"
                  >
                     <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-card border border-border flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-all">
                           {user.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-sm font-black text-foreground uppercase tracking-tight">{user.name}</p>
                           <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                              <Clock size={10} /> Joined as <span className="text-primary font-black">{user.role}</span> • 2 mins ago
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[8px] font-black uppercase opacity-40">Direct Entry</Badge>
                        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                           <ArrowRight size={16} />
                        </Button>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>

         {/* Secondary Controls */}
         <div className="lg:col-span-4 space-y-12">
            <section className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Globe size={16} /> Platform Status
               </h3>
               <Card className="bg-slate-900 border-none rounded-3xl overflow-hidden text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Shield size={120} />
                  </div>
                  <CardBody className="p-8 space-y-8 relative z-10">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">System Status</p>
                           <p className="text-3xl font-black mt-1 uppercase tracking-tighter">Normal</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                           <ShieldCheck size={24} />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>API Performance</span>
                           <span className="text-emerald-400">99.9%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '99%' }} className="h-full bg-emerald-400" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                           <span>Server Load</span>
                           <span className="text-amber-400">24%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div initial={{ width: 0 }} animate={{ width: '24%' }} className="h-full bg-amber-400" />
                        </div>
                     </div>

                     <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Launch System Diagnostics
                     </Button>
                  </CardBody>
               </Card>
            </section>

            <section className="space-y-6">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <TrendingUp size={16} /> Registry Access
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/students">
                     <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl hover:border-primary/50 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center mb-4 group-hover:bg-success group-hover:text-white transition-all">
                           <Users size={18} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Manage</p>
                        <p className="text-lg font-black uppercase tracking-tighter">Scholars</p>
                     </div>
                  </Link>
                  <Link href="/dashboard/admin/counselors">
                     <div className="p-6 bg-muted/30 border border-border/50 rounded-2xl hover:border-primary/50 transition-all group">
                        <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center mb-4 group-hover:bg-info group-hover:text-white transition-all">
                           <ShieldCheck size={18} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Manage</p>
                        <p className="text-lg font-black uppercase tracking-tighter">Experts</p>
                     </div>
                  </Link>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <Activity className={className} size={size} />
);
