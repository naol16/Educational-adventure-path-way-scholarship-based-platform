'use client';

import { useEffect, useState, use } from 'react';
import { useAuth } from '@/providers/auth-context';
import { useRouter } from 'next/navigation';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MeetingPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isJitsiLoading, setIsJitsiLoading] = useState(true);
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;

  if (isLoading) {
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
  
  // Custom Jitsi configuration
  const configOverwrite = {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    disableDeepLinking: true,
    prejoinPageEnabled: true,
  };

  const interfaceConfigOverwrite = {
    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
    SHOW_PROMOTIONAL_CLOSE_PAGE: false,
    TOOLBAR_BUTTONS: [
      'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
      'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
      'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
      'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
      'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone', 'security'
    ].filter(btn => btn !== 'invite' && btn !== 'livestreaming'), // Remove invite and livestream per requirements
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 rounded-lg overflow-hidden relative bg-slate-950">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-md flex items-center px-6 z-10 border-b border-slate-800/50">
        <Button 
          variant="ghost" 
          className="text-white hover:bg-slate-800 hover:text-white mr-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-white">Counseling Session</h1>
        </div>
        <div className="w-[150px]"></div> {/* Spacer for centering */}
      </div>

      {isJitsiLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-0">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
          <p className="text-emerald-400 font-medium">Connecting to secure room...</p>
        </div>
      )}

      {/* Jitsi Meeting Container */}
      <div className="flex-1 mt-16 w-full h-full relative z-0">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomId}
          configOverwrite={configOverwrite}
          interfaceConfigOverwrite={interfaceConfigOverwrite}
          userInfo={{
            displayName: displayName,
            email: user.email,
          }}
          onApiReady={(externalApi) => {
            setIsJitsiLoading(false);
            
            // Execute command to set subject branding
            if (user.role === 'counselor') {
              externalApi.executeCommand('subject', `Counseling Session: ${displayName}`);
            }

            // Listen for meeting end to navigate away
            externalApi.addListener('readyToClose', () => {
              if (user.role === 'student') {
                router.push('/dashboard/student/counselors'); // Route to counselor review logic eventually
              } else {
                router.push('/dashboard/counselor');
              }
            });
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
        />
      </div>
    </div>
  );
}
