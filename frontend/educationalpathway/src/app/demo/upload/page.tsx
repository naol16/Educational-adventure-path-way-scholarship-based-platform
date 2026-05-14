"use client";

import { ModernFileUpload } from "@/components/ui/ModernFileUpload";
import { useState } from "react";

export default function UploadDemoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
            Modern Upload
          </h1>
          <p className="text-muted-foreground">
            Premium file selection with instant local previews
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl shadow-foreground/5 flex flex-col items-center">
          <ModernFileUpload 
            label="Supporting Documents"
            onFileSelect={(file) => setSelectedFile(file)}
          />

          {selectedFile && (
            <div className="mt-8 p-4 bg-success/5 border border-success/20 rounded-xl w-full animate-in fade-in slide-in-from-top-4">
              <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">
                Selected File Debug Info
              </p>
              <pre className="text-[10px] text-foreground/70 font-mono">
                {JSON.stringify({
                  name: selectedFile.name,
                  size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
                  type: selectedFile.type
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="text-center text-xs text-muted-foreground">
          Built with React, Framer Motion, and Lucide React
        </div>
      </div>
    </div>
  );
}
