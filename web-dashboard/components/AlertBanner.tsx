"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CriticalAlert {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  location: { latitude: number; longitude: number; area: string };
  probability: number;
  precautions: string[];
}

export default function AlertBanner() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasNotified, setHasNotified] = useState(false);

  // Drag state management
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Fetch critical alerts every 30 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/alerts/critical");
        if (res.ok) {
          const data = await res.json();
          if (data.has_critical && data.alerts.length > 0) {
            setAlerts(data.alerts);

            // Play alert sound on initial detection only
            if (!hasNotified) {
              playAlertSound();
              requestBrowserNotification(data.alerts[0]);
              setHasNotified(true);
            }
          }
        }
      } catch {
        // Silent catch
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [hasNotified]);

  // Rotate through alerts if multiple exist
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  // Alert sound using Web Audio API
  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playBeep = (freq: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playBeep(880, now, 0.25);
      playBeep(880, now + 0.35, 0.25);
      playBeep(1100, now + 0.7, 0.4);
    } catch {
      // Audio not available
    }
  };

  // Browser Push Notification
  const requestBrowserNotification = (alert: CriticalAlert) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      sendNotification(alert);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          sendNotification(alert);
        }
      });
    }
  };

  const sendNotification = (alert: CriticalAlert) => {
    const icon = alert.type === "FLOOD" ? "🌊" : "⛰️";
    new Notification(`${icon} NER-Sentinel CRITICAL ALERT`, {
      body: `${alert.title}\n${alert.location.area} — ${Math.round(alert.probability * 100)}% probability`,
      icon: "/chatbot_avatar.jpg",
      tag: alert.id,
      requireInteraction: false,
    });
  };

  // Drag-to-pull-down / Drag-to-slide-up handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Ignore clicks on buttons
    if ((e.target as HTMLElement).closest("button")) return;
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || dragStartY === null) return;
    const deltaY = e.clientY - dragStartY;

    if (!isOpen) {
      // Dragging down to open: positive delta
      if (deltaY > 0) {
        setDragOffset(Math.min(deltaY, 200));
      }
    } else {
      // Dragging up to close: negative delta
      if (deltaY < 0) {
        setDragOffset(Math.max(deltaY, -200));
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || dragStartY === null) return;
    const deltaY = e.clientY - dragStartY;
    setIsDragging(false);
    setDragStartY(null);
    setDragOffset(0);

    if (!isOpen) {
      // Dragged down more than 25px -> Open!
      if (deltaY > 25) {
        setIsOpen(true);
      } else if (Math.abs(deltaY) < 5) {
        // Simple tap/click toggle
        setIsOpen(true);
      }
    } else {
      // Dragged up more than 25px -> Close!
      if (deltaY < -25) {
        setIsOpen(false);
      }
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragStartY(null);
    setDragOffset(0);
  };

  if (isDismissed || alerts.length === 0) return null;

  const current = alerts[currentIndex];
  const icon = current.type === "FLOOD" ? "🌊" : "⛰️";

  return (
    <aside
      aria-label="Critical Emergency Notification Shade"
      ref={bannerRef}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-[45] flex flex-col items-center select-none"
      style={{
        transform: `translate(-50%, ${dragOffset}px)`,
        transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Collapsed Flush Ceiling Tab (Subtly rounded bottom corners: rounded-b-md, flat top) ── */}
      {!isOpen && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="group flex items-center gap-2 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white rounded-b-md border-b-2 border-x-2 border-red-500/80 px-3 py-1 text-xs font-semibold shadow-md shadow-red-950/20 cursor-grab active:cursor-grabbing hover:bg-red-600 transition-colors"
          title="Drag down or click to view alert details"
        >
          {/* Subtle emergency pulse */}
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>

          {/* Severity & Type */}
          <span className="text-white text-[11px] font-extrabold tracking-wider uppercase">
            {icon} {current.severity}:
          </span>

          {/* Compact truncated title */}
          <span className="max-w-[150px] sm:max-w-[210px] md:max-w-[260px] truncate text-[11px] font-medium text-red-50">
            {current.title.replace(/^CRITICAL:\s*/i, "")}
          </span>

          {/* Probability tag */}
          <span className="text-[10px] bg-red-950/70 border border-red-400/40 px-1.5 py-0.2 rounded text-red-100 font-mono">
            {Math.round(current.probability * 100)}%
          </span>

          {/* Pull Down Handle / Indicator */}
          <div className="flex items-center gap-0.5 text-red-200 group-hover:text-white pl-1 border-l border-red-500/50">
            <span className="text-[10px] uppercase font-bold tracking-tight hidden sm:inline">
              Pull
            </span>
            <span className="material-symbols-outlined text-[16px] animate-pulse">
              expand_more
            </span>
          </div>

          {/* Audio Siren Quick Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playAlertSound();
            }}
            className="p-0.5 hover:bg-white/20 rounded transition-colors text-white/90"
            title="Replay Alert Siren"
          >
            <span className="text-xs">🔊</span>
          </button>

          {/* Dismiss Tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-0.5 hover:bg-white/20 rounded transition-colors text-white/70 hover:text-white text-xs font-bold leading-none"
            title="Dismiss until next alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Expanded Emergency Drawer (Clean rounded-b-lg border, flat ceiling) ── */}
      {isOpen && (
        <div
          className="w-[460px] max-w-[94vw] bg-white rounded-b-lg shadow-2xl border-x-2 border-b-2 border-red-600 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Drawer Header */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white p-3 flex items-center justify-between cursor-grab active:cursor-grabbing"
            title="Drag up to close or click close"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span>Active Disaster Warning</span>
                  <span className="bg-red-950/70 border border-red-400/50 text-red-200 text-[9px] px-1.5 py-0.2 rounded font-mono">
                    RED TIER
                  </span>
                </h4>
                <p className="text-[10px] text-red-100/80">
                  Real-time Multi-Satellite Risk Threshold Exceeded
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {alerts.length > 1 && (
                <span className="text-[10px] bg-red-950/70 px-2 py-0.5 rounded font-mono text-red-200 border border-red-500/30">
                  {currentIndex + 1} / {alerts.length}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/90 hover:text-white text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors flex items-center gap-1 font-semibold"
                title="Slide up"
              >
                <span>▲</span>
                <span>Slide Up</span>
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="p-3.5 space-y-2.5 text-xs">
            <div>
              <p className="font-extrabold text-slate-950 text-sm leading-snug">
                {current.title}
              </p>
              <p className="text-slate-600 text-[11.5px] mt-1 leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-md border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Impact Sector
                </span>
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                  <span>📍</span>
                  <span>{current.location.area}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Hazard Probability
                </span>
                <span className="font-extrabold text-red-600 text-xs flex items-center gap-1">
                  <span>🔥</span>
                  <span>{Math.round(current.probability * 100)}% Saturation Risk</span>
                </span>
              </div>
            </div>

            {/* Precautions List */}
            {current.precautions && current.precautions.length > 0 && (
              <div className="bg-red-50/70 p-2.5 rounded-md border border-red-200">
                <span className="font-bold text-[10px] text-red-900 uppercase tracking-wider block mb-1">
                  Mandatory Field Precautions:
                </span>
                <ul className="text-[10.5px] text-red-800 space-y-1">
                  {current.precautions.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Drawer Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                {alerts.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex(
                          (prev) => (prev - 1 + alerts.length) % alerts.length
                        )
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors"
                    >
                      ◀ Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentIndex((prev) => (prev + 1) % alerts.length)
                      }
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition-colors"
                    >
                      Next ▶
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => playAlertSound()}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>🔊</span>
                  <span>Test Siren</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Pull-Up Grip Bar (Easy drag / click to slide back up) */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onClick={() => setIsOpen(false)}
            className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 border-t border-slate-200 flex items-center justify-center gap-1 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors"
            title="Click or drag up to slide back into ceiling"
          >
            <div className="w-8 h-1 bg-slate-400 rounded-full"></div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
              ▲ Slide Up
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

