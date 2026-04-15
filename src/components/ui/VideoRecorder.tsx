'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Video, StopCircle, RefreshCw, Check, X, Loader2 } from 'lucide-react';

interface VideoRecorderProps {
  onRecorded: (file: File) => void | Promise<void>;
  onCancel?: () => void;
  /** Facing mode for the camera — 'user' (selfie) or 'environment' (rear) */
  facingMode?: 'user' | 'environment';
  /** Max recording duration in seconds (default 120) */
  maxDuration?: number;
}

type RecorderState = 'idle' | 'preview' | 'recording' | 'recorded' | 'error';

export default function VideoRecorder({
  onRecorded,
  onCancel,
  facingMode = 'user',
  maxDuration = 120,
}: VideoRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordedFileRef = useRef<File | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [stopStream, previewUrl]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // avoid feedback while previewing
        await videoRef.current.play();
      }
      setState('preview');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied';
      setError(msg);
      setState('error');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : 'video/mp4';

    const recorder = new MediaRecorder(streamRef.current, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const filename = `recording-${Date.now()}.${ext}`;
      const file = new File([blob], filename, { type: mimeType });
      recordedFileRef.current = file;
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
        videoRef.current.play().catch(() => {});
      }
      stopStream();
      setState('recorded');
    };

    mediaRecorderRef.current = recorder;
    recorder.start();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= maxDuration) {
          stopRecording();
        }
        return next;
      });
    }, 1000);
    setState('recording');
  };

  const stopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    recordedFileRef.current = null;
    if (videoRef.current) {
      videoRef.current.src = '';
      videoRef.current.controls = false;
    }
    setElapsed(0);
    startCamera();
  };

  const confirm = async () => {
    if (!recordedFileRef.current) return;
    await onRecorded(recordedFileRef.current);
  };

  const cancel = () => {
    stopTimer();
    stopStream();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setState('idle');
    onCancel?.();
  };

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <div className="w-full">
      {/* Camera viewport */}
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-3">
        <video
          ref={videoRef}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {state === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-3 bg-[#5DB347] text-white rounded-xl font-medium hover:bg-[#4a9a38] transition-colors"
            >
              <Video className="w-5 h-5" />
              Start Camera
            </button>
          </div>
        )}
        {state === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/80">
            <div className="text-center text-white px-6">
              <p className="font-medium mb-2">Camera unavailable</p>
              <p className="text-sm opacity-80">{error}</p>
              <button
                onClick={() => { setState('idle'); setError(null); }}
                className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        {state === 'recording' && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            REC {formatTime(elapsed)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {state === 'preview' && (
          <>
            <button
              onClick={cancel}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              type="button"
            >
              <span className="w-2.5 h-2.5 bg-white rounded-full" />
              Record
            </button>
          </>
        )}
        {state === 'recording' && (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2 bg-[#1B2A4A] text-white rounded-lg font-medium hover:bg-[#2D4A7A] transition-colors"
            type="button"
          >
            <StopCircle className="w-5 h-5" />
            Stop
          </button>
        )}
        {state === 'recorded' && (
          <>
            <button
              onClick={retake}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg"
              type="button"
            >
              <RefreshCw className="w-4 h-4" />
              Retake
            </button>
            <button
              onClick={cancel}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              type="button"
              aria-label="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={confirm}
              className="flex items-center gap-2 px-5 py-2 bg-[#5DB347] text-white rounded-lg font-medium hover:bg-[#4a9a38] transition-colors"
              type="button"
            >
              <Check className="w-4 h-4" />
              Use this video
            </button>
          </>
        )}
      </div>

      {state === 'preview' && (
        <p className="mt-2 text-xs text-center text-gray-400">
          Max recording: {Math.floor(maxDuration / 60)}m {maxDuration % 60}s
        </p>
      )}
    </div>
  );
}
