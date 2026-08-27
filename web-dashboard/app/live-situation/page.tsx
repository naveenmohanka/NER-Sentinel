"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

export interface Incident {
  id: string;
  title: string;
  location: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  roadStatus: "BLOCKED" | "CLEAR" | "SUBMERGED";
  type: "Incident" | "Damage" | "Weather Alert";
  description: string;
  updated: string;
  icon: string;
  link?: string;
  mapCoords?: { top: string; left: string };
}

export interface ResponderTeam {
  id: string;
  name: string;
  code: string;
  location: string;
  status: "EN ROUTE" | "ON SITE" | "STANDBY";
}

const mockIncidents: Incident[] = [
  {
    id: "inc-1",
    title: "Ranipool Flash Inundation",
    location: "Ranipool River Basin",
    severity: "CRITICAL",
    roadStatus: "BLOCKED",
    type: "Incident",
    description: "Teesta feeder river level rising rapidly. Safe evacuation corridor active.",
    updated: "Updated 2 min ago",
    icon: "flood",
    link: "/risk-assessment",
    mapCoords: { top: "40%", left: "45%" },
  },
  {
    id: "inc-2",
    title: "NH-10 Himalayan Debris Slide",
    location: "29th Mile / Coronation Cut",
    severity: "HIGH",
    roadStatus: "BLOCKED",
    type: "Damage",
    description: "Hill slope failure along NH-10. Traffic rerouted via alternate NH-717A corridor.",
    updated: "Updated 5 min ago",
    icon: "traffic",
    mapCoords: { top: "55%", left: "35%" },
  },
  {
    id: "inc-3",
    title: "Singtam Teesta Basin Surge",
    location: "Singtam Valley",
    severity: "HIGH",
    roadStatus: "SUBMERGED",
    type: "Weather Alert",
    description: "Glacial & monsoon runoff surge along Teesta riverbed banks.",
    updated: "Updated 12 min ago",
    icon: "water_drop",
    mapCoords: { top: "30%", left: "60%" },
  },
  {
    id: "inc-4",
    title: "Rangpo Hydel Substation Watch",
    location: "Rangpo Border",
    severity: "MODERATE",
    roadStatus: "CLEAR",
    type: "Damage",
    description: "Preventative sandbagging and backup hydro-telemetry active.",
    updated: "Updated 25 min ago",
    icon: "bolt",
  },
];

const mockTeams: ResponderTeam[] = [
  {
    id: "team-1",
    name: "SDRF Sikkim Alpha",
    code: "SA",
    location: "Ranipool Sector",
    status: "EN ROUTE",
  },
  {
    id: "team-2",
    name: "NDRF 1st Bn (Patgaon)",
    code: "NB",
    location: "Singtam Valley",
    status: "ON SITE",
  },
];

