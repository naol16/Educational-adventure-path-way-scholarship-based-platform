"use client";

import { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";
import { User, MessageCircle } from "lucide-react";

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
  const renderConversation = (conv: Conversation) => {
    const isGroup = !!conv.isGroup;
    const participants = conv.members || conv.users || [];
    const otherUser = participants.find(u => u.id !== currentUserId);
    const lastMessage = conv.chatMessages?.[0] || conv.messages?.[0] || conv.ChatMessages?.[0];
    const isActive = activeConversationId === conv.id;

    const chatTitle = isGroup ? conv.name : (otherUser?.name || 'Unknown User');
    const chatSubtitle = isGroup ? (conv.country || 'Group') : otherUser?.role;

    return (
      <div
        key={conv.id}
        onClick={() => onSelect(conv)}
        className={`w-full p-4 flex items-center gap-3 transition-colors hover:bg-muted cursor-pointer ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          {isGroup ? (
            <span className="font-bold text-xs">{conv.country?.substring(0, 2).toUpperCase() || 'GP'}</span>
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`font-semibold text-sm truncate ${isGroup ? 'text-primary' : ''}`}>{chatTitle}</span>
            <div className="flex flex-col items-end gap-1 shrink-0">
                {lastMessage && (() => {
                  const msgDate = lastMessage.createdAt;
                  if (!msgDate) return null;
                  const date = new Date(msgDate);
                  if (isNaN(date.getTime())) return null;

                  return (
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(date, { addSuffix: true })}
                    </span>
                  );
                })()}
                {Number(conv.unreadCount) > 0 && (
                    <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg border border-white/20 animate-in fade-in zoom-in duration-300">
                        {conv.unreadCount}
                    </span>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              {chatSubtitle}
            </span>
            {!isGroup && currentUserRole === 'student' && otherUser?.role === 'counselor' && onBookSession && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onBookSession(otherUser.id);
                    }}
                    className="ml-auto text-[9px] font-black uppercase text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded"
                >
                    Book
                </button>
            )}
            {lastMessage && (
              <p className="text-xs text-muted-foreground truncate flex-1">
                {lastMessage.content}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Conversations</h2>
        </div>
        {onNewChat && (
            <button onClick={onNewChat} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center transition-colors shadow-sm" title="New Chat">
                <span className="text-lg leading-none">+</span>
            </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No active conversations.
          </div>
        ) : (() => {
          const personal = conversations.filter(c => !c.isGroup);
          const groups = conversations.filter(c => c.isGroup);

          return (
            <>
              {groups.length > 0 && (
                <div className="px-4 py-2 bg-muted/30 text-[10px] font-black uppercase tracking-widest text-primary/70 border-b border-border/50">
                  Community Groups
                </div>
              )}
              {groups.map((conv) => renderConversation(conv))}

              {personal.length > 0 && (
                <div className="px-4 py-2 bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 mt-2">
                  Personal Messages
                </div>
              )}
              {personal.map((conv) => renderConversation(conv))}
            </>
          );
        })()}
      </div>
    </div>
  );
};
