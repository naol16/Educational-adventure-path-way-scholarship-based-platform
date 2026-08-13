"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip, X, Edit2, CheckCheck, Mic, File, UploadCloud, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { VoiceRecorder } from "./VoiceRecorder";

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
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [sendingFiles, setSendingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files);
        setAttachedFiles((prev) => [...prev, ...filesArray]);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const handleVoiceSend = async (blob: Blob, duration: number) => {
    if (disabled) return;
    const toastId = toast.loading("Syncing voice note...");
    const formData = new FormData();
    formData.append("file", blob, "voice-note.webm");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      const fileUrl = res.data.data.url;
      onSend(`[Attached Voice](${fileUrl})`);
      toast.success("Voice note sent", { id: toastId });
    } catch (err) {
      toast.error("Voice note sync failed", { id: toastId });
      console.error("Voice upload error:", err);
    } finally {
      setIsRecordingVoice(false);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (disabled || sendingFiles) return;

    if (editingMessage) {
      if (!content.trim()) return;
      onUpdate(content.trim());
      setContent("");
      onTyping(false);
      if (textareaRef.current) textareaRef.current.style.height = "40px";
      return;
    }

    if (attachedFiles.length === 0 && !content.trim()) return;

    if (attachedFiles.length > 0) {
      setSendingFiles(true);
      const toastId = toast.loading(`Syncing ${attachedFiles.length} file(s)...`);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        for (const file of attachedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await axios.post(`${API_BASE_URL}/chat/upload`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const fileUrl = res.data.data.url;
          onSend(`[Attached File](${fileUrl})`);
        }
        toast.success("All attachments synced and sent", { id: toastId });
        setAttachedFiles([]);
      } catch (err) {
        toast.error("File sync failed", { id: toastId });
        console.error("Multi-upload error:", err);
        setSendingFiles(false);
        return;
      }
      setSendingFiles(false);
    }

    if (content.trim()) {
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
      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
          >
            <div className="flex flex-col items-center justify-center p-12 rounded-3xl border-3 border-dashed border-primary/50 bg-card/50 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-primary/10 rounded-full text-primary mb-4 animate-bounce">
                <UploadCloud size={48} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">Drop your attachments</h3>
              <p className="text-sm font-medium text-muted-foreground">
                Release your files here to attach them instantly to your message.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        {isRecordingVoice ? (
          <VoiceRecorder
            onSend={handleVoiceSend}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          /* Input Box */
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

            {/* Multi-File Preview Tray */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2.5 border-b border-border/40 bg-muted/10 p-3 max-h-36 overflow-y-auto custom-scrollbar">
                {attachedFiles.map((file, idx) => {
                  const isImage = file.type.startsWith("image/");
                  return (
                    <div
                      key={idx}
                      className="group relative flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pr-3 shadow-xs animate-in zoom-in-95 duration-150"
                    >
                      {isImage ? (
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                          <File size={16} />
                        </div>
                      )}
                      <div className="min-w-0 max-w-[120px]">
                        <p className="truncate text-xs font-bold text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground/80 font-black uppercase tracking-tight">
                          {(file.size / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-destructive p-0.5 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                      >
                        <X size={10} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-end gap-0.5 px-1.5 py-1.5">
              <button
                type="button"
                onClick={() => setShowEmoji((prev) => !prev)}
                disabled={disabled || sendingFiles}
                className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95 disabled:opacity-50"
              >
                <Smile className="h-6 w-6" />
              </button>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                disabled={disabled || sendingFiles}
                placeholder={editingMessage ? "Edit message…" : (placeholder || "Message")}
                className="custom-scrollbar max-h-40 min-h-[40px] flex-1 resize-none border-none bg-transparent py-2.5 pl-1 pr-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/50"
                rows={1}
              />

              <div className="flex items-center gap-0.5">
                <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || sendingFiles || !!editingMessage}
                  className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95 disabled:opacity-30"
                  title="Attach file"
                >
                  <Paperclip className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  disabled={disabled || sendingFiles || !!editingMessage}
                  className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-primary active:scale-95 disabled:opacity-30"
                  title="Record voice note"
                >
                  <Mic className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send / Mic button */}
        {!isRecordingVoice && (
          <motion.button
            type="button"
            onClick={() => handleSubmit()}
            disabled={disabled || sendingFiles || (!content.trim() && attachedFiles.length === 0 && !editingMessage)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full shadow-md transition-all ${
              !content.trim() && attachedFiles.length === 0 && !editingMessage
                ? "cursor-default border border-border bg-card text-muted-foreground/40"
                : "cursor-pointer bg-primary text-white shadow-primary/25 hover:opacity-90"
            }`}
          >
            {sendingFiles ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editingMessage ? (
              <CheckCheck className="h-6 w-6" />
            ) : (
              <Send className="h-6 w-6 ml-0.5" />
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
};