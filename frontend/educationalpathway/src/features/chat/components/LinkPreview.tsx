"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { ExternalLink, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  domain: string;
  url: string;
}

interface LinkPreviewProps {
  url: string;
}

export const LinkPreview = ({ url }: LinkPreviewProps) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/chat/url-metadata?url=${encodeURIComponent(url)}`);
        if (active && res.data?.status === "success" && res.data?.data) {
          setMetadata(res.data.data);
          setError(false);
        }
      } catch (err) {
        if (active) {
          console.error("[LinkPreview] Error loading link preview:", err);
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMetadata();
    return () => {
      active = false;
    };
  }, [url]);

  if (error || (!loading && !metadata)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium break-all"
      >
        {url}
        <ExternalLink size={12} className="shrink-0" />
      </a>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-2 flex h-20 w-full animate-pulse items-center gap-3 rounded-xl border border-border/40 bg-muted/20 p-2.5"
        >
          <div className="h-10 w-10 shrink-0 rounded-lg bg-foreground/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-foreground/5" />
            <div className="h-3.5 w-3/4 rounded bg-foreground/5" />
          </div>
        </motion.div>
      ) : (
        metadata && (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-2.5 overflow-hidden rounded-xl border border-border/60 bg-background/40 backdrop-blur-md transition-all hover:bg-background/60 hover:shadow-md max-w-sm"
          >
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col group/link"
            >
              {metadata.image && (
                <div className="relative h-32 w-full shrink-0 overflow-hidden bg-muted/20 border-b border-border/40">
                  <img
                    src={metadata.image}
                    alt={metadata.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/link:scale-[1.03]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
              
              <div className="p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {metadata.favicon ? (
                    <img
                      src={metadata.favicon}
                      alt=""
                      className="h-4.5 w-4.5 rounded-sm object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Globe size={14} className="text-muted-foreground" />
                  )}
                  <span className="text-[10px] font-bold text-muted-foreground/80 tracking-wide uppercase truncate">
                    {metadata.siteName || metadata.domain}
                  </span>
                </div>
                
                <h5 className="text-xs font-black text-foreground tracking-tight leading-snug group-hover/link:text-primary transition-colors line-clamp-1">
                  {metadata.title}
                </h5>
                
                {metadata.description && (
                  <p className="text-[11px] text-muted-foreground/80 font-medium leading-relaxed line-clamp-2">
                    {metadata.description}
                  </p>
                )}
              </div>
            </a>
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};
