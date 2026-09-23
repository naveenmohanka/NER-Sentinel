"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

interface IncidentMarker {
  id: string;
  title: string;
  location: string;
  lat: number;
  lng: number;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  roadStatus: string;
  link?: string;
  icon: string;
}

export default function Live2DStreetIncidentMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapStyle, setMapStyle] = useState<"google_streets" | "google_hybrid" | "google_terrain">("google_streets");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);

  useEffect(() => {
    let maplibre: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const mlgl = await import("maplibre-gl");
        maplibre = (mlgl as any).default || mlgl;

        // Direct Google Maps Live Tiles Integration (Google Streets / Hybrid / Terrain)
        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              // 1. Google Live Streets (Google Standard Map)
              "google-streets": {
                type: "raster",
                tiles: [
                  "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
                  "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
                  "https://mt2.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
                  "https://mt3.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                ],
                tileSize: 256,
                attribution: "Google Maps"
              },
              // 2. Google Live Hybrid (Satellite + Google Road Network)
              "google-hybrid": {
                type: "raster",
                tiles: [
                  "https://mt0.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                  "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                  "https://mt2.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
                  "https://mt3.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                ],
                tileSize: 256,
                attribution: "Google Satellite Hybrid"
              },
              // 3. Google Live Terrain (Contour & Hillshade)
              "google-terrain": {
                type: "raster",
                tiles: [
                  "https://mt0.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
                  "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
                  "https://mt2.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
                  "https://mt3.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
                ],
                tileSize: 256,
                attribution: "Google Terrain"
              }
            },
            layers: [
              {
                id: "google-streets-layer",
                type: "raster",
                source: "google-streets",
                minzoom: 0,
                maxzoom: 22,
                layout: { visibility: "visible" }
              },
              {
                id: "google-hybrid-layer",
                type: "raster",
                source: "google-hybrid",
                minzoom: 0,
                maxzoom: 22,
                layout: { visibility: "none" }
              },
              {
                id: "google-terrain-layer",
                type: "raster",
                source: "google-terrain",
                minzoom: 0,
                maxzoom: 22,
                layout: { visibility: "none" }
              }
            ]
          },
          center: [88.5944, 27.2789], // Focused on Ranipool - NH10 - Gangtok Corridor
          zoom: 14.5,
          pitch: 0,
          bearing: 0,
          attributionControl: false
        });

        mapInstanceRef.current = map;

        // Add standard navigation controls
        map.addControl(new maplibre.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");

        map.on("load", async () => {
          // Fetch dynamic incidents from FastAPI
          const dynamicMarkers: IncidentMarker[] = [];

          try {
            const [alertsRes, reportsRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/v1/alerts`).then((r) => (r.ok ? r.json() : null)),
              fetch(`${API_BASE_URL}/api/v1/reports`).then((r) => (r.ok ? r.json() : null))
            ]);

            // Add alerts
            if (alertsRes?.alerts && Array.isArray(alertsRes.alerts)) {
              alertsRes.alerts.forEach((alt: any) => {
                if (alt.location?.latitude && alt.location?.longitude) {
                  dynamicMarkers.push({
                    id: alt.id,
                    title: alt.title,
                    location: alt.location.area || "Sikkim Corridor",
                    lat: alt.location.latitude,
                    lng: alt.location.longitude,
                    severity: alt.severity === "RED" ? "CRITICAL" : alt.severity === "ORANGE" ? "HIGH" : "MODERATE",
                    roadStatus: alt.type === "LANDSLIDE" ? "BLOCKED" : "WATCH",
                    link: "/risk-assessment",
                    icon: alt.type === "LANDSLIDE" ? "terrain" : "flood"
                  });
                }
              });
            }

            // Add reports
            if (reportsRes?.reports && Array.isArray(reportsRes.reports)) {
              reportsRes.reports.forEach((rep: any, idx: number) => {
                if (rep.lat && rep.lng) {
                  dynamicMarkers.push({
                    id: rep.report_id || `REP-${idx + 1}`,
                    title: `Citizen: ${rep.report_type} (${rep.device_id || "Field App"})`,
                    location: `Lat ${rep.lat.toFixed(4)}, Lng ${rep.lng.toFixed(4)}`,
                    lat: rep.lat,
                    lng: rep.lng,
                    severity: (rep.report_type || "").toLowerCase().includes("landslide") ? "CRITICAL" : "HIGH",
                    roadStatus: "SUBMERGED",
                    link: "/risk-assessment",
                    icon: "report_problem"
                  });
                }
              });
            }
          } catch (e) {
            console.error("Failed to load map markers from API:", e);
          }

          // Fallback ranipool hub point if empty
          if (dynamicMarkers.length === 0) {
            dynamicMarkers.push({
              id: "inc-1",
              title: "Ranipool Flash Inundation",
              location: "Ranipool River Basin (Gangtok)",
              lat: 27.2789,
              lng: 88.5944,
              severity: "CRITICAL",
              roadStatus: "BLOCKED",
              link: "/risk-assessment",
              icon: "flood"
            });
          }

          // Render Live Interactive Markers
          dynamicMarkers.forEach((inc) => {
            const isCritical = inc.severity === "CRITICAL";
            const isHigh = inc.severity === "HIGH";

            const el = document.createElement("div");
            el.className = "custom-incident-marker";
            el.style.display = "flex";
            el.style.flexDirection = "column";
            el.style.alignItems = "center";
            el.style.cursor = "pointer";

            el.innerHTML = `
              <div style="
                width: 38px;
                height: 38px;
                background: ${isCritical ? "#ba1a1a" : isHigh ? "#f97316" : "#eab308"};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 ${isCritical ? "16px rgba(186, 26, 26, 0.9)" : "8px rgba(0,0,0,0.3)"};
                color: white;
                font-size: 16px;
                transition: transform 0.2s ease;
              ">
                ${isCritical ? "⚠️" : isHigh ? "🌊" : "🪨"}
              </div>
              <div style="
                margin-top: 3px;
                background: ${isCritical ? "#ba1a1a" : "#1e293b"};
                color: white;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 6px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              ">
                ${inc.title.slice(0, 15)} ${inc.severity === "CRITICAL" ? "🔴" : ""}
              </div>
            `;

            el.addEventListener("click", () => {
              setSelectedIncident(inc);
              map.flyTo({ center: [inc.lng, inc.lat], zoom: 16.0, duration: 1200 });
              if (inc.link) {
                setTimeout(() => router.push(inc.link!), 1500);
              }
            });

            const marker = new maplibre.Marker({ element: el })
              .setLngLat([inc.lng, inc.lat])
              .setPopup(
                new maplibre.Popup({ offset: 25 }).setHTML(`
                  <div style="font-weight:700; color:#1e293b; font-size:13px;">${inc.title}</div>
                  <div style="font-size:11px; color:#ba1a1a; margin-top:2px;"><b>${inc.severity} Priority</b> • Status: ${inc.roadStatus}</div>
                  <div style="font-size:11px; color:#64748b;">${inc.location}</div>
                  ${inc.link ? '<div style="margin-top:4px; font-size:10px; color:#2563eb; font-weight:700;">Click marker to view Deep Risk Assessment →</div>' : ''}
                `)
              )
              .addTo(map);

            markersRef.current.push(marker);
          });
        });
      } catch (err) {
        console.error("2D Map initialization error:", err);
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [router]);

  const switchGoogleLayer = (style: "google_streets" | "google_hybrid" | "google_terrain") => {
    setMapStyle(style);
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setLayoutProperty("google-streets-layer", "visibility", style === "google_streets" ? "visible" : "none");
    map.setLayoutProperty("google-hybrid-layer", "visibility", style === "google_hybrid" ? "visible" : "none");
    map.setLayoutProperty("google-terrain-layer", "visibility", style === "google_terrain" ? "visible" : "none");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const map = mapInstanceRef.current;
    if (!map || !searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();
    if (q.includes("ranipool")) {
      map.flyTo({ center: [88.5944, 27.2789], zoom: 16.5, duration: 1500 });
    } else if (q.includes("gangtok")) {
      map.flyTo({ center: [88.6138, 27.3314], zoom: 15.5, duration: 1500 });
    } else if (q.includes("singtam")) {
      map.flyTo({ center: [88.4992, 27.2317], zoom: 16.0, duration: 1500 });
    } else if (q.includes("bhusuk")) {
      map.flyTo({ center: [88.6200, 27.3500], zoom: 16.0, duration: 1500 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px]">
      {/* MapLibre DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

      {/* Top Floating Controls: Search & Google Maps Layer Switcher */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200/80 px-2.5 py-1.5 min-w-[240px] max-w-sm">
          <span className="material-symbols-outlined text-gray-400 text-[18px] mr-1.5">search</span>
          <input
            type="text"
            placeholder="Search Ranipool, Singtam, NH-10..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs text-gray-800 bg-transparent outline-none placeholder-gray-400 font-medium"
          />
          <button type="submit" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 transition-colors">
            Go
          </button>
        </form>

        {/* Google Map Mode Switcher */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-200/80 p-1 gap-1">
          <button
            type="button"
            onClick={() => switchGoogleLayer("google_streets")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mapStyle === "google_streets"
                ? "bg-[#1b1b1d] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">map</span>
            <span>Google Streets</span>
          </button>

          <button
            type="button"
            onClick={() => switchGoogleLayer("google_hybrid")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mapStyle === "google_hybrid"
                ? "bg-[#1b1b1d] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">satellite_alt</span>
            <span>Satellite Hybrid</span>
          </button>

          <button
            type="button"
            onClick={() => switchGoogleLayer("google_terrain")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              mapStyle === "google_terrain"
                ? "bg-[#1b1b1d] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">terrain</span>
            <span>Terrain</span>
          </button>
        </div>
      </div>

      {/* Selected Incident Drawer / Bottom Banner */}
      {selectedIncident && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md border border-gray-200 rounded-xl p-3 shadow-xl z-10 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm ${
              selectedIncident.severity === "CRITICAL" ? "bg-[#ba1a1a]" : "bg-orange-600"
            }`}>
              <span className="material-symbols-outlined text-[20px]">{selectedIncident.icon}</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>{selectedIncident.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-[#ba1a1a] font-bold">
                  {selectedIncident.severity}
                </span>
              </h4>
              <p className="text-[11px] text-gray-600">{selectedIncident.location} • Status: <b>{selectedIncident.roadStatus}</b></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIncident.link && (
              <button
                onClick={() => router.push(selectedIncident.link!)}
                className="px-3 py-1.5 bg-[#ba1a1a] hover:bg-[#961212] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                Deep Risk Analysis →
              </button>
            )}
            <button
              onClick={() => setSelectedIncident(null)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
