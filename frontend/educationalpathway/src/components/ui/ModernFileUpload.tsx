"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  FileText, 
  X, 
  FileCheck, 
  AlertCircle, 
  RefreshCw,
  Image as ImageIcon
} from "lucide-react";

interface ModernFileUploadProps {
  onFileSelect?: (file: File | null) => void;
  label?: string;
  id?: string;
  className?: string;
}

export const ModernFileUpload: React.FC<ModernFileUploadProps> = ({
  onFileSelect,
  label = "Upload Document",
  id = "modern-file-upload",
  className = "",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];

  const validateFile = (selectedFile: File): boolean => {
    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase()}`;
    const isValidExtension = allowedExtensions.includes(extension);
    const isValidType = allowedTypes.includes(selectedFile.type);

    if (!isValidExtension || !isValidType) {
      setError("Only JPG, PNG, and PDF files are allowed");
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = useCallback((selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      if (onFileSelect) onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (onFileSelect) onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerInput = () => {
    fileInputRef.current?.click();
  };

  const isPDF = file?.type === "application/pdf";
  const isImage = file?.type.startsWith("image/");

  return (
    <div className={`w-full max-w-md ${className}`}>
      <label className="block text-sm font-bold text-foreground mb-2 px-1">
        {label}
      </label>

      <motion.div
        onClick={triggerInput}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 min-h-[220px] flex flex-col items-center justify-center p-6 ${
          isDragging 
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
            : file 
              ? "border-success/40 bg-success/5" 
              : error 
                ? "border-destructive/40 bg-destructive/5" 
                : "border-border hover:border-primary/50 bg-card hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          className="hidden"
          accept={allowedExtensions.join(",")}
          onChange={onFileChange}
        />

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="upload-prompt"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                <Upload className={`h-8 w-8 ${error ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <p className="text-sm font-bold text-foreground">
                Drag & Drop or <span className="text-primary underline">Browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supported: JPG, PNG, PDF (Max 10MB)
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full flex flex-col items-center"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-background border border-border mb-4 shadow-sm">
                {isImage && previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain p-2"
                  />
                )}
                {isPDF && previewUrl && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20">
                    <FileText className="w-12 h-12 text-primary mb-2" />
                    <iframe 
                      src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                      className="w-full h-full border-none pointer-events-none absolute inset-0 opacity-20"
                    />
                    <span className="text-xs font-bold text-foreground relative z-10">PDF Document Ready</span>
                  </div>
                )}

                <button
                  onClick={removeFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all z-20"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between w-full bg-background/50 rounded-lg p-2 border border-border">
                <div className="flex items-center gap-2 overflow-hidden">
                  {isImage ? <ImageIcon size={16} className="text-primary" /> : <FileText size={16} className="text-primary" />}
                  <span className="text-xs font-medium truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <FileCheck size={14} className="text-success shrink-0" />
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); triggerInput(); }}
                  className="text-[10px] font-black uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={10} />
                  Replace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-10 left-0 right-0 flex items-center justify-center gap-1.5 text-destructive text-xs font-bold"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
