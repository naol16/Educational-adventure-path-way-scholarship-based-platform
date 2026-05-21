"use client";

import { ChatUser, Conversation, Message } from "../types";
import { 
  X, User, Bell, Shield, Trash2, LogOut, ChevronRight, 
  File, Link as LinkIcon, Download, ExternalLink, Image as ImageIcon, Globe 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getConversationMembers, getDirectChatPeer } from "../conversation-utils";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface ChatDetailsProps {
  conversation: Conversation;
  currentUser: ChatUser;
  messages?: Message[];
  onClose: () => void;
  onLeaveGroup?: () => void;
  onDeleteChat?: () => void;
  onStartPrivateChat?: (userId: number) => void;
}

export const ChatDetails = ({
  conversation,
  currentUser,
  messages = [],
  onClose,
  onLeaveGroup,
  onDeleteChat,
  onStartPrivateChat,
}: ChatDetailsProps) => {
  const isGroup = !!conversation.isGroup;
  const [activeTab, setActiveTab] = useState(isGroup ? "Members" : "Media");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const toggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      // Optional: Call real backend endpoint
      // await api.patch(`/chat/notifications/${conversation.id}`, { enabled: newState });
    } catch (e) {
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const participants = getConversationMembers(conversation);
  const otherUser = getDirectChatPeer(conversation, currentUser.id);
  const title = isGroup ? conversation.name : otherUser?.name;
  const subtitle = isGroup ? `${participants.length} members` : otherUser?.role;

  // Extract shared media, files, and urls from history
  const mediaMessages = messages.filter(
    (m) => m.content.startsWith("[Attached File]") && m.content.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
  );
  
  const fileMessages = messages.filter(
    (m) => m.content.startsWith("[Attached File]") && !m.content.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)
  );

  const linkMessages = messages.filter(
    (m) => m.content.match(/https?:\/\/[^\s]+/i) && !m.content.startsWith("[Attached File]")
  );

  const tabs = isGroup ? ["Members", "Media", "Files", "Links"] : ["Media", "Files", "Links"];

  const handleDownload = async (rawUrl: string) => {
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
      toast.success("Downloaded to disk", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Download failed", { id: toastId });
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 bottom-0 z-40 flex h-full w-full flex-col border-l border-border bg-background shadow-2xl md:w-80 lg:w-96"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 py-3 backdrop-blur-md">
        <h3 className="pl-1 text-[17px] font-semibold text-foreground">Info</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {/* Profile Header Card */}
        <div className="border-b border-border bg-linear-to-b from-primary/10 to-transparent px-6 pb-8 pt-8 text-center">
          <div className="mx-auto mb-3 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-primary text-3xl font-semibold text-white shadow-lg ring-4 ring-background">
            {title?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-[19px] font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-[13px] font-medium text-muted-foreground">{subtitle}</p>
          {isGroup && conversation.description && (
            <p className="mx-auto mt-4 max-w-sm text-left text-[14px] leading-relaxed text-muted-foreground">
              {conversation.description}
            </p>
          )}
        </div>

        {/* Info Settings Details */}
        <div className="bg-card px-0 py-2">
          <SectionTitle title="Information" />
          {!isGroup && (
            <InfoItem icon={User} label="Email" value={otherUser?.email || "No email available"} />
          )}
          {isGroup && (
            <InfoItem icon={Shield} label="Moderated" value="Community Standard" />
          )}
          
          <InfoItem
            icon={Bell}
            label="Notifications"
            value={notificationsEnabled ? "Enabled" : "Muted"}
            action={
              <div
                onClick={toggleNotifications}
                className={`h-5 w-9 rounded-full relative cursor-pointer transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              >
                <motion.div
                  layout
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                  initial={false}
                  animate={{ left: notificationsEnabled ? "calc(100% - 18px)" : "2px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            }
          />

          {/* Shared Assets tabs */}
          <div className="mt-6">
            <div className="flex w-full items-center justify-around border-b border-border/50 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-medium transition-colors relative flex-1 text-center ${
                    activeTab === tab ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="py-3 px-1">
              <AnimatePresence mode="wait">
                {activeTab === "Members" && isGroup && (
                  <motion.div 
                    key="members" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SectionTitle title={`Participants (${participants.length})`} />
                    <div className="px-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                      {participants.map((member: ChatUser) => (
                        <div
                          key={member.id}
                          onClick={() => member.id !== currentUser.id && onStartPrivateChat?.(member.id)}
                          className={`flex items-center gap-3 p-2 rounded-xl transition-all group ${
                            member.id !== currentUser.id ? "hover:bg-primary/5 cursor-pointer active:scale-[0.98]" : "opacity-80"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {member.name}
                            </p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                              {member.role}
                            </p>
                          </div>
                          {member.id !== currentUser.id && (
                            <ChevronRight 
                              className="text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" 
                              size={14} 
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "Media" && (
                  <motion.div 
                    key="media" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SectionTitle title={`Media (${mediaMessages.length})`} />
                    {mediaMessages.length > 0 ? (
                      <div className="px-3 grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar">
                        {mediaMessages.map((m) => {
                          const url = m.content.match(/^\[Attached File\]\((.*?)\)$/)?.[1];
                          return (
                            <div 
                              key={m.id} 
                              className="group relative aspect-square rounded-xl bg-muted/40 border border-border/40 overflow-hidden cursor-pointer active:scale-95 transition-all shadow-sm hover:shadow-md"
                            >
                              {url ? (
                                <img 
                                  src={url} 
                                  alt="Media" 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" 
                                  onClick={() => window.open(url, "_blank")}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <ImageIcon size={18} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <ImageIcon size={24} className="opacity-40 mb-2" />
                        <p className="text-xs font-semibold">No media shared yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "Files" && (
                  <motion.div 
                    key="files" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SectionTitle title={`Documents (${fileMessages.length})`} />
                    {fileMessages.length > 0 ? (
                      <div className="px-2 space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                        {fileMessages.map((m) => {
                          const url = m.content.match(/^\[Attached File\]\((.*?)\)$/)?.[1] || "";
                          const name = url.split("/").pop()?.split("?")[0] || "Document";
                          const ext = name.split(".").pop()?.toUpperCase() || "FILE";
                          return (
                            <div 
                              key={m.id} 
                              className="group relative flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-all hover:border-primary/20 shadow-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 border border-primary/20">
                                  <File size={16} />
                                  <span className="text-[7px] font-black tracking-tight leading-none mt-0.5">{ext}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p 
                                    onClick={() => window.open(url, "_blank")}
                                    className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors cursor-pointer hover:underline"
                                  >
                                    {name}
                                  </p>
                                  <p className="text-[9px] text-muted-foreground/80 font-black uppercase tracking-tight">
                                    Tap to view
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDownload(url)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 hover:bg-primary hover:text-white text-primary transition-colors shadow-xs"
                                title="Download document"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <File size={24} className="opacity-40 mb-2" />
                        <p className="text-xs font-semibold">No files shared yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "Links" && (
                  <motion.div 
                    key="links" 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <SectionTitle title={`Links (${linkMessages.length})`} />
                    {linkMessages.length > 0 ? (
                      <div className="px-2 space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
                        {linkMessages.map((m) => {
                          const urlMatch = m.content.match(/https?:\/\/[^\s]+/i);
                          const url = urlMatch ? urlMatch[0] : "#";
                          let domain = "Link";
                          try {
                            domain = new URL(url).hostname;
                          } catch (e) {}

                          return (
                            <div 
                              key={m.id} 
                              className="group flex flex-col p-2.5 rounded-xl border border-border/40 bg-card hover:bg-muted/30 transition-all hover:border-primary/20 shadow-xs"
                            >
                              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                                <Globe size={11} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{domain}</span>
                              </div>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs font-bold text-primary hover:underline truncate flex items-center gap-1"
                              >
                                {url}
                                <ExternalLink size={10} className="shrink-0" />
                              </a>
                              <p className="text-[10px] text-muted-foreground line-clamp-1 mt-1 font-medium italic">
                                "{m.content}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <LinkIcon size={24} className="opacity-40 mb-2" />
                        <p className="text-xs font-semibold">No links shared yet</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {isGroup && (
            <>
              <SectionTitle title="Actions" />
              <MenuItem icon={LogOut} label="Leave Group" variant="destructive" onClick={onLeaveGroup} />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <h4 className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
    {title}
  </h4>
);

interface InfoItemProps {
  icon: any;
  label: string;
  value: string;
  action?: React.ReactNode;
}

const InfoItem = ({ icon: Icon, label, value, action }: InfoItemProps) => (
  <div className="px-4 py-3 flex items-start gap-4 group">
    <Icon className="text-primary mt-0.5 shrink-0" size={18} />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-foreground font-medium truncate">{value}</p>
    </div>
    {action}
  </div>
);

interface MenuItemProps {
  icon: any;
  label: string;
  value?: string;
  variant?: "destructive";
  onClick?: () => void;
}

const MenuItem = ({ icon: Icon, label, value, variant, onClick }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full px-4 py-3 flex items-center gap-4 hover:bg-muted transition-colors group"
  >
    <Icon
      className={`${variant === "destructive" ? "text-destructive" : "text-primary"} shrink-0`}
      size={18}
    />
    <span
      className={`flex-1 text-left text-sm font-medium ${variant === "destructive" ? "text-destructive" : "text-foreground"
        }`}
    >
      {label}
    </span>
    {value && (
      <span className="text-[10px] font-black text-muted-foreground/40 uppercase group-hover:text-primary transition-colors">
        {value}
      </span>
    )}
    {!variant && (
      <ChevronRight
        className="text-muted-foreground/30 group-hover:text-primary transition-colors"
        size={14}
      />
    )}
  </button>
);
