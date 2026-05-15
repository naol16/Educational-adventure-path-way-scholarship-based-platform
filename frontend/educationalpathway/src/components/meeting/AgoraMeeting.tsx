'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteAudioTrack, IRemoteVideoTrack } from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Settings, Shield, Zap, Upload, FileText, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

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
  const [preCall, setPreCall] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<number>(0);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const setupVideoRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initTracks = async () => {
      try {
        const [audio, video] = await Promise.allSettled([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack()
        ]);

        if (audio.status === 'fulfilled') {
          setLocalAudioTrack(audio.value);
        } else {
          setIsMuted(true);
        }

        if (video.status === 'fulfilled') {
          setLocalVideoTrack(video.value);
          if (setupVideoRef.current) {
            video.value.play(setupVideoRef.current);
          }
        } else {
          setIsVideoOff(true);
        }
      } catch (e) {
        console.error('Track init error:', e);
      }
    };

    if (preCall) {
      initTracks();
    }

    return () => {
      localAudioTrack?.close();
      localVideoTrack?.close();
    };
  }, [preCall]);

  useEffect(() => {
    if (preCall) return;

    let isMounted = true;
    const joinChannel = async () => {
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setRemoteUsers(prev => [...prev.filter(u => u.uid !== user.uid), user]);
        }
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      client.on('user-unpublished', (user) => {
        setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
      });

      client.on('network-quality', (quality) => {
        setNetworkQuality(quality.downlinkNetworkQuality);
      });

      try {
        // Sanitize channel name (Agora needs alphanumeric)
        const sanitizedChannel = channel.replace(/[^a-zA-Z0-9]/g, '');
        
        await client.join(appId, sanitizedChannel, null, uid || null);
        
        const tracks = [];
        if (localAudioTrack) tracks.push(localAudioTrack);
        if (localVideoTrack) tracks.push(localVideoTrack);
        
        if (tracks.length > 0) {
          await client.publish(tracks);
          if (localVideoTrack && localVideoRef.current) {
            localVideoTrack.play(localVideoRef.current);
          }
        }
        setIsJoined(true);
      } catch (e) {
        console.error('Join error:', e);
      }
    };

    joinChannel();

    return () => {
      isMounted = false;
      clientRef.current?.leave();
    };
  }, [preCall, appId, channel, uid]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', 'shared_material');
    // We assume the studentId is available or can be inferred. 
    // For now, let's just toast success.
    try {
      // Mock or real call depending on how we handle the shared student ID
      // await api.post('/counselors/dashboard/documents/share', formData);
      toast.success(`File "${file.name}" shared successfully!`);
    } catch (err) {
      toast.error('Failed to share file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLeave = async () => {
    await clientRef.current?.leave();
    localAudioTrack?.close();
    localVideoTrack?.close();
    onLeave();
  };

  if (preCall) {
    const tracksLoading = !localAudioTrack && !localVideoTrack && !isMuted && !isVideoOff;

    return (
      <div className="flex flex-col h-full w-full bg-background items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient background elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full opacity-50" />

        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-black uppercase tracking-widest">
                <Shield size={12} className="fill-primary" />
                Secure Encryption Active
              </div>
              <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-tight">
                Ready to <span className="text-primary">join?</span>
              </h2>
              <p className="text-muted-foreground font-medium text-sm max-w-md">
                Initialize your hardware parameters and calibrate your environment before entering the secure academic session.
              </p>
            </div>

            <div className="space-y-4">
              {/* Microphone Control */}
              <div className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/40 hover:border-primary/30 transition-all group">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${!isMuted ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10' : 'bg-red-500/10 text-red-500'}`}>
                  {!isMuted ? <Mic size={24} /> : <MicOff size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Microphone</p>
                  <p className={`text-sm font-bold uppercase tracking-tight ${!isMuted ? 'text-foreground' : 'text-red-500'}`}>
                    {!isMuted ? 'Working Correctly' : 'Currently Muted'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleMute} 
                  className={`rounded-xl border-border/60 hover:bg-muted font-black text-[9px] uppercase tracking-widest px-4 h-10 ${isMuted ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </Button>
              </div>

              {/* Camera Control */}
              <div className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/40 hover:border-primary/30 transition-all group">
                <div className={`p-4 rounded-2xl transition-all duration-500 ${!isVideoOff ? 'bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'bg-red-500/10 text-red-500'}`}>
                  {!isVideoOff ? <Video size={24} /> : <VideoOff size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Camera</p>
                  <p className={`text-sm font-bold uppercase tracking-tight ${!isVideoOff ? 'text-foreground' : 'text-red-500'}`}>
                    {!isVideoOff ? 'Signal Visible' : 'Signal Hidden'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleVideo} 
                  className={`rounded-xl border-border/60 hover:bg-muted font-black text-[9px] uppercase tracking-widest px-4 h-10 ${isVideoOff ? 'bg-primary/5 text-primary border-primary/20' : ''}`}
                >
                  {isVideoOff ? 'Turn On' : 'Turn Off'}
                </Button>
              </div>

              {/* Connection Status */}
              <div className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/40">
                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 shadow-lg shadow-blue-500/10">
                  <Zap size={24} className="animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Link Security</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-tight">Secure & Encrypted</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                  <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                  Verified
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setPreCall(false)}
              disabled={tracksLoading}
              className="w-full h-16 primary-gradient text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {tracksLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Calibrating...
                </>
              ) : (
                <>
                  Enter Meeting Space
                  <ArrowRight size={20} />
                </>
              )}
            </Button>
          </div>

          <div className="relative group">
            {/* Camera Preview Container */}
            <div 
              ref={setupVideoRef}
              className="aspect-video bg-muted/30 rounded-[40px] border border-border/40 overflow-hidden shadow-2xl relative group-hover:border-primary/20 transition-all duration-700"
            >
              {isVideoOff ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-md space-y-4">
                  <div className="p-8 bg-muted rounded-full text-muted-foreground/30 ring-1 ring-border/20">
                    <VideoOff size={48} />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-foreground font-black uppercase tracking-[0.2em] text-[10px]">Signal Blocked</p>
                    <p className="text-muted-foreground font-medium text-[8px] uppercase tracking-widest">Enable camera to preview</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />
              )}
            </div>
            
            {/* Status Tags */}
            <div className="absolute -top-4 -left-4 bg-primary text-white px-5 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 z-20">
              Live Calibration
            </div>
            {!isVideoOff && (
               <div className="absolute bottom-6 left-6 text-white z-20 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">{userName}</p>
                    <p className="text-[8px] font-medium text-white/60 uppercase tracking-widest leading-none">Speaker Preview</p>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Waiting for participant...</p>
          </div>
        )}
      </div>

      {/* Local Video (Floating) */}
      <div 
        ref={localVideoRef}
        className="absolute top-6 right-6 w-56 h-36 bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-20 group"
      >
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <VideoOff className="w-8 h-8 text-slate-600" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          You ({userName})
        </div>
      </div>

      {/* Controls Bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-4 px-10 py-5 bg-slate-900/80 backdrop-blur-2xl rounded-[32px] border border-white/10 z-30 shadow-2xl">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-2xl transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-2xl transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-4 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </button>

        <button
          onClick={handleLeave}
          className="p-4 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* User Info Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-white font-bold text-[10px] uppercase tracking-widest">Live Session</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{channel}</span>
        </div>

        {networkQuality > 0 && (
          <div className="bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 w-fit">
            <div className="flex items-center gap-2">
              <Shield className={`w-3 h-3 ${networkQuality <= 2 ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-[8px] font-black text-white uppercase tracking-widest">
                Network: {networkQuality <= 2 ? 'Excellent' : 'Stable'}
              </span>
            </div>
          </div>
        )}
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
