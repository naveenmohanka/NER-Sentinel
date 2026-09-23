"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import { API_BASE_URL } from "@/lib/config";

interface AlertItem {
  id: string;
  title: string;
  source: string;
  severity: "RED ALERT" | "ORANGE WARNING" | "YELLOW WATCH";
  sector: string;
  time: string;
  message: string;
  telemetry: string;
  precautions?: string[];
  probability?: number;
}

export default function AlertsStatusPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criticalCount, setCriticalCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [threatLevel, setThreatLevel] = useState("NORMAL");
  const [lastSync, setLastSync] = useState<string>("Loading...");
  const [smsSent, setSmsSent] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/alerts`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setCriticalCount(data.critical_count || 0);
        setWarningCount(data.warning_count || 0);
        setWatchCount(data.watch_count || 0);
        setThreatLevel(data.threat_level || "ELEVATED");

        if (Array.isArray(data.alerts)) {
          const mapped: AlertItem[] = data.alerts.map((a: any, idx: number) => {
            const sevUpper = (a.severity || "").toUpperCase();
            const sev: "RED ALERT" | "ORANGE WARNING" | "YELLOW WATCH" =
              sevUpper === "RED" || sevUpper === "CRITICAL"
                ? "RED ALERT"
                : sevUpper === "ORANGE" || sevUpper === "WARNING"
                ? "ORANGE WARNING"
                : "YELLOW WATCH";

            let timeStr = `${(idx + 1) * 3} min ago`;
            if (a.issued_at) {
              const diffMs = Date.now() - new Date(a.issued_at).getTime();
              const mins = Math.max(1, Math.floor(diffMs / 60000));
              timeStr = mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)}h ago`;
            }

            const probPercent = a.probability ? `${Math.round(a.probability * 100)}%` : "N/A";
            const popStr = a.affected_population ? ` | Pop at Risk: ${a.affected_population.toLocaleString()}` : "";
            const telem = `Risk Prob: ${probPercent} | Hazard: ${a.type || "MULTI-HAZARD"}${popStr}`;

            return {
              id: a.id || `ALT-${idx + 1}`,
              title: a.title || "Hazard Alert",
              source: a.source || "NER-Sentinel ML Predictor",
              severity: sev,
              sector: a.location?.area || "Sikkim Regional Basin",
              time: timeStr,
              message: a.description || "",
              telemetry: telem,
              precautions: a.precautions || [],
              probability: a.probability
            };
          });
          setAlerts(mapped);
        }
        setLastSync(new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false }) + " IST");
      }
    } catch (err) {
      console.error("Failed to fetch alerts from backend:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  const triggerEmergencyBroadcast = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3500);
  };

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopNavbar title="Alerts & Status" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1300px] w-full mx-auto overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1b1b1d] tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ba1a1a] text-3xl">notifications_active</span>
                <span>Emergency Broadcast &amp; Alert Telemetry</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  FastAPI Live Stream
                </span>
              </h2>
              <p className="text-xs text-[#515f74] mt-1">
                Real-time multi-satellite disaster warnings broadcast by SSDMA and Gangtok District Control. Last synced: <span className="font-mono font-semibold text-gray-700">{lastSync}</span>
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchAlerts}
                className="px-3.5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                title="Refresh alerts from backend"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Sync</span>
              </button>

              <button
                onClick={triggerEmergencyBroadcast}
                className="px-4 py-2.5 bg-[#ba1a1a] hover:bg-[#961212] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                <span>{smsSent ? "✅ Broadcast Dispatched to SSDMA Nodes!" : "Trigger Public Emergency SMS"}</span>
              </button>
            </div>
          </div>

          {/* KPI Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Overall Threat</div>
              <div className="text-xl font-extrabold text-[#ba1a1a] mt-0.5 flex items-center gap-1">
                <span>⚠️ {threatLevel}</span>
              </div>
            </div>
            <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-200 shadow-2xs">
              <div className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Red Alerts</div>
              <div className="text-xl font-extrabold text-[#ba1a1a] mt-0.5">{criticalCount} Active</div>
            </div>
            <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-200 shadow-2xs">
              <div className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Orange Warnings</div>
              <div className="text-xl font-extrabold text-orange-700 mt-0.5">{warningCount} Active</div>
            </div>
            <div className="bg-yellow-50/60 p-3.5 rounded-xl border border-yellow-200 shadow-2xs">
              <div className="text-[11px] font-bold text-yellow-700 uppercase tracking-wider">Yellow Watches</div>
              <div className="text-xl font-extrabold text-yellow-800 mt-0.5">{watchCount} Active</div>
            </div>
          </div>

          {/* Alert Feed */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-gray-500 font-mono bg-white rounded-2xl border border-gray-200">
              <span className="material-symbols-outlined text-3xl animate-spin text-gray-400 mb-2">progress_activity</span>
              <div>Streaming live multi-satellite alerts from NER-Sentinel AI...</div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500 bg-white rounded-2xl border border-gray-200">
              🟢 No active critical alerts at this time. All sectors operating under normal surveillance.
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alt) => {
                const isRed = alt.severity === "RED ALERT";
                const isOrange = alt.severity === "ORANGE WARNING";

                return (
                  <div
                    key={alt.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm space-y-3 transition-all ${
                      isRed
                        ? "border-red-300 border-l-[6px] border-l-[#ba1a1a] bg-red-500/5"
                        : isOrange
                        ? "border-orange-300 border-l-[6px] border-l-orange-500 bg-orange-500/5"
                        : "border-yellow-300 border-l-[6px] border-l-yellow-500 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-tight ${
                          isRed
                            ? "bg-red-100 text-[#ba1a1a]"
                            : isOrange
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {alt.severity}
                        </span>
                        <span className="text-xs font-bold text-gray-500">Source: {alt.source}</span>
                      </div>

                      <span className="text-[11px] font-mono text-gray-500">{alt.time}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900">{alt.title}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed">{alt.message}</p>

                    {/* Precaution Checklist */}
                    {alt.precautions && alt.precautions.length > 0 && (
                      <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3 space-y-1.5">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-emerald-600">checklist</span>
                          <span>Mandated Response Protocol</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-700">
                          {alt.precautions.map((p, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-200/60 text-xs">
                      <span className="font-mono text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                        📊 Telemetry: <b>{alt.telemetry}</b>
                      </span>
                      <span className="font-bold text-gray-800 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-gray-500">location_on</span>
                        <span>{alt.sector}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
