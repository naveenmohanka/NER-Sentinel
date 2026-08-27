"use client";

export default function ActiveIncidentsLog() {
  return (
    <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
        <div>
          <h3 className="text-lg font-bold text-[#1b1b1d] tracking-tight">
            Active Incidents Log
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[#515f74] mt-0.5">
            <span className="material-symbols-outlined text-[16px] text-[#515f74]">
              visibility
            </span>
            <span>
              Viewing <strong className="text-[#1b1b1d]">02</strong> active
              incidents
            </span>
          </div>
        </div>

        {/* Filter / Sort Actions */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#515f74]">
          <button
            type="button"
            className="hover:text-black transition-colors focus:outline-none"
          >
            Incident Type
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            className="hover:text-black transition-colors focus:outline-none"
          >
            Severity
          </button>
          <span className="text-gray-300">|</span>
          <button
            type="button"
            className="hover:text-black transition-colors focus:outline-none"
          >
            Location
          </button>
        </div>
      </div>

      {/* Incident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Critical Flood Alert */}
        <div className="bg-red-500/5 border border-red-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-shadow">
          {/* Top Alert Header Banner */}
          <div className="bg-[#ba1a1a] text-white text-center py-1 font-bold text-xs uppercase tracking-wider">
            Critical Flood Alert
          </div>

          <div className="p-3.5 space-y-2.5">
            {/* Metadata Row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[10px] font-mono font-bold">
                  PRIORITY 2
                </span>
                <div className="flex items-center gap-1 text-[#ba1a1a] font-bold text-xs">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <span>Critical</span>
                </div>
              </div>

              <div className="text-right text-[10px] leading-tight">
                <div className="flex items-center justify-end gap-1 font-bold text-[#ba1a1a]">
                  <span className="material-symbols-outlined text-[13px]">
                    schedule
                  </span>
                  <span>2 min ago</span>
                </div>
                <div className="text-[#76777d] mt-0.5">10:42 AM</div>
              </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-[#1b1b1d] leading-snug">
              Critical flood activity detected
            </h4>

            {/* Location */}
            <div className="flex items-center gap-1 text-[#515f74] text-xs">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              <span>Sector 4</span>
            </div>

            {/* Bottom Status / Reports */}
            <div className="flex justify-between items-center pt-1 border-t border-red-100">
              <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[10px] font-bold uppercase tracking-wider">
                Team Dispatched
              </span>
              <span className="text-[11px] text-[#515f74] font-medium">
                12 reports
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Road Blockage Alert */}
        <div className="bg-orange-500/5 border border-orange-200/80 rounded-xl overflow-hidden shadow-2xs hover:shadow-sm transition-shadow">
          {/* Top Alert Header Banner */}
          <div className="bg-orange-500 text-white text-center py-1 font-bold text-xs uppercase tracking-wider">
            Major debris &amp; Accident Alert
          </div>

          <div className="p-3.5 space-y-2.5">
            {/* Metadata Row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-mono font-bold">
                  PRIORITY 3
                </span>
                <div className="flex items-center gap-1 text-orange-600 font-bold text-xs">
                  <span
                    className="material-symbols-outlined text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    warning
                  </span>
                  <span>High</span>
                </div>
              </div>

              <div className="text-right text-[10px] leading-tight">
                <div className="flex items-center justify-end gap-1 font-bold text-orange-600">
                  <span className="material-symbols-outlined text-[13px]">
                    schedule
                  </span>
                  <span>11 min ago</span>
                </div>
                <div className="text-[#76777d] mt-0.5">10:31 AM</div>
              </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-[#1b1b1d] leading-snug">
              Major debris on main route
            </h4>

            {/* Location */}
            <div className="flex items-center gap-1 text-[#515f74] text-xs">
              <span className="material-symbols-outlined text-[14px]">
                location_on
              </span>
              <span>Sector 7</span>
            </div>

            {/* Bottom Status / Reports */}
            <div className="flex justify-between items-center pt-1 border-t border-orange-100">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold uppercase tracking-wider">
                Responding
              </span>
              <span className="text-[11px] text-[#515f74] font-medium">
                Status: En Route
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

