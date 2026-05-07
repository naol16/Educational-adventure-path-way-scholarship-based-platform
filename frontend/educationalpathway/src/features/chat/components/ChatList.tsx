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
    const title = isGroup ? conv.name : (otherUser?.name || 'Unknown User');
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversation = (conv: Conversation, index: number) => {
    const isGroup = !!conv.isGroup;
    const participants = conv.members || conv.users || [];
    const otherUser = participants.find(u => u.id !== currentUserId);
    const lastMessage = conv.chatMessages?.[0] || conv.messages?.[0] || conv.ChatMessages?.[0];
    const isActive = activeConversationId === conv.id;

    const chatTitle = isGroup ? conv.name : (otherUser?.name || 'Unknown User');
    const chatSubtitle = isGroup ? (conv.country || 'Group') : otherUser?.role;

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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => onSelect(conv)}
        className={`relative group px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${isActive ? 'bg-primary/10 border-r-2 border-primary' : 'hover:bg-muted/50'}`}
      >
        <div className="relative shrink-0">
          <div className="h-12 w-12 rounded-full overflow-hidden bg-primary/5 flex items-center justify-center text-primary border border-border shadow-sm">
            {isGroup ? (
              <span className="font-black text-sm">{conv.country?.substring(0, 2).toUpperCase() || 'GP'}</span>
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
          {!isGroup && (
             <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {chatTitle}
            </h4>
            {lastMessage && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {formatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground truncate leading-tight">
               {lastMessage ? (
                 <span className="flex items-center gap-1">
                   {lastMessage.senderId === currentUserId && <span className="text-[10px] text-primary font-bold shrink-0">You:</span>}
                   {lastMessage.content.startsWith('[Attached File]') ? '📎 File' : lastMessage.content}
                 </span>
               ) : (
                 <span className="italic opacity-60 uppercase text-[10px] tracking-widest">{chatSubtitle}</span>
               )}
            </p>
            {Number(conv.unreadCount) > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-sm">
                {conv.unreadCount}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card/30">
      {/* Search Header */}
      <div className="p-4 space-y-4 border-b border-border/50 bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight text-foreground/80">Messages</h2>
          {onNewChat && (
            <button 
              onClick={onNewChat} 
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
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
              className="p-12 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 opacity-20">
                <Search size={24} />
              </div>
              <p className="text-sm text-muted-foreground">No conversations found</p>
            </motion.div>
          ) : (
            <div className="flex flex-col">
              {filteredConversations.map((conv, idx) => renderConversation(conv, idx))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

