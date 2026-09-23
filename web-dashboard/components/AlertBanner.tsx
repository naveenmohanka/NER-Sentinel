"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

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
  const pathname = usePathname();

  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasNotified, setHasNotified] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Auto-hide alert when user scrolls down to view 3D maps or incidents
  useEffect(() => {
    const handleScroll = (e: any) => {
      const target = e.target;
      const scrollY = target?.scrollTop ?? window.scrollY ?? 0;
      if (scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", handleScroll, { capture: true });
  }, []);

  // Drag state management
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Fetch critical alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/alerts/critical`);
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
        // Fallback default alert if backend isn't reachable
        if (alerts.length === 0) {
          setAlerts([
            {
              id: "teesta-flood-1",
              type: "FLOOD",
              severity: "CRITICAL",
              title: "CRITICAL: Flash Flood Alert — Teesta River Basin",
              description: "Teesta feeder river surge (+1.4m) above warning mark. Inundation buffer active.",
              location: { latitude: 27.2789, longitude: 88.5944, area: "Teesta River Basin" },
              probability: 0.91,
              precautions: [
                "Evacuate low-lying riverbanks along NH-10 immediately.",
                "Dijkstra safe corridor active towards Bhusuk ridge shelter.",
                "Keep emergency mobile radios tuned to NDMA channel 1078."
              ]
            }
          ]);
        }
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
      icon: "/chatbot_avatar.png",
      tag: alert.id,
      requireInteraction: false,
    });
  };

  // Drag-to-pull-down / Drag-to-slide-up handlers
  const handlePointerDown = (e: React.PointerEvent) => {
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
      if (deltaY > 0) {
        setDragOffset(Math.min(deltaY, 200));
      }
    } else {
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
      if (deltaY > 20 || Math.abs(deltaY) < 5) {
        setIsOpen(true);
      }
    } else {
      if (deltaY < -20) {
        setIsOpen(false);
      }
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragStartY(null);
    setDragOffset(0);
  };

  // Hide on login page
  if (pathname === "/" || pathname === "/login") return null;
  if (isDismissed || alerts.length === 0) return null;

  const current = alerts[currentIndex] || alerts[0];
  const icon = current?.type === "FLOOD" ? "🌊" : "⛰️";

  return (
    <aside
      aria-label="Critical Emergency Notification Shade"
      ref={bannerRef}
      /* Positioned at top-16 (64px) right BELOW the white navbar so it NEVER covers "Command Dashboard" */
      className={`fixed top-16 left-1/2 -translate-x-1/2 md:left-[calc(50%+130px)] z-[45] flex flex-col items-center select-none transition-all duration-300 ${
        isScrolled && !isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        transform:
          isScrolled && !isOpen
            ? "translate(-50%, -70px)"
            : `translate(-50%, ${dragOffset}px)`,
        transition: isDragging ? "none" : "all 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* ── Collapsed Red Tab (The exact user-approved design, hanging safely below navbar) ── */}
      {!isOpen && (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          className="group flex items-center gap-2 bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white rounded-b-lg border-b-2 border-x-2 border-red-500/90 px-3.5 py-1.5 text-xs font-semibold shadow-lg shadow-red-950/30 cursor-grab active:cursor-grabbing hover:bg-red-600 transition-all"
          title="Drag down or click to view alert details"
        >
          {/* Subtle emergency pulse */}
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>

          {/* Severity & Type */}
          <span className="text-white text-[11px] font-extrabold tracking-wider uppercase shrink-0">
            {icon} RED:
          </span>

          {/* Compact title */}
          <span className="max-w-[150px] sm:max-w-[220px] md:max-w-[280px] truncate text-[11px] font-medium text-red-50">
            {current.title.replace(/^CRITICAL:\s*/i, "")}
          </span>

          {/* Probability tag */}
          <span className="text-[10px] bg-red-950/70 border border-red-400/40 px-1.5 py-0.2 rounded text-red-100 font-mono shrink-0">
            {Math.round(current.probability * 100)}%
          </span>

          {/* Pull Down Handle / Indicator */}
          <div className="flex items-center gap-0.5 text-red-200 group-hover:text-white pl-1.5 border-l border-red-500/50 shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-tight hidden sm:inline">
              PULL
            </span>
            <span className="material-symbols-outlined text-[16px] animate-bounce">
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
            className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/90 shrink-0 cursor-pointer"
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
            className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white text-xs font-bold leading-none shrink-0 cursor-pointer"
            title="Dismiss until next alert"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Expanded Emergency Drawer (Full disaster details & directives) ── */}
      {isOpen && (
        <div
          className="w-[480px] max-w-[94vw] bg-white rounded-b-xl shadow-2xl border-x-2 border-b-2 border-red-600 overflow-hidden text-slate-900 animate-in fade-in slide-in-from-top-4 duration-200"
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
                className="text-white/90 hover:text-white text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-semibold cursor-pointer"
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
          </div>
        </div>
      )}
    </aside>
  );
}
