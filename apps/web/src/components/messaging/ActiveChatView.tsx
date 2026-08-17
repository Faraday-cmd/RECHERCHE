'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface MessageBubble {
  id: string;
  sender: 'user' | 'provider';
  text: string;
  timestamp: string;
  type?: 'text' | 'voice' | 'image' | 'file';
  mediaUrl?: string;
  fileName?: string;
  durationSeconds?: number;
  replyToMessageId?: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
    type?: 'text' | 'voice' | 'image' | 'file';
    fileName?: string;
    durationSeconds?: number;
  };
}

export interface ActiveChatViewProps {
  providerId: string;
  recipientName: string;
  recipientRole?: string;
  recipientAvatar?: string;
  userAvatar?: string;
  verified?: boolean;
  messages: MessageBubble[];
  onSendMessage: (text: string) => void;
  onSendMediaMessage?: (msg: Partial<MessageBubble>) => void;
  onBack: () => void;
}

// ----------------------------------------------------------------------
// 1. REUSABLE PREMIUM RECHERCHE SEND BUTTON COMPONENT
// ----------------------------------------------------------------------
export const RechercheSendButton: React.FC<{
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  title?: string;
}> = ({ onClick, disabled = false, title = 'Envoyer' }) => (
  <button
    type="submit"
    onClick={onClick}
    disabled={disabled}
    title={title}
    style={{
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      backgroundColor: disabled ? '#CBD5E1' : '#5B21B6',
      color: '#FFFFFF',
      border: 'none',
      fontSize: '16px',
      fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: disabled ? 'none' : '0 4px 14px rgba(91, 33, 182, 0.35)',
      transition: 'all 0.15s ease',
    }}
  >
    <span style={{ transform: 'translateX(1px) translateY(-1px)', display: 'inline-block' }}>
      ➤
    </span>
  </button>
);

