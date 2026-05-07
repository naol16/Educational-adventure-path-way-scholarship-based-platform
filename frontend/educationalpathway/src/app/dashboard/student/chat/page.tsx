"use client";

import { useAuth } from "@/providers/auth-context";
import { ChatPage } from "@/features/chat/ChatPage";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

export default function StudentChatPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
    <div className="h-full">

      <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>}>
        <ChatPage currentUser={{ id: user.id, name: user.name, role: user.role }} />
      </Suspense>
    </div>
  );
}
