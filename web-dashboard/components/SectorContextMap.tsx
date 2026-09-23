"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/lib/config";

interface SectorContextMapProps {
  targetLat?: number;
  targetLng?: number;
  sectorName?: string;
  elevation?: number;
  riskLevel?: string;
}

export default function SectorContextMap({
  targetLat = 27.2789,
  targetLng = 88.5944,
  sectorName = "Ranipool Sector",
  elevation = 766,
  riskLevel = "CRITICAL",
}: SectorContextMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeView, setActiveView] = useState<"3D" | "2D">("3D");
  const [showStreets, setShowStreets] = useState(true);
  const [isRegionalView, setIsRegionalView] = useState(false);

  const toggleRegionalView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isRegionalView) {
      // Fly out to Regional Northeast Global Context
      map.flyTo({
        center: [targetLng, targetLat],
        zoom: 8.5,
        pitch: 35,
        bearing: 0,
        duration: 1800,
        essential: true,
      });
      setIsRegionalView(true);
    } else {
      // Fly back to target sector 3D
      map.flyTo({
        center: [targetLng, targetLat],
        zoom: 14.8,
        pitch: activeView === "3D" ? 68 : 0,
        bearing: -25,
        duration: 1800,
        essential: true,
      });
      setIsRegionalView(false);
    }
  };

  // Re-center and update danger buffer whenever target coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo({
      center: [targetLng, targetLat],
      zoom: 14.8,
      pitch: activeView === "3D" ? 68 : 0,
      bearing: -20,
      duration: 1600,
      essential: true,
    });

    const circleSource = map.getSource("danger-buffer");
    if (circleSource) {
      const center = [targetLng, targetLat];
      const radiusKm = 0.45;
      const points = 36;
      const coords = [];
      const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
      const distanceY = radiusKm / 110.574;

      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        const x = distanceX * Math.cos(theta);
        const y = distanceY * Math.sin(theta);
        coords.push([center[0] + x, center[1] + y]);
      }

      circleSource.setData({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      });
    }
  }, [targetLat, targetLng, activeView]);

  useEffect(() => {
    let maplibre: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const mlgl = await import("maplibre-gl");
        maplibre = (mlgl as any).default || mlgl;

        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              "satellite-tiles": {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                attribution: "Esri, NASA, USGS",
              },
              "hybrid-roads": {
                type: "raster",
                tiles: [
                  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                maxzoom: 19,
              },
              "hybrid-labels": {
                type: "raster",
                tiles: [
                  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                maxzoom: 19,
              },
              "terrain-dem": {
                type: "raster-dem",
                encoding: "terrarium",
                tiles: ["/api/terrain/{z}/{x}/{y}.png"],
                tileSize: 256,
                maxzoom: 15,
              },
            },
            layers: [
              {
                id: "satellite-layer",
                type: "raster",
                source: "satellite-tiles",
                minzoom: 0,
                maxzoom: 19,
              },
              {
                id: "hybrid-roads-layer",
                type: "raster",
                source: "hybrid-roads",
                minzoom: 10,
                maxzoom: 19,
                paint: { "raster-opacity": 0.95 },
              },
              {
                id: "hybrid-labels-layer",
                type: "raster",
                source: "hybrid-labels",
                minzoom: 10,
                maxzoom: 19,
                paint: { "raster-opacity": 1.0 },
              },
            ],
            terrain: {
              source: "terrain-dem",
              exaggeration: 2.1,
            },
          },
          center: [targetLng, targetLat],
          zoom: 14.8,
          pitch: 68,
          bearing: -25,
          attributionControl: true,
        });

        mapInstanceRef.current = map;
        map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "bottom-right");

        // Suppress tile load warning toasts in Next.js dev overlay
        map.on("error", () => {});

        map.on("load", async () => {
          // Critical Danger Perimeter Circle
          const center = [targetLng, targetLat];
          const radiusKm = 0.45;
          const points = 36;
          const coords = [];
          const distanceX = radiusKm / (111.32 * Math.cos((center[1] * Math.PI) / 180));
          const distanceY = radiusKm / 110.574;

          for (let i = 0; i <= points; i++) {
            const theta = (i / points) * (2 * Math.PI);
            const x = distanceX * Math.cos(theta);
            const y = distanceY * Math.sin(theta);
            coords.push([center[0] + x, center[1] + y]);
          }

          const dangerBufferGeoJson = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coords],
            },
          };

          map.addSource("danger-buffer", { type: "geojson", data: dangerBufferGeoJson });

          map.addLayer({
            id: "danger-buffer-fill",
            type: "fill",
            source: "danger-buffer",
            paint: {
              "fill-color": "#ef4444",
              "fill-opacity": 0.22,
            },
          });

          map.addLayer({
            id: "danger-buffer-outline",
            type: "line",
            source: "danger-buffer",
            paint: {
              "line-color": "#dc2626",
              "line-width": 2.5,
              "line-dasharray": [2, 2],
            },
          });

          // Render Dynamic Ground Report Markers from FastAPI
          try {
            const [repRes, altRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/v1/reports`).then((r) => (r.ok ? r.json() : null)),
              fetch(`${API_BASE_URL}/api/v1/alerts`).then((r) => (r.ok ? r.json() : null)),
            ]);

            const liveMarkers: any[] = [];

            if (repRes?.reports && Array.isArray(repRes.reports)) {
              repRes.reports.forEach((rep: any, idx: number) => {
                if (rep.lat && rep.lng) {
                  liveMarkers.push({
                    id: rep.report_id || `RPT-${idx + 1}`,
                    label: `${(rep.report_type || "Incident").toUpperCase()} (${rep.device_id || "Field Node"})`,
                    lat: rep.lat,
                    lng: rep.lng,
                    type: (rep.report_type || "").toLowerCase().includes("landslide") ? "landslide" : "flood",
                    time: "Live Sync",
                    sector: "Field Telemetry",
                  });
                }
              });
            }

            if (altRes?.alerts && Array.isArray(altRes.alerts)) {
              altRes.alerts.slice(0, 4).forEach((alt: any) => {
                if (alt.location?.latitude && alt.location?.longitude) {
                  liveMarkers.push({
                    id: alt.id,
                    label: alt.title,
                    lat: alt.location.latitude,
                    lng: alt.location.longitude,
                    type: alt.type === "LANDSLIDE" ? "landslide" : "flood",
                    time: "Satellite Alert",
                    sector: alt.location.area || "NER Corridor",
                  });
                }
              });
            }

            // Always add the current target focal point
            liveMarkers.push({
              id: "ACTIVE-LOC",
              label: `Active Sector: ${sectorName}`,
              lat: targetLat,
              lng: targetLng,
              type: "evac",
              time: "Live Targeted",
              sector: sectorName,
            });

            liveMarkers.forEach((gr) => {
              const el = document.createElement("div");
              el.innerHTML =
                gr.type === "landslide"
                  ? "🪨"
                  : gr.type === "flood"
                  ? "🌊"
                  : gr.type === "blockage"
                  ? "🚧"
                  : "📍";
              el.style.fontSize = "20px";
              el.style.padding = "4px";
              el.style.background = "rgba(15, 23, 42, 0.85)";
              el.style.borderRadius = "50%";
              el.style.border = "2px solid #ef4444";
              el.style.boxShadow = "0 0 10px rgba(239, 68, 68, 0.8)";
              el.style.cursor = "pointer";

              new maplibre.Marker({ element: el })
                .setLngLat([gr.lng, gr.lat])
                .setPopup(
                  new maplibre.Popup().setHTML(`
                    <div style="font-weight:700; color:#ba1a1a; font-size:12px;">${gr.id}: ${gr.label}</div>
                    <div style="font-size:10px; color:#64748b;">${gr.time}</div>
                    <div style="font-size:10px; color:#0f172a; margin-top:2px;"><b>${gr.sector}</b></div>
                  `)
                )
                .addTo(map);
            });
          } catch (e) {
            console.error("Failed to load live reports for 3D map:", e);
          }
        });
      } catch (err) {
        console.error("Sector map initialization error:", err);
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const toggleView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (activeView === "3D") {
      map.flyTo({ pitch: 0, bearing: 0, duration: 1200 });
      setActiveView("2D");
    } else {
      map.flyTo({ pitch: 68, bearing: -25, duration: 1200 });
      setActiveView("3D");
    }
  };

  const toggleStreetGrid = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextState = !showStreets;
    const visibility = nextState ? "visible" : "none";

    if (map.getLayer("hybrid-roads-layer")) {
      map.setLayoutProperty("hybrid-roads-layer", "visibility", visibility);
    }
    if (map.getLayer("hybrid-labels-layer")) {
      map.setLayoutProperty("hybrid-labels-layer", "visibility", visibility);
    }
    setShowStreets(nextState);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950">
      {/* 3D WebGL Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Tactical Top Bar */}
      <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Controls */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white rounded-lg border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-none">
              {isRegionalView ? "Northeast Regional Overview" : `${sectorName} 3D Sector`}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleView}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-900 rounded-lg font-bold text-xs shadow-md border border-gray-200 transition-colors shrink-0 cursor-pointer"
          >
            {activeView === "3D" ? "🏔️ 3D View" : "🗺️ 2D View"}
          </button>

          <button
            type="button"
            onClick={toggleStreetGrid}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs shadow-md border border-emerald-200 transition-colors shrink-0 cursor-pointer"
          >
            {showStreets ? "🛣️ Roads: ON" : "🛣️ Roads: OFF"}
          </button>

          <button
            type="button"
            onClick={toggleRegionalView}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow-md border transition-colors shrink-0 cursor-pointer ${
              isRegionalView
                ? "bg-blue-600 text-white border-blue-500 hover:bg-blue-700"
                : "bg-white/95 hover:bg-white text-slate-800 border-gray-200"
            }`}
          >
            {isRegionalView ? `📍 Focus ${sectorName}` : "🌍 Regional Overview"}
          </button>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
          <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-tight shadow-md text-white ${
            riskLevel === "CRITICAL"
              ? "bg-[#ba1a1a]"
              : riskLevel === "HIGH"
              ? "bg-orange-600"
              : riskLevel === "MEDIUM"
              ? "bg-yellow-600"
              : "bg-emerald-600"
          }`}>
            {riskLevel} RISK
          </span>
          <span className="bg-slate-800 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-tight shadow-md">
            AI MONITORED
          </span>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white rounded-xl p-2.5 border border-white/20 text-[11px] space-y-1.5 shadow-lg max-w-xs pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500" />
          <span>450m Dynamic Hazard Perimeter</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
          <span>📍 Lat: {targetLat.toFixed(4)}, Lng: {targetLng.toFixed(4)} | Elev: {elevation}m</span>
        </div>
      </div>

      {/* Scoped CSS */}
      <style jsx global>{`
        .maplibregl-ctrl-bottom-right {
          bottom: 28px !important;
          right: 12px !important;
        }
        .maplibregl-ctrl-bottom-right .maplibregl-ctrl {
          margin: 0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35) !important;
          overflow: hidden !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
