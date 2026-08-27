"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LiveRiskMap() {
  const router = useRouter();

  const handlePriority1Click = () => {
    router.push("/risk-assessment");
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span
          className="material-symbols-outlined text-blue-600 text-[26px]"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          map
        </span>
        <h3 className="text-xl font-bold text-[#1b1b1d] tracking-tight">
          Live Risk &amp; Connectivity Map
        </h3>
      </div>

      {/* Map Canvas Box */}
      <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm overflow-hidden relative h-[520px]">
        {/* Background Map Graphic */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/map-bg.png')",
          }}
        >
          {/* Subtle overlay grid/gradient for tactical digital twin look */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Map Markers Overlay */}
        <div className="absolute inset-0">
          {/* Critical Kalyanpur Marker (Clickable) */}
          <Link
            href="/risk-assessment"
            className="absolute top-[48%] left-[58%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10 flex flex-col items-center focus:outline-none"
            title="Click to view Village Kalyanpur Risk Assessment"
          >
            {/* Pulsing Beacon Ring */}
            <span className="absolute -top-1 w-9 h-9 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
            <span className="absolute -top-0.5 w-7 h-7 rounded-full bg-red-600/50 animate-pulse pointer-events-none" />

            {/* Red Pin Icon */}
            <div className="relative flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(186,26,26,0.5)] transition-transform duration-200 group-hover:scale-125">
              <span
                className="material-symbols-outlined text-[#ba1a1a] text-[34px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
            </div>

            {/* Marker Label Badge */}
            <div className="bg-[#ba1a1a] text-white font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-md mt-0.5 flex items-center gap-1 group-hover:bg-red-800 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Kalyanpur (Critical)</span>
            </div>
          </Link>

          {/* Secondary Orange Marker (New Kanpur City area) */}
          <div className="absolute top-[32%] left-[68%] -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-orange-500 text-[28px] drop-shadow-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>

          {/* Low Risk Green Marker (Naraina Medical area) */}
          <div className="absolute top-[65%] left-[48%] -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center pointer-events-none select-none">
            <span
              className="material-symbols-outlined text-emerald-600 text-[24px] drop-shadow-md"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              location_on
            </span>
          </div>
        </div>

        {/* Floating Top Right Stack: Priority 1 & Weather Intel */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 w-64 z-20">
          {/* Priority 1 Analysis Card (Clickable) */}
          <div
            onClick={handlePriority1Click}
            className="rounded-xl border-l-[5px] border-l-[#ba1a1a] p-3.5 bg-white/75 backdrop-blur-xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl hover:bg-white/85 hover:scale-[1.01] transition-all duration-200"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handlePriority1Click();
              }
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#ba1a1a] uppercase font-bold tracking-wider">
                Priority 1
              </span>
              <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[10px] font-mono font-bold tracking-tight">
                CRITICAL
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#1b1b1d] mb-2 tracking-tight">
              VILLAGE KALYANPUR
            </h4>

            <div className="text-xs space-y-1.5 mb-3">
              <div className="flex justify-between">
                <span className="text-[#45464d] font-semibold">Road:</span>
                <span className="text-[#ba1a1a] font-bold">BLOCKED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#45464d] font-semibold">
                  Ground Reports:
                </span>
                <span className="font-bold text-[#1b1b1d]">12</span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                router.push("/risk-assessment");
              }}
              className="w-full py-1.5 bg-[#ba1a1a] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#961212] transition-colors shadow-sm active:scale-95"
            >
              Dispatch
            </button>
          </div>

          {/* Weather Intelligence Card */}
          <div className="rounded-xl p-3.5 bg-white/75 backdrop-blur-xl border border-white/60 shadow-lg">
            <h5 className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-2.5 border-b border-gray-200/60 pb-1.5">
              Weather Intel
            </h5>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Current</span>
                <span className="font-mono font-bold text-[#1b1b1d]">82 mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Forecast</span>
                <span className="font-mono font-bold text-[#ba1a1a]">
                  105 mm
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Trend</span>
                <span className="text-[#ba1a1a] font-bold flex items-center gap-0.5 text-xs">
                  <span className="material-symbols-outlined text-[14px] font-bold">
                    arrow_upward
                  </span>
                  Increasing
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">
                  Affected Area
                </span>
                <span className="font-mono font-bold text-[#1b1b1d]">
                  4.2 km²
                </span>
              </div>
            </div>
          </div>

          {/* Map Sync Indicator */}
          <div className="rounded-lg border border-white/60 p-2 bg-white/75 backdrop-blur-xl flex items-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[14px] text-[#45464d]">
              info
            </span>
            <span className="text-[10px] font-medium text-[#45464d]">
              Map data syncs every 2 mins.
            </span>
          </div>
        </div>

        {/* Floating Bottom Left: Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl shadow-lg w-48 z-20 p-3 bg-white/75 backdrop-blur-xl border border-white/60">
          <h5 className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-2">
            Legend
          </h5>
          <div className="space-y-2.5">
            {/* Risk Level */}
            <div>
              <span className="text-[10px] font-bold text-[#1b1b1d] mb-1 block">
                Risk Level
              </span>
              <div className="space-y-1 text-[11px] text-[#45464d] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span>Critical</span>
                </div>
              </div>
            </div>

            {/* Road Status */}
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-[10px] font-bold text-[#1b1b1d] mb-1 block">
                Road Status
              </span>
              <div className="space-y-1 text-[11px] text-[#45464d] font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-emerald-500" />
                  <span>Open</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-yellow-500" />
                  <span>At Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-orange-500" />
                  <span>Partially Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 rounded-full bg-red-600" />
                  <span>Blocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

