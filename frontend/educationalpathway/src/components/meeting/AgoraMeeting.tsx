'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AgoraMeetingProps {
  appId: string;
  channel: string;
  uid?: string | number;
  userName: string;
  onLeave: () => void;
}

export default function AgoraMeeting({ appId, channel, uid, userName, onLeave }: AgoraMeetingProps) {
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

      clientRef.current.on('user-published', async (user, mediaType) => {
        await clientRef.current?.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      clientRef.current.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      try {
        // Sanitize channel name (Agora needs alphanumeric)
        const sanitizedChannel = channel.replace(/[^a-zA-Z0-9]/g, '');
        
        await clientRef.current.join(appId, sanitizedChannel, null, uid || null);
        
        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        
        await clientRef.current.publish([audioTrack, videoTrack]);
        setIsJoined(true);
      } catch (error) {
        console.error('Agora Init Error:', error);
      }
    };

    init();

    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
      clientRef.current?.leave();
    };
  }, [appId, channel]);

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleLeave = async () => {
    await clientRef.current?.leave();
    localAudioTrack?.close();
    localVideoTrack?.close();
    onLeave();
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 relative overflow-hidden">
      {/* Remote Video (Main View) */}
      <div className="flex-1 relative flex items-center justify-center">
        {remoteUsers.length > 0 ? (
          <RemoteVideoPlayer user={remoteUsers[0]} />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center border border-emerald-500/20 mb-4">
              <User className="w-16 h-16 text-emerald-500" />
            </div>
            <p className="text-slate-400 animate-pulse">Waiting for participant to join...</p>
          </div>
        )}
      </div>

      {/* Local Video (Floating) */}
      <div 
        ref={localVideoRef}
        className="absolute top-6 right-6 w-48 h-32 bg-slate-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-20"
      >
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <VideoOff className="w-8 h-8 text-slate-600" />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-4 px-8 py-4 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 z-30">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* User Info Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-medium text-sm">Live Session: {channel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemoteVideoPlayer({ user }: { user: any }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }
  }, [user.videoTrack]);

  return <div ref={ref} className="w-full h-full object-cover" />;
}
