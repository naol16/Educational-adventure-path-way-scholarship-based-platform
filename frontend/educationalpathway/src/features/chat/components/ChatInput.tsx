"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Edit2, CheckCheck } from "lucide-react";
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
  placeholder?: string;
}

export const ChatInput = ({
  onSend,
  onTyping,
  disabled,
  editingMessage,
  replyingTo,
  onUpdate,
  onCancelEdit,
  onCancelReply,
  placeholder,
}: ChatInputProps) => {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content);
      textareaRef.current?.focus();
    } else {
      setContent("");
    }
  }, [editingMessage]);

  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

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
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    if (textareaRef.current) textareaRef.current.style.height = "40px";
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
    <div className="relative bg-transparent px-4 pb-4 pt-2">
      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            ref={emojiRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-[calc(100%-8px)] left-4 z-50 mb-4 overflow-hidden rounded-2xl border border-border shadow-2xl"
          >
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={Theme.AUTO}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emojis..."
              width={350}
              height={400}
              skinTonesDisabled
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto flex max-w-5xl items-end gap-3">
        {/* Input Box */}
        <div className="flex min-h-[52px] flex-1 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-md transition-shadow focus-within:border-primary/50 focus-within:shadow-lg">
          {/* Contextual Banners */}
          <AnimatePresence mode="wait">
            {editingMessage ? (
              <motion.div
                key="edit-banner"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center justify-between border-b border-primary/20 bg-primary/10 px-4 py-2.5"
              >
                <div className="flex items-center gap-4">
                  <Edit2 size={16} className="text-primary" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      Editing Message
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                      {editingMessage.content}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onCancelEdit}
                  className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ) : replyingTo ? (
              <motion.div
                key="reply-banner"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5"
              >
                <div className="flex items-center gap-4 border-l-2 border-primary pl-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                      Replying to {replyingTo.senderName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                      {replyingTo.content}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onCancelReply}
                  className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-all"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="flex items-end gap-0.5 px-1.5 py-1.5">
            <button
              type="button"
              onClick={() => setShowEmoji((prev) => !prev)}
              disabled={disabled}
              className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95 disabled:opacity-50"
            >
              <Smile className="h-6 w-6" />
            </button>

            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
              disabled={disabled}
              placeholder={editingMessage ? "Edit message…" : (placeholder || "Message")}
              className="custom-scrollbar max-h-40 min-h-[40px] flex-1 resize-none border-none bg-transparent py-2.5 pl-1 pr-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50"
              rows={1}
            />

            <div className="flex items-center">
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || !!editingMessage}
                className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95 disabled:opacity-30"
                title="Attach file"
              >
                <Paperclip className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Send / Mic button */}
        <motion.button
          type="button"
          onClick={() => handleSubmit()}
          disabled={disabled || (!content.trim() && !editingMessage)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
            !content.trim() && !editingMessage
              ? "cursor-default border border-border bg-card text-muted-foreground/40"
              : "cursor-pointer bg-primary text-white shadow-primary/25 hover:opacity-90"
          }`}
        >
          {editingMessage ? (
            <CheckCheck className="h-6 w-6" />
          ) : (
            <Send className="h-6 w-6 ml-0.5" />
          )}
        </motion.button>
      </div>
    </div>
  );
};