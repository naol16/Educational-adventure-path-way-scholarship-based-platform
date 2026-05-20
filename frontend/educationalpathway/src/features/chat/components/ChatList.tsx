"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Conversation } from "../types";
import { isToday, isYesterday, format } from "date-fns";
import { Search, Plus, Users, Loader2, MessageSquareDashed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getConversationLastMessage,
  getDirectChatPeer,
  getConversationMembers
} from "../conversation-utils";

interface ChatListProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelect: (conversation: Conversation) => void;
  currentUserId: number;
  currentUserRole?: string;
  onNewChat?: () => void;
  onlineUsers?: Set<number>;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  initialLoading?: boolean;
}

export const ChatList = ({
  conversations,
  activeConversationId,
  onSelect,
  currentUserId,
  currentUserRole,
  onNewChat,
  onlineUsers,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  initialLoading = false,
}: ChatListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "direct" | "groups">("all");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver: fires onLoadMore when sentinel enters viewport
  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, initialLoading]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const isGroup = !!conv.isGroup;
      if (activeTab === "direct") {
        if (isGroup) return false;
        const isCounselor = currentUserRole?.toLowerCase() === "counselor";
        if (isCounselor && !(conv as any).isStudentChat) return false;
        if (!isCounselor && !(conv as any).isCounselorChat) return false;
      }
      if (activeTab === "groups" && !isGroup) return false;

      const otherUser = getDirectChatPeer(conv, currentUserId);
      const title = isGroup ? conv.name || "Group" : otherUser?.name || "Chat";
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, activeTab, currentUserRole, currentUserId, searchQuery]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "d.MM.yy");
  };

  const renderConversation = (conv: Conversation, index: number) => {
    const isGroup = !!conv.isGroup;
    const otherUser = getDirectChatPeer(conv, currentUserId);
    const members = getConversationMembers(conv);
    const lastMessage = getConversationLastMessage(conv);
    const isActive = activeConversationId === conv.id;
    const unread = Number(conv.unreadCount) || 0;
    const chatTitle = isGroup ? conv.name || "Group" : otherUser?.name || "Chat";
    const peerOnline = !isGroup && otherUser && onlineUsers?.has(otherUser.id);

    return (
      <motion.button
        type="button"
        key={conv.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.02, 0.3) }}
        onClick={() => onSelect(conv)}
        className={`mx-2 mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
          isActive
            ? "bg-primary/10 dark:bg-primary/20 shadow-sm ring-1 ring-primary/20"
            : "hover:bg-muted/60"
        }`}
      >
        <div className="relative shrink-0">
          <div
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-full text-lg font-semibold text-white shadow-inner ${
              isGroup ? "bg-primary" : "bg-muted text-primary dark:bg-muted dark:text-foreground"
            }`}
          >
            {isGroup ? (
              conv.name?.trim() ? (
                <span>{conv.name.substring(0, 1).toUpperCase()}</span>
              ) : (
                <Users className="h-7 w-7 opacity-90" />
              )
            ) : (
              <span>{otherUser?.name?.substring(0, 1).toUpperCase() || "?"}</span>
            )}
          </div>
          {peerOnline && (
            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-[2.5px] border-background bg-primary" />
          )}
          {unread > 0 && !isActive && (
            <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow-sm">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[15px] font-semibold text-foreground">{chatTitle}</span>
            {lastMessage && (
              <span className="shrink-0 text-[12px] text-muted-foreground tabular-nums">
                {formatTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="min-w-0 flex-1 truncate text-[14px] leading-snug text-muted-foreground">
              {lastMessage ? (
                <>
                  {lastMessage.senderId === currentUserId && (
                    <span className="font-medium text-primary">You: </span>
                  )}
                  {lastMessage.content.startsWith("[Attached File]") ? "📎 File" : lastMessage.content}
                </>
              ) : isGroup ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">
                    {members.length} {members.length === 1 ? "member" : "members"}
                    {conv.country ? ` · ${conv.country}` : ""}
                  </span>
                  {(conv as any).isNotJoined && (
                    <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Join
                    </span>
                  )}
                </div>
              ) : (
                <span className="italic opacity-70">{otherUser?.role ?? ""}</span>
              )}
            </div>
          </div>
        </div>
      </motion.button>
    );
  };

  // Skeleton loader for initial load
  const renderSkeleton = () => (
    <div className="flex flex-col gap-1 px-2 py-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5 animate-pulse">
          <div className="h-[52px] w-[52px] shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-3/5 rounded-full bg-muted" />
            <div className="h-3 w-4/5 rounded-full bg-muted/70" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 shrink-0 border-b border-border bg-background/95 px-3 pb-2 pt-3 backdrop-blur-md">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          {/* Spacer for mobile hamburger button (fixed top-4 left-4 = 56px wide) */}
          <div className="w-10 shrink-0 lg:hidden" />
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-full border border-border bg-muted py-2 pl-9 pr-3 text-[14px] outline-none ring-0 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
            />
          </div>
          {onNewChat && (
            <button
              type="button"
              onClick={onNewChat}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              aria-label="New chat"
            >
              <Plus className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="flex gap-2 px-0.5">
          {(["all", "direct", "groups"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab === "direct"
                ? currentUserRole?.toLowerCase() === "student"
                  ? "Counselors"
                  : "Students"
                : "Groups"}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {initialLoading ? (
            renderSkeleton()
          ) : filteredConversations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-6 py-16 text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-1">
                  <MessageSquareDashed className="text-muted-foreground opacity-40" size={24} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No chats match your search."
                    : activeTab === "groups"
                    ? "You haven't joined any groups yet."
                    : "No active conversations yet."}
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col bg-background pb-2">
              {filteredConversations.map((conv, idx) => renderConversation(conv, idx))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4 w-full" />

              {/* Loading more spinner */}
              {isLoadingMore && (
                <div className="flex justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              {/* No more chats indicator */}
              {!hasMore && conversations.length > 0 && !searchQuery && (
                <p className="py-3 text-center text-[11px] text-muted-foreground/50 font-medium uppercase tracking-widest">
                  All chats loaded
                </p>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

