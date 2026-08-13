"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, ChevronRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/providers/auth-context";
import { toast } from "react-hot-toast";

interface Group {
  id: number;
  name: string;
  country: string;
  description: string;
  isGroup: boolean;
  isJoined?: boolean;
}

export const CommunityGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await api.get("/groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      toast.error("Failed to load community groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const joinGroup = async (groupId: number) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      toast.success("You joined the group");
      setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, isJoined: true } : g)));
      // Immediately navigate to the chat page with the group selected
      window.location.href = `/dashboard/student/chat?groupId=${groupId}`;
    } catch (error) {
      console.error("Failed to join group:", error);
      toast.error("Could not join this group");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-16 text-muted-foreground dark:text-[#8eb2c0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3390ec]" />
        <p className="text-sm">Loading groups…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-3 pb-6 pt-4 md:px-6 md:pt-8">
      <div className="mb-6 text-center md:text-left">
        <h1 className="text-[22px] font-bold tracking-tight text-foreground dark:text-white">Groups</h1>
        <p className="mt-1 text-[14px] text-muted-foreground dark:text-[#8eb2c0]">
          Join destination communities — same layout as your chat list, clear actions on the right.
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 px-6 py-14 text-center dark:border-white/10 dark:bg-[#17212b]/80">
          <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground dark:text-[#8eb2c0]">No groups yet. Check back later.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/60 bg-white shadow-sm dark:border-white/10 dark:bg-[#17212b]">
          {groups.map((group, i) => (
            <div
              key={group.id}
              className={`flex items-stretch gap-3 px-3 py-3 md:gap-4 md:px-4 ${
                i > 0 ? "border-t border-black/60 dark:border-white/10" : ""
              }`}
            >
              <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#3390ec] text-lg font-semibold text-white shadow-inner dark:bg-[#5288c1]">
                {group.name?.trim() ? group.name.substring(0, 1).toUpperCase() : <Users className="h-6 w-6" />}
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate text-[15px] font-semibold text-foreground dark:text-white">{group.name}</h2>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-muted-foreground dark:text-[#8eb2c0]">
                      {group.country ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 opacity-70" />
                          {group.country}
                        </span>
                      ) : null}
                      <span className="text-[#3390ec] dark:text-[#6ab7ff]">Public group</span>
                    </div>
                  </div>
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted-foreground dark:text-[#a7b3c2]">
                  {group.description || "No description yet."}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end justify-center gap-2 self-center">
                {group.isJoined ? (
                  <Link
                    href={`/dashboard/${user?.role === "counselor" ? "counselor" : "student"}/chat?groupId=${group.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-[#3390ec] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#2b7fd4] dark:bg-[#5288c1] dark:hover:bg-[#4676ad]"
                  >
                    Open
                    <ChevronRight className="h-4 w-4 opacity-90" />
                  </Link>
                ) : (
                  <div className="flex flex-col items-stretch gap-1.5 min-w-[90px]">
                    <button
                      type="button"
                      onClick={() => joinGroup(group.id)}
                      className="rounded-full bg-[#3390ec] px-4 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2b7fd4] dark:bg-[#5288c1] dark:hover:bg-[#4676ad]"
                    >
                      Join
                    </button>
                    <Link
                      href={`/dashboard/${user?.role === "counselor" ? "counselor" : "student"}/chat?groupId=${group.id}`}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-transparent px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Preview
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};