export default function LiveSituationPage() {
  const router = useRouter();

  // Filters State
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [roadFilter, setRoadFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilterOverlay, setShowFilterOverlay] = useState<boolean>(false);

  // Dynamic Incident Filtering
  const filteredIncidents = useMemo(() => {
    return mockIncidents.filter((inc) => {
      // Risk filter
      if (
        riskFilter !== "All" &&
        inc.severity.toLowerCase() !== riskFilter.toLowerCase()
      ) {
        return false;
      }
      // Road Status filter
      if (
        roadFilter !== "All" &&
        inc.roadStatus.toLowerCase() !== roadFilter.toLowerCase()
      ) {
        return false;
      }
      // Type filter
      if (
        typeFilter !== "All" &&
        inc.type.toLowerCase() !== typeFilter.toLowerCase()
      ) {
        return false;
      }
      // Search filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesLocation = inc.location.toLowerCase().includes(q);
        const matchesDesc = inc.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocation && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [riskFilter, roadFilter, typeFilter, searchQuery]);

  const handleIncidentClick = (incident: Incident) => {
    if (incident.link) {
      router.push(incident.link);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <TopNavbar title="Live Situation" />

        {/* Workspace Canvas */}
        <main className="flex-1 p-4 md:p-6 space-y-4 max-w-[1500px] w-full mx-auto overflow-y-auto">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 bg-white rounded-2xl border border-[#dcd9db] shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#515f74] uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">
                filter_alt
              </span>
              <span>Filters:</span>
            </div>

            {/* Risk Level Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-white border border-[#dcd9db] rounded-lg px-3 py-1.5 text-xs font-medium text-[#1b1b1d] focus:ring-1 focus:ring-[#515f74] outline-none cursor-pointer"
            >
              <option value="All">Risk Level (All)</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>

            {/* Road Status Filter */}
            <select
              value={roadFilter}
              onChange={(e) => setRoadFilter(e.target.value)}
              className="bg-white border border-[#dcd9db] rounded-lg px-3 py-1.5 text-xs font-medium text-[#1b1b1d] focus:ring-1 focus:ring-[#515f74] outline-none cursor-pointer"
            >
              <option value="All">Road Status (All)</option>
              <option value="Blocked">Blocked</option>
              <option value="Submerged">Submerged</option>
              <option value="Clear">Clear</option>
            </select>

            {/* Report Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white border border-[#dcd9db] rounded-lg px-3 py-1.5 text-xs font-medium text-[#1b1b1d] focus:ring-1 focus:ring-[#515f74] outline-none cursor-pointer"
            >
              <option value="All">Report Type (All)</option>
              <option value="Incident">Incident</option>
              <option value="Damage">Damage</option>
              <option value="Weather Alert">Weather Alert</option>
            </select>

            {/* Time Range Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-white border border-[#dcd9db] rounded-lg px-3 py-1.5 text-xs font-medium text-[#1b1b1d] focus:ring-1 focus:ring-[#515f74] outline-none cursor-pointer"
            >
              <option value="All">Time Range</option>
              <option value="Live">Live</option>
              <option value="Last 24h">Last 24h</option>
              <option value="7 Days">7 Days</option>
            </select>

            {/* Apply Filters Button */}
            <button
              type="button"
              onClick={() => {
                // Reset or re-apply
                if (
                  riskFilter === "All" &&
                  roadFilter === "All" &&
                  typeFilter === "All"
                ) {
                  setRiskFilter("All");
                }
              }}
              className="ml-auto px-4 py-1.5 bg-[#515f74] hover:bg-[#3d4858] text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
            >
              Apply Filters
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
            {/* Left Column: Live Incident Map */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm flex flex-col flex-1 h-full relative overflow-hidden">
                {/* Map Header */}
                <div className="p-3.5 border-b border-[#e2e8f0] flex justify-between items-center bg-white z-10">
                  <h3 className="text-base md:text-lg font-bold text-[#1b1b1d] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#515f74]">
                      map
                    </span>
                    <span>Live Incident Map</span>
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowFilterOverlay(!showFilterOverlay)}
                    className="px-3 py-1.5 text-xs font-medium border border-[#dcd9db] rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      filter_list
                    </span>
                    <span>Filter</span>
                  </button>
                </div>

                {/* Map View Canvas */}
                <div className="flex-1 relative bg-slate-200 overflow-hidden min-h-[480px]">
                  {/* Top Map Action Bar (Search & Quick Tools) */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none gap-3">
                    {/* Search Input Box */}
                    <div className="flex-1 max-w-md pointer-events-auto relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                        search
                      </span>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search Location, Village, or Zone..."
                        className="w-full pl-9 pr-4 py-2 bg-white/95 backdrop-blur-md border border-[#dcd9db] rounded-xl shadow-md text-xs text-[#1b1b1d] focus:outline-none focus:ring-2 focus:ring-[#515f74]"
                      />
                    </div>

                    {/* Quick Tools */}
                    <div className="flex gap-2 pointer-events-auto">
                      <button
                        type="button"
                        title="Fullscreen"
                        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#dcd9db] flex items-center justify-center hover:bg-gray-100 text-[#515f74] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          fullscreen
                        </span>
                      </button>
                      <button
                        type="button"
                        title="Share"
                        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#dcd9db] flex items-center justify-center hover:bg-gray-100 text-[#515f74] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          share
                        </span>
                      </button>
                      <button
                        type="button"
                        title="Refresh"
                        onClick={() => {
                          setSearchQuery("");
                          setRiskFilter("All");
                          setRoadFilter("All");
                        }}
                        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#dcd9db] flex items-center justify-center hover:bg-gray-100 text-[#515f74] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          refresh
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Map Graphic */}
                  <div
                    className="absolute inset-0 w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/live-situation-map.png')",
                    }}
                  />

                  {/* Map Markers Overlay */}
                  {/* Kalyanpur Flood Critical Marker (Clickable -> /risk-assessment) */}
                  <Link
                    href="/risk-assessment"
                    className="absolute top-[40%] left-[45%] flex flex-col items-center group cursor-pointer z-20 focus:outline-none"
                    title="Click to view Village Kalyanpur Risk Assessment"
                  >
                    <div className="relative flex items-center justify-center">
                      <span className="absolute w-8 h-8 rounded-full bg-red-600/30 animate-ping pointer-events-none" />
                      <div className="w-6 h-6 rounded-full bg-[#ba1a1a] border-2 border-white shadow-md flex items-center justify-center text-white relative z-10 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[14px]">
                          flood
                        </span>
                      </div>
                    </div>
                    <div className="mt-1 bg-white px-2 py-0.5 rounded shadow text-xs font-bold text-[#ba1a1a] border border-red-200 whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
                      Kalyanpur Flood
                    </div>
                  </Link>

                  {/* High Risk Marker (Singtam Valley Basin area) */}
                  <div className="absolute top-[30%] left-[60%] flex flex-col items-center group cursor-pointer z-10 pointer-events-none select-none">
                    <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[12px]">
                        water_drop
                      </span>
                    </div>
                  </div>

                  {/* Road Block Marker (Sector 7 / Panki area) */}
                  <div className="absolute top-[55%] left-[35%] flex flex-col items-center group cursor-pointer z-10 pointer-events-none select-none">
                    <div className="w-5 h-5 rounded-full bg-[#ba1a1a] border-2 border-white shadow flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[12px]">
                        block
                      </span>
                    </div>
                  </div>

                  {/* Overlay Controls Bottom Right */}
                  <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
                    <button
                      type="button"
                      aria-label="Zoom in"
                      className="w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1b1b1d]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="Zoom out"
                      className="w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1b1b1d]"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        remove
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label="My Location"
                      className="w-9 h-9 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-[#1b1b1d] mt-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        my_location
                      </span>
                    </button>
                  </div>

                  {/* Map Legend Bottom Left */}
                  <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 z-10 text-xs font-medium space-y-1.5">
                    <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      LEGEND
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#45464d]">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] border border-white shadow-2xs" />
                      <span>Critical Incident</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#45464d]">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white shadow-2xs" />
                      <span>High Risk</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#45464d]">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white shadow-2xs" />
                      <span>Resource</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#45464d]">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white shadow-2xs" />
                      <span>Ground Report</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Active Situations, Responder Status, KPI Cards */}
            <div className="flex flex-col gap-4 h-full">
              {/* Active Situations Panel */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm flex flex-col flex-1 min-h-[220px]">
                <div className="p-3.5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#1b1b1d]">
                    Active Situations
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRiskFilter("All");
                      setRoadFilter("All");
                    }}
                    className="text-[#515f74] text-xs font-semibold hover:underline"
                  >
                    View All
                  </button>
                </div>

                <div className="p-2.5 overflow-y-auto space-y-2 flex-grow max-h-[260px]">
                  {filteredIncidents.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-500">
                      No matching situations found.
                    </div>
                  ) : (
                    filteredIncidents.map((incident) => {
                      const isCritical = incident.severity === "CRITICAL";
                      const isHigh = incident.severity === "HIGH";

                      return (
                        <div
                          key={incident.id}
                          onClick={() => handleIncidentClick(incident)}
                          className={`bg-white p-3 rounded-xl border border-gray-200 shadow-2xs transition-all flex gap-3 ${
                            incident.link
                              ? "cursor-pointer hover:bg-slate-50/80"
                              : ""
                          } ${
                            isCritical
                              ? "border-l-4 border-l-[#ba1a1a]"
                              : isHigh
                              ? "border-l-4 border-l-orange-500"
                              : "border-l-4 border-l-yellow-500"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center ${
                              isCritical
                                ? "bg-[#ffdad6] text-[#ba1a1a]"
                                : isHigh
                                ? "bg-orange-100 text-orange-700"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {incident.icon}
                            </span>
                          </div>

                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className="text-sm font-bold text-[#1b1b1d] truncate">
                                {incident.title}
                              </h4>
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                                  isCritical
                                    ? "bg-red-50 text-[#ba1a1a] border-red-200"
                                    : isHigh
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-yellow-50 text-yellow-800 border-yellow-200"
                                }`}
                              >
                                {incident.severity}
                              </span>
                            </div>

                            <p className="text-xs text-[#515f74] truncate">
                              {incident.description}
                            </p>

                            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[12px]">
                                update
                              </span>
                              <span>{incident.updated}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Responder Status Panel */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm flex flex-col p-3.5 shrink-0">
                <div className="pb-2 border-b border-gray-100 mb-2">
                  <h3 className="text-sm font-bold text-[#1b1b1d] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#515f74] text-[18px]">
                      group
                    </span>
                    <span>Responder Status</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {mockTeams.map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-300">
                          {team.code}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#1b1b1d]">
                            {team.name}
                          </p>
                          <p className="text-[11px] text-[#515f74] flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">
                              location_on
                            </span>
                            <span>{team.location}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider border ${
                          team.status === "EN ROUTE"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPI Metrics Grid (2x2) */}
              <div className="grid grid-cols-2 gap-3 shrink-0">
                {/* Metric 1: Active Incidents */}
                <div className="bg-white rounded-xl p-3 border border-[#dcd9db] shadow-xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1 truncate">
                    Active Incidents
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#1b1b1d]">8</p>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#515f74]">
                      <span className="material-symbols-outlined text-[16px]">
                        warning
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Critical */}
                <div className="bg-white rounded-xl p-3 border border-[#dcd9db] shadow-xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1 truncate">
                    Critical
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#ba1a1a]">3</p>
                    <div className="w-8 h-8 rounded-full bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
                      <span
                        className="material-symbols-outlined text-[16px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        emergency
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Response Teams */}
                <div className="bg-white rounded-xl p-3 border border-[#dcd9db] shadow-xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1 truncate">
                    Response Teams
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#1b1b1d]">5</p>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#515f74]">
                      <span className="material-symbols-outlined text-[16px]">
                        group
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Field Reports */}
                <div className="bg-white rounded-xl p-3 border border-[#dcd9db] shadow-xs flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1 truncate">
                    Field Reports
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#1b1b1d]">12</p>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#515f74]">
                      <span className="material-symbols-outlined text-[16px]">
                        assignment
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

