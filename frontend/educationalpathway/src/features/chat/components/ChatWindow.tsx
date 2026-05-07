"use client";

import { Message, ChatUser } from "../types";
import { format, isToday, isYesterday } from "date-fns";
import { User, CheckCheck, Edit2, Trash2, ChevronLeft, Calendar, Info, Search, MoreVertical, MessageCircle, Reply, Copy, CornerUpLeft } from "lucide-react";
import { Button } from "@/components/ui";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: number;
  otherUser: ChatUser | null;
  loading: boolean;
  typingUser: { userId: number; isTyping: boolean } | null;
  currentUserRole?: string;
  isGroup?: boolean;
  conversationId?: number;
  onBookSession?: () => void;
  onShowMembers?: () => void; 
  onStartPrivateChat?: (userId: number) => void;
  bookingLoading?: boolean;
  groupName?: string;
  onlineUsers: Set<number>;
  onLoadMore: () => void;
  hasMore: boolean;
  onEditMessage?: (id: number, content: string) => void;
  onDeleteMessage?: (id: number) => void;
  onReplyMessage?: (message: Message) => void;
  onBack?: () => void;
}

export const ChatWindow = ({ 
  messages, 
  currentUserId, 
  otherUser, 
  loading, 
  typingUser,
  currentUserRole,
  isGroup,
  conversationId,
  onBookSession,
  onShowMembers, 
  onStartPrivateChat,
  bookingLoading,
  groupName,
  onlineUsers,
  onLoadMore,
  hasMore,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onBack
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(messages.length <= 20 ? 'auto' : 'smooth');
    }
  }, [messages.length]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleScroll = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    document.addEventListener('contextmenu', handleClick); // Close on another right click elsewhere
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, message: Message) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const menuWidth = 200; 
    const menuHeight = 220; 
    
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    
    // Ensure horizontal fit within container
    if (x + menuWidth > rect.width) {
      x = rect.width - menuWidth - 10;
    }
    x = Math.max(10, x);

    // Ensure vertical fit within container
    if (y + menuHeight > rect.height) {
      y = rect.height - menuHeight - 10;
    }
    y = Math.max(10, y);

    setContextMenu({ x, y, message });
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
    setContextMenu(null);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    const sentinel = document.getElementById('load-more-sentinel');
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  // Group messages by date and sender
  const groupedMessages = useMemo(() => {
    const groups: any[] = [];
    let currentGroup: any = null;

    [...messages].reverse().forEach((msg, idx) => {
      const date = new Date(msg.createdAt);
      const dateKey = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMMM d, yyyy");
      
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = { date: dateKey, items: [] };
        groups.push(currentGroup);
      }

      const lastItem = currentGroup.items[currentGroup.items.length - 1];
      if (lastItem && lastItem.senderId === msg.senderId && !msg.content.startsWith('[Attached File]')) {
        lastItem.messages.push(msg);
      } else {
        currentGroup.items.push({
          senderId: msg.senderId,
          sender: (msg as any).sender,
          messages: [msg],
          time: format(date, "HH:mm")
        });
      }
    });

    return groups;
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#0e1621]"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.373 6.06 47.96 7.473 41.887 0h1.428zM16.686 0L10.627 6.06l1.414 1.414L18.114 0h-1.428zm24.17 0l7.172 7.172-1.414 1.414L39.43 0h1.428zM19.144 0L11.97 7.172l1.414 1.414L20.572 0h-1.428zm15.427 0l9.57 9.57-1.414 1.414L33.143 0h1.428zm-9.142 0L15.857 9.57l1.414 1.414L26.43 0h-1.428zM24.713 0l12.373 12.373-1.414 1.414L23.286 0h1.427zM21.287 0L8.913 12.373l1.414 1.414L22.714 0h-1.427zM15.427 0L0 15.427v1.414L16.84 0h-1.413zM44.573 0L60 15.427v1.414L43.16 0h1.413zM28.43 0L0 28.43v1.414L29.844 0h-1.414zm3.14 0L60 28.43v1.414L30.156 0h1.414zM0 31.574L31.574 0h1.414L0 32.988v-1.414zm60 0L28.426 0h-1.414L60 32.988v-1.414zM0 37.23L37.23 0h1.414L0 38.644V37.23zm60 0L22.77 0h-1.414L60 38.644V37.23zM0 42.887L42.887 0h1.414L0 44.301v-1.414zm60 0L17.113 0h-1.414L60 44.301v-1.414zM0 48.544L48.544 0h1.414L0 49.958v-1.414zm60 0L11.456 0h-1.414L60 49.958v-1.414zM0 54.2L54.2 0h1.414L0 55.614V54.2zm60 0L5.8 0H4.386L60 55.614V54.2zM30 60l30-30v1.414L31.414 60H30zm0-60L0 30v-1.414L28.586 0H30z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")` }} />

      {/* Header */}
      <div className="z-20 px-4 py-2 bg-[#17212b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between sticky top-0 shadow-lg">
        <div className="flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="md:hidden p-2 -ml-2 text-primary hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
          )}
          <div 
            className={`flex items-center gap-3 py-1 px-2 rounded-xl transition-colors ${isGroup ? 'hover:bg-white/5 cursor-pointer' : ''}`}
            onClick={isGroup ? onShowMembers : undefined}
          >
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
              {isGroup ? (
                <span className="font-black text-sm">{groupName?.substring(0, 2).toUpperCase() || 'GP'}</span>
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white leading-tight">
                {isGroup ? (groupName || 'Community Group') : (otherUser?.name || 'Select a conversation')}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={`h-1.5 w-1.5 rounded-full ${otherUser && onlineUsers.has(otherUser.id) ? 'bg-emerald-500' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold text-primary tracking-wide uppercase">
                  {otherUser && onlineUsers.has(otherUser.id) ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Icons removed as they are not currently functional */}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:px-8 lg:px-12 flex flex-col">
        {loading && messages.length === 0 && (
          <div className="flex flex-col gap-4">
             {[1, 2, 3].map(i => (
               <div key={i} className={`flex ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} gap-3 animate-pulse`}>
                  <div className="h-9 w-9 rounded-full bg-white/5 shrink-0 self-end" />
                  <div className={`h-12 w-48 rounded-2xl bg-white/5 ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
               </div>
             ))}
          </div>
        )}

        {loading && messages.length > 0 && (
          <div className="flex justify-center py-4">
             <div className="px-4 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5 text-[10px] text-white/60 font-black uppercase tracking-widest animate-pulse">
               Syncing...
             </div>
          </div>
        )}

        {messages.length === 0 && !loading ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
             <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4 rotate-12">
               <MessageCircle size={40} className="text-white" />
             </div>
             <p className="text-sm font-bold text-white">No messages here yet...</p>
             <p className="text-xs text-white/60">Send a message to start the conversation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {hasMore && (
              <div id="load-more-sentinel" className="h-4 w-full" />
            )}
            
            {groupedMessages.map((group, gIdx) => (
              <div key={group.date} className="flex flex-col gap-4">
                {/* Date Separator */}
                <div className="flex justify-center sticky top-4 z-10">
                  <span className="px-3 py-1 rounded-full bg-[#17212b]/80 backdrop-blur-md border border-white/5 text-[10px] font-black text-white/80 uppercase tracking-widest shadow-lg">
                    {group.date}
                  </span>
                </div>

                {group.items.map((item: any, iIdx: number) => {
                  const isMe = item.senderId === currentUserId;
                  return (
                    <motion.div 
                      key={`${gIdx}-${iIdx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar for non-me */}
                      {!isMe && (
                        <div className="h-9 w-9 rounded-full bg-primary/20 shrink-0 self-end mb-1 border border-primary/20 flex items-center justify-center text-primary font-black text-xs">
                           {item.sender?.name?.charAt(0) || '?'}
                        </div>
                      )}

                      <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {isGroup && !isMe && (
                          <span 
                            onClick={() => onStartPrivateChat?.(item.senderId)}
                            className="text-[10px] font-bold text-primary mb-0.5 ml-2 hover:underline cursor-pointer tracking-wide"
                          >
                            {item.sender?.name}
                          </span>
                        )}

                        <div className="flex flex-col gap-0.5">
                          {item.messages.map((m: Message, mIdx: number) => {
                            const isFirst = mIdx === 0;
                            const isLast = mIdx === item.messages.length - 1;
                            const parentMsg = m.parentId ? messages.find(msg => msg.id === m.parentId) : null;
                            
                            return (
                              <div 
                                key={m.id} 
                                className="group relative flex items-end gap-2"
                              >
                                <div 
                                  onContextMenu={(e) => handleContextMenu(e, m)}
                                  className={`
                                    relative p-3 shadow-sm text-[14px] leading-relaxed cursor-default select-none
                                    ${isMe 
                                      ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
                                      : 'bg-[#182533] text-white rounded-2xl rounded-tl-none border border-white/5'}
                                    ${!isFirst && isMe ? 'rounded-tr-2xl' : ''}
                                    ${!isFirst && !isMe ? 'rounded-tl-2xl' : ''}
                                  `}
                                >
                                  {/* Reply Preview in Bubble */}
                                  {parentMsg && (
                                    <div className="mb-2 p-2 bg-black/20 rounded-lg border-l-2 border-white/40 opacity-80 cursor-pointer hover:bg-black/30 transition-colors">
                                      <p className="text-[10px] font-black uppercase tracking-widest text-white/60">
                                        {(parentMsg as any).sender?.name || 'User'}
                                      </p>
                                      <p className="text-xs truncate">{parentMsg.content}</p>
                                    </div>
                                  )}

                                  {m.content.startsWith('[Message Removed:') ? (
                                    <span className="italic opacity-40 text-xs">{m.content}</span>
                                  ) : m.content.startsWith('[Attached File]') ? (() => {
                                    const match = m.content.match(/^\[Attached File\]\((.*?)\)$/);
                                    if (!match) return <span className="whitespace-pre-wrap">{m.content}</span>;
                                    const rawUrl = match[1];
                                    return (
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3 p-2 rounded-xl bg-black/20 border border-white/5">
                                          <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold truncate">Attachment</p>
                                            <p className="text-[10px] opacity-60">Encrypted Cloud Storage</p>
                                          </div>
                                          <button 
                                            onClick={async (e) => {
                                              e.preventDefault();
                                              const toastId = toast.loading('Syncing...');
                                              try {
                                                const res = await api.get(`/chat/download?url=${encodeURIComponent(rawUrl)}`, { responseType: 'blob' });
                                                const url = window.URL.createObjectURL(new Blob([res.data]));
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = rawUrl.split('/').pop() || 'file';
                                                a.click();
                                                toast.success('Downloaded', { id: toastId });
                                              } catch {
                                                toast.error('Failed', { id: toastId });
                                              }
                                            }}
                                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })() : (
                                    <div className="flex flex-col gap-1">
                                      <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>
                                      <div className={`flex items-center gap-1 self-end -mb-1 ml-4 ${isMe ? 'text-white/60' : 'text-white/40'}`}>
                                        <span className="text-[9px] font-bold uppercase tracking-tighter">
                                          {format(new Date(m.createdAt), "HH:mm")}
                                        </span>
                                        {isMe && (
                                          <div className="flex">
                                            {m.isRead ? (
                                              <CheckCheck size={12} className="text-white" />
                                            ) : m.isDelivered ? (
                                              <CheckCheck size={12} className="opacity-40" />
                                            ) : (
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><polyline points="20 6 9 17 4 12"/></svg>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} className="h-4 w-full" />
          </div>
        )}
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUser && typingUser.isTyping && typingUser.userId !== currentUserId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-24 left-6 z-30"
          >
            <div className="px-4 py-2 rounded-full bg-[#17212b] border border-white/5 flex items-center gap-3 shadow-xl backdrop-blur-md">
              <div className="flex gap-1">
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
              </div>
              <span className="text-[10px] font-black uppercase text-white/60 tracking-widest">
                {otherUser?.name} is typing...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            {/* Mobile Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContextMenu(null)}
              className="fixed inset-0 z-998 bg-black/40 backdrop-blur-sm sm:hidden"
            />
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1, 
                left: contextMenu.x,
                top: contextMenu.y,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute z-999 w-56 bg-[#17212b] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1"
            >
              <button 
                onClick={() => { onReplyMessage?.(contextMenu.message); setContextMenu(null); }}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 text-[13px] text-white/90 transition-colors"
              >
                <Reply size={16} className="text-primary" />
                Reply
              </button>
              <button 
                onClick={() => handleCopy(contextMenu.message.content)}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 text-[13px] text-white/90 transition-colors"
              >
                <Copy size={16} className="text-primary" />
                Copy Text
              </button>
              {contextMenu.message.senderId === currentUserId && (
                <>
                  <button 
                    onClick={() => { onEditMessage?.(contextMenu.message.id, contextMenu.message.content); setContextMenu(null); }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 text-[13px] text-white/90 transition-colors"
                  >
                    <Edit2 size={16} className="text-primary" />
                    Edit
                  </button>
                  <button 
                    onClick={() => { onDeleteMessage?.(contextMenu.message.id); setContextMenu(null); }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/5 text-[13px] text-red-400 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-400" />
                    Delete
                  </button>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};


