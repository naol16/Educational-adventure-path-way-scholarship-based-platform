'use client';

import { useState, useEffect } from 'react';
import { User, UserRole } from '@/features/auth/types';
import { 
  getAllUsers, 
  updateUserRole, 
  deactivateUser, 
  activateUser, 
  deleteUser 
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
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const UserManagement = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'deactivate' | 'activate' | 'delete' | 'role' | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = (user: any, type: 'deactivate' | 'activate' | 'delete' | 'role') => {
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
        toast.success(`User deactivated`);
      } else if (actionType === 'activate') {
        await activateUser(selectedUser.id);
        toast.success(`User activated`);
      } else if (actionType === 'delete') {
        await deleteUser(selectedUser.id);
        toast.success(`User deleted`);
      } else if (actionType === 'role') {
        const newRole = selectedUser.role === 'admin' ? 'student' : 'admin';
        await updateUserRole(selectedUser.id, newRole as UserRole);
        toast.success(`Role updated to ${newRole.toUpperCase()}`);
      }
      fetchUsers();
    } catch (error) {
      toast.error('Error: Action failed');
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
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading Users</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black text-foreground uppercase tracking-tighter leading-none">Users</h2>
          <p className="text-muted-foreground text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-3">
            <Lock size={14} className="text-primary" /> Manage user roles and access
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-end gap-4 w-full lg:w-auto">
           <div className="flex gap-2 bg-muted/30 p-1 rounded-xl border border-border">
              {['all', 'admin', 'counselor', 'student'].map((r) => (
                 <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      roleFilter === r ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                    }`}
                 >
                    {r}
                 </button>
              ))}
           </div>
           <div className="relative w-full lg:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH USERS..."
                className="w-full bg-muted/30 border-border border rounded-xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, idx) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`group relative bg-card border ${user.isActive === false ? 'border-destructive/20 opacity-60' : 'border-border'} rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 flex flex-col md:flex-row items-center gap-8`}
            >
              <div className="flex items-center gap-6 flex-1">
                 <div className={`h-14 w-14 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-500 ${
                    user.role === 'admin' ? 'bg-destructive/10 text-destructive' : 
                    user.role === 'counselor' ? 'bg-info/10 text-info' : 
                    'bg-success/10 text-success'
                 }`}>
                   {user.name?.charAt(0)}
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                      {user.name}
                      {user.role === 'admin' && <ShieldCheck size={16} className="text-destructive" />}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{user.email}</p>
                 </div>
              </div>

              <div className="flex items-center gap-12 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-border/50">
                  <div className="text-right">
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Role</p>
                     <Badge variant="outline" className={`text-[10px] font-black uppercase ${
                        user.role === 'admin' ? 'border-destructive/30 text-destructive' : 
                        user.role === 'counselor' ? 'border-info/30 text-info' : 
                        'border-success/30 text-success'
                     }`}>
                        {user.role}
                     </Badge>
                  </div>

                  <div className="text-right">
                     <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Status</p>
                     <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase ${user.isActive === false ? 'text-destructive' : 'text-success'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${user.isActive === false ? 'bg-destructive' : 'bg-success animate-pulse'}`} />
                        {user.isActive === false ? 'Inactive' : 'Active'}
                     </span>
                  </div>

                 <div className="flex items-center gap-2">
                    {user.isActive === false ? (
                       <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 w-10 p-0 border-success/30 text-success hover:bg-success/5"
                          onClick={() => handleAction(user, 'activate')}
                       >
                          <Unlock size={16} />
                       </Button>
                    ) : (
                       <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-10 w-10 p-0 border-warning/30 text-warning hover:bg-warning/5"
                          onClick={() => handleAction(user, 'deactivate')}
                       >
                          <Lock size={16} />
                       </Button>
                    )}
                    
                    <Button 
                       size="sm" 
                       variant="outline" 
                       className="h-10 w-10 p-0 border-primary/30 text-primary hover:bg-primary/5"
                       onClick={() => handleAction(user, 'role')}
                       title="Toggle Admin Privileges"
                    >
                       <Shield size={16} />
                    </Button>

                    <Button 
                       size="sm" 
                       variant="outline" 
                       className="h-10 w-10 p-0 border-destructive/30 text-destructive hover:bg-destructive/5"
                       onClick={() => handleAction(user, 'delete')}
                    >
                       <Trash2 size={16} />
                    </Button>
                 </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 text-center">
            <Users size={48} className="mx-auto text-muted-foreground opacity-20 mb-6" />
            <h3 className="text-xl font-black uppercase tracking-tight">Identity Registry Empty</h3>
            <p className="text-muted-foreground text-sm font-medium mt-2">No users found matching current security filters.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        title={`${actionType === 'role' ? 'Change Role' : (actionType?.charAt(0).toUpperCase() || '') + (actionType?.slice(1) || '') + ' User'}`}
        description={`Are you sure you want to ${actionType} ${selectedUser?.name}?`}
        confirmText="Yes, Confirm"
      />
    </div>
  );
};
