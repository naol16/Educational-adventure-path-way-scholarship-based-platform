"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { ChatDetails } from "./components/ChatDetails";
import { BookingModal } from "../counselor/components/BookingModal";
import { StudentBookingModal } from "../counselor/components/StudentBookingModal";
import { Conversation, Message, ChatUser } from "./types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2, Search, X, Users, Trash2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui";

interface ChatPageProps {
  currentUser: ChatUser;
}

export const ChatPage = ({ currentUser }: ChatPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetGroupId = searchParams.get("groupId");
  const userIdFromUrl = searchParams.get("userId");
  const initialHandled = useRef(false);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // List pagination
  const [listHasMore, setListHasMore] = useState(false);
  const [listPage, setListPage] = useState(1);
  
  // Messages pagination
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [typingUser, setTypingUser] = useState<{ userId: number; isTyping: boolean } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: number; content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: number; content: string; senderName: string } | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);
  const [messageIdToDelete, setMessageIdToDelete] = useState<number | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeCounselorData, setActiveCounselorData] = useState<any>(null);
  const [fetchingCounselor, setFetchingCounselor] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { socket, isConnected } = useSocket(token);

  const fetchConversations = useCallback(async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      const isCounselor = currentUser.role?.toLowerCase() === 'counselor';
      const limit = 15;

      const [convsRes, groupsRes, extraRes, recommendedRes] = await Promise.all([
        api.get(`/chat/conversations?page=${pageNum}&limit=${limit}`),
        api.get(`/groups?page=${pageNum}&limit=${limit}`),
        isCounselor ? api.get(`/counselors/students?page=${pageNum}&limit=${limit}`) : api.get(`/counselors/directory?page=${pageNum}&limit=${limit}`),
        !isCounselor && pageNum === 1 ? api.get("/counselors/recommendations/me") : Promise.resolve({ data: [] })
      ]);
      
      const convsData = Array.isArray(convsRes.data) ? convsRes.data : (convsRes.data?.data || []);
      const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : (groupsRes.data?.data || []);
      
      // Check if any category has more items
      const hasMoreConvs = convsRes.data?.pagination?.hasMore || false;
      const hasMoreGroups = groupsRes.data?.pagination?.hasMore || false;
      const hasMoreExtra = extraRes.data?.pagination?.hasMore || extraRes.data?.data?.pagination?.hasMore || false;
      
      setListHasMore(hasMoreConvs || hasMoreGroups || hasMoreExtra);
      
      let extraData = isCounselor 
        ? (Array.isArray(extraRes.data) ? extraRes.data : extraRes.data?.data || [])
        : (extraRes.data?.rows || extraRes.data?.data?.rows || extraRes.data?.data || (Array.isArray(extraRes.data) ? extraRes.data : []));

      // For students, merge directory with recommendations
      if (!isCounselor) {
        const recommendedData = Array.isArray(recommendedRes.data) ? recommendedRes.data : (recommendedRes.data?.data || []);
        // Combine and deduplicate by user ID
        const combinedCounselors = [...recommendedData];
        extraData.forEach((c: any) => {
          if (!combinedCounselors.some(rc => (rc.user?.id || rc.userId) === (c.user?.id || c.userId))) {
            combinedCounselors.push(c);
          }
        });
        extraData = combinedCounselors;
      }
      
      // Merge: Keep all personal chats + All groups
      let mergedConvs = [...convsData];
      
      // Mark existing personal chats based on role
      mergedConvs = mergedConvs.map(c => {
        if (!c.isGroup) {
          const otherUser = c.members?.find((m: any) => m.id !== currentUser.id) || c.users?.find((u: any) => u.id !== currentUser.id);
          const role = otherUser?.role?.toLowerCase();
          if (isCounselor && (role === 'student' || role === 'user')) {
             return { ...c, isStudentChat: true };
          } else if (!isCounselor && role === 'counselor') {
            return { ...c, isCounselorChat: true };
          }
        }
        return c;
      });
      
      // Add discoverable entries (counselors for students, students for counselors)
      if (isCounselor) {
        extraData.forEach((s: any) => {
          const studentId = s.userId || s.id;
          if (!studentId || studentId === currentUser.id) return;

          const hasExisting = mergedConvs.some(conv => 
            !conv.isGroup && 
            (conv.members?.some((m: any) => m.id === studentId) || conv.users?.some((u: any) => u.id === studentId))
          );

          if (!hasExisting) {
            const studentUser = { 
              id: studentId, 
              name: s.name || "Student", 
              email: s.email || "", 
              role: 'student',
              avatarUrl: s.avatarUrl || null
            };
            mergedConvs.push({
              id: `student-${studentId}`,
              isNotJoined: true,
              isStudentChat: true,
              name: studentUser.name,
              members: [studentUser],
              users: [studentUser],
              unreadCount: 0,
              messages: [],
              isGroup: false
            });
          }
        });
      } else {
        extraData.forEach((c: any) => {
          const counselorId = c.userId || c.id;
          if (!counselorId || counselorId === currentUser.id) return;
          
          const hasExisting = mergedConvs.some(conv => 
            !conv.isGroup && 
            (conv.members?.some((m: any) => m.id === counselorId) || conv.users?.some((u: any) => u.id === counselorId))
          );

          if (!hasExisting) {
            const counselorUser = {
              id: counselorId,
              name: c.name || "Counselor",
              email: c.email || "",
              role: 'counselor',
              avatarUrl: c.profileImageUrl || null
            };
            mergedConvs.push({
              id: `counselor-${counselorId}`,
              isNotJoined: true,
              isCounselorChat: true,
              name: counselorUser.name,
              members: [counselorUser],
              users: [counselorUser],
              unreadCount: 0,
              messages: [],
              isGroup: false
            });
          }
        });
      }

      groupsData.forEach((group: any) => {
        const isAlreadyIn = mergedConvs.some(c => c.id === group.id);
        if (!isAlreadyIn) {
          mergedConvs.push({
            ...group,
            isNotJoined: !group.isJoined,
            unreadCount: 0,
            messages: []
          });
        }
      });

      setConversations(prev => {
        if (pageNum === 1) return mergedConvs;
        
        // Append new, filter duplicates
        const existingIds = new Set(prev.map(c => c.id));
        const newConvs = mergedConvs.filter(c => !existingIds.has(c.id));
        return [...prev, ...newConvs];
      });
    } catch (err) {
      console.error("[Chat] Failed to load conversations:", err);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentUser]);

  // Separate effect for handling URL parameters (one-time only)
  useEffect(() => {
    if (loading || initialHandled.current) return;

    const handleInitialChat = async () => {
      initialHandled.current = true;
      let currentConvs = [...conversations];

      // Priority 1: Handle userId (1-on-1 chat)
      if (userIdFromUrl) {
        try {
          const res = await api.post("/chat/start", { receiverId: userIdFromUrl });
          const chatData = res.data;
          if (chatData && chatData.id) {
            const chatId = Number(chatData.id);
            const existingIdx = currentConvs.findIndex(c => Number(c.id) === chatId);
            if (existingIdx !== -1) {
               currentConvs[existingIdx] = chatData;
            } else {
               currentConvs = [chatData, ...currentConvs];
            }
            setConversations(currentConvs);
            setActiveConv(chatData);
            setIsMobileListVisible(false);
            
            // Clean URL to prevent re-triggering and "locked" state
            router.replace('/dashboard/student/chat', { scroll: false });
          }
        } catch (e) {
          console.error("Failed to start initial 1-on-1 chat", e);
        }
      } 
      // Priority 2: Handle target group from URL
      else if (targetGroupId) {
        const targetId = parseInt(targetGroupId);
        const existing = currentConvs.find((c: Conversation) => Number(c.id) === targetId);
        if (existing) {
          setActiveConv(existing);
          setIsMobileListVisible(false);
          router.replace('/dashboard/student/chat', { scroll: false });
        } else {
          try {
            const groupRes = await api.get(`/groups/${targetId}`);
            const groupData = groupRes.data;
            if (groupData && groupData.id) {
              setConversations(prev => [groupData, ...prev]);
              setActiveConv(groupData);
              setIsMobileListVisible(false);
              router.replace('/dashboard/student/chat', { scroll: false });
            }
          } catch (e) {
            console.error("Failed to fetch target group", e);
          }
        }
      }
    };

    handleInitialChat();
  }, [loading, userIdFromUrl, targetGroupId, conversations, router]);

  useEffect(() => {
    fetchConversations(1);
    setListPage(1);
  }, [fetchConversations]);

  const handleLoadMore = useCallback(() => {
    if (!listHasMore || loading || isLoadingMore) return;
    const nextPage = listPage + 1;
    setListPage(nextPage);
    fetchConversations(nextPage);
  }, [listHasMore, loading, isLoadingMore, listPage, fetchConversations]);

  const fetchMessages = useCallback(async (convId: number, pageNum: number = 1) => {
    try {
      setMessagesLoading(true);
      const res = await api.get(`/chat/${convId}?page=${pageNum}`);
      
      // Paginated response has pagination info, so res.data is likely the whole object
      const dataObj = res.data?.data ? res.data : (res.data?.status === 'success' ? res.data : null);
      const newMessages = dataObj?.data || (Array.isArray(res.data) ? res.data : []);
      
      if (pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...prev, ...newMessages]);
      }
      
      const totalPages = dataObj?.pagination?.totalPages || 1;
      setHasMore(pageNum < totalPages);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeConv && socket) {
      const isNotJoined = (activeConv as any).isNotJoined;
      setPage(1);
      
      // Join conversation room for real-time updates
      socket.emit("join_conversation", activeConv.id);
      
      // Only fetch messages if joined or if group allows preview (backend dependent)
      fetchMessages(activeConv.id, 1);
      setShowDetails(false);
      
      // Mark as read only if joined
      if (!isNotJoined) {
        api.patch(`/chat/read/${activeConv.id}`).catch(() => {});
        setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, unreadCount: 0 } : c));
      }

      return () => {
        socket.emit("leave_conversation", activeConv.id);
      };
    }
  }, [activeConv?.id, fetchMessages, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("receive_message", (message: Message) => {
      const conversationId = message.conversationId;
      console.log("[Chat] Received real-time message:", message);
      
      // Update conversations list (move to top, update last message)
      setConversations(prev => {
        const convIdx = prev.findIndex(c => c.id === conversationId);
        if (convIdx === -1) return prev;
        
        const updated = [...prev];
        const conv = { ...updated[convIdx] };
        conv.messages = [message];
        if (activeConv?.id !== conversationId) {
          conv.unreadCount = (Number(conv.unreadCount) || 0) + 1;
        }
        
        updated.splice(convIdx, 1);
        return [conv, ...updated];
      });

      // Add message if active and not already present
      if (activeConv?.id === conversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [message, ...prev];
        });
        api.patch(`/chat/read/${conversationId}`).catch(() => {});
      }
    });

    socket.on("user_typing", (data: { userId: number; isTyping: boolean; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setTypingUser({ userId: data.userId, isTyping: data.isTyping });
      }
    });

    socket.on("onlineUsers", (users: number[]) => {
      setOnlineUsers(new Set(users));
    });

    socket.on("messages_read", (data: { conversationId: number; readerId: number }) => {
      if (activeConv?.id === data.conversationId && data.readerId !== currentUser.id) {
        setMessages(prev => prev.map(m => m.senderId === currentUser.id ? { ...m, isRead: true } : m));
      }
    });

    socket.on("message_edited", (data: { messageId: number; content: string; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m));
      }
    });

    socket.on("message_deleted", (data: { messageId: number; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("onlineUsers");
      socket.off("messages_read");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [socket, activeConv?.id, currentUser.id]);

  const handleSend = async (content: string) => {
    if (!activeConv) return;
    try {
      const payload: any = { 
        content,
        conversationId: activeConv.id
      };
      if (replyingTo) payload.replyToId = replyingTo.id;
      
      const response = await api.post("/chat/send", payload);
      const { message } = response.data;

      // Update state immediately if it's the active conversation
      if (message && activeConv.id === message.conversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [message, ...prev];
        });
      }

      setReplyingTo(null);
    } catch (err) {
      console.error("[Chat] Send failed:", err);
      toast.error("Failed to send message");
    }
  };

  const handleUpdate = async (content: string) => {
    if (!editingMessage) return;
    try {
      await api.patch(`/chat/messages/${editingMessage.id}`, { content });
      setEditingMessage(null);
    } catch (err) {
      toast.error("Failed to update message");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Optimistically update state
      setMessages(prev => prev.filter(m => m.id !== id));
      await api.delete(`/chat/messages/${id}`);
      setMessageIdToDelete(null);
    } catch (err) {
      console.error("[Chat] Delete failed:", err);
      toast.error("Failed to delete message");
      // Optionally refresh messages if delete fails to restore the state
      if (activeConv) fetchMessages(activeConv.id, 1);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (socket && activeConv) {
      socket.emit("typing", { conversationId: activeConv.id, isTyping });
    }
  };

  const handleJoinGroup = async () => {
    if (!activeConv || !activeConv.isGroup) return;
    try {
      setIsJoining(true);
      await api.post(`/groups/${activeConv.id}/join`);
      toast.success("Joined group successfully");
      
      // Refresh active conversation to update membership status
      const res = await api.get(`/groups/${activeConv.id}`);
      const groupData = res.data?.data || res.data;
      const updatedGroup = { ...groupData, isNotJoined: false };
      setActiveConv(updatedGroup);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? updatedGroup : c));
    } catch (err) {
      toast.error("Failed to join group");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeConv || !activeConv.isGroup) return;
    try {
      await api.delete(`/groups/${activeConv.id}/leave`);
      toast.success("Left group");
      setActiveConv(null);
      setIsMobileListVisible(true);
      fetchConversations();
    } catch (err) {
      toast.error("Failed to leave group");
    }
  };

  const handleSelectConv = async (conv: Conversation) => {
    if (conv.isGroup) {
      setActiveConv(conv);
      setIsMobileListVisible(false);
      return;
    }

    // Handle initialization for both discoverable students and counselors
    if ((conv as any).isNotJoined && ((conv as any).isCounselorChat || (conv as any).isStudentChat)) {
      const otherUser = conv.members?.[0] || conv.users?.[0];
      if (otherUser && otherUser.id) {
        await startNewChat(otherUser.id);
        return;
      }
    }
    
    setActiveConv(conv);
    setIsMobileListVisible(false);
    if (!conv.isGroup) {
      setShowDetails(false);
    }
  };

  const handleBack = () => {
    setIsMobileListVisible(true);
    setActiveConv(null);
  };

  const handleOpenBooking = async () => {
    const otherUser = activeConv?.isGroup ? null : (activeConv?.members?.find(u => u.id !== currentUser.id) || activeConv?.users?.find(u => u.id !== currentUser.id) || null);
    if (!otherUser) return;

    if (currentUser.role === 'counselor') {
      setActiveCounselorData({ id: -1, name: currentUser.name });
      setIsBookingModalOpen(true);
    } else if (otherUser.role === 'counselor') {
      setFetchingCounselor(true);
      try {
        const res = await api.get(`/counselors/by-user/${otherUser.id}`);
        setActiveCounselorData(res.data.data || res.data);
        setIsBookingModalOpen(true);
      } catch (err) {
        console.error("Failed to fetch counselor data", err);
        toast.error("Could not fetch counselor details");
      } finally {
        setFetchingCounselor(false);
      }
    }
  };



  const startNewChat = async (userId: number) => {
    try {
      const res = await api.post("/chat/start", { receiverId: userId });
      // The interceptor unwraps res.data.data into res.data
      const chatData = res.data;
      
      if (chatData && chatData.id) {
        const chatId = Number(chatData.id);
        
        setConversations(prev => {
          const existsIdx = prev.findIndex(c => Number(c.id) === chatId);
          if (existsIdx !== -1) {
            const updated = [...prev];
            updated[existsIdx] = { ...updated[existsIdx], ...chatData };
            return updated;
          }
          return [chatData, ...prev];
        });
        
        setActiveConv(chatData);
        setIsMobileListVisible(false);
        
        // Fetch messages for the newly selected/started chat
        fetchMessages(chatId, 1);
      }
    } catch (err) {
      console.error("[Chat] Failed to start/select chat:", err);
      toast.error("Failed to start chat");
    }
  };



  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
            Establishing Secure Link
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar List */}
      <div className={`
        ${isMobileListVisible ? 'flex' : 'hidden md:flex'}
        w-full md:w-80 lg:w-96 flex-col border-r border-border shrink-0
      `}>
        <ChatList
          conversations={conversations}
          activeConversationId={activeConv?.id || null}
          onSelect={handleSelectConv}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onlineUsers={onlineUsers}
          hasMore={listHasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          initialLoading={loading}
        />
      </div>

      {/* Main Chat Area */}
      <div className={`
        ${!isMobileListVisible ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col relative overflow-hidden
      `}>
        {activeConv ? (
          <>
            <ChatWindow
              messages={messages}
              currentUserId={currentUser.id}
              otherUser={activeConv.isGroup ? null : (activeConv.members?.find(u => u.id !== currentUser.id) || activeConv.users?.find(u => u.id !== currentUser.id) || null)}
              loading={messagesLoading}
              typingUser={typingUser}
              isGroup={activeConv.isGroup}
              isMember={!(activeConv as any).isNotJoined}
              conversationId={activeConv.id}
              groupName={activeConv.name}
              groupMemberCount={activeConv.members?.length || activeConv.users?.length}
              onlineUsers={onlineUsers}
              hasMore={hasMore}
              onLoadMore={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchMessages(activeConv.id, nextPage);
              }}
              onEditMessage={(id, content) => setEditingMessage({ id, content })}
              onDeleteMessage={(id) => setMessageIdToDelete(id)}
              onReplyMessage={(msg) => setReplyingTo({ id: msg.id, content: msg.content, senderName: msg.sender?.name || "User" })}
              onShowMembers={() => setShowDetails(true)}
              onJoinGroup={handleJoinGroup}
              isJoining={isJoining}
              onBack={handleBack}
              onBookSession={handleOpenBooking}
              bookingLoading={fetchingCounselor}
              currentUserRole={currentUser.role}
            />

            {/* Message Delete Confirmation Modal */}
            <AnimatePresence>
              {messageIdToDelete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden p-6 text-center"
                  >
                    <div className="flex justify-center mb-4 text-destructive">
                      <div className="p-4 bg-destructive/10 rounded-full">
                        <Trash2 size={32} />
                      </div>
                    </div>
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Delete Message?</h3>
                    <p className="text-sm text-muted-foreground font-medium mb-6">
                      This action cannot be undone. The message will be removed for all participants.
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                        onClick={() => setMessageIdToDelete(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="flex-1 bg-destructive hover:bg-destructive/90 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                        onClick={() => {
                          if (messageIdToDelete) handleDelete(messageIdToDelete);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <ChatInput
              onSend={handleSend}
              onTyping={handleTyping}
              disabled={(activeConv as any).isNotJoined}
              editingMessage={editingMessage}
              replyingTo={replyingTo}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingMessage(null)}
              onCancelReply={() => setReplyingTo(null)}
              placeholder={(activeConv as any).isNotJoined ? "Join community to chat" : "Type a message..."}
              onSchedule={handleOpenBooking}
            />
            
            <AnimatePresence>
              {showDetails && (
                <ChatDetails
                  conversation={activeConv}
                  currentUser={currentUser}
                  messages={messages}
                  onClose={() => setShowDetails(false)}
                  onLeaveGroup={handleLeaveGroup}
                  onStartPrivateChat={startNewChat}
                />
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-foreground/[0.03] text-muted-foreground/20">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </motion.div>
            </div>
            <h2 className="text-xl font-bold text-foreground">Select a Secure Channel</h2>
            <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Choose a direct line or community group from the list to synchronize communications.
            </p>
          </div>
        )}
      </div>

      {isBookingModalOpen && activeCounselorData && (
        currentUser.role === 'counselor' ? (
          <BookingModal counselor={activeCounselorData} studentUserId={activeConv?.isGroup ? undefined : (activeConv?.members?.find(u => u.id !== currentUser.id)?.id || activeConv?.users?.find(u => u.id !== currentUser.id)?.id)} onClose={() => setIsBookingModalOpen(false)} />
        ) : (
          <StudentBookingModal counselor={activeCounselorData} onClose={() => setIsBookingModalOpen(false)} />
        )
      )}
    </div>
  );
};
