"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2, Send, Check } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Scholarship } from "../types";
import { useAuth } from "@/providers/auth-context";

interface ShareModalProps {
  scholarship: Scholarship;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ scholarship, isOpen, onClose }: ShareModalProps) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingStates, setSharingStates] = useState<{ [key: number]: "idle" | "sharing" | "shared" }>({});
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/chat/conversations?limit=30");
      const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setConversations(list);
    } catch (err) {
      console.error("Failed to fetch conversations for sharing:", err);
      toast.error("Failed to load active chats");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getDirectChatPeerName = (c: any) => {
    if (c.isGroup) return c.name || "Community Group";
    const members = c.members ?? c.users ?? [];
    const peer = members.find((m: any) => m.id !== user?.id);
    return peer?.name || "Private Chat";
  };

  const handleShare = async (convId: number) => {
    setSharingStates((prev) => ({ ...prev, [convId]: "sharing" }));
    const deadline = scholarship.deadline
      ? new Date(scholarship.deadline).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Rolling";
    const matchScore = Math.round(scholarship.matchScore ?? (scholarship as any).match_score ?? 0);

    const sharePayload = JSON.stringify({
      id: scholarship.id,
      title: scholarship.title,
      amount: scholarship.amount || "Variable Support",
      deadline: deadline,
      matchScore: matchScore,
      fundType: scholarship.fundType || "Scholarship",
      country: scholarship.country || "Global",
    });

    try {
      await api.post("/chat/send", {
        conversationId: convId,
        content: `[Scholarship Share](${sharePayload})`,
      });
      setSharingStates((prev) => ({ ...prev, [convId]: "shared" }));
      toast.success("Scholarship shared successfully!");
    } catch (err) {
      console.error("Share action failed:", err);
      toast.error("Failed to share scholarship");
      setSharingStates((prev) => ({ ...prev, [convId]: "idle" }));
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = getDirectChatPeerName(c).toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">
              Share Opportunity
            </h3>
            <p className="text-xs text-muted-foreground font-bold mt-0.5 truncate max-w-[280px]">
              {scholarship.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="relative flex items-center mb-4">
          <Search size={16} className="absolute left-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recent conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-muted/20 text-sm font-semibold outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Content List */}
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Fetching recent chats...
              </p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground font-semibold text-sm">
              No matching conversations found.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const name = getDirectChatPeerName(c);
              const isGroup = c.isGroup;
              const state = sharingStates[c.id] || "idle";

              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/30 bg-muted/5 hover:bg-muted/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-sm">
                      <span>{name.substring(0, 1).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-tight">
                        {isGroup ? "Community Group" : "Direct Message"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleShare(c.id)}
                    disabled={state !== "idle"}
                    className={`flex items-center gap-1.5 h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 ${
                      state === "shared"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : state === "sharing"
                        ? "bg-primary/20 text-primary"
                        : "bg-primary text-white hover:opacity-90 shadow-md shadow-primary/10"
                    }`}
                  >
                    {state === "sharing" ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : state === "shared" ? (
                      <>
                        <Check size={12} strokeWidth={3} />
                        Shared
                      </>
                    ) : (
                      <>
                        <Send size={11} className="mr-0.5" />
                        Share
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
