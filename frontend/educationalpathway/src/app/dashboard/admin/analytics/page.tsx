'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Globe, 
  Zap, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import { motion } from 'framer-motion';
import { getAdminStats } from '@/features/admin/api/admin-api';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Analytics fetch failure:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Analytics</p>
      </div>
    );
  }

  const performanceMetrics = [
    { label: 'Uptime', value: '99.98%', trend: '+0.02%', icon: Zap, color: 'text-success' },
    { label: 'Avg Latency', value: '124ms', trend: '-12ms', icon: Clock, color: 'text-primary' },
    { label: 'Conversion', value: '14.2%', trend: '+2.4%', icon: TrendingUp, color: 'text-info' },
    { label: 'Daily Active', value: '1.2k', trend: '+15%', icon: Users, color: 'text-warning' },
  ];

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Analytics</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
             <BarChart3 size={14} className="text-primary" /> View platform performance and user growth
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="outline" className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border-border hover:bg-muted transition-all">
              <Calendar className="mr-2" size={14} /> Last 30 Days
           </Button>
           <Button className="primary-gradient text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20">
              Download Report
           </Button>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all"
          >
             <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl bg-muted flex items-center justify-center ${m.color} group-hover:bg-primary group-hover:text-white transition-all`}>
                   <m.icon size={18} />
                </div>
                <div>
                   <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</p>
                   <p className="text-xl font-black text-foreground">{m.value}</p>
                </div>
             </div>
             <span className={`text-[10px] font-black flex items-center gap-1 ${m.trend.startsWith('+') ? 'text-success' : 'text-primary'}`}>
                {m.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {m.trend}
             </span>
          </motion.div>
        ))}
      </div>

      {/* Visual Data Representation - CSS Based Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* User Growth */}
         <Card className="lg:col-span-8 bg-card border-border rounded-3xl overflow-hidden relative group">
            <CardBody className="p-10 space-y-12">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">User Growth</h3>
                     <p className="text-2xl font-black mt-2">New users over time</p>
                  </div>
                  <div className="flex gap-2">
                     <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase">Students</Badge>
                     <Badge className="bg-info/10 text-info border-info/20 font-black uppercase">Counselors</Badge>
                  </div>
               </div>

               {/* Simulated Wave Chart with CSS */}
               <div className="h-64 w-full flex items-end gap-2 relative">
                  {[40, 65, 45, 80, 55, 90, 75, 100, 85, 95, 110, 130].map((h, i) => (
                     <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="flex-1 bg-linear-to-t from-primary/10 to-primary group-hover:from-primary/20 group-hover:to-primary transition-all rounded-t-lg relative"
                     >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-black transition-opacity">
                           {h * 10}
                        </div>
                     </motion.div>
                  ))}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                     {[1,2,3,4].map(l => <div key={l} className="w-full h-px bg-foreground" />)}
                  </div>
               </div>

               <div className="flex justify-between text-[10px] font-black text-muted-foreground opacity-40 uppercase tracking-widest pt-4 border-t border-border/50">
                  <span>January</span>
                  <span>March</span>
                  <span>June</span>
                  <span>September</span>
                  <span>December</span>
               </div>
            </CardBody>
         </Card>

         {/* Distribution */}
         <Card className="lg:col-span-4 bg-card border-border rounded-3xl overflow-hidden relative">
            <CardBody className="p-10 space-y-10">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Users by Role</h3>
               
               <div className="space-y-8">
                  {[
                    { label: 'Students', value: stats?.students || 0, color: 'bg-success', total: stats?.totalUsers || 1 },
                    { label: 'Counselors', value: stats?.counselors || 0, color: 'bg-info', total: stats?.totalUsers || 1 },
                    { label: 'Admins', value: stats?.admins || 0, color: 'bg-destructive', total: stats?.totalUsers || 1 }
                  ].map((role, i) => (
                     <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{role.label}</span>
                           <span className="text-xl font-black text-foreground">{role.value} <span className="text-[10px] opacity-40">({Math.round((role.value / role.total) * 100)}%)</span></span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(role.value / role.total) * 100}%` }}
                              transition={{ delay: 0.5 + (i * 0.1), duration: 1.5 }}
                              className={`h-full ${role.color}`}
                           />
                        </div>
                     </div>
                  ))}
               </div>

               <div className="pt-10 space-y-4">
                  <div className="p-4 bg-muted/30 border border-border/50 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Globe size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Countries Reach</span>
                     </div>
                     <span className="text-sm font-black text-foreground">12 COUNTRIES</span>
                  </div>
               </div>
            </CardBody>
         </Card>
      </div>

      {/* Regional Intelligence */}
      <section className="space-y-8">
         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
            <Globe size={16} /> Location Breakdown
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
               { country: 'Ethiopia', users: 850, trend: '+12%', color: 'text-emerald-500' },
               { country: 'Kenya', users: 320, trend: '+8%', color: 'text-emerald-500' },
               { country: 'USA', users: 150, trend: '-2%', color: 'text-primary' },
               { country: 'Canada', users: 90, trend: '+25%', color: 'text-emerald-500' },
               { country: 'Germany', users: 45, trend: '+5%', color: 'text-emerald-500' },
               { country: 'China', users: 12, trend: '+0%', color: 'text-muted-foreground' }
            ].map((c, i) => (
               <div key={i} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-muted border border-border flex items-center justify-center font-black text-[10px] group-hover:bg-primary group-hover:text-white transition-all uppercase">
                        {c.country.substring(0, 2)}
                     </div>
                     <div>
                        <p className="text-sm font-black text-foreground uppercase tracking-tight">{c.country}</p>
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{c.users} active users</p>
                     </div>
                  </div>
                  <span className={`text-[10px] font-black ${c.color}`}>{c.trend}</span>
               </div>
            ))}
         </div>
      </section>
    </div>
  );
}
