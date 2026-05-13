"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { ChatList } from "./components/ChatList";
import { ChatWindow } from "./components/ChatWindow";
import { ChatInput } from "./components/ChatInput";
import { ChatDetails } from "./components/ChatDetails";
import { Conversation, Message, ChatUser } from "./types";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

interface ChatPageProps {
  currentUser: ChatUser;
}

export const ChatPage = ({ currentUser }: ChatPageProps) => {
  const searchParams = useSearchParams();
  const targetGroupId = searchParams.get("groupId");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [typingUser, setTypingUser] = useState<{ userId: number; isTyping: boolean } | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [editingMessage, setEditingMessage] = useState<{ id: number; content: string } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: number; content: string; senderName: string } | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const { socket, isConnected } = useSocket(token);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch both personal conversations and all discoverable groups
      const [convsRes, groupsRes] = await Promise.all([
        api.get("/chat/conversations"),
        api.get("/groups")
      ]);
      
      const convsData = Array.isArray(convsRes.data) ? convsRes.data : (convsRes.data?.data || []);
      const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : (groupsRes.data?.data || []);
      
      // Merge: Keep all personal chats + All groups (mark them as joined/unjoined)
      const mergedConvs = [...convsData];
      
      groupsData.forEach((group: any) => {
        const isAlreadyIn = mergedConvs.some(c => c.id === group.id);
        if (!isAlreadyIn) {
          // If not in personal conversations, it's an unjoined group
          mergedConvs.push({
            ...group,
            isNotJoined: true, // Marker for UI
            unreadCount: 0,
            messages: []
          });
        }
      });

      setConversations(mergedConvs);

      // Handle target group from URL
      if (targetGroupId) {
        const targetId = parseInt(targetGroupId);
        const existing = mergedConvs.find((c: Conversation) => c.id === targetId);
        if (existing) {
          setActiveConv(existing);
          setIsMobileListVisible(false);
        } else {
          // If not in list, fetch specifically
          try {
            const groupRes = await api.get(`/groups/${targetId}`);
            const groupData = groupRes.data?.data || groupRes.data;
            if (groupData) {
              setConversations(prev => [groupData, ...prev]);
              setActiveConv(groupData);
              setIsMobileListVisible(false);
            }
          } catch (e) {
            console.error("Failed to fetch target group", e);
          }
        }
      }
    } catch (err) {
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, [targetGroupId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
    if (activeConv) {
      const isNotJoined = (activeConv as any).isNotJoined;
      setPage(1);
      
      // Only fetch messages if joined or if group allows preview (backend dependent)
      // For now, let's try to fetch but handle errors gracefully
      fetchMessages(activeConv.id, 1);
      setShowDetails(false);
      
      // Mark as read only if joined
      if (!isNotJoined) {
        api.patch(`/chat/read/${activeConv.id}`).catch(() => {});
        setConversations(prev => prev.map(c => c.id === activeConv.id ? { ...c, unreadCount: 0 } : c));
      }
    }
  }, [activeConv?.id, fetchMessages]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (data: { message: Message; conversationId: number }) => {
      // Update conversations list (move to top, update last message)
      setConversations(prev => {
        const convIdx = prev.findIndex(c => c.id === data.conversationId);
        if (convIdx === -1) return prev;
        
        const updated = [...prev];
        const conv = { ...updated[convIdx] };
        conv.messages = [data.message];
        if (activeConv?.id !== data.conversationId) {
          conv.unreadCount = (Number(conv.unreadCount) || 0) + 1;
        }
        
        updated.splice(convIdx, 1);
        return [conv, ...updated];
      });

      // Add message if active
      if (activeConv?.id === data.conversationId) {
        setMessages(prev => [data.message, ...prev]);
        api.post(`/chat/conversations/${data.conversationId}/read`).catch(() => {});
      }
    });

    socket.on("userTyping", (data: { userId: number; isTyping: boolean; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setTypingUser({ userId: data.userId, isTyping: data.isTyping });
      }
    });

    socket.on("onlineUsers", (users: number[]) => {
      setOnlineUsers(new Set(users));
    });

    socket.on("messageRead", (data: { conversationId: number; userId: number }) => {
      if (activeConv?.id === data.conversationId && data.userId !== currentUser.id) {
        setMessages(prev => prev.map(m => m.senderId === currentUser.id ? { ...m, isRead: true } : m));
      }
    });

    socket.on("messageEdited", (data: { messageId: number; content: string; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, content: data.content, isEdited: true } : m));
      }
    });

    socket.on("messageDeleted", (data: { messageId: number; conversationId: number }) => {
      if (activeConv?.id === data.conversationId) {
        setMessages(prev => prev.filter(m => m.id !== data.messageId));
      }
    });

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("onlineUsers");
      socket.off("messageRead");
      socket.off("messageEdited");
      socket.off("messageDeleted");
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
      
      await api.post("/chat/send", payload);
      setReplyingTo(null);
    } catch (err) {
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
      await api.delete(`/chat/messages/${id}`);
    } catch (err) {
      toast.error("Failed to delete message");
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
      setActiveConv(groupData);
      setConversations(prev => prev.map(c => c.id === activeConv.id ? groupData : c));
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

  const handleSelectConv = (conv: Conversation) => {
    setActiveConv(conv);
    setIsMobileListVisible(false);
  };

  const handleBack = () => {
    setIsMobileListVisible(true);
    setActiveConv(null);
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
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
    <div className="flex h-screen w-full overflow-hidden bg-background">
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
          onlineUsers={onlineUsers}
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
              onDeleteMessage={handleDelete}
              onReplyMessage={(msg) => setReplyingTo({ id: msg.id, content: msg.content, senderName: msg.sender?.name || "User" })}
              onShowMembers={() => setShowDetails(true)}
              onJoinGroup={handleJoinGroup}
              isJoining={isJoining}
              onBack={handleBack}
            />
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
            />
            
            <AnimatePresence>
              {showDetails && (
                <ChatDetails
                  conversation={activeConv}
                  currentUser={currentUser}
                  messages={messages}
                  onClose={() => setShowDetails(false)}
                  onLeaveGroup={handleLeaveGroup}
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
    </div>
  );
};
