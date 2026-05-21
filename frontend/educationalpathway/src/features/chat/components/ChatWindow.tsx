"use client";

import { Message, ChatUser } from "../types";
import { format, isToday, isYesterday } from "date-fns";
import {
  User, CheckCheck, Edit2, Trash2, ChevronLeft, Info,
  MessageCircle, Reply, Copy, CornerUpLeft, File, Download, Loader2, MessageSquare,
  GraduationCap
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AudioPlayer } from "./AudioPlayer";
import { LinkPreview } from "./LinkPreview";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: number;
  otherUser: ChatUser | null;
  loading: boolean;
  typingUser: { userId: number; isTyping: boolean } | null;
  currentUserRole?: string;
  isGroup?: boolean;
  isMember?: boolean;
  conversationId?: number;
  onBookSession?: () => void;
  onShowMembers?: () => void;
  onStartPrivateChat?: (userId: number) => void;
  bookingLoading?: boolean;
  groupName?: string;
  groupMemberCount?: number;
  onlineUsers: Set<number>;
  onLoadMore: () => void;
  hasMore: boolean;
  onEditMessage?: (id: number, content: string) => void;
  onDeleteMessage?: (id: number) => void;
  onReplyMessage?: (message: Message) => void;
  onJoinGroup?: () => void;
  isJoining?: boolean;
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
  isMember,
  conversationId,
  onBookSession,
  onShowMembers,
  onStartPrivateChat,
  bookingLoading,
  groupName,
  groupMemberCount,
  onlineUsers,
  onLoadMore,
  hasMore,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onJoinGroup,
  isJoining,
  onBack,
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; message: Message } | null>(null);

  const extractUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches && matches.length > 0 ? matches[0] : null;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(messages.length <= 20 ? "auto" : "smooth");
    }
  }, [messages.length]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    const handleScroll = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    document.addEventListener("contextmenu", handleClick);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("contextmenu", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
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
    if (x + menuWidth > rect.width) x = rect.width - menuWidth - 10;
    x = Math.max(10, x);
    if (y + menuHeight > rect.height) y = rect.height - menuHeight - 10;
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
    const sentinel = document.getElementById("load-more-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const groupedMessages = useMemo(() => {
    const groups: any[] = [];
    let currentGroup: any = null;
    [...messages].reverse().forEach((msg) => {
      const date = new Date(msg.createdAt);
      const dateKey = isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMMM d, yyyy");
      if (!currentGroup || currentGroup.date !== dateKey) {
        currentGroup = { date: dateKey, items: [] };
        groups.push(currentGroup);
      }
      const lastItem = currentGroup.items[currentGroup.items.length - 1];
      if (lastItem && lastItem.senderId === msg.senderId && !msg.content.startsWith("[Attached File]")) {
        lastItem.messages.push(msg);
      } else {
        currentGroup.items.push({
          senderId: msg.senderId,
          sender: (msg as any).sender,
          messages: [msg],
          time: format(date, "HH:mm"),
        });
      }
    });
    return groups;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full flex-1 flex-col overflow-hidden bg-muted/20"
    >


      {/* Header */}
      <div className="relative z-20 flex h-[52px] shrink-0 items-center justify-between border-b border-border bg-card/95 px-2 backdrop-blur-md md:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 rounded-full p-2 text-primary hover:bg-muted md:hidden"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <button
            type="button"
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 pr-2 text-left transition-colors ${isGroup ? "hover:bg-muted/60" : ""}`}
            onClick={isGroup ? onShowMembers : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm">
              {isGroup
                ? <span>{groupName?.substring(0, 1).toUpperCase() || "G"}</span>
                : <span>{otherUser?.name?.substring(0, 1).toUpperCase() || "U"}</span>
              }
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-semibold leading-tight text-foreground">
                {isGroup ? groupName || "Group" : otherUser?.name || "Chat"}
              </h3>
              <p className="truncate text-[12px] text-muted-foreground">
                {isGroup ? (
                  <>
                    {typeof groupMemberCount === "number"
                      ? `${groupMemberCount} member${groupMemberCount === 1 ? "" : "s"}`
                      : "Group"}
                    {" · "}
                    <span className="opacity-60">info</span>
                  </>
                ) : otherUser ? (
                  <span className={onlineUsers.has(otherUser.id) ? "text-primary" : ""}>
                    {onlineUsers.has(otherUser.id) ? "online" : "offline"}
                  </span>
                ) : " "}
              </p>
            </div>
          </button>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {isGroup && (
            <button
              type="button"
              onClick={onShowMembers}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Chat info"
            >
              <Info size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex flex-1 flex-col overflow-y-auto custom-scrollbar bg-transparent px-2 py-2 md:px-4">
        {loading && messages.length === 0 && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "flex-row-reverse" : "flex-row"} gap-2 animate-pulse`}>
                <div className="h-8 w-8 shrink-0 self-end rounded-full bg-foreground/5" />
                <div className={`h-10 w-44 rounded-2xl bg-foreground/5 ${i % 2 === 0 ? "rounded-br-sm" : "rounded-bl-sm"}`} />
              </div>
            ))}
          </div>
        )}

        {loading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <div className="rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
              Loading…
            </div>
          </div>
        )}

        {messages.length === 0 && !loading ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-foreground/6">
              <MessageCircle size={28} className="text-muted-foreground" />
            </div>
            <p className="text-[15px] font-medium text-foreground">No messages yet</p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              Send a message to start the conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {hasMore && <div id="load-more-sentinel" className="h-4 w-full" />}
            {groupedMessages.map((group, gIdx) => (
              <div key={group.date} className="flex flex-col gap-4">
                {/* Date Separator */}
                <div className="sticky top-2 z-10 flex justify-center py-1">
                  <span className="rounded-full border border-border bg-card/90 px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-md">
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
                      className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      {!isMe && (
                        <div className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center self-end rounded-full bg-card text-[11px] font-semibold text-muted-foreground shadow-sm ring-1 ring-border">
                          {item.sender?.name?.charAt(0) || "?"}
                        </div>
                      )}

                      <div className={`flex max-w-[min(85%,28rem)] flex-col gap-0.5 sm:max-w-[min(72%,28rem)] ${isMe ? "items-end" : "items-start"}`}>
                        {isGroup && !isMe && (
                          <span
                            onClick={() => onStartPrivateChat?.(item.senderId)}
                            className="mb-0.5 cursor-pointer pl-1 text-[12px] font-medium text-primary hover:underline"
                          >
                            {item.sender?.name}
                          </span>
                        )}

                        <div className="flex flex-col gap-px">
                          {item.messages.map((m: Message, mIdx: number) => {
                            const isFirst = mIdx === 0;
                            const isLast = mIdx === item.messages.length - 1;
                            const repliedTo = (m as any).repliedTo;

                            return (
                              <div
                                key={m.id}
                                id={`msg-${m.id}`}
                                className={`group relative flex items-end gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                              >
                                <div
                                  onContextMenu={(e) => handleContextMenu(e, m)}
                                  className={`
                                    relative max-w-full cursor-default select-none px-3 py-1.5 text-[15px] leading-snug shadow-sm transition-transform
                                    ${isMe
                                      ? "rounded-2xl rounded-br-sm bg-muted text-foreground"
                                      : "rounded-2xl rounded-bl-sm border border-border bg-card text-foreground"}
                                    ${!isFirst && isMe ? "rounded-tr-2xl" : ""}
                                    ${!isFirst && !isMe ? "rounded-tl-2xl" : ""}
                                    ${!isLast && isMe ? "rounded-br-md" : ""}
                                    ${!isLast && !isMe ? "rounded-bl-md" : ""}
                                    active:scale-[0.99]
                                  `}
                                >
                                  {/* Reply Context */}
                                  {repliedTo && (
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const parentEl = document.getElementById(`msg-${repliedTo.id}`);
                                        if (parentEl) {
                                          parentEl.scrollIntoView({ behavior: "smooth", block: "center" });
                                          parentEl.classList.add("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background");
                                          setTimeout(() => parentEl.classList.remove("ring-2", "ring-primary", "ring-offset-2", "ring-offset-background"), 2000);
                                        }
                                      }}
                                      className="mb-2 cursor-pointer rounded-lg border-l-[3px] border-primary bg-black/5 p-2 transition-colors hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10"
                                    >
                                      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                        {repliedTo.sender?.name || "User"}
                                      </p>
                                      <p className="line-clamp-1 truncate text-xs italic text-muted-foreground">
                                        {repliedTo.content.startsWith("[Attached File]")
                                          ? "📎 Attachment"
                                          : repliedTo.content.startsWith("[Attached Voice]")
                                          ? "🎙️ Voice message"
                                          : repliedTo.content.startsWith("[Scholarship Share]")
                                          ? "🎓 Scholarship Match Opportunity"
                                          : repliedTo.content}
                                      </p>
                                    </div>
                                  )}

                                  {/* Content */}
                                  {m.content.startsWith("[Attached File]") ? (() => {
                                    const match = m.content.match(/^\[Attached File\]\((.*?)\)$/);
                                    if (!match) return <span className="whitespace-pre-wrap">{m.content}</span>;
                                    const rawUrl = match[1];
                                    return (
                                      <div className="min-w-[200px]">
                                        <div
                                          onClick={() => window.open(rawUrl, "_blank")}
                                          className="group/file flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/50 p-2.5 transition-colors hover:bg-background/80"
                                        >
                                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                                            <File size={18} />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-foreground">File</p>
                                            <p className="text-[10px] text-muted-foreground">Tap to view</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              const toastId = toast.loading("Downloading...");
                                              try {
                                                const res = await api.get(`/chat/download?url=${encodeURIComponent(rawUrl)}`, { responseType: "blob" });
                                                const blob = res.data instanceof Blob ? res.data : new Blob([res.data]);
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement("a");
                                                a.href = url;
                                                const baseName = rawUrl.split("/").pop()?.split("?")[0] || "file";
                                                a.download = baseName;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                window.URL.revokeObjectURL(url);
                                                toast.success("Downloaded", { id: toastId });
                                              } catch (err) {
                                                console.error(err);
                                                toast.error("Download failed", { id: toastId });
                                              }
                                            }}
                                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors bg-primary/10 text-primary hover:bg-primary hover:text-white"
                                            title="Download to disk"
                                          >
                                            <Download size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })() : m.content.startsWith("[Attached Voice]") ? (() => {
                                    const match = m.content.match(/^\[Attached Voice\]\((.*?)\)$/);
                                    if (!match) return <span className="whitespace-pre-wrap">{m.content}</span>;
                                    const rawUrl = match[1];
                                    return (
                                      <div className="flex flex-col gap-1 min-w-[280px]">
                                        <AudioPlayer url={rawUrl} />
                                        <div className={`mt-0.5 flex flex-wrap items-center gap-1.5 ${isMe ? "justify-end" : ""} text-muted-foreground`}>
                                          <span className="text-[10px] font-bold tracking-tight">
                                            {format(new Date(m.createdAt), "HH:mm")}
                                          </span>
                                          {isMe && (
                                            <div className="flex items-center">
                                              {m.isRead ? (
                                                <CheckCheck size={14} className="text-primary" />
                                              ) : m.isDelivered ? (
                                                <CheckCheck size={14} className="opacity-40" />
                                              ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                                                  <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })() : m.content.startsWith("[Scholarship Share]") ? (() => {
                                    const match = m.content.match(/^\[Scholarship Share\]\((.*?)\)$/);
                                    if (!match) return <span className="whitespace-pre-wrap">{m.content}</span>;
                                    let data: any = {};
                                    try {
                                      data = JSON.parse(match[1]);
                                    } catch (err) {
                                      return <span className="whitespace-pre-wrap">{m.content}</span>;
                                    }
                                    const score = data.matchScore || 0;
                                    // Build role-aware URL: counselors go to student scholarship page (read-only view)
                                    // since there's no separate counselor scholarship detail page
                                    const scholarshipUrl = `/dashboard/student/scholarships/${data.id}`;
                                    return (
                                      <div className="flex flex-col gap-3 min-w-[280px] max-w-sm rounded-2xl bg-card p-4 border border-border/80 shadow-md">
                                        <div className="flex justify-between items-start gap-3">
                                          <div className="min-w-0 flex-1">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-primary/10 text-primary border border-primary/20 uppercase mb-1.5">
                                              {data.fundType || "Scholarship"}
                                            </span>
                                            <h4 className="font-extrabold text-sm text-foreground tracking-tight leading-snug line-clamp-2">
                                              {data.title}
                                            </h4>
                                            <p className="text-[10px] text-muted-foreground/80 font-bold mt-1">
                                              {data.country || "Global"}
                                            </p>
                                          </div>
                                          <div className="relative shrink-0 w-12 h-12 flex items-center justify-center">
                                            <svg className="w-12 h-12 transform -rotate-90 absolute">
                                              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-muted/10" />
                                              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * score) / 100} className="text-primary" strokeLinecap="round" />
                                            </svg>
                                            <span className="text-xs font-black text-foreground">{score}%</span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-3">
                                          <div>
                                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">
                                              Award Value
                                            </p>
                                            <p className="text-xs font-black text-foreground truncate">
                                              {data.amount}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest text-right">
                                              Deadline
                                            </p>
                                            <p className="text-xs font-black text-emerald-600 truncate text-right">
                                              {data.deadline}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Use <a> tag for reliable cross-browser navigation.
                                            pointer-events-auto + cursor-pointer override the
                                            parent bubble's cursor-default / select-none styles. */}
                                        <a
                                          href={scholarshipUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="pointer-events-auto cursor-pointer w-full mt-1.5 h-10 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-wider transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/10 no-underline"
                                          style={{ pointerEvents: "auto" }}
                                        >
                                          <GraduationCap size={14} />
                                          View Opportunity
                                        </a>

                                        <div className={`mt-0.5 flex flex-wrap items-center gap-1.5 ${isMe ? "justify-end" : ""} text-muted-foreground`}>
                                          <span className="text-[10px] font-bold tracking-tight">
                                            {format(new Date(m.createdAt), "HH:mm")}
                                          </span>
                                          {isMe && (
                                            <div className="flex items-center">
                                              {m.isRead ? (
                                                <CheckCheck size={14} className="text-primary" />
                                              ) : m.isDelivered ? (
                                                <CheckCheck size={14} className="opacity-40" />
                                              ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                                                  <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })() : (() => {
                                    const url = extractUrl(m.content);
                                    return (
                                      <div className="flex flex-col gap-1">
                                        <p className="whitespace-pre-wrap wrap-break-word">{m.content}</p>
                                        {url && <LinkPreview url={url} />}
                                        <div className={`mt-0.5 flex flex-wrap items-center gap-1.5 ${isMe ? "justify-end" : ""} text-muted-foreground`}>
                                          {m.isEdited && (
                                            <span className="text-[9px] font-black uppercase tracking-tighter italic opacity-60">Edited</span>
                                          )}
                                          <span className="text-[10px] font-bold tracking-tight">
                                            {format(new Date(m.createdAt), "HH:mm")}
                                          </span>
                                          {isMe && (
                                            <div className="flex items-center">
                                              {m.isRead ? (
                                                <CheckCheck size={14} className="text-primary" />
                                              ) : m.isDelivered ? (
                                                <CheckCheck size={14} className="opacity-40" />
                                              ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                                                  <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>

                                 {/* Quick Action Buttons */}
                                 <div className={`mb-0.5 flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-all ${isMe ? "flex-row-reverse mr-1" : "flex-row ml-1"}`}>
                                   <button
                                     type="button"
                                     onClick={() => onReplyMessage?.(m)}
                                     className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-90"
                                     title="Reply"
                                   >
                                     <Reply size={15} />
                                   </button>
                                   
                                   {isMe && (
                                     <button
                                       type="button"
                                       onClick={() => onEditMessage?.(m.id, m.content)}
                                       className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:bg-primary/5 active:scale-90"
                                       title="Edit"
                                     >
                                       <Edit2 size={15} />
                                     </button>
                                   )}

                                   <button
                                     type="button"
                                     onClick={() => onDeleteMessage?.(m.id)}
                                     className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:border-destructive hover:text-destructive hover:bg-destructive/5 active:scale-90"
                                     title="Delete"
                                   >
                                     <Trash2 size={15} />
                                   </button>
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
        {typingUser && typingUser.isTyping && typingUser.userId !== currentUserId && isMember && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-none absolute bottom-19 left-1/2 z-30 -translate-x-1/2 md:bottom-20"
          >
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/95 px-3 py-1.5 text-[12px] text-muted-foreground shadow-md backdrop-blur-md">
              <div className="flex gap-1">
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 bg-primary rounded-full" />
              </div>
              <span className="max-w-[200px] truncate text-foreground">
                {isGroup ? "Someone is typing…" : `${otherUser?.name || "Contact"} is typing…`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join CTA Overlay for non-members in groups */}
      <AnimatePresence>
        {isGroup && !isMember && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-40 flex flex-col items-center gap-3 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-xl backdrop-blur-md md:bottom-6 md:left-6 md:right-6 md:p-6"
          >
            <div className="text-center">
              <h4 className="text-[15px] font-bold text-foreground">Welcome to {groupName}!</h4>
              <p className="mt-1 text-[13px] text-muted-foreground">
                You are currently in preview mode. Join the community to send messages and participate in discussions.
              </p>
            </div>
            <button
              type="button"
              disabled={isJoining}
              onClick={onJoinGroup}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <MessageSquare size={16} />
                  Join to Chat
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setContextMenu(null)}
              className="fixed inset-0 z-998 bg-black/40 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: contextMenu.x, top: contextMenu.y }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute z-999 w-52 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
            >
              <button
                onClick={() => { onReplyMessage?.(contextMenu.message); setContextMenu(null); }}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted text-[13px] text-foreground/90 transition-colors"
              >
                <Reply size={16} className="text-primary" /> Reply
              </button>
              <button
                onClick={() => handleCopy(contextMenu.message.content)}
                className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted text-[13px] text-foreground/90 transition-colors"
              >
                <Copy size={16} className="text-primary" /> Copy Text
              </button>
              {/* Message Actions */}
              {contextMenu.message.senderId === currentUserId ? (
                <>
                  <button
                    onClick={() => { onEditMessage?.(contextMenu.message.id, contextMenu.message.content); setContextMenu(null); }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted text-[13px] text-foreground/90 transition-colors"
                  >
                    <Edit2 size={16} className="text-primary" /> Edit
                  </button>
                  <button
                    onClick={() => { onDeleteMessage?.(contextMenu.message.id); setContextMenu(null); }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted text-[13px] text-destructive transition-colors"
                  >
                    <Trash2 size={16} className="text-destructive" /> Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onDeleteMessage?.(contextMenu.message.id); setContextMenu(null); }}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted text-[13px] text-destructive transition-colors"
                >
                  <Trash2 size={16} className="text-destructive" /> Delete
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};