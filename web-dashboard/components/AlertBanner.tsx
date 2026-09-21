"use client";

import { useState, useEffect, useRef } from "react";

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
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasNotified, setHasNotified] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch critical alerts every 30 seconds
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/alerts/critical");
        if (res.ok) {
          const data = await res.json();
          if (data.has_critical && data.alerts.length > 0) {
            setAlerts(data.alerts);
            setIsVisible(true);

            // Play alert sound on first detection
            if (!hasNotified) {
              playAlertSound();
              requestBrowserNotification(data.alerts[0]);
              setHasNotified(true);
            }
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [hasNotified]);

  // Rotate alerts every 5 seconds
  useEffect(() => {
    if (alerts.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [alerts.length]);

  // Alert sound using Web Audio API
  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a warning siren pattern
      const playBeep = (freq: number, startTime: number, duration: number) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // 3 warning beeps
      const now = audioContext.currentTime;
      playBeep(880, now, 0.3);
      playBeep(880, now + 0.4, 0.3);
      playBeep(1100, now + 0.8, 0.5);
    } catch (e) {
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
      requireInteraction: true,
    });
  };

  if (!isVisible || alerts.length === 0) return null;

  const current = alerts[currentIndex];
  const icon = current.type === "FLOOD" ? "🌊" : "⛰️";

  return (
    <div className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[50] flex flex-col items-center">
      {/* ── Dropdown Trigger Pill (Compact, doesn't block Date/Time or Title) ── */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white rounded-full shadow-lg border border-red-400/80 px-3 py-1 text-xs font-bold transition-all duration-200 hover:shadow-red-500/30 hover:scale-[1.02]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left focus:outline-none"
          title="Click to toggle Alert details"
        >
          <span className="text-base animate-bounce">{icon}</span>
          <span className="bg-red-950/60 text-red-200 text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-red-500/40">
            🔴 {current.severity}
          </span>
          <span className="hidden sm:inline-block font-bold max-w-[200px] md:max-w-[260px] truncate text-white">
            {current.title}
          </span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono">
            {Math.round(current.probability * 100)}%
          </span>
          <span className="material-symbols-outlined text-sm transition-transform duration-200 text-red-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
            expand_more
          </span>
        </button>

        {/* Quick Audio Siren button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            playAlertSound();
          }}
          className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/90"
          title="Replay Alert Siren"
        >
          🔊
        </button>

        {/* Quick Dismiss button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="p-1 hover:bg-white/20 rounded-full transition-colors text-white/70 hover:text-white text-xs font-bold"
          title="Dismiss Alert"
        >
          ✕
        </button>
      </div>

      {/* ── Expanded Dropdown Menu Card ── */}
      {isOpen && (
        <div className="mt-2 w-[440px] max-w-[94vw] bg-white rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden text-slate-900 transition-all duration-200 animate-in fade-in slide-in-from-top-2">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-800 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wide">
                  Active Emergency Alert
                </h4>
                <p className="text-[10px] text-red-200">
                  Real-time Multi-Satellite Risk Threshold Breached
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {alerts.length > 1 && (
                <span className="text-[10px] bg-red-950/60 px-2 py-0.5 rounded-full font-mono text-red-200">
                  {currentIndex + 1} of {alerts.length}
                </span>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white text-xs bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
              >
                ▲ Close
              </button>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3.5 space-y-2.5 text-xs">
            <div>
              <p className="font-bold text-slate-950 text-sm leading-snug">
                {current.title}
              </p>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                {current.description}
              </p>
            </div>

            {/* Alert Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Target Sector
                </span>
                <span className="font-bold text-slate-900 text-xs">
                  📍 {current.location.area}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  Hazard Probability
                </span>
                <span className="font-extrabold text-red-600 text-xs">
                  🔥 {Math.round(current.probability * 100)}% Saturation Risk
                </span>
              </div>
            </div>

            {/* Precautions list */}
            {current.precautions && current.precautions.length > 0 && (
              <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-200">
                <span className="font-bold text-[10px] text-red-900 uppercase tracking-wider block mb-1">
                  Immediate Precautions:
                </span>
                <ul className="text-[10.5px] text-red-800 space-y-0.5">
                  {current.precautions.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation & Controls */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                {alerts.length > 1 && (
                  <>
                    <button
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
                  onClick={() => playAlertSound()}
                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <span>🔊</span>
                  <span>Test Siren</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
