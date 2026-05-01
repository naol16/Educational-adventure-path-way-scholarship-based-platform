'use client';

import { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Zap, 
  Lock, 
  Unlock,
  Database, 
  Mail, 
  Save, 
  RotateCcw,
  AlertCircle,
  Eye,
  EyeOff,
  Cpu,
  Fingerprint
} from 'lucide-react';
import { Card, CardBody, Button, Badge } from '@/components/ui';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [commissionRate, setCommissionRate] = useState('15');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Configuration updated and propagated to registry');
    }, 1500);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 lg:px-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Settings</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
             <Settings size={14} className="text-primary" /> Manage platform settings and controls
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <Button variant="ghost" className="h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <RotateCcw className="mr-2" size={14} /> Cancel
           </Button>
           <Button 
              onClick={handleSave}
              isLoading={isSaving}
              className="primary-gradient text-white h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              <Save className="mr-2" size={14} /> Save Changes
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Navigation Sidebar */}
         <div className="lg:col-span-3 space-y-2">
            {[
              { label: 'General', icon: Globe, active: true },
              { label: 'Security', icon: Shield },
              { label: 'Notifications', icon: Bell },
              { label: 'Payments', icon: Database },
              { label: 'Intelligence', icon: Cpu },
            ].map((tab, i) => (
               <button 
                  key={i}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    tab.active ? 'bg-primary/5 text-primary border border-primary/10' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
               >
                  <tab.icon size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
               </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-9 space-y-12">
            {/* System Status Section */}
            <section className="space-y-8">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Zap size={16} /> System Status
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-8 rounded-3xl border transition-all duration-500 flex flex-col justify-between h-48 ${
                    maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-success/5 border-success/20'
                  }`}>
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Maintenance Mode</p>
                           <div className={`h-2 w-2 rounded-full ${maintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-success'}`} />
                        </div>
                        <p className="text-2xl font-black uppercase tracking-tight">
                           {maintenanceMode ? 'SYSTEM: MAINTENANCE' : 'SYSTEM: LIVE'}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-2 uppercase tracking-wide leading-relaxed">
                           {maintenanceMode ? 'Public access is restricted. Only verified admins can interact with the registry.' : 'Platform is fully operational and synchronized with global nodes.'}
                        </p>
                     </div>
                     <Button 
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        variant="outline" 
                        className={`h-10 text-[9px] font-black uppercase tracking-widest border-border hover:bg-background ${maintenanceMode ? 'border-amber-500/50 text-amber-600' : 'text-success border-success/50'}`}
                     >
                        {maintenanceMode ? <><Unlock size={14} className="mr-2" /> Turn Off Maintenance</> : <><Lock size={14} className="mr-2" /> Turn On Maintenance</>}
                     </Button>
                  </div>

                  <div className="p-8 bg-muted/20 border border-border/50 rounded-3xl flex flex-col justify-between h-48">
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">System Version</p>
                        <p className="text-2xl font-black uppercase tracking-tight text-foreground">Version 2.4.1</p>
                        <Badge className="mt-2 bg-primary/10 text-primary border-primary/20 font-black">STABLE RELEASE</Badge>
                     </div>
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Last updated: 2 hrs ago • UTC+3</p>
                  </div>
               </div>
            </section>

            {/* Financial Configuration */}
            <section className="space-y-8 pt-8 border-t border-border/40">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Database size={16} /> Payment Settings
               </h3>
               
               <div className="space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="max-w-md">
                        <p className="text-sm font-black text-foreground uppercase tracking-tight">Platform Commission Rate</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                           The percentage retained by the platform for every successful consultation session.
                        </p>
                     </div>
                     <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border">
                        <input 
                           type="number" 
                           className="w-20 bg-transparent border-none text-center font-black text-2xl focus:ring-0" 
                           value={commissionRate}
                           onChange={(e) => setCommissionRate(e.target.value)}
                        />
                        <span className="text-xl font-black text-muted-foreground mr-4">%</span>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="max-w-md">
                        <p className="text-sm font-black text-foreground uppercase tracking-tight">Minimum Payout</p>
                        <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                           Minimum balance required for a counselor to request a payout.
                        </p>
                     </div>
                     <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border">
                        <input 
                           type="number" 
                           className="w-32 bg-transparent border-none text-center font-black text-2xl focus:ring-0" 
                           defaultValue="500"
                        />
                        <span className="text-xs font-black text-muted-foreground mr-4 uppercase">ETB</span>
                     </div>
                  </div>
               </div>
            </section>

            {/* Advanced Identity Controls */}
            <section className="space-y-8 pt-8 border-t border-border/40">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3">
                  <Fingerprint size={16} /> Identity Protocol
               </h3>
               
               <div className="space-y-4">
                  {[
                    { label: 'Mandatory ID Verification', desc: 'Require government-issued ID for all experts before listing.', enabled: true },
                    { label: 'Biometric Face-Sync', desc: 'Experimental AI verification for selfie uploads.', enabled: false },
                    { label: 'Public Counselor Search', desc: 'Allow unauthenticated users to browse the expert network.', enabled: true },
                  ].map((setting, i) => (
                     <div key={i} className="p-6 bg-card border border-border rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
                        <div className="max-w-md">
                           <p className="text-sm font-black text-foreground uppercase tracking-tight">{setting.label}</p>
                           <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">{setting.desc}</p>
                        </div>
                        <button className={`h-8 w-14 rounded-full p-1 transition-all duration-500 ${setting.enabled ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-muted border border-border'}`}>
                           <div className={`h-6 w-6 rounded-full bg-white transition-all duration-500 ${setting.enabled ? 'ml-6' : 'ml-0'}`} />
                        </button>
                     </div>
                  ))}
               </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-8 pt-12 border-t border-border/40">
               <div className="p-10 bg-destructive/5 border border-destructive/20 rounded-[40px] space-y-6">
                  <div className="flex items-center gap-4">
                     <AlertCircle className="text-destructive" size={24} />
                     <h3 className="text-lg font-black text-destructive uppercase tracking-tighter leading-none">Danger Zone</h3>
                  </div>
                  <p className="text-xs font-medium text-destructive/80 uppercase tracking-wide leading-relaxed max-w-2xl">
                     Executing actions in this zone may result in irreversible platform failure or registry corruption. Handle with extreme caution.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                     <Button variant="outline" className="border-destructive/30 text-destructive text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-xl hover:bg-destructive hover:text-white transition-all">
                        Clear Cache
                     </Button>
                     <Button variant="outline" className="border-destructive/30 text-destructive text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-xl hover:bg-destructive hover:text-white transition-all">
                        Delete Inactive Users
                     </Button>
                  </div>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
}
