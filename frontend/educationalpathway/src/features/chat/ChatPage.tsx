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

  // Pagination
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const MESSAGES_PER_PAGE = 20;

  const searchParams = useSearchParams();
  const targetUserId = searchParams.get("userId");

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
        const res = await axios.get(`${API_BASE_URL}/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const convs = res.data.data;
        setConversations(convs);

        // If targetUserId is provided, try to find or start chat
        if (targetUserId) {
          const tid = parseInt(targetUserId);
          const existing = convs.find((c: any) => 
            !c.isGroup && (c.members || c.users || []).some((m: any) => m.id === tid)
          );
          if (existing) {
            setActiveConversation(existing);
          } else {
            // Start new chat logic (reusing internal logic if possible or just calling API)
            try {
              const startRes = await axios.post(`${API_BASE_URL}/chat/start`, { receiverId: tid }, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const newConv = startRes.data.data;
              setConversations(prev => [newConv, ...prev]);
              setActiveConversation(newConv);
            } catch (err) {
              console.error("Failed to auto-start chat", err);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    if (token) fetchConversations();
  }, [token, targetUserId]);

  // 2. Fetch Messages with Pagination
  const fetchMessages = useCallback(async (isInitial = false) => {
    if (!activeConversation || (!hasMore && !isInitial)) return;

    const currentPage = isInitial ? 0 : page;
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/chat/${activeConversation.id}?limit=${MESSAGES_PER_PAGE}&offset=${currentPage * MESSAGES_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
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
    if (activeConversation) {
      setHasMore(true);
      setPage(0);
      fetchMessages(true);
      
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
          // Remove optimistic message if it exists (by matching content and senderId within a short time)
          const filtered = prev.filter(m => !(m.senderId === message.senderId && m.content === message.content && (m.id > 1000000000000))); // Temp IDs are timestamps
          return [message, ...filtered];
        });
        socket.emit("mark_read", { conversationId: activeConversation.id });
      }

      // Update conversations list for snippet
      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.id === message.conversationId);
        if (index === -1) return prev;

        const newConversations = [...prev];
        const conv = newConversations[index];
        const isCurrentlyViewed = activeConversation?.id === conv.id;
        const currentCount = typeof conv.unreadCount === 'string' ? parseInt(conv.unreadCount, 10) : (conv.unreadCount || 0);

        newConversations[index] = {
          ...conv,
          chatMessages: [message, ...(conv.chatMessages || conv.messages || conv.ChatMessages || [])],
          updatedAt: new Date().toISOString(),
          unreadCount: isCurrentlyViewed ? 0 : currentCount + 1
        };

        return newConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
  }, [socket, activeConversation, token]);

  const participants = activeConversation?.members || activeConversation?.users || [];
  const otherUser = participants.find(u => u.id !== currentUser.id) || null;

  const handleSendMessage = useCallback((content: string) => {
    if (!activeConversation || !socket) return;
    
    // Optimistic UI update
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
      parentId: replyingTo?.id || null,
      sender: currentUser // Include sender info for immediate rendering
    };

    setMessages(prev => [optimisticMessage, ...prev]);

    socket.emit("send_message", {
      conversationId: activeConversation.id,
      receiverId: otherUser?.id || 0,
      content,
      parentId: replyingTo?.id || null
    });
    setReplyingTo(null);
  }, [activeConversation, socket, currentUser.id, replyingTo, otherUser]);

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

    setMessages(prev => prev.map(m => 
      m.id === editingMessage.id ? { ...m, content } : m
    ));

    setEditingMessage(null);
    toast.success("Message synchronized");
  }, [activeConversation, socket, editingMessage]);

  const handleDeleteMessage = useCallback((messageId: number) => {
    if (!activeConversation || !socket) return;
    
    // Optimistically remove from UI to prevent ghost messages from getting stuck
    setMessages(prev => prev.filter(m => m.id !== messageId));
    
    socket.emit("delete_message", {
      conversationId: activeConversation.id,
      messageId
    });
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
    socket.emit("typing", {
      conversationId: activeConversation.id,
      isTyping
    });
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
      const res = await axios.post(`${API_BASE_URL}/chat/start`, { receiverId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      // Counselor mode: otherUser is the student
      setActiveCounselorData({ 
        id: -1, // Placeholder as we use /counselors/slots anyway
        name: currentUser.name 
      });
      setIsBookingModalOpen(true);
    } else if (otherUser.role === 'counselor') {
      // Student mode: otherUser is the counselor
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

  return (
    <div className="flex h-[calc(100vh-100px)] w-full overflow-hidden bg-background/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl mt-4 relative">
      {/* Sidebar - Hidden on mobile when a chat is active */}
      <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 h-full border-r border-border/50 shrink-0 flex-col transition-all duration-300 ease-in-out`}>
        <ChatList
          conversations={conversations}
          activeConversationId={activeConversation?.id || null}
          onSelect={setActiveConversation}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onNewChat={handleOpenNewChat}
          onBookSession={async (userId) => {
            if (currentUser.role === 'counselor') {
              setActiveCounselorData({ id: -1, name: currentUser.name });
              setIsBookingModalOpen(true);
            } else {
              setFetchingCounselor(true);
              try {
                const res = await axios.get(`${API_BASE_URL}/counselors/by-user/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setActiveCounselorData(res.data.data);
                setIsBookingModalOpen(true);
              } catch (err) {
                toast.error("Could not fetch counselor details");
              } finally {
                setFetchingCounselor(false);
              }
            }
          }}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex flex-col h-full overflow-hidden bg-muted/5 relative`}>
        {activeConversation ? (
          showMembers && activeConversation.isGroup ? (
            <GroupMembers 
              conversationId={activeConversation.id}
              currentUserId={currentUser.id}
              currentUserRole={currentUser.role}
              onClose={() => setShowMembers(false)}
              onStartPrivateChat={handleStartChat}
            />
          ) : (
            <>
              <ChatWindow
                messages={messages}
                currentUserId={currentUser.id}
                otherUser={otherUser}
                loading={loading}
                typingUser={typingStatus}
                currentUserRole={currentUser.role}
                isGroup={activeConversation.isGroup}
                conversationId={activeConversation.id}
                onBookSession={handleOpenBooking}
                onShowMembers={() => setShowMembers(!showMembers)}
                onStartPrivateChat={handleStartChat}
                groupName={activeConversation.name}
                bookingLoading={fetchingCounselor}
                onlineUsers={onlineUsers}
                onLoadMore={() => fetchMessages(false)}
                hasMore={hasMore}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReplyMessage={handleReplyMessage}
                onBack={() => setActiveConversation(null)}
              />

              <ChatInput
                onSend={handleSendMessage}
                onTyping={handleTyping}
                onSchedule={handleOpenBooking}
                disabled={!activeConversation}
                editingMessage={editingMessage}
                replyingTo={replyingTo}
                onUpdate={handleUpdateMessage}
                onCancelEdit={() => setEditingMessage(null)}
                onCancelReply={() => setReplyingTo(null)}
              />
            </>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a chat to start messaging</h3>
            <p className="max-w-xs text-sm opacity-60">Choose from your existing conversations or start a new one with a counselor or peer.</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {isModalOpen && (
        <div className="absolute inset-0 z-100 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-2xl p-6 flex flex-col max-h-[80vh] shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">New Chat</h2>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {availableUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
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
          <BookingModal
            counselor={activeCounselorData}
            studentUserId={otherUser?.id}
            onClose={() => setIsBookingModalOpen(false)}
          />
        ) : (
          <StudentBookingModal
            counselor={activeCounselorData}
            onClose={() => setIsBookingModalOpen(false)}
          />
        )
      )}
    </div>
  );
};