// ----------------------------------------------------------------------
// 2. CUSTOM WAVEFORM VOICE MESSAGE PLAYER BUBBLE (DYNAMIC REAL DURATION & PLAYBACK)
// ----------------------------------------------------------------------
const CustomVoicePlayer: React.FC<{
  mediaUrl?: string;
  durationSeconds?: number;
  isUser: boolean;
}> = ({ mediaUrl, durationSeconds, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [detectedDuration, setDetectedDuration] = useState<number>(durationSeconds || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!mediaUrl) return;
    const audio = new Audio(mediaUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDetectedDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      setDetectedDuration(Math.round(audio.duration));
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audioRef.current = null;
    };
  }, [mediaUrl]);

  const togglePlay = () => {
    if (!audioRef.current && mediaUrl) {
      const audio = new Audio(mediaUrl);
      audioRef.current = audio;
    }
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const finalSecs = detectedDuration || durationSeconds || (audioRef.current?.duration ? Math.round(audioRef.current.duration) : 0);
  const progressPercent = finalSecs > 0 ? (currentTime / finalSecs) * 100 : 0;

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const waveformBars = [40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 35, 75, 50, 85, 65, 40, 90, 60];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '220px',
        padding: '4px 0',
      }}
    >
      {/* PLAY / PAUSE BUTTON */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Mettre en pause" : "Lire la note vocale"}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: isUser ? '#FFFFFF' : '#5B21B6',
          color: isUser ? '#5B21B6' : '#FFFFFF',
          border: 'none',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        }}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* WAVEFORM & TIMING */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '24px' }}>
          {waveformBars.map((heightPct, idx) => {
            const barProgress = (idx / waveformBars.length) * 100;
            const isPlayed = barProgress <= progressPercent;
            return (
              <span
                key={idx}
                style={{
                  flex: 1,
                  height: `${heightPct}%`,
                  backgroundColor: isUser
                    ? isPlayed
                      ? '#FFFFFF'
                      : 'rgba(255, 255, 255, 0.4)'
                    : isPlayed
                    ? '#5B21B6'
                    : '#CBD5E1',
                  borderRadius: '2px',
                  transition: 'height 0.2s ease, background-color 0.1s ease',
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: isUser ? 'rgba(255, 255, 255, 0.85)' : '#64748B',
            fontWeight: 700,
          }}
        >
          <span>{isPlaying ? formatSecs(currentTime) : formatSecs(finalSecs)}</span>
          <span>🎤 Voice</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. MAIN ACTIVE CHAT VIEW COMPONENT
// ----------------------------------------------------------------------
export const ActiveChatView: React.FC<ActiveChatViewProps> = ({
  recipientName,
  recipientRole = 'Ami(e)',
  recipientAvatar,
  userAvatar,
  verified = true,
  messages,
  onSendMessage,
  onSendMediaMessage,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  
  // Composer States: IDLE, RECORDING, PAUSED
  const [recordingState, setRecordingState] = useState<'IDLE' | 'RECORDING' | 'PAUSED'>('IDLE');
  const [recordTimeSeconds, setRecordTimeSeconds] = useState(0);
  const [liveMicLevels, setLiveMicLevels] = useState<number[]>([25, 40, 20, 60, 30, 75, 45, 50, 35, 65, 30, 80, 50, 40, 60, 35, 70, 45]);

  // Attachment & Reply States
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    file: File;
    url: string;
    type: 'image' | 'file';
    fileName: string;
  } | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<MessageBubble | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDocument = (msg: MessageBubble) => {
    if (!msg.mediaUrl) return;
    try {
      const link = document.createElement('a');
      link.href = msg.mediaUrl;
      link.target = '_blank';
      if (msg.fileName) {
        link.download = msg.fileName;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(msg.mediaUrl, '_blank');
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const totalRecordedMsRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const cleanupAudioResources = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanupAudioResources();
    };
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingAttachment, replyingToMessage]);

  // SCROLL TO TARGET ORIGINAL MESSAGE WHEN TAPPING QUOTED PREVIEW
  const scrollToMessage = (targetMsgId: string) => {
    const el = document.getElementById(`msg-item-${targetMsgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(targetMsgId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
  };

  // SEND MESSAGE (TEXT, ATTACHMENT WITH CAPTION, OR REPLY)
  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Case 1: Attachment with optional text caption
    if (pendingAttachment) {
      if (onSendMediaMessage) {
        onSendMediaMessage({
          type: pendingAttachment.type,
          text: inputText.trim() || (pendingAttachment.type === 'image' ? '📷 Photo' : `📎 ${pendingAttachment.fileName}`),
          mediaUrl: pendingAttachment.url,
          fileName: pendingAttachment.fileName,
          replyToMessageId: replyingToMessage?.id,
          replyTo: replyingToMessage
            ? {
                id: replyingToMessage.id,
                senderName: replyingToMessage.sender === 'user' ? 'Vous' : recipientName,
                text: replyingToMessage.text,
                type: replyingToMessage.type || 'text',
                fileName: replyingToMessage.fileName,
                durationSeconds: replyingToMessage.durationSeconds,
              }
            : undefined,
        });
      } else {
        onSendMessage(inputText.trim() || `[${pendingAttachment.fileName}]`);
      }
      setPendingAttachment(null);
      setInputText('');
      setReplyingToMessage(null);
      return;
    }

    if (!inputText.trim()) return;

    // Case 2: Regular text message or reply to message
    if (onSendMediaMessage && replyingToMessage) {
      onSendMediaMessage({
        type: 'text',
        text: inputText.trim(),
        replyToMessageId: replyingToMessage.id,
        replyTo: {
          id: replyingToMessage.id,
          senderName: replyingToMessage.sender === 'user' ? 'Vous' : recipientName,
          text: replyingToMessage.text,
          type: replyingToMessage.type || 'text',
          fileName: replyingToMessage.fileName,
          durationSeconds: replyingToMessage.durationSeconds,
        },
      });
    } else {
      onSendMessage(inputText.trim());
    }

    setInputText('');
    setReplyingToMessage(null);
  };

  // 1. REAL VOICE RECORDING ENGINE WITH WEB AUDIO API SPECTRUM & PRECISE TIMER
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("L'enregistrement vocal n'est pas supporté sur ce navigateur.");
        return;
      }

      cleanupAudioResources();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Web Audio API Spectrum Analyser for Live Mic Visualization
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLiveWaveform = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        const newBars: number[] = [];
        for (let i = 0; i < 18; i++) {
          const rawVal = dataArray[i] || 0;
          const barHeight = Math.max(15, Math.min(100, Math.round((rawVal / 220) * 100)));
          newBars.push(barHeight);
        }

        setLiveMicLevels(newBars);
        animFrameRef.current = requestAnimationFrame(updateLiveWaveform);
      };

      updateLiveWaveform();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recordStartTimeRef.current = Date.now();
      totalRecordedMsRef.current = 0;

      recorder.onstop = async () => {
        const elapsedMs = totalRecordedMsRef.current + (recordStartTimeRef.current ? Date.now() - recordStartTimeRef.current : 0);
        let realDurationSecs = Math.max(1, Math.round(elapsedMs / 1000));

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Decode metadata duration for 100% precision
        try {
          const tempAudio = new Audio(audioUrl);
          await new Promise<void>((resolve) => {
            tempAudio.onloadedmetadata = () => {
              if (tempAudio.duration && !isNaN(tempAudio.duration) && isFinite(tempAudio.duration)) {
                realDurationSecs = Math.max(1, Math.round(tempAudio.duration));
              }
              resolve();
            };
            tempAudio.onerror = () => resolve();
            setTimeout(resolve, 350);
          });
        } catch (e) {
          // Fallback to elapsed recording time
        }

        if (onSendMediaMessage) {
          onSendMediaMessage({
            type: 'voice',
            text: '🎤 Note vocale',
            mediaUrl: audioUrl,
            durationSeconds: realDurationSecs,
            replyToMessageId: replyingToMessage?.id,
            replyTo: replyingToMessage
              ? {
                  id: replyingToMessage.id,
                  senderName: replyingToMessage.sender === 'user' ? 'Vous' : recipientName,
                  text: replyingToMessage.text,
                  type: replyingToMessage.type || 'text',
                  fileName: replyingToMessage.fileName,
                  durationSeconds: replyingToMessage.durationSeconds,
                }
              : undefined,
          });
        } else {
          onSendMessage(`🎤 Note vocale (${realDurationSecs}s)`);
        }

        cleanupAudioResources();
        setReplyingToMessage(null);
      };

      recorder.start();
      setRecordingState('RECORDING');
      setRecordTimeSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        const ms = totalRecordedMsRef.current + (Date.now() - recordStartTimeRef.current);
        setRecordTimeSeconds(Math.floor(ms / 1000));
      }, 200);
    } catch (err) {
      cleanupAudioResources();
      setRecordingState('IDLE');
      alert("Permission microphone refusée ou indisponible.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'RECORDING') {
      mediaRecorderRef.current.pause();
      totalRecordedMsRef.current += Date.now() - recordStartTimeRef.current;
      recordStartTimeRef.current = 0;
      setRecordingState('PAUSED');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state === 'running') {
        audioContextRef.current.suspend().catch(() => {});
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'PAUSED') {
      mediaRecorderRef.current.resume();
      recordStartTimeRef.current = Date.now();
      setRecordingState('RECORDING');

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      timerIntervalRef.current = setInterval(() => {
        const ms = totalRecordedMsRef.current + (Date.now() - recordStartTimeRef.current);
        setRecordTimeSeconds(Math.floor(ms / 1000));
      }, 200);
    }
  };

  const finalizeSendRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'RECORDING' || recordingState === 'PAUSED')) {
      mediaRecorderRef.current.stop();
      setRecordingState('IDLE');
    }
  };

  const discardRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'RECORDING' || recordingState === 'PAUSED')) {
      mediaRecorderRef.current.onstop = null; // Suppress auto send callback
      mediaRecorderRef.current.stop();
      cleanupAudioResources();
      setRecordingState('IDLE');
      setRecordTimeSeconds(0);
    }
  };

  // 2. ATTACHMENT SELECTION
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setPendingAttachment({
          file,
          url: evt.target.result as string,
          type: 'image',
          fileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
    setIsPlusMenuOpen(false);
    if (e.target) e.target.value = '';
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingAttachment({
      file,
      url: URL.createObjectURL(file),
      type: 'file',
      fileName: file.name,
    });
    setIsPlusMenuOpen(false);
    if (e.target) e.target.value = '';
  };

  const formatRecordTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Helper to format reply preview text based on original message type
  const formatReplyPreview = (reply: NonNullable<MessageBubble['replyTo']>) => {
    if (reply.type === 'image') return '📷 Photo';
    if (reply.type === 'file') return `📎 ${reply.fileName || 'Document'}`;
    if (reply.type === 'voice') return `🎤 Note vocale · ${reply.durationSeconds || 5}s`;
    return `"${reply.text}"`;
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '0px',
        border: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: 'calc(100vh - 130px)',
        maxHeight: 'calc(100vh - 130px)',
        position: 'relative',
      }}
    >
      {/* Hidden File Inputs */}
      <input type="file" ref={photoInputRef} accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
      <input type="file" ref={documentInputRef} accept=".pdf,.doc,.docx,.png,.jpg,.txt" onChange={handleDocumentSelect} style={{ display: 'none' }} />

      {/* 1. CHAT HEADER BAR */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexShrink: 0,
          minHeight: '58px',
        }}
      >
        <button
          onClick={onBack}
          aria-label="Retour aux conversations"
          title="Retour"
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '50%',
            fontSize: '16px',
            fontWeight: 800,
            color: '#475569',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          <span>←</span>
        </button>

        {/* Circular Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#EDE9FE',
            color: '#5B21B6',
            fontWeight: 800,
            fontSize: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #DDD6FE',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {recipientAvatar ? (
            <img src={recipientAvatar} alt={recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            recipientName.charAt(0)
          )}
        </div>

        {/* Recipient Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {recipientName}
            </h3>
            {verified && (
              <span
                style={{
                  backgroundColor: '#ECFDF5',
                  color: '#047857',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                  flexShrink: 0,
                }}
              >
                ✓ VÉRIFIÉ
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#5B21B6',
              fontWeight: 700,
              marginTop: '1px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {recipientRole}
          </div>
        </div>
      </div>

      {/* 2. MESSAGES THREAD AREA */}
      <div
        style={{
          flex: 1,
          padding: '18px',
          overflowY: 'auto',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto 0',
              padding: '36px 24px',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>💬</div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Discussion avec {recipientName}
            </h4>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', lineHeight: 1.5 }}>
              Partagez des messages texte, notes vocales, photos et documents.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isHighlighted = highlightedMsgId === msg.id;

            return (
              <div
                key={msg.id}
                id={`msg-item-${msg.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Recipient Avatar */}
                {!isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#EDE9FE',
                      color: '#5B21B6',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}
                  >
                    {recipientAvatar ? (
                      <img src={recipientAvatar} alt={recipientName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      recipientName.charAt(0)
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <div
                    style={{
                      backgroundColor: isUser ? '#5B21B6' : '#FFFFFF',
                      color: isUser ? '#FFFFFF' : '#0F172A',
                      padding: '12px 16px',
                      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      border: isHighlighted
                        ? '2px solid #7C3AED'
                        : isUser
                        ? 'none'
                        : '1px solid #E2E8F0',
                      fontSize: '14.5px',
                      lineHeight: 1.5,
                      boxShadow: isHighlighted ? '0 0 16px rgba(124, 58, 237, 0.4)' : '0 3px 10px rgba(15, 23, 42, 0.05)',
                      wordBreak: 'break-word',
                      position: 'relative',
                    }}
                  >
                    {/* QUOTED REPLIED MESSAGE PREVIEW BOX (CLICKABLE TO SCROLL TO TARGET) */}
                    {msg.replyTo && (
                      <div
                        onClick={() => msg.replyTo?.id && scrollToMessage(msg.replyTo.id)}
                        title="Cliquer pour voir le message original"
                        style={{
                          marginBottom: '8px',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          backgroundColor: isUser ? 'rgba(255, 255, 255, 0.18)' : '#F1F5F9',
                          borderLeft: `4px solid ${isUser ? '#FFFFFF' : '#5B21B6'}`,
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        <div style={{ fontWeight: 800, color: isUser ? '#FFFFFF' : '#5B21B6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>↩ {msg.replyTo.senderName}</span>
                        </div>
                        <div style={{ opacity: 0.9, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '240px', marginTop: '2px' }}>
                          {formatReplyPreview(msg.replyTo)}
                        </div>
                      </div>
                    )}

                    {/* BUBBLE CONTENT TYPE RENDERING */}
                    {msg.type === 'image' && msg.mediaUrl ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <img
                          src={msg.mediaUrl}
                          alt="Photo partagée"
                          onClick={() => setViewingPhotoUrl(msg.mediaUrl || null)}
                          title="Cliquer pour agrandir en plein écran"
                          style={{
                            maxWidth: '280px',
                            maxHeight: '240px',
                            borderRadius: '14px',
                            objectFit: 'cover',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                          }}
                        />
                        {msg.text && <span style={{ fontSize: '13.5px', marginTop: '2px' }}>{msg.text}</span>}
                      </div>
                    ) : msg.type === 'voice' ? (
                      /* SENT CUSTOM VOICE MESSAGE PLAYER BUBBLE (IMAGE 5 REFERENCE) */
                      <CustomVoicePlayer mediaUrl={msg.mediaUrl} durationSeconds={msg.durationSeconds} isUser={isUser} />
                    ) : msg.type === 'file' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div
                          onClick={() => handleOpenDocument(msg)}
                          title={msg.mediaUrl ? `Cliquer pour ouvrir / télécharger ${msg.fileName || 'ce document'}` : 'Document'}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: isUser ? 'rgba(255,255,255,0.18)' : '#F8FAFC',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            cursor: msg.mediaUrl ? 'pointer' : 'default',
                            transition: 'transform 0.15s ease',
                            border: isUser ? '1px solid rgba(255,255,255,0.25)' : '1px solid #E2E8F0',
                          }}
                        >
                          <span style={{ fontSize: '26px' }}>📄</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {msg.fileName || 'Document'}
                            </div>
                            <span style={{ fontSize: '11px', opacity: 0.85 }}>
                              {msg.mediaUrl ? 'Cliquer pour ouvrir / télécharger ↗' : 'Document joint'}
                            </span>
                          </div>
                        </div>
                        {msg.text && msg.text !== `📎 ${msg.fileName}` && (
                          <span style={{ fontSize: '13.5px', marginTop: '4px' }}>{msg.text}</span>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>

                  {/* Message timestamp + Reply trigger button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', padding: '0 4px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => setReplyingToMessage(msg)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#5B21B6',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      ↩ Répondre
                    </button>
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#5B21B6',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}
                  >
                    {userAvatar ? (
                      <img src={userAvatar} alt="Vous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      'M'
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* 3. TYPE-AWARE REPLY PREVIEW BANNER ABOVE COMPOSER */}
      {replyingToMessage && (
        <div
          style={{
            padding: '10px 18px',
            backgroundColor: '#F5F3FF',
            borderTop: '1px solid #DDD6FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0,
          }}
        >
          <div style={{ borderLeft: '3px solid #5B21B6', paddingLeft: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#5B21B6' }}>
              En réponse à {replyingToMessage.sender === 'user' ? 'Vous' : recipientName}
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
              {formatReplyPreview({
                id: replyingToMessage.id,
                senderName: replyingToMessage.sender === 'user' ? 'Vous' : recipientName,
                text: replyingToMessage.text,
                type: replyingToMessage.type,
                fileName: replyingToMessage.fileName,
                durationSeconds: replyingToMessage.durationSeconds,
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingToMessage(null)}
            style={{ border: 'none', background: 'none', color: '#64748B', fontSize: '16px', cursor: 'pointer', fontWeight: 800 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 4. PENDING ATTACHMENT PREVIEW BAR (ATTACHMENT + TEXT CAPTION SYSTEM) */}
      {pendingAttachment && (
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#FAF5FF',
            borderTop: '1px solid #DDD6FE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pendingAttachment.type === 'image' ? (
              <img src={pendingAttachment.url} alt="Aperçu" style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px' }}>📄</span>
            )}
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                {pendingAttachment.fileName}
              </div>
              <div style={{ fontSize: '11.5px', color: '#5B21B6', fontWeight: 700 }}>
                Prêt à envoyer. Saisissez votre légende ci-dessous.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Retirer ✕
          </button>
        </div>
      )}

      {/* 5. FLOATING PREMIUM MULTIMEDIA COMPOSER (SCREENSHOT 2 REFERENCE) */}
      <div
        style={{
          padding: '10px 14px 14px 14px',
          backgroundColor: '#F8FAFC',
          position: 'sticky',
          bottom: 0,
          zIndex: 30,
          flexShrink: 0,
        }}
      >
        {recordingState !== 'IDLE' ? (
          /* STATE C: DEDICATED VOICE RECORDING BAR (IMAGE 4 REFERENCE) */
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #DDD6FE',
              boxShadow: '0 10px 30px -5px rgba(91, 33, 182, 0.15), 0 4px 12px rgba(15, 23, 42, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            {/* 🗑️ DISCARD / TRASH BUTTON */}
            <button
              type="button"
              onClick={discardRecording}
              title="Annuler et supprimer l'enregistrement"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FCA5A5',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              🗑️
            </button>

            {/* TIMER & ANIMATED WAVEFORM */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '0 4px', minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 900, color: '#5B21B6', fontFamily: 'monospace' }}>
                {formatRecordTime(recordTimeSeconds)}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '2px', height: '22px' }}>
                {liveMicLevels.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      flex: 1,
                      height: recordingState === 'RECORDING' ? `${h}%` : '20%',
                      backgroundColor: recordingState === 'RECORDING' ? '#5B21B6' : '#94A3B8',
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* PAUSE / RESUME TOGGLE BUTTON */}
            <button
              type="button"
              onClick={recordingState === 'RECORDING' ? pauseRecording : resumeRecording}
              title={recordingState === 'RECORDING' ? 'Mettre en pause' : 'Reprendre l\'enregistrement'}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: '#F5F3FF',
                color: '#5B21B6',
                border: '1px solid #DDD6FE',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {recordingState === 'RECORDING' ? '⏸️' : '▶️'}
            </button>

            {/* REUSABLE RECHERCHE SEND BUTTON */}
            <RechercheSendButton onClick={finalizeSendRecording} title="Envoyer le message vocal" />
          </div>
        ) : (
          /* STATE A & B: FLOATING CAPSULE COMPOSER BAR (SCREENSHOT 2 DESIGN) */
          <form
            onSubmit={handleSend}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(91, 33, 182, 0.04)',
              padding: '6px 8px 6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
          >
            {/* POPUP MENU FOR ATTACHMENTS (+) */}
            {isPlusMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '56px',
                  left: '8px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.18)',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 50,
                  minWidth: '170px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    photoInputRef.current?.click();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>📷</span>
                  <span>Photo / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlusMenuOpen(false);
                    documentInputRef.current?.click();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <span>📎</span>
                  <span>Document</span>
                </button>
              </div>
            )}

            {/* PLUS (+) ATTACHMENT BUTTON */}
            <button
              type="button"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              title="Joindre une photo ou document"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: isPlusMenuOpen ? '#5B21B6' : '#F1F5F9',
                color: isPlusMenuOpen ? '#FFFFFF' : '#475569',
                fontSize: '18px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              +
            </button>

            {/* MAIN TEXT CAPTION INPUT */}
            <input
              type="text"
              placeholder={pendingAttachment ? "Ajoutez un message / légende..." : "Écrivez un message..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              aria-label="Votre message"
              style={{
                flex: 1,
                minHeight: '38px',
                padding: '0 8px',
                border: 'none',
                fontSize: '14px',
                color: '#0F172A',
                backgroundColor: 'transparent',
                outline: 'none',
              }}
            />

            {/* DYNAMIC RIGHT ACTION: PREMIUM MICROPHONE (EMPTY TEXT) VS REUSABLE SEND BUTTON (TEXT / ATTACHMENT) */}
            {!inputText.trim() && !pendingAttachment ? (
              <button
                type="button"
                onClick={startRecording}
                title="Enregistrer un message vocal"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(91, 33, 182, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                🎙️
              </button>
            ) : (
              <RechercheSendButton title="Envoyer le message" />
            )}
          </form>
        )}
      </div>

      {/* FULL-SCREEN PHOTO LIGHTBOX VIEWER OVERLAY */}
      {viewingPhotoUrl && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setViewingPhotoUrl(null)}
        >
          {/* CLOSE BUTTON */}
          <button
            type="button"
            onClick={() => setViewingPhotoUrl(null)}
            title="Fermer le plein écran"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontSize: '22px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            }}
          >
            ✕
          </button>

          {/* FULL RESOLUTION IMAGE */}
          <img
            src={viewingPhotoUrl}
            alt="Photo agrandie"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          />
        </div>
      )}
    </div>
  );
};
