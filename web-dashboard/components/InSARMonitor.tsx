"use client";

import { useState, useEffect } from "react";

interface InSARZone {
  zone_id: string;
  name: string;
  state: string;
  coordinates: { latitude: number; longitude: number };
  terrain: { elevation_m: number; slope_deg: number };
  insar_data: {
    satellite: string;
    technique: string;
    frequency_band: string;
    spatial_resolution_m: number;
    revisit_days: number;
    latest_acquisition: string;
  };
  deformation: {
    weekly_displacement_mm: number;
    cumulative_displacement_mm: number;
    velocity_mm_per_year: number;
    direction: string;
    coherence: number;
  };
  risk_assessment: {
    deformation_risk: string;
    risk_color: string;
    interpretation: string;
    landslide_eta: string;
  };
  monitoring_since: string;
  last_updated: string;
}

const riskStyles: Record<string, { bg: string; text: string; border: string; dot: string; glow: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-300", dot: "bg-red-500", glow: "shadow-red-200" },
  HIGH:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500", glow: "shadow-orange-200" },
  MODERATE: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500", glow: "shadow-yellow-200" },
  LOW:      { bg: "bg-green-50", text: "text-green-700", border: "border-green-300", dot: "bg-green-500", glow: "shadow-green-200" },
};

const riskIcons: Record<string, string> = {
  CRITICAL: "🔴",
  HIGH: "🟠",
  MODERATE: "🟡",
  LOW: "🟢",
};

export default function InSARMonitor() {
  const [zones, setZones] = useState<InSARZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<InSARZone | null>(null);
  const [summary, setSummary] = useState({ total: 0, critical: 0, high: 0 });

  useEffect(() => {
    const fetchInSAR = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/insar");
        if (res.ok) {
          const data = await res.json();
          setZones(data.zones);
          setSummary({
            total: data.total_zones,
            critical: data.critical_zones,
            high: data.high_risk_zones,
          });
        }
      } catch (err) {
        // Silent
      } finally {
        setLoading(false);
      }
    };
    fetchInSAR();
    const interval = setInterval(fetchInSAR, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
          <div className="space-y-2 mt-4">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm flex items-center gap-2">
              <span>📡</span>
              InSAR Ground Deformation Monitor
              <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-mono border border-white/30">
                SENTINEL-1
              </span>
            </h3>
            <p className="text-[10px] text-indigo-200 mt-0.5">
              PS-InSAR Persistent Scatterer Interferometry • C-band 5.405 GHz • 5m resolution
            </p>
          </div>
          <div className="flex gap-2 text-center">
            <div className="bg-white/15 px-2.5 py-1.5 rounded-lg border border-white/20">
              <p className="text-lg font-bold">{summary.total}</p>
              <p className="text-[8px] text-indigo-200">ZONES</p>
            </div>
            <div className="bg-red-500/30 px-2.5 py-1.5 rounded-lg border border-red-400/40">
              <p className="text-lg font-bold">{summary.critical}</p>
              <p className="text-[8px] text-red-200">CRITICAL</p>
            </div>
            <div className="bg-orange-500/30 px-2.5 py-1.5 rounded-lg border border-orange-400/40">
              <p className="text-lg font-bold">{summary.high}</p>
              <p className="text-[8px] text-orange-200">HIGH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Cards */}
      <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
        {zones.map((zone) => {
          const style = riskStyles[zone.risk_assessment.deformation_risk] || riskStyles.LOW;
          const isSelected = selectedZone?.zone_id === zone.zone_id;

          return (
            <div
              key={zone.zone_id}
              onClick={() => setSelectedZone(isSelected ? null : zone)}
              className={`${style.bg} border ${style.border} rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${style.glow} ${isSelected ? "ring-2 ring-indigo-400" : ""}`}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.dot} ${zone.risk_assessment.deformation_risk === "CRITICAL" ? "animate-pulse" : ""}`}></span>
                    <span className={`text-[10px] font-bold ${style.text} uppercase tracking-wider`}>
                      {riskIcons[zone.risk_assessment.deformation_risk]} {zone.risk_assessment.deformation_risk}
                    </span>
                    <span className="text-[9px] text-gray-400 font-mono">{zone.zone_id}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 mt-1 truncate">{zone.name}</h4>
                  <p className="text-[10px] text-gray-500">{zone.state} • {zone.coordinates.latitude.toFixed(4)}°N, {zone.coordinates.longitude.toFixed(4)}°E</p>
                </div>

                {/* Displacement Badge */}
                <div className={`text-center px-2.5 py-1.5 rounded-lg ${style.bg} border ${style.border}`}>
                  <p className={`text-sm font-bold font-mono ${style.text}`}>
                    {zone.deformation.weekly_displacement_mm.toFixed(1)}
                  </p>
                  <p className="text-[8px] text-gray-500">mm/week</p>
                </div>
              </div>

              {/* Expanded Detail */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 animate-in">
                  {/* Interpretation */}
                  <p className="text-[11px] text-gray-700 italic leading-relaxed">
                    &quot;{zone.risk_assessment.interpretation}&quot;
                  </p>

                  {/* Data Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white/80 rounded-md p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase">Cumulative</p>
                      <p className="text-xs font-bold font-mono text-gray-800">{zone.deformation.cumulative_displacement_mm.toFixed(1)} mm</p>
                    </div>
                    <div className="bg-white/80 rounded-md p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase">Velocity</p>
                      <p className="text-xs font-bold font-mono text-gray-800">{zone.deformation.velocity_mm_per_year.toFixed(0)} mm/yr</p>
                    </div>
                    <div className="bg-white/80 rounded-md p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase">Slope</p>
                      <p className="text-xs font-bold font-mono text-gray-800">{zone.terrain.slope_deg}°</p>
                    </div>
                    <div className="bg-white/80 rounded-md p-2 text-center border border-gray-100">
                      <p className="text-[9px] text-gray-400 uppercase">Elevation</p>
                      <p className="text-xs font-bold font-mono text-gray-800">{zone.terrain.elevation_m}m</p>
                    </div>
                  </div>

                  {/* ETA + Source */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-bold ${style.text}`}>
                      ⏰ Landslide ETA: {zone.risk_assessment.landslide_eta}
                    </span>
                    <span className="text-gray-400">
                      Direction: {zone.deformation.direction} • Coherence: {zone.deformation.coherence}
                    </span>
                  </div>

                  {/* Satellite Info */}
                  <div className="bg-indigo-50 rounded-md p-2 border border-indigo-200">
                    <p className="text-[9px] text-indigo-600 font-mono">
                      🛰️ {zone.insar_data.satellite} • {zone.insar_data.technique} • {zone.insar_data.frequency_band} • {zone.insar_data.spatial_resolution_m}m res • Revisit: {zone.insar_data.revisit_days} days
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <span className="text-[9px] text-gray-400 font-mono">
          Source: Sentinel-1 InSAR (Simulated) • Auto-refresh: 60s
        </span>
        <span className="text-[9px] text-gray-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          LIVE MONITORING
        </span>
      </div>
    </div>
  );
}
