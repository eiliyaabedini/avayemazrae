"use client";

import { useRef, useState, useCallback } from "react";

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onRecordingComplete,
  disabled,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      chunks.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.current = recorder;
      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timer.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch {
      alert("دسترسی به میکروفون امکان‌پذیر نیست");
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    if (timer.current) clearInterval(timer.current);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-all ${
          isRecording
            ? "bg-red-500 animate-pulse scale-110"
            : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isRecording ? "⏹" : "🎙"}
      </button>
      <p className="text-sm text-gray-500">
        {isRecording
          ? `در حال ضبط... ${formatTime(duration)}`
          : "برای شروع ضبط کلیک کنید"}
      </p>
    </div>
  );
}
