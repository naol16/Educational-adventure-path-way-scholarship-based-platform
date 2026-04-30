"use client";

import { useEffect, useState } from "react";
import { ChatUser } from "../types";
import { User, X, Plus, Search, Trash2, MessageSquare } from "lucide-react";
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
      
      // Defensive deduplication in the frontend
      const uniqueMembers = Array.from(
        new Map(data.map((m: ChatUser) => [m.id, m])).values()
      );
      
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
      // Filter out users who are already members
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
    if (showAddMember) {
      fetchAvailableUsers();
    }
  }, [showAddMember, members]);

  const handleAddMember = async (userId: number) => {
    try {
      await api.post(`/groups/${conversationId}/members`, { userId });
      toast.success("Member added successfully");
      fetchMembers();
      setShowAddMember(false);
    } catch (err) {
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this member?")) return;
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
    <div className="flex-1 h-full bg-card flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-foreground">Group Members</h2>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{(members?.length || 0)} Members</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground opacity-50">Loading members...</div>
        ) : (
          <div className="divide-y divide-border/50">
            {members.map(member => (
              <div 
                key={member.id} 
                onClick={() => member.id !== currentUserId && onStartPrivateChat(member.id)}
                className={`p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors ${member.id !== currentUserId ? 'cursor-pointer' : ''}`}
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs truncate">{member.name}</span>
                    {member.id === currentUserId && (
                      <span className="text-[8px] px-1 bg-primary/10 text-primary rounded font-bold uppercase">You</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
                    {member.role}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                   {member.id !== currentUserId && (
                      <button 
                        onClick={() => onStartPrivateChat(member.id)}
                        className="p-1.5 hover:bg-primary/10 text-primary rounded-full transition-colors"
                        title="Message"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>
                   )}
                   {currentUserRole === 'admin' && member.id !== currentUserId && (
                      <button 
                        onClick={(e) => handleRemoveMember(e, member.id)}
                        className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentUserRole === 'admin' && (
        <div className="p-3 border-t border-border bg-muted/5">
          {!showAddMember ? (
            <button 
              onClick={() => setShowAddMember(true)}
              className="w-full py-2 px-4 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="h-3 w-3" />
              Add Member
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border rounded-md text-xs focus:ring-1 focus:ring-primary outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {filteredAvailable.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground text-center py-2">No users found</p>
                ) : (
                  filteredAvailable.map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handleAddMember(user.id)}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-bold text-[11px] leading-tight">{user.name}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">{user.role}</div>
                      </div>
                      <Plus className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100" />
                    </div>
                  ))
                )}
              </div>
              <button 
                onClick={() => setShowAddMember(false)}
                className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground font-bold"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
