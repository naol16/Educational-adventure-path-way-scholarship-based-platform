import { useEffect, useState } from "react";
import { ChatUser } from "../types";
import { User, X, Plus, Search, Trash2, MessageSquare, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface GroupMembersProps {
  conversationId: number;
  currentUserId: number;
  currentUserRole?: string;
  onClose: () => void;
  onStartPrivateChat: (userId: number) => void;
}

export const GroupMembers = ({ conversationId, currentUserId, currentUserRole, onClose, onStartPrivateChat }: GroupMembersProps) => {
  const [members, setMembers] = useState<ChatUser[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/groups/${conversationId}/members`);
      const data = Array.isArray(res.data) ? res.data : [];
      const uniqueMembers = Array.from(new Map(data.map((m: ChatUser) => [m.id, m])).values());
      setMembers(uniqueMembers);
    } catch (err) {
      console.error("Failed to fetch members", err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await api.get("/chat/available-users");
      const memberIds = members.map(m => m.id);
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = data.filter((u: ChatUser) => !memberIds.includes(u.id));
      setAvailableUsers(filtered);
    } catch (err) {
      console.error("Failed to fetch available users", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [conversationId]);

  useEffect(() => {
    if (showAddMember) fetchAvailableUsers();
  }, [showAddMember, members]);

  const handleAddMember = async (userId: number) => {
    try {
      await api.post(`/groups/${conversationId}/members`, { userId });
      toast.success("Member synchronized");
      fetchMembers();
      setShowAddMember(false);
    } catch (err) {
      toast.error("Synchronization failed");
    }
  };

  const handleRemoveMember = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (!confirm("Remove this member from group?")) return;
    try {
      await api.delete(`/groups/${conversationId}/members/${userId}`);
      toast.success("Member removed");
      fetchMembers();
    } catch (err) {
      toast.error("Failed to remove member");
    }
  };

  const filteredAvailable = availableUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-1 h-full bg-[#0e1621] flex flex-col overflow-hidden border-l border-white/5 shadow-2xl"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#17212b]/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 text-primary hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white tracking-tight">Group Details</h2>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest opacity-80">{(members?.length || 0)} Participants</span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
             {[1,2,3].map(i => <div key={i} className="h-12 w-full rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {members.map(member => (
              <div 
                key={member.id} 
                onClick={() => member.id !== currentUserId && onStartPrivateChat(member.id)}
                className={`p-3 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all group ${member.id !== currentUserId ? 'cursor-pointer' : ''}`}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black border border-primary/20 shadow-inner">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{member.name}</span>
                    {member.id === currentUserId && (
                      <span className="text-[8px] px-1.5 py-0.5 bg-primary/20 text-primary rounded font-black uppercase tracking-tighter">You</span>
                    )}
                  </div>
                  <p className="text-[9px] text-primary/60 uppercase font-black tracking-widest">
                    {member.role}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   {member.id !== currentUserId && (
                      <button 
                        onClick={() => onStartPrivateChat(member.id)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                      >
                        <MessageSquare size={16} />
                      </button>
                   )}
                   {(currentUserRole === 'admin' || currentUserRole === 'counselor') && member.id !== currentUserId && (
                      <button 
                        onClick={(e) => handleRemoveMember(e, member.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(currentUserRole === 'admin' || currentUserRole === 'counselor') && (
        <div className="p-4 border-t border-white/5 bg-[#17212b]/30">
          {!showAddMember ? (
            <button 
              onClick={() => setShowAddMember(true)}
              className="w-full py-3 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={16} />
              Invite New Member
            </button>
          ) : (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search to invite..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl text-sm text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredAvailable.length === 0 ? (
                  <p className="text-[10px] text-white/40 text-center py-4 font-bold uppercase tracking-widest">No users found</p>
                ) : (
                  filteredAvailable.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handleAddMember(user.id)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-all border border-transparent hover:border-white/5"
                    >
                      <div>
                        <div className="font-bold text-xs text-white leading-tight">{user.name}</div>
                        <div className="text-[9px] text-primary/60 uppercase font-black tracking-widest">{user.role}</div>
                      </div>
                      <Plus size={14} className="text-primary" />
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => setShowAddMember(false)}
                className="w-full text-center text-[10px] text-white/40 hover:text-white font-black uppercase tracking-widest transition-colors py-2"
              >
                Cancel Invitation
              </button>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
};
