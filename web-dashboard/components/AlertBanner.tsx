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
  const bgColor = current.severity === "RED" 
    ? "from-red-600 via-red-700 to-red-800" 
    : "from-orange-500 via-orange-600 to-orange-700";
  const icon = current.type === "FLOOD" ? "🌊" : "⛰️";

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r ${bgColor} text-white shadow-2xl`}
      style={{ animation: "alertPulse 2s ease-in-out infinite" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Alert Content */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Flashing icon */}
          <div className="text-2xl animate-pulse shrink-0">{icon}</div>
          
          {/* Severity badge */}
          <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold tracking-wider shrink-0 border border-white/30">
            🔴 {current.severity} ALERT
          </span>

          {/* Title */}
          <span className="font-bold text-sm truncate">
            {current.title}
          </span>

          {/* Probability */}
          <span className="px-2 py-0.5 bg-black/30 rounded-full text-xs font-mono shrink-0">
            {Math.round(current.probability * 100)}%
          </span>

          {/* Location */}
          <span className="text-xs text-white/80 shrink-0 hidden md:block">
            📍 {current.location.area}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {alerts.length > 1 && (
            <span className="text-[10px] text-white/60">
              {currentIndex + 1}/{alerts.length}
            </span>
          )}
          <button
            onClick={() => playAlertSound()}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
            title="Replay Alert Sound"
          >
            🔊
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Alert animation */}
      <style jsx>{`
        @keyframes alertPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.92; }
        }
      `}</style>
    </div>
  );
}
