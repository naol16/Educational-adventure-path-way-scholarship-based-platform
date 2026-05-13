"use client";

import { ChatUser, Conversation, Message } from "../types";
import { X, User, Bell, Shield, Trash2, LogOut, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { getConversationMembers, getDirectChatPeer } from "../conversation-utils";

interface ChatDetailsProps {
  conversation: Conversation;
  currentUser: ChatUser;
  messages?: Message[];
  onClose: () => void;
  onLeaveGroup?: () => void;
  onDeleteChat?: () => void;
}

export const ChatDetails = ({
  conversation,
  currentUser,
  messages = [],
  onClose,
  onLeaveGroup,
  onDeleteChat,
}: ChatDetailsProps) => {
  const [activeTab, setActiveTab] = useState("Members");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const toggleNotifications = async () => {
    try {
      const newState = !notificationsEnabled;
      setNotificationsEnabled(newState);
      // Optional: Call your real backend endpoint here if implemented
      // await api.patch(`/chat/notifications/${conversation.id}`, { enabled: newState });
    } catch (e) {
      setNotificationsEnabled(!notificationsEnabled);
    }
  };

  const isGroup = !!conversation.isGroup;
  const participants = getConversationMembers(conversation);
  const otherUser = getDirectChatPeer(conversation, currentUser.id);
  const title = isGroup ? conversation.name : otherUser?.name;
  const subtitle = isGroup ? `${participants.length} members` : otherUser?.role;

  // Extract media, files, links from messages
  const mediaMessages = messages.filter(m => m.content.startsWith("[Attached File]") && m.content.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  const fileMessages = messages.filter(m => m.content.startsWith("[Attached File]") && !m.content.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  const linkMessages = messages.filter(m => m.content.match(/https?:\/\/[^\s]+/i) && !m.content.startsWith("[Attached File]"));

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
        {/* Profile Section */}
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

        {/* Info List */}
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

          {isGroup && (
            <div className="mt-4">
              <div className="flex w-full items-center justify-around border-b border-border/50">
                {["Members", "Media", "Files", "Links"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 text-sm font-medium transition-colors relative ${
                      activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
              
              <div className="py-2">
                <AnimatePresence mode="wait">
                  {activeTab === "Members" && (
                    <motion.div key="members" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SectionTitle title={`Participants (${participants.length})`} />
                      <div className="px-2 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                        {participants.map((member: ChatUser) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20 shrink-0">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
                              <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                                {member.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "Media" && (
                    <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SectionTitle title={`Media (${mediaMessages.length})`} />
                      <div className="px-4 grid grid-cols-3 gap-2">
                        {mediaMessages.length > 0 ? mediaMessages.map((m) => {
                          const url = m.content.match(/^\[Attached File\]\((.*?)\)$/)?.[1];
                          return (
                            <div key={m.id} className="aspect-square rounded-lg bg-muted overflow-hidden">
                              {url ? <img src={url} alt="Media" className="w-full h-full object-cover" /> : null}
                            </div>
                          );
                        }) : <p className="col-span-3 text-center text-[13px] text-muted-foreground py-4">No media found.</p>}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "Files" && (
                    <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SectionTitle title={`Files (${fileMessages.length})`} />
                      <div className="px-2 space-y-2">
                        {fileMessages.length > 0 ? fileMessages.map((m) => {
                          const url = m.content.match(/^\[Attached File\]\((.*?)\)$/)?.[1] || "";
                          const name = url.split('/').pop() || "Document";
                          return (
                            <a key={m.id} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <span className="font-bold text-xs">DOC</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{name}</p>
                              </div>
                            </a>
                          );
                        }) : <p className="text-center text-[13px] text-muted-foreground py-4">No files found.</p>}
                      </div>
                    </motion.div>
                  )}
                  {activeTab === "Links" && (
                    <motion.div key="links" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <SectionTitle title={`Links (${linkMessages.length})`} />
                      <div className="px-2 space-y-2">
                        {linkMessages.length > 0 ? linkMessages.map((m) => {
                          const urlMatch = m.content.match(/https?:\/\/[^\s]+/i);
                          const url = urlMatch ? urlMatch[0] : "#";
                          return (
                            <a key={m.id} href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col p-2 rounded-xl hover:bg-muted transition-colors group">
                              <p className="text-sm text-primary hover:underline truncate">{url}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{m.content}</p>
                            </a>
                          );
                        }) : <p className="text-center text-[13px] text-muted-foreground py-4">No links found.</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}


          <SectionTitle title="Actions" />
          {isGroup ? (
            <MenuItem icon={LogOut} label="Leave Group" variant="destructive" onClick={onLeaveGroup} />
          ) : (
            <MenuItem icon={Trash2} label="Delete Chat" variant="destructive" onClick={onDeleteChat} />
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
      className={`flex-1 text-left text-sm font-medium ${
        variant === "destructive" ? "text-destructive" : "text-foreground"
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
