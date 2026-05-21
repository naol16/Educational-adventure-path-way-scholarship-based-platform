"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);

  // Use a ref for duration so onstop closure always reads the latest value
  const durationRef = useRef(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Whether we're intentionally stopping to SEND (vs cancel)
  const sendOnStopRef = useRef(false);

  // Audio Visualizer refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      // Cleanup on unmount — do NOT send
      sendOnStopRef.current = false;
      cleanupResources();
    };
  }, []);

  /** Stop timers, animation, audio context, and microphone stream */
  const cleanupResources = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  /** Safely stop the MediaRecorder, respecting its current state */
  const safeStopRecorder = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // If paused, resume first so that the final ondataavailable fires
    if (recorder.state === "paused") {
      recorder.resume();
    }

    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Read duration from ref — not the stale closure value
        const finalDuration = durationRef.current;

        if (sendOnStopRef.current && audioChunksRef.current.length > 0 && finalDuration > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          onSend(audioBlob, finalDuration);
        }

        cleanupResources();
      };

      mediaRecorder.start(100);
      setIsPaused(false);
      durationRef.current = 0;
      setDuration(0);

      // Start duration timer
      timerRef.current = setInterval(() => {
        durationRef.current += 1;
        setDuration(durationRef.current);
      }, 1000);

      // Initialize Web Audio API Visualizer
      setupVisualizer(stream);
    } catch (err) {
      console.error("Failed to access microphone:", err);
      onCancel();
    }
  };

  const setupVisualizer = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        animationFrameRef.current = requestAnimationFrame(draw);

        analyserRef.current.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

          const y = (canvas.height - barHeight) / 2;

          ctx.fillStyle = `hsl(${220 + i * 2}, 85%, 60%)`;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.error("Failed to set up visualizer:", e);
    }
  };

  const handlePauseToggle = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    // Guard: only act when recorder is in a valid state
    const state = recorder.state;

    if (state === "inactive") {
      // Recorder already stopped — nothing to do
      return;
    }

    if (state === "paused") {
      try {
        recorder.resume();
        setIsPaused(false);

        // Restart the duration timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          durationRef.current += 1;
          setDuration(durationRef.current);
        }, 1000);

        // Resume audio context for visualizer
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          audioContextRef.current.resume();
        }
      } catch (err) {
        console.warn("Could not resume recorder:", err);
      }
    } else if (state === "recording") {
      try {
        recorder.pause();
        setIsPaused(true);

        // Stop the timer so duration freezes while paused
        if (timerRef.current) clearInterval(timerRef.current);

        // Suspend audio context so visualizer freezes
        if (audioContextRef.current && audioContextRef.current.state === "running") {
          audioContextRef.current.suspend();
        }
      } catch (err) {
        console.warn("Could not pause recorder:", err);
      }
    }
  };

  const handleStopAndSend = () => {
    if (durationRef.current === 0) return;
    sendOnStopRef.current = true;
    safeStopRecorder();
  };

  const handleCancel = () => {
    sendOnStopRef.current = false;
    safeStopRecorder();
    onCancel();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex w-full items-center justify-between rounded-3xl border border-primary/20 bg-primary/5 px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scale: isPaused ? 1 : [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg"
        >
          <Mic className="h-5 w-5" />
        </motion.div>

        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            {isPaused ? "Recording Paused" : "Recording Audio"}
          </span>
          <span className="text-[13px] font-bold text-foreground">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Visual Audio Waveform */}
      <div className="flex-1 max-w-[200px] sm:max-w-xs md:max-w-md h-10 mx-4 opacity-80">
        <canvas
          ref={canvasRef}
          width={300}
          height={40}
          className="w-full h-full"
        />
      </div>

      <div className="flex items-center gap-2.5">
        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full p-2.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
          title="Delete Recording"
        >
          <Trash2 className="h-5 w-5" />
        </button>

        {/* Pause/Resume Button */}
        <button
          type="button"
          onClick={handlePauseToggle}
          className="rounded-full p-2.5 text-primary bg-primary/10 transition-all hover:bg-primary/20 active:scale-95"
          title={isPaused ? "Resume Recording" : "Pause Recording"}
        >
          {isPaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
        </button>

        {/* Send/Submit Button */}
        <button
          type="button"
          onClick={handleStopAndSend}
          disabled={duration === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
          title="Send Audio Message"
        >
          <Send className="h-5 w-5 ml-0.5" />
        </button>
      </div>
    </div>
  );
};
