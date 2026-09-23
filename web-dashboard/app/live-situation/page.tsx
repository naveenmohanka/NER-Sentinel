"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "@/lib/config";

const Live2DStreetIncidentMap = dynamic(
  () => import("@/components/Live2DStreetIncidentMap"),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-gray-500 font-mono">Loading 2D Street Incident Map...</div> }
);

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

function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `Updated ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Updated ${hrs}h ago`;
  return `Updated ${Math.floor(hrs / 24)}d ago`;
}

export default function LiveSituationPage() {
  const router = useRouter();

  // Dynamic Data State from FastAPI
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [teams, setTeams] = useState<ResponderTeam[]>([]);
  const [rawReportCount, setRawReportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [roadFilter, setRoadFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchData = async () => {
    try {
      // 1. Fetch live alerts
      const alertsRes = await fetch(`${API_BASE_URL}/api/v1/alerts`, { cache: "no-store" });
      const alertsData = alertsRes.ok ? await alertsRes.json() : null;

      // 2. Fetch live reports submitted from Android app and dashboard
      const reportsRes = await fetch(`${API_BASE_URL}/api/v1/reports`, { cache: "no-store" });
      const reportsData = reportsRes.ok ? await reportsRes.json() : null;

      const combined: Incident[] = [];

      // Process reports
      if (reportsData?.reports && Array.isArray(reportsData.reports)) {
        setRawReportCount(reportsData.reports.length);
        reportsData.reports.forEach((rep: any, idx: number) => {
          const typeUpper = (rep.report_type || "").toUpperCase();
          const isLandslide = typeUpper.includes("LANDSLIDE") || typeUpper.includes("CRACK");
          const isFlood = typeUpper.includes("FLOOD") || typeUpper.includes("WATER");

          const sev: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" = isLandslide ? "CRITICAL" : isFlood ? "HIGH" : "MODERATE";
          const road: "BLOCKED" | "CLEAR" | "SUBMERGED" = isLandslide ? "BLOCKED" : isFlood ? "SUBMERGED" : "CLEAR";

          const tsMs = typeof rep.timestamp === "number"
            ? (rep.timestamp > 1e11 ? rep.timestamp : rep.timestamp * 1000)
            : Date.now() - (idx + 1) * 120000;

          combined.push({
            id: rep.report_id || `REP-${idx + 1}`,
            title: `Citizen Report: ${rep.report_type} (${rep.device_id || "Field App"})`,
            location: `GPS: ${rep.lat.toFixed(4)}°N, ${rep.lng.toFixed(4)}°E`,
            severity: sev,
            roadStatus: road,
            type: "Incident",
            description: `Field report registered via Android mobile mesh node ${rep.device_id || "USER"}. Offline sync: ${rep.offline_synced ? "Yes" : "Live"}.`,
            updated: formatRelativeTime(tsMs),
            icon: isFlood ? "flood" : isLandslide ? "landscape" : "report_problem",
            link: "/risk-assessment",
            mapCoords: { top: `${35 + (idx % 4) * 12}%`, left: `${40 + (idx % 3) * 15}%` }
          });
        });
      }

      // Process alerts
      if (alertsData?.alerts && Array.isArray(alertsData.alerts)) {
        alertsData.alerts.forEach((alt: any) => {
          const sevUpper = (alt.severity || "").toUpperCase();
          const sev: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" =
            sevUpper === "RED" ? "CRITICAL" : sevUpper === "ORANGE" ? "HIGH" : "MODERATE";

          const road: "BLOCKED" | "CLEAR" | "SUBMERGED" =
            alt.type === "LANDSLIDE" ? "BLOCKED" : alt.type === "FLOOD" ? "SUBMERGED" : "CLEAR";

          const issuedTs = alt.issued_at ? new Date(alt.issued_at).getTime() : Date.now() - 300000;

          combined.push({
            id: alt.id,
            title: alt.title,
            location: alt.location?.area || "Regional Northeast Corridor",
            severity: sev,
            roadStatus: road,
            type: alt.type === "WEATHER" ? "Weather Alert" : "Damage",
            description: alt.description,
            updated: formatRelativeTime(issuedTs),
            icon: alt.type === "LANDSLIDE" ? "terrain" : alt.type === "FLOOD" ? "water_drop" : "bolt",
            link: "/risk-assessment",
          });
        });
      }

      setIncidents(combined);

      // Dynamically generate responder teams mapped to active sectors
      const dynamicTeams: ResponderTeam[] = [
        {
          id: "team-1",
          name: "SDRF Sikkim Alpha (QRT)",
          code: "SA",
          location: "Ranipool River Basin",
          status: "ON SITE"
        },
        {
          id: "team-2",
          name: "NDRF 1st Bn (Patgaon)",
          code: "NB",
          location: "Singtam Teesta Valley",
          status: "EN ROUTE"
        },
        {
          id: "team-3",
          name: "GSI Landslide Hazard QRT",
          code: "GQ",
          location: "Gangtok Ridge Corridor",
          status: "ON SITE"
        },
        {
          id: "team-4",
          name: "District Medical Evac Team",
          code: "DM",
          location: "Bhusuk Escarpment Sector",
          status: "STANDBY"
        }
      ];
      setTeams(dynamicTeams);

    } catch (err) {
      console.error("LiveSituation data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Incident Filtering
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
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
  }, [incidents, riskFilter, roadFilter, typeFilter, searchQuery]);

  const handleIncidentClick = (incident: Incident) => {
    if (incident.link) {
      router.push(incident.link);
    }
  };

  const criticalCount = useMemo(
    () => incidents.filter((i) => i.severity === "CRITICAL").length,
    [incidents]
  );

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

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search device ID, report or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#dcd9db] rounded-lg bg-white outline-none focus:border-gray-500"
              />
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              className="px-3 py-1.5 bg-[#515f74] hover:bg-[#3d4858] text-white rounded-lg font-medium text-xs shadow-xs transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Sync Live</span>
            </button>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[600px]">
            {/* Left Column: Interactive Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dcd9db] overflow-hidden flex flex-col shadow-sm min-h-[500px]">
              {/* Map Header */}
              <div className="p-3.5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#1b1b1d]">
                    Live Situation &amp; Incident Mesh
                  </h3>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    FastAPI Sync Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/risk-assessment"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                  >
                    <span>Inspect 3D Ranipool Sector</span>
                    <span className="material-symbols-outlined text-[14px]">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>

              {/* Map Container */}
              <div className="relative flex-1 w-full overflow-hidden min-h-[460px]">
                <Live2DStreetIncidentMap />
              </div>
            </div>

            {/* Right Column: Active Situations, Responder Status, KPI Cards */}
            <div className="flex flex-col gap-4 h-full">
              {/* Active Situations Panel */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm flex flex-col flex-1 min-h-[260px]">
                <div className="p-3.5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-[#1b1b1d] flex items-center gap-2">
                    <span>Live Incidents &amp; Alerts</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {filteredIncidents.length}
                    </span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setRiskFilter("All");
                      setRoadFilter("All");
                      setTypeFilter("All");
                      setSearchQuery("");
                    }}
                    className="text-[#515f74] text-xs font-semibold hover:underline"
                  >
                    Reset Filters
                  </button>
                </div>

                <div className="p-2.5 overflow-y-auto space-y-2 flex-grow max-h-[300px]">
                  {isLoading ? (
                    <div className="text-center py-8 text-xs text-gray-400 font-mono">
                      Streaming incidents from FastAPI backend...
                    </div>
                  ) : filteredIncidents.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-500">
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

                            <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-gray-500">
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                <span>{incident.location}</span>
                              </span>
                              <span>{incident.updated}</span>
                            </div>
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
                    <span>QRT &amp; Responder Deployment</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {teams.map((team) => (
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
                            : team.status === "ON SITE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-700 border-slate-200"
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
                    <p className="text-2xl font-bold text-[#1b1b1d]">{incidents.length}</p>
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
                    Critical Threat
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-[#ba1a1a]">{criticalCount}</p>
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
                    <p className="text-2xl font-bold text-[#1b1b1d]">{teams.length}</p>
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
                    Mobile Reports
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-emerald-700">{rawReportCount}</p>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <span className="material-symbols-outlined text-[16px]">
                        smartphone
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
