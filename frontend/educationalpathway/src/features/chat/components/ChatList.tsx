"use client";

import { useState } from "react";
import { Conversation } from "../types";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { User, MessageCircle, Search, Plus, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelect: (conversation: Conversation) => void;
  currentUserId: number;
  currentUserRole?: string;
  onNewChat?: () => void;
  onBookSession?: (userId: number) => void;
}

export const ChatList = ({ conversations, activeConversationId, onSelect, currentUserId, currentUserRole, onNewChat, onBookSession }: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter(conv => {
    const isGroup = !!conv.isGroup;
    const participants = conv.members || conv.users || [];
    const otherUser = participants.find(u => u.id !== currentUserId);
    const title = isGroup ? (conv.name || 'Unnamed Group') : (otherUser?.name || 'Unknown User');
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversation = (conv: Conversation, index: number) => {
    const isGroup = !!conv.isGroup;
    const participants = conv.members || conv.users || [];
    const otherUser = participants.find(u => u.id !== currentUserId);
    const lastMessage = conv.chatMessages?.[0] || conv.messages?.[0] || conv.ChatMessages?.[0];
    const isActive = activeConversationId === conv.id;

    const chatTitle = isGroup ? (conv.name || 'Unnamed Group') : (otherUser?.name || 'Unknown User');
    const chatSubtitle = isGroup ? (conv.country || 'Global Community') : otherUser?.role;

    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      if (isToday(date)) return format(date, "HH:mm");
      if (isYesterday(date)) return "Yesterday";
      return format(date, "MMM d");
    };

    return (
      <motion.div
        key={conv.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => onSelect(conv)}
        className={`relative group px-6 py-4 flex items-center gap-4 transition-all duration-300 cursor-pointer 
          ${isActive 
            ? 'bg-primary/15 before:absolute before:left-0 before:top-1/4 before:bottom-1/4 before:w-1 before:bg-primary before:rounded-r-full shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]' 
            : 'hover:bg-white/5'}`}
      >
        <div className="relative shrink-0">
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300
            ${isActive ? 'bg-primary/20 ring-2 ring-primary/30' : 'bg-white/5 border border-white/5'}`}>
            {isGroup ? (
              <span className="font-black text-xs text-primary tracking-tighter">{conv.country?.substring(0, 2).toUpperCase() || 'GP'}</span>
            ) : (
              <div className="text-white/60 group-hover:text-primary transition-colors">
                <User className="h-6 w-6" strokeWidth={1.5} />
              </div>
            )}
          </div>
          {!isGroup && (
             <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-[#0a0f18] bg-emerald-500 shadow-xl" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className={`text-[15px] font-bold truncate tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
              {chatTitle}
            </h4>
            {lastMessage && (
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest whitespace-nowrap">
                {formatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-white/40 truncate font-medium">
               {lastMessage ? (
                 <span className="flex items-center gap-1.5">
                   {lastMessage.senderId === currentUserId && <span className="text-[10px] text-primary font-black uppercase tracking-widest shrink-0">You:</span>}
                   {lastMessage.content.startsWith('[Attached File]') ? '📎 Secure Attachment' : lastMessage.content}
                 </span>
               ) : (
                 <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.1em]">{chatSubtitle}</span>
               )}
            </p>
            {Number(conv.unreadCount) > 0 && (
              <span className="h-5 min-w-[20px] px-2 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] animate-in zoom-in">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0d131f]/50">
      {/* Search Header */}
      <div className="p-6 space-y-6 border-b border-white/5 bg-[#0a0f18]/40 backdrop-blur-3xl sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
             <h2 className="text-2xl font-black tracking-tight text-white">Direct</h2>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Encrypted Channel</span>
          </div>
          {onNewChat && (
            <button 
              onClick={onNewChat} 
              className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white active:scale-90 transition-all duration-300"
            >
              <Plus size={20} strokeWidth={3} />
            </button>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:ring-2 focus:ring-primary/20 focus:bg-white/10 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredConversations.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="p-16 text-center"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 opacity-40">
                <Search size={32} className="text-white" />
              </div>
              <p className="text-sm font-bold text-white/40">No Intel Found</p>
            </motion.div>
          ) : (
            <div className="flex flex-col py-2">
              {filteredConversations.map((conv, idx) => renderConversation(conv, idx))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


