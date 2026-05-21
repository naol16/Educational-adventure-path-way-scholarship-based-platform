"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  url: string;
}

export const AudioPlayer = ({ url }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLInputElement | null>(null);

  // Generate stable simulated waveform heights for the track
  const waveformBars = useRef<number[]>(
    Array.from({ length: 28 }, () => Math.floor(Math.random() * 26) + 6)
  );

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    // Initial check in case it loaded extremely fast
    if (audio.readyState >= 2) {
      setDuration(audio.duration || 0);
    }

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [url]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSpeedToggle = () => {
    if (!audioRef.current) return;
    let nextRate = 1;
    if (playbackRate === 1) nextRate = 1.5;
    else if (playbackRate === 1.5) nextRate = 2;
    else nextRate = 1;

    setPlaybackRate(nextRate);
    audioRef.current.playbackRate = nextRate;
  };

  const handleMuteToggle = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Calculate percentage for waveform bar shading
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex min-w-[280px] max-w-sm items-center gap-3.5 rounded-2xl border border-border bg-background/45 p-3.5 shadow-sm backdrop-blur-md">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={handlePlayPause}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/10 transition-all hover:scale-105 active:scale-95"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 fill-current" />
        ) : (
          <Play className="h-5 w-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Seek Slider Stack */}
      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        {/* Visual Waveform + Seek input overlay */}
        <div className="relative flex h-8 items-center">
          {/* Simulated Waveform Spans */}
          <div className="absolute inset-0 flex items-center justify-between gap-[3px] pointer-events-none px-0.5">
            {waveformBars.current.map((height, idx) => {
              const activePercent = (idx / waveformBars.current.length) * 100;
              const isPlayed = progressPercent > activePercent;

              return (
                <span
                  key={idx}
                  style={{ height: `${height}px` }}
                  className={`w-[3px] rounded-full transition-all duration-150 ${
                    isPlayed ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              );
            })}
          </div>

          {/* Invisible HTML5 Range Input overlay to support slider dragging */}
          <input
            ref={progressBarRef}
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
        </div>

        {/* Timers & Volume controls */}
        <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span className="opacity-80">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Speed Controls & Sound Toggle */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Speed Button (1x, 1.5x, 2x) */}
        <button
          type="button"
          onClick={handleSpeedToggle}
          className="rounded-lg bg-muted px-2 py-1 text-[10px] font-black text-foreground hover:bg-muted-foreground/10 transition-all"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Mute Button */}
        <button
          type="button"
          onClick={handleMuteToggle}
          className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};
