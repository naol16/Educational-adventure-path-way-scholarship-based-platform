"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, Calendar, X, Mic, Edit2, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  onSchedule?: () => void;
  disabled?: boolean;
  editingMessage: { id: number; content: string } | null;
  replyingTo: { id: number; content: string; senderName: string } | null;
  onUpdate: (content: string) => void;
  onCancelEdit: () => void;
  onCancelReply: () => void;
}

export const ChatInput = ({ 
  onSend, 
  onTyping, 
  onSchedule, 
  disabled, 
  editingMessage, 
  replyingTo,
  onUpdate, 
  onCancelEdit,
  onCancelReply 
}: ChatInputProps) => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set content when editingMessage changes
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      textareaRef.current?.focus();
    } else {
      setContent("");
    }
  }, [editingMessage]);

  // Focus when replyingTo changes
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    const toastId = toast.loading("Syncing attachment...");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      const fileUrl = res.data.data.url;
      onSend(`[Attached File](${fileUrl})`);
      toast.success("File synchronized and sent", { id: toastId });
    } catch (err) {
      toast.error("Synchronization failed", { id: toastId });
      console.error("Upload error:", err);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || disabled) return;

    if (editingMessage) {
      onUpdate(content.trim());
    } else {
      onSend(content.trim());
    }
    
    setContent("");
    onTyping(false);
    if (textareaRef.current) textareaRef.current.style.height = "44px";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (editingMessage) onCancelEdit();
      if (replyingTo) onCancelReply();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      onTyping(false);
    }, 3000);
  };

  return (
    <div className="p-4 bg-[#0e1621] relative border-t border-white/5">
      <AnimatePresence>
        {showEmoji && (
          <motion.div 
            ref={emojiRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-full mb-4 left-4 z-50 rounded-2xl overflow-hidden shadow-2xl border border-white/5"
          >
            <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} lazyLoadEmojis={true} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {editingMessage ? (
            <motion.div 
              key="edit-banner"
              initial={{ height: 0, opacity: 0, y: 10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 10 }}
              className="mb-2 flex items-center justify-between px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  <Edit2 size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Editing Message</span>
                  <span className="text-xs text-white/60 truncate max-w-[300px]">{editingMessage.content}</span>
                </div>
              </div>
              <button onClick={onCancelEdit} className="p-1 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ) : replyingTo ? (
            <motion.div 
              key="reply-banner"
              initial={{ height: 0, opacity: 0, y: 10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 10 }}
              className="mb-2 flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl border border-white/5 overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="text-primary border-l-2 border-primary pl-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Replying to {replyingTo.senderName}</span>
                    <span className="text-xs text-white/60 truncate max-w-[300px]">{replyingTo.content}</span>
                  </div>
                </div>
              </div>
              <button onClick={onCancelReply} className="p-1 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#17212b] rounded-2xl border border-white/5 shadow-lg flex items-end px-2 py-1.5 transition-all focus-within:border-primary/30">
            <button 
              type="button" 
              onClick={() => setShowEmoji((prev) => !prev)}
              disabled={disabled}
              className="p-2.5 text-white/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              <Smile className="h-5 w-5" />
            </button>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              disabled={disabled}
              placeholder={editingMessage ? "Edit message..." : "Write a message..."}
              className="flex-1 bg-transparent border-none py-2.5 px-1 text-sm text-white placeholder:text-white/20 outline-none resize-none max-h-40 min-h-[44px] custom-scrollbar"
              rows={1}
            />

            <div className="flex items-center">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || !!editingMessage}
                className="p-2.5 text-white/40 hover:text-primary transition-colors cursor-pointer disabled:opacity-30"
                title="Attach File"
              >
                <Paperclip className="h-5 w-5" />
              </button>

            </div>
          </div>

          <motion.button
            type="button"
            onClick={() => handleSubmit()}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg
              ${!content.trim() 
                ? 'bg-[#17212b] text-white/40 cursor-default' 
                : 'bg-primary text-white shadow-primary/20 cursor-pointer'}`}
          >
            {editingMessage ? (
              <CheckCheck className="h-5 w-5" />
            ) : content.trim() ? (
              <Send className="h-5 w-5 ml-0.5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

