"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { Conversation, Message, ChatUser } from "./types";
import axios from "axios";
import { toast } from "react-hot-toast";
import { BookingModal } from "../counselor/components/BookingModal";
import { StudentBookingModal } from "../counselor/components/StudentBookingModal";
import { GroupMembers } from "./components/GroupMembers";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChatDetails } from "./components/ChatDetails";
import { 
  getConversationMembers, 
  getConversationLastMessage, 
  getDirectChatPeer 
} from "./conversation-utils";
import { MessageSquare, X, User, Plus } from "lucide-react";
import api from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const ChatPage = ({ currentUser }: { currentUser: ChatUser }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingStatus, setTypingStatus] = useState<{ userId: number; isTyping: boolean } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [editingMessage, setEditingMessage] = useState<{ id: number; content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: number; content: string; senderName: string } | null>(null);
  const [isMember, setIsMember] = useState<boolean>(true);
  const [isJoining, setIsJoining] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const MESSAGES_PER_PAGE = 20;

  // Sidebar Resizing
  const [sidebarWidth, setSidebarWidth] = useState(384); // Default to w-96 roughly
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(384);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const delta = e.clientX - startX;
    const newWidth = Math.max(280, Math.min(startWidth + delta, 600)); // Min 280px, Max 600px
    setSidebarWidth(newWidth);
  }, [isResizing, startX, startWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");
  const targetGroupId = searchParams.get("groupId");

  // Booking States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeCounselorData, setActiveCounselorData] = useState<any>(null);
  const [fetchingCounselor, setFetchingCounselor] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
  const { socket, isConnected } = useSocket(token);

  // 1. Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const [convsRes, groupsRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/groups')
        ]);

        const convs = convsRes.data || [];
        const allGroups = groupsRes.data || [];

        // Merge groups: prioritize active conversations, but add missing groups
        const mergedConvs = [...convs];
        
        allGroups.forEach((group: any) => {
          const exists = mergedConvs.find(c => c.isGroup && c.id === group.id);
          if (!exists) {
            mergedConvs.push({
              ...group,
              isGroup: true,
              chatMessages: [],
              unreadCount: 0,
              isNotJoined: true // Flag for UI
            });
          }
        });

        setConversations(mergedConvs);

        // If targetUserId is provided, try to find or start chat
        if (targetUserId) {
          const tid = parseInt(targetUserId);
          const existing = mergedConvs.find((c: Conversation) => 
            !c.isGroup && getConversationMembers(c).some((m) => m.id === tid)
          );
          if (existing) {
            setActiveConversation(existing);
          } else {
            try {
              const startRes = await axios.post(`${API_BASE_URL}/chat/start`, 
                { receiverId: tid }, 
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const newConv = startRes.data.data;
              setConversations(prev => [newConv, ...prev]);
              setActiveConversation(newConv);
            } catch (err) {
              console.error("Failed to auto-start chat", err);
            }
          }
        }

        // If targetGroupId is provided, select it
        if (targetGroupId) {
          const gid = parseInt(targetGroupId);
          const existing = mergedConvs.find((c: any) => c.isGroup && c.id === gid);
          if (existing) {
            setActiveConversation(existing);
          } else {
            // Fetch group details if not in joined list
            try {
              const groupRes = await api.get(`/groups/${gid}`);
              const groupData = groupRes.data;
              if (groupData) {
                // Temporary add to conversations for viewing
                setConversations(prev => [groupData, ...prev]);
                setActiveConversation(groupData);
              }
            } catch (err) {
              console.error("Failed to fetch group details for preview", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };

    if (token) fetchConversations();
  }, [token, targetUserId, targetGroupId]);

  // 2. Fetch Messages with Pagination
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!activeConversation || (!hasMore && !isInitial)) return;
    
    const currentPage = isInitial ? 0 : page;
    setLoading(true);
    
    try {
      const res = await axios.get(
        `${API_BASE_URL}/chat/${activeConversation.id}?limit=${MESSAGES_PER_PAGE}&offset=${currentPage * MESSAGES_PER_PAGE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMessages = res.data.data;
      
      if (isInitial) {
        setMessages(newMessages);
        setPage(1);
        setHasMore(newMessages.length === MESSAGES_PER_PAGE);
        
        // Mark as read
        if (socket) {
          socket.emit("mark_read", { conversationId: activeConversation.id });
        }
      } else {
        setMessages(prev => [...prev, ...newMessages]);
        setPage(currentPage + 1);
        setHasMore(newMessages.length === MESSAGES_PER_PAGE);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setLoading(false);
    }
  }, [activeConversation, token, page, hasMore, socket]);

  useEffect(() => {
    const fetchMembership = async () => {
      if (activeConversation?.isGroup) {
        try {
          const res = await api.get(`/groups/${activeConversation.id}/membership`);
          setIsMember(res.data.isMember);
        } catch (err) {
          console.error("Failed to fetch membership", err);
          setIsMember(false);
        }
      } else {
        setIsMember(true); // Direct chats are always "members"
      }
    };

    if (activeConversation) {
      setHasMore(true);
      setPage(0);
      fetchMessages(true);
      fetchMembership();
      if (socket) {
        socket.emit("join_conversation", activeConversation.id);
      }
    }
  }, [activeConversation, socket]);

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message: Message) => {
      if (activeConversation && message.conversationId === activeConversation.id) {
        setMessages((prev) => {
          const filtered = prev.filter(m => 
            !(m.senderId === message.senderId && 
              m.content === message.content && 
              (m.id > 1000000000000))
          );
          return [message, ...filtered];
        });
        socket.emit("mark_read", { conversationId: activeConversation.id });
      }

      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.id === message.conversationId);
        if (index === -1) return prev;
        
        const newConversations = [...prev];
        const conv = newConversations[index];
        const isCurrentlyViewed = activeConversation?.id === conv.id;
        const currentCount = typeof conv.unreadCount === 'string' ? 
          parseInt(conv.unreadCount, 10) : (conv.unreadCount || 0);
        
        const priorPreview = getConversationLastMessage(conv);
        
        newConversations[index] = {
          ...conv,
          chatMessages: [message, ...(priorPreview ? [priorPreview] : [])],
          messages: [message, ...(priorPreview ? [priorPreview] : [])],
          updatedAt: new Date().toISOString(),
          unreadCount: isCurrentlyViewed ? 0 : currentCount + 1
        };
        
        return newConversations.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    });

    socket.on("message_delivered", (data: { messageId: number; conversationId: number; deliveredAt: string }) => {
      if (activeConversation?.id === data.conversationId) {
        setMessages(prev => prev.map(m => 
          m.id === data.messageId ? { ...m, isDelivered: true, deliveredAt: data.deliveredAt } : m
        ));
      }
    });

    socket.on("messages_read", (data: { conversationId: number; readerId: number }) => {
      if (activeConversation?.id === data.conversationId && data.readerId !== currentUser.id) {
        setMessages(prev => prev.map(m => 
          m.senderId === currentUser.id ? { ...m, isRead: true } : m
        ));
      }
    });

    socket.on("user_online", (userId: number) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on("user_offline", (userId: number) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socket.on("user_typing", (data: { userId: number; isTyping: boolean }) => {
      setTypingStatus(data);
    });

    socket.on("new_message_alert", (data: { conversationId: number; senderName: string; content: string }) => {
      if (!activeConversation || activeConversation.id !== data.conversationId) {
        toast(`${data.senderName}: ${data.content}`, { 
          icon: '💬', 
          position: 'bottom-right' 
        });
      }
    });

    socket.on("message_edited", (data: { messageId: number; conversationId: number; content: string }) => {
      if (activeConversation?.id === data.conversationId) {
        setMessages(prev => prev.map(m => 
          m.id === data.messageId ? { ...m, content: data.content } : m
        ));
      }
    });

    socket.on("message_deleted", (data: { messageId: number; conversationId: number }) => {
      if (activeConversation?.id === data.conversationId) {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_delivered");
      socket.off("messages_read");
      socket.off("user_online");
      socket.off("user_offline");
      socket.off("user_typing");
      socket.off("new_message_alert");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [socket, activeConversation, token, currentUser.id]);

  const otherUser = activeConversation ? getDirectChatPeer(activeConversation, currentUser.id) : null;

  const handleSendMessage = useCallback((content: string) => {
    if (!activeConversation || !socket) return;

    const tempId = Date.now();
    const optimisticMessage: Message = {
      id: tempId,
      content,
      senderId: currentUser.id,
      conversationId: activeConversation.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isRead: false,
      isDelivered: false,
      isEdited: false,
      replyToId: replyingTo?.id || null,
      repliedTo: replyingTo ? messages.find(m => m.id === replyingTo.id) : null,
      sender: currentUser
    };

    setMessages(prev => [optimisticMessage, ...prev]);
    socket.emit("send_message", {
      conversationId: activeConversation.id,
      ...(otherUser ? { receiverId: otherUser.id } : {}),
      content,
      replyToId: replyingTo?.id || null
    });
    setReplyingTo(null);
  }, [activeConversation, socket, currentUser, replyingTo, otherUser, messages]);

  const handleEditMessage = useCallback((messageId: number, content: string) => {
    setEditingMessage({ id: messageId, content });
  }, []);

  const handleUpdateMessage = useCallback((content: string) => {
    if (!editingMessage || !activeConversation || !socket) return;
    socket.emit("edit_message", {
      conversationId: activeConversation.id,
      messageId: editingMessage.id,
      content
    });
    setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content } : m));
    setEditingMessage(null);
    toast.success("Message synchronized");
  }, [activeConversation, socket, editingMessage]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    if (!activeConversation || !socket) return;
    setMessages(prev => prev.filter(m => m.id !== messageId));
    socket.emit("delete_message", { conversationId: activeConversation.id, messageId });
  }, [activeConversation, socket]);

  const handleReplyMessage = useCallback((message: Message) => {
    setReplyingTo({ 
      id: message.id, 
      content: message.content, 
      senderName: (message as any).sender?.name || 'User' 
    });
    setEditingMessage(null);
  }, []);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (!activeConversation || !socket) return;
    socket.emit("typing", { conversationId: activeConversation.id, isTyping });
  }, [activeConversation, socket]);

  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenNewChat = async () => {
    setIsModalOpen(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/chat/available-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch available users", err);
    }
  };

  const handleStartChat = async (userId: number) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/chat/start`, 
        { receiverId: userId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newConv = res.data.data;
      setConversations(prev => {
        const exists = prev.find(c => c.id === newConv.id);
        if (exists) return prev;
        return [newConv, ...prev];
      });
      setActiveConversation(newConv);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to start chat", err);
      toast.error("Failed to start chat");
    }
  };

  const handleOpenBooking = async () => {
    if (!otherUser) return;
    if (currentUser.role === 'counselor') {
      setActiveCounselorData({ id: -1, name: currentUser.name });
      setIsBookingModalOpen(true);
    } else if (otherUser.role === 'counselor') {
      setFetchingCounselor(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/counselors/by-user/${otherUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveCounselorData(res.data.data);
        setIsBookingModalOpen(true);
      } catch (err) {
        console.error("Failed to fetch counselor data", err);
        toast.error("Could not fetch counselor details");
      } finally {
        setFetchingCounselor(false);
      }
    }
  };

  const [showDetails, setShowDetails] = useState(false);

  const handleLeaveGroup = async () => {
    if (!activeConversation) return;
    try {
      await api.post(`/groups/${activeConversation.id}/leave`);
      toast.success("Left group successfully");
      setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
      setActiveConversation(null);
      setShowDetails(false);
    } catch (err) {
      console.error("Failed to leave group", err);
      toast.error("Failed to leave group");
    }
  };

  const handleDeleteChat = async () => {
    if (!activeConversation) return;
    if (!confirm("Are you sure you want to delete this chat? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_BASE_URL}/chat/conversations/${activeConversation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Chat deleted");
      setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
      setActiveConversation(null);
      setShowDetails(false);
    } catch (err) {
      console.error("Failed to delete chat", err);
      toast.error("Failed to delete chat");
    }
  };

  const handleJoinGroup = async () => {
    if (!activeConversation) return;
    setIsJoining(true);
    try {
      await api.post(`/groups/${activeConversation.id}/join`);
      toast.success("Joined group!");
      setIsMember(true);
      // Re-join socket room now that we are a member
      if (socket) {
        socket.emit("join_conversation", activeConversation.id);
      }
      // Update local conversation list if needed
      setConversations(prev => prev.map(c => 
        c.id === activeConversation.id ? { ...c, isJoined: true } : c
      ));
    } catch (err) {
      console.error("Failed to join group", err);
      toast.error("Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={`relative flex h-[calc(100vh-80px)] w-full overflow-hidden border-b border-border/60 bg-background shadow-sm dark:border-white/10 dark:bg-background ${isResizing ? 'select-none' : ''}`}>
      {/* Sidebar */}
      <div 
        style={{ width: sidebarWidth }}
        className={`${activeConversation ? 'hidden md:flex' : 'flex'} h-full shrink-0 flex-col bg-background transition-all duration-75 ease-out`}
      >
        <ChatList 
          conversations={conversations} 
          activeConversationId={activeConversation?.id || null} 
          onSelect={setActiveConversation} 
          currentUserId={currentUser.id} 
          currentUserRole={currentUser.role} 
          onNewChat={handleOpenNewChat} 
          onlineUsers={onlineUsers} 
        />
      </div>

      {/* Resize Handle */}
      <div 
        onMouseDown={(e) => {
          e.preventDefault();
          setStartX(e.clientX);
          setStartWidth(sidebarWidth);
          setIsResizing(true);
        }}
        className={`hidden md:flex relative z-20 w-1 shrink-0 cursor-col-resize items-center justify-center transition-all hover:w-1.5 hover:bg-primary/20 ${isResizing ? 'w-1.5 bg-primary/30' : 'bg-border/40'}`}
      >
        <div className="flex h-10 w-full items-center justify-center rounded-full">
          <div className={`w-0.5 h-10 rounded-full transition-colors ${isResizing ? 'bg-primary' : 'bg-border/60 hover:bg-primary/70'}`} />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} relative h-full flex-1 flex-col overflow-hidden bg-muted/20 dark:bg-muted/10`}>
        {activeConversation ? (
          <>
            <ChatWindow 
              messages={messages} 
              currentUserId={currentUser.id} 
              otherUser={otherUser} 
              loading={loading} 
              typingUser={typingStatus} 
              currentUserRole={currentUser.role} 
              isGroup={activeConversation.isGroup} 
              isMember={isMember}
              conversationId={activeConversation.id} 
              onBookSession={handleOpenBooking} 
              onShowMembers={() => setShowDetails(!showDetails)} 
              onStartPrivateChat={handleStartChat} 
              groupName={activeConversation.name} 
              groupMemberCount={activeConversation.isGroup ? getConversationMembers(activeConversation).length : undefined} 
              bookingLoading={fetchingCounselor} 
              onlineUsers={onlineUsers} 
              onLoadMore={() => fetchMessages(false)} 
              hasMore={hasMore} 
              onEditMessage={handleEditMessage} 
              onDeleteMessage={handleDeleteMessage} 
              onReplyMessage={handleReplyMessage} 
              onJoinGroup={handleJoinGroup}
              isJoining={isJoining}
              onBack={() => setActiveConversation(null)} 
            />
            <ChatInput 
              onSend={handleSendMessage} 
              onTyping={handleTyping} 
              onSchedule={handleOpenBooking} 
              disabled={!activeConversation || !isMember} 
              editingMessage={editingMessage} 
              replyingTo={replyingTo} 
              onUpdate={handleUpdateMessage} 
              onCancelEdit={() => setEditingMessage(null)} 
              onCancelReply={() => setReplyingTo(null)} 
              placeholder={isMember ? "Type a message..." : "Join this group to participate"}
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-muted/30 dark:bg-muted/10">
            <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-card p-8 text-center shadow-sm border border-border">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Your Messages</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-[250px]">
                  Select a chat from the sidebar to view your conversation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {showDetails && activeConversation && (
          <ChatDetails 
            conversation={activeConversation} 
            currentUser={currentUser} 
            messages={messages}
            onClose={() => setShowDetails(false)} 
            onLeaveGroup={handleLeaveGroup} 
            onDeleteChat={handleDeleteChat} 
          />
        )}
      </AnimatePresence>

      {/* New Chat Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 flex flex-col max-h-[80vh] shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Chat</h2>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <User className="text-muted-foreground" size={24} />
                  </div>
                  <p className="text-sm text-muted-foreground">No users available to chat.</p>
                </div>
              ) : (
                availableUsers.map(user => (
                  <div 
                    key={user.id} 
                    className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all cursor-pointer" 
                    onClick={() => handleStartChat(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-primary transition-colors">{user.name}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">{user.role}</div>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <Plus size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isBookingModalOpen && activeCounselorData && (
        currentUser.role === 'counselor' ? (
          <BookingModal counselor={activeCounselorData} studentUserId={otherUser?.id} onClose={() => setIsBookingModalOpen(false)} />
        ) : (
          <StudentBookingModal counselor={activeCounselorData} onClose={() => setIsBookingModalOpen(false)} />
        )
      )}
    </div>
  );
};