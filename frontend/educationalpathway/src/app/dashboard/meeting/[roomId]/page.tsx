'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/providers/auth-context';
import { useRouter } from 'next/navigation';
import AgoraMeeting from '@/components/meeting/AgoraMeeting';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Please log in to join the meeting</h2>
        <Button onClick={() => router.push('/login')}>Log In</Button>
      </div>
    );
  }

  const displayName = user.name || (user.role === 'student' ? 'Student' : 'Counselor');
  
  const handleLeave = () => {
    if (user.role === 'student') {
      router.push('/dashboard/counselors');
    } else if (user.role === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/counselor');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 rounded-lg overflow-hidden relative bg-slate-950">
      {/* Agora Meeting Container */}
      <div className="flex-1 w-full h-full relative z-0">
        <AgoraMeeting
          appId="5ef76d27b47942eeb8dbc338310e4876"
          channel={roomId}
          userName={displayName}
          uid={user.id}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
}
