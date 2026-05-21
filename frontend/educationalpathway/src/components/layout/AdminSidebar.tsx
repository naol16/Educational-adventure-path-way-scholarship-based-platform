'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  User as UserIcon,
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
  MessageSquare,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../providers/auth-context';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  {
    group: "OVERVIEW",
    items: [
      { name: 'Home', icon: LayoutDashboard, href: '/dashboard/admin' },
    ]
  },
  {
    group: "MANAGEMENT",
    items: [
      { name: 'Students', icon: GraduationCap, href: '/dashboard/admin/students' },
      { name: 'Counselors', icon: ShieldCheck, href: '/dashboard/admin/counselors' },
      { name: 'Approval Queue', icon: UserIcon, href: '/dashboard/admin/counselors/approvals' },
      { name: 'Chat Groups', icon: MessageSquare, href: '/dashboard/admin/groups' },
    ]
  },
  {
    group: "FINANCIAL",
    items: [
      { name: 'Payouts', icon: Banknote, href: '/dashboard/admin/payouts' },
    ]
  },
  {
    group: "PLATFORM",
    items: [
      { name: 'Settings', icon: Settings, href: '/dashboard/admin/settings' },
    ]
  }
];

export const AdminSidebar = () => {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-card">
      {/* Brand / Logo Section & Collapse Toggle */}
      <div className={cn(
        "h-16 flex items-center border-b border-border px-5",
        collapsed && !mobile && "justify-center px-3"
      )}>
        {(!collapsed || mobile) && (
          <span className="text-sm font-black text-primary tracking-[0.3em] uppercase">
            ADMIN <span className="text-foreground/40 text-[10px]">CORE</span>
          </span>
        )}
        
        {mobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-2 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all",
              collapsed ? "mx-auto" : "ml-auto"
            )}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((group, idx) => (
          <div key={idx}>
            {/* Group section labels removed intentionally */}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => mobile && setMobileOpen(false)}
                    title={collapsed && !mobile ? item.name : ""}
                    className={cn(
                      "group flex items-center px-4 py-3 rounded-xl transition-all duration-300",
                      isActive 
                        ? "bg-primary/5 text-primary border border-primary/10 shadow-sm" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent",
                      collapsed && !mobile && "justify-center px-0"
                    )}
                  >
                    <div className={cn("flex items-center gap-4", collapsed && !mobile && "gap-0")}>
                      <item.icon 
                        size={18} 
                        className={cn(
                          "transition-transform group-hover:scale-110 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} 
                      />
                      {(!collapsed || mobile) && (
                        <span className={cn(
                          "text-[11px] font-black uppercase tracking-widest",
                          isActive ? "text-primary" : ""
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer / User Profile Section */}
      <div className="p-3 border-t border-border mt-auto">
        <div className="relative">
          <AnimatePresence>
            {showDropdown && (!collapsed || mobile) && (
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
              if (collapsed && !mobile) {
                setCollapsed(false);
              } else {
                setShowDropdown(!showDropdown);
              }
            }}
            className={cn(
              "w-full p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between group",
              showDropdown && (!collapsed || mobile) ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/50 hover:bg-muted/50",
              collapsed && !mobile && "p-2 justify-center"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase group-hover:scale-110 transition-transform shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                {(!collapsed || mobile) && (
                  <div className="min-w-0 text-left">
                    <p className="text-[10px] font-black text-foreground truncate uppercase">{user?.name || 'Admin User'}</p>
                    <p className="text-[8px] font-bold text-muted-foreground truncate uppercase opacity-50">Administrator</p>
                  </div>
                )}
            </div>
            {(!collapsed || mobile) && (
              <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", showDropdown && "rotate-180")} />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-3 bg-card border border-border rounded-xl text-foreground shadow-xl hover:bg-muted transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border z-50 overflow-hidden"
            >
              <SidebarContent mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: collapsed ? 88 : 288 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 40,
          restDelta: 0.1
        }}
        className="hidden lg:flex flex-col h-screen bg-card border-r border-border sticky top-0 overflow-hidden z-30 shadow-sm"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
};

