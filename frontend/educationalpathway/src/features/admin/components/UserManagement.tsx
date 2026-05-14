'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/features/auth/types';
import { 
  getAllUsers, 
  updateUserRole, 
  deactivateUser, 
  activateUser, 
  deleteUser,
  updateCounselorVerification,
  getAdminStats
} from '../api/admin-api';

import { Button, Card, CardBody, Badge, ConfirmModal } from '@/components/ui';
import { 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  UserMinus, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  Key,
  History,
  Lock,
  Unlock,
  Users,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FileText,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { useRouter } from 'next/navigation';

type ManagementTab = 'students' | 'counselors' | 'all';

export const UserManagement = () => {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ManagementTab>('students');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const limit = 10;
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'deactivate' | 'activate' | 'delete' | 'role' | 'approve' | 'reject' | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(currentPage, limit);
      setUsers(data);
      
      // Fetch stats to get total count for pagination
      const stats = await getAdminStats();
      if (activeTab === 'students') setTotalUsers(stats.students);
      else if (activeTab === 'counselors') setTotalUsers(stats.counselors);
      else setTotalUsers(stats.totalUsers);
      
    } catch {
      toast.error('Failed to load identity registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, activeTab]);

  const totalPages = Math.ceil(totalUsers / limit);

  const handleAction = (e: React.MouseEvent, user: any, type: any) => {
    e.stopPropagation(); // Prevent navigation when clicking buttons
    setSelectedUser(user);
    setActionType(type);
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !actionType) return;
    setProcessingId(selectedUser.id);
    
    try {
      if (actionType === 'deactivate') {
        await deactivateUser(selectedUser.id);
        toast.success(`User access restricted`);
      } else if (actionType === 'activate') {
        await activateUser(selectedUser.id);
        toast.success(`User access restored`);
      } else if (actionType === 'delete') {
        await deleteUser(selectedUser.id);
        toast.success(`User record purged`);
      } else if (actionType === 'approve') {
        await updateCounselorVerification(selectedUser.counselor.id, 'verified');
        toast.success(`Counselor verified successfully`);
      } else if (actionType === 'reject') {
        await updateCounselorVerification(selectedUser.counselor.id, 'rejected');
        toast.success(`Counselor verification rejected`);
      }
      fetchUsers();
    } catch (error) {
      toast.error('Protocol failure: Action could not be completed');
    } finally {
      setProcessingId(null);
      setIsConfirmModalOpen(false);
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesTab = true;
    if (activeTab === 'students') matchesTab = u.role === 'student';
    if (activeTab === 'counselors') matchesTab = u.role === 'counselor';
    
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synchronizing Identity Registry</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header & Role Switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-border pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg border border-border/50">
              {(['students', 'counselors', 'all'] as ManagementTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="relative w-full lg:w-96">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
           <input 
             type="text" 
             placeholder="SEARCH IDENTITY REGISTRY..."
             className="w-full bg-muted/20 border-border/50 border rounded-2xl py-4 pl-14 pr-6 text-[10px] font-black uppercase tracking-[0.2em] focus:ring-4 focus:ring-primary/10 transition-all outline-none"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      {/* Identity List */}
      <div className="space-y-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, idx) => {
            const isCounselor = user.role === 'counselor';
            const isStudent = user.role === 'student';
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => router.push(`/dashboard/admin/users/${user.id}`)}
                className={`group relative bg-card border ${!user.isActive ? 'border-destructive/20 opacity-70' : 'border-border/50'} rounded-2xl overflow-hidden transition-all duration-500 hover:border-primary/30 cursor-pointer`}
              >
                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                  {/* Identity Avatar */}
                  <div className={`h-20 w-20 rounded-2xl shrink-0 flex items-center justify-center font-black text-2xl shadow-inner transition-all duration-700 group-hover:scale-105 ${
                    isCounselor ? 'bg-blue-500/10 text-blue-500' : 
                    isStudent ? 'bg-emerald-500/10 text-emerald-500' : 
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {(user.name || user.fullName || 'U').charAt(0)}
                  </div>

                  {/* Core Details */}
                  <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">{user.name || user.fullName}</h3>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                         <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${
                            isCounselor ? 'border-blue-500/30 text-blue-500 bg-blue-500/5' : 
                            isStudent ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 
                            'border-slate-500/30 text-slate-500'
                         }`}>
                            {user.role}
                         </Badge>
                         {!user.isActive && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[8px] font-black uppercase">Blocked</Badge>}
                         {isCounselor && user.counselor && (
                           <Badge className={`text-[8px] font-black uppercase ${
                             user.counselor.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                             user.counselor.verificationStatus === 'rejected' ? 'bg-destructive/10 text-destructive' :
                             'bg-amber-500/10 text-amber-500 animate-pulse'
                           }`}>
                             {user.counselor.verificationStatus}
                           </Badge>
                         )}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] flex items-center justify-center md:justify-start gap-2 opacity-60">
                      <Mail size={12} className="text-primary" /> {user.email}
                    </p>
                  </div>

                  {/* Quick Stats / Location */}
                  <div className="hidden lg:flex items-center gap-12 px-12 border-x border-border/30">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-destructive'}`} />
                        <span className="text-[10px] font-black uppercase tracking-tighter">{user.isActive ? 'Active' : 'Blocked'}</span>
                      </div>
                    </div>
                    {isStudent && user.student && (
                      <div className="text-center">
                         <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest opacity-40 mb-1">Country</p>
                         <p className="text-[10px] font-black uppercase tracking-tighter">{user.student.countryOfResidence || 'Unknown'}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className={`h-12 w-12 rounded-lg transition-all ${user.isActive ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                         onClick={(e) => handleAction(e, user, user.isActive ? 'deactivate' : 'activate')}
                         title={user.isActive ? 'Block User' : 'Unblock User'}
                       >
                         {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-12 w-12 rounded-lg text-destructive hover:bg-destructive/10"
                         onClick={(e) => handleAction(e, user, 'delete')}
                       >
                         <Trash2 size={18} />
                       </Button>
                    </div>

                    <Button 
                      variant="outline" 
                      className="h-12 px-4 rounded-lg border-border/50 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="py-40 text-center">
            <Users size={80} className="mx-auto text-muted-foreground opacity-10 mb-8" />
            <h3 className="text-3xl font-black uppercase tracking-tighter text-muted-foreground">No Records Found</h3>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Identity registry is empty for this protocol level.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-12 border-t border-border/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            Showing Page <span className="text-primary">{currentPage}</span> of {totalPages} ({totalUsers} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="h-12 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
            >
              Previous Protocol
            </Button>
            <div className="flex gap-1">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 const pageNum = i + 1;
                 return (
                   <button
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`h-12 w-12 rounded-lg text-[10px] font-black transition-all ${
                       currentPage === pageNum ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="h-12 px-6 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
            >
              Next Protocol
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        title={`${actionType?.charAt(0).toUpperCase()}${actionType?.slice(1)} Identity`}
        description={`Execute ${actionType} protocol for ${selectedUser?.name}? This action will be logged in the system registry.`}
        confirmText="Confirm Action"
      />
    </div>
  );
};

const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
  <ChevronDown className={`${className} -rotate-90`} size={size} />
);

