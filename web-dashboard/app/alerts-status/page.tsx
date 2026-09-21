"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

interface AlertItem {
  id: string;
  title: string;
  source: string;
  severity: "RED ALERT" | "ORANGE WARNING" | "YELLOW WATCH";
  sector: string;
  time: string;
  message: string;
  telemetry: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: "ALT-01",
    title: "Critical Inundation Alert: Ranipool Teesta Catchment",
    source: "NASA SMAP + CWC Flood Sensor",
    severity: "RED ALERT",
    sector: "East Sikkim (Ranipool - Singtam)",
    time: "3 min ago",
    message: "Volumetric soil moisture exceeded 0.42 m³/m³. Extreme pore-water pressure detected. Evacuate low-lying riverbed settlements immediately.",
    telemetry: "Rain: 82mm/24h | SMAP: 0.42 m³/m³ | Slope: 32.4°"
  },
  {
    id: "ALT-02",
    title: "NH-10 Highway Landslide Warning",
    source: "Geological Survey of India & NER-Sentinel Model",
    severity: "RED ALERT",
    sector: "29th Mile / Coronation Bridge Corridor",
    time: "15 min ago",
    message: "Debris slide movement detected. Road edge completely blocked. All vehicular traffic diverted to NH-717A.",
    telemetry: "Slide Probability: 84% | Rockfall Risk: HIGH"
  },
  {
    id: "ALT-03",
    title: "Convective Monsoon Surge Warning",
    source: "NASA POWER Meteorology & IMD Gangtok",
    severity: "ORANGE WARNING",
    sector: "Bhusuk Ridge (1357m)",
    time: "42 min ago",
    message: "Heavy rain bands approaching from lower Himalayan escarpments. Relative humidity 88%.",
    telemetry: "Expected Rain: 105mm in next 12h | Wind: 3.4 m/s"
  },
  {
    id: "ALT-04",
    title: "Teesta Stage III Hydroelectric Dam Surveillance",
    source: "Central Water Commission (CWC)",
    severity: "YELLOW WATCH",
    sector: "Chungthang / Mangan Sector",
    time: "1 hour ago",
    message: "Water reservoir levels within controlled buffer. Sluice gates operating under standard protocol.",
    telemetry: "Discharge: 420 m³/s | Sluice: 2/4 Open"
  }
];

export default function AlertsStatusPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [smsSent, setSmsSent] = useState(false);

  const triggerEmergencyBroadcast = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 3000);
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
              </h2>
              <p className="text-xs text-[#515f74] mt-1">
                Real-time multi-satellite disaster warnings broadcast by SSDMA and Gangtok District Control.
              </p>
            </div>

            <button
              onClick={triggerEmergencyBroadcast}
              className="px-4 py-2.5 bg-[#ba1a1a] hover:bg-[#961212] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">cell_tower</span>
              <span>{smsSent ? "✅ Broadcast Dispatched!" : "Trigger Public Emergency SMS"}</span>
            </button>
          </div>

          {/* Alert Feed */}
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
        </main>
      </div>
    </div>
  );
}
