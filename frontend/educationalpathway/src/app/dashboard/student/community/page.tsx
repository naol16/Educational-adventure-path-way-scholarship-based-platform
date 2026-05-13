"use client";

import { CommunityGroups } from "@/features/student/components/CommunityGroups";
import { useSearchParams } from "next/navigation";
import { ChatPage } from "@/features/chat/ChatPage";
import { useAuth } from "@/providers/auth-context";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

function CommunityContent() {
    const searchParams = useSearchParams();
    const groupId = searchParams.get("groupId");
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
            </div>
        );
    }

    if (groupId) {
        return <ChatPage currentUser={{ id: user.id, name: user.name, role: user.role }} />;
    }

    return <CommunityGroups />;
}

export default function CommunityPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" /></div>}>
            <CommunityContent />
        </Suspense>
    );
}

