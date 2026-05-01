import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Send, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onSend, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Microphone access denied or not available");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleCancel = () => {
    stopRecording();
    setAudioBlob(null);
    onCancel();
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result;
      onSend(base64Audio);
      setAudioBlob(null);
    };
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 bg-[var(--bg-elevated)] rounded-full px-4 py-2 w-full animate-in slide-in-from-right-4 duration-300 shadow-lg ring-1 ring-[var(--accent-color)]/20">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="size-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono font-bold text-[var(--text-main)]">
              {formatTime(recordingTime)}
            </span >
            <span className="text-xs text-[var(--text-muted)] ml-2">Recording voice...</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <Square className="size-5 fill-current" />
          </button>
        </>
      ) : audioBlob ? (
        <>
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm font-bold text-[var(--accent-color)]">Audio Ready</span>
            <span className="text-xs text-[var(--text-muted)]">({formatTime(recordingTime)})</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <Trash2 className="size-5" />
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="size-10 bg-[var(--accent-color)] text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            <Send className="size-4 ml-0.5" />
          </button>
        </>
      ) : (
        <>
          <div className="flex-1 text-sm text-[var(--text-muted)]">Tap to record voice message</div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full"
          >
            <X className="size-5" />
          </button>
          <button
            type="button"
            onClick={startRecording}
            className="size-10 bg-[var(--accent-color)] text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-md"
          >
            <Mic className="size-5" />
          </button>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
