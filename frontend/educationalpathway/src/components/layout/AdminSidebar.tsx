'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShieldAlert, 
  BarChart3, 
  LogOut,
  TrendingUp,
  Banknote,
  ShieldCheck,
  Globe,
  Database,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../providers/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    group: "OVERVIEW",
    items: [
      { name: 'Admin Home', icon: LayoutDashboard, href: '/dashboard/admin' },
      { name: 'Analytics', icon: BarChart3, href: '/dashboard/admin/analytics' },
    ]
  },
  {
    group: "MANAGEMENT",
    items: [
      { name: 'Students', icon: Users, href: '/dashboard/admin/students' },
      { name: 'Counselors', icon: ShieldCheck, href: '/dashboard/admin/counselors' },
      { name: 'Chat Groups', icon: MessageSquare, href: '/dashboard/admin/groups' },
      { name: 'Users', icon: ShieldAlert, href: '/dashboard/admin/users' },
    ]
  },
  {
    group: "FINANCIAL",
    items: [
      { name: 'Payouts', icon: Banknote, href: '/dashboard/admin/payouts' },
      { name: 'Payments', icon: TrendingUp, href: '/dashboard/admin/transactions' },
    ]
  },
  {
    group: "PLATFORM",
    items: [
      { name: 'Logs', icon: Database, href: '/dashboard/admin/logs' },
      { name: 'Settings', icon: Settings, href: '/dashboard/admin/settings' },
    ]
  }
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 88 : 288 }}
      className="flex flex-col h-screen bg-card border-r border-border/50 pt-12 pb-8 px-4 overflow-x-hidden overflow-y-auto scrollbar-hide z-50 relative"
    >
      {/* Brand / Logo Section & Collapse Toggle */}
      <div className={cn(
        "mb-16 px-2 flex items-center justify-between",
        collapsed && "flex-col gap-8 justify-center"
      )}>
        <div className={cn("flex items-center gap-3 group cursor-pointer", collapsed && "justify-center w-full")}>
          <div className="h-10 w-10 shrink-0 primary-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <Globe className="text-white" size={20} />
          </div>
        </div>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 space-y-10">
        {menuItems.map((group, idx) => (
          <div key={idx} className="space-y-4">
             {!collapsed ? (
                <motion.h3 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]"
                >
                  {group.group}
                </motion.h3>
             ) : (
                <div className="h-px bg-border/40 mx-4" />
             )}
             <nav className="space-y-1">
               {group.items.map((item) => {
                 const isActive = pathname === item.href;
                 return (
                   <Link
                     key={item.href}
                     href={item.href}
                     title={collapsed ? item.name : ""}
                     className={cn(
                       "group flex items-center px-4 py-3 rounded-xl transition-all duration-300",
                       isActive 
                         ? "bg-primary/5 text-primary border border-primary/10" 
                         : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
                       collapsed && "justify-center px-0"
                     )}
                   >
                     <div className={cn("flex items-center gap-4", collapsed && "gap-0")}>
                       <item.icon 
                         size={18} 
                         className={cn(
                           "transition-transform group-hover:scale-110 shrink-0",
                           isActive ? "text-primary" : "text-muted-foreground"
                         )} 
                       />
                       {!collapsed && (
                         <motion.span 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "text-[11px] font-black uppercase tracking-widest",
                              isActive ? "text-primary" : ""
                            )}
                          >
                           {item.name}
                         </motion.span>
                       )}
                     </div>
                     {!collapsed && isActive && (
                       <motion.div layoutId="active" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                     )}
                   </Link>
                 );
               })}
             </nav>
          </div>
        ))}
      </div>

      {/* Footer / User Profile Section with Dropdown */}
      <div className="mt-auto pt-8 border-t border-border/40 relative">
        <AnimatePresence>
          {showDropdown && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-0 w-full mb-4 bg-card border border-border shadow-2xl rounded-2xl overflow-hidden z-50"
            >
              <div className="p-2">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-all group"
                >
                  <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
            } else {
              setShowDropdown(!showDropdown);
            }
          }}
          className={cn(
            "w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
            showDropdown && !collapsed ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50 hover:bg-muted/50",
            collapsed && "p-2 justify-center"
          )}
        >
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase group-hover:scale-110 transition-transform shrink-0">
                 {user?.name?.charAt(0) || 'A'}
              </div>
              {!collapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="min-w-0 text-left"
                >
                   <p className="text-[10px] font-black text-foreground truncate uppercase">{user?.name || 'Admin User'}</p>
                   <p className="text-[8px] font-bold text-muted-foreground truncate uppercase opacity-50">Administrator</p>
                </motion.div>
              )}
           </div>
           {!collapsed && (
             <motion.div
                animate={{ rotate: showDropdown ? 180 : 0 }}
                className="text-muted-foreground"
             >
                <ChevronDown size={14} />
             </motion.div>
           )}
        </button>
      </div>
    </motion.aside>
  );
};
