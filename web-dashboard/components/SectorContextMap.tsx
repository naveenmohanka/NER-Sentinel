"use client";

import { useEffect, useRef, useState } from "react";

const groundReports = [
  { id: "GR-01", label: "Slope Debris on NH-10", lat: 27.2810, lng: 88.5920, type: "landslide", time: "10:42 AM" },
  { id: "GR-02", label: "Water Level Surge (+1.4m)", lat: 27.2770, lng: 88.5955, type: "flood", time: "10:35 AM" },
  { id: "GR-03", label: "Road Access Cut (Ranipool Bridge)", lat: 27.2795, lng: 88.5938, type: "blockage", time: "10:18 AM" },
  { id: "GR-04", label: "Civil Evacuation in Progress", lat: 27.2750, lng: 88.5970, type: "evac", time: "10:05 AM" }
];

export default function SectorContextMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [activeView, setActiveView] = useState<"3D" | "2D">("3D");
  const [showStreets, setShowStreets] = useState(true);

  useEffect(() => {
    let maplibre: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const mlgl = await import("maplibre-gl");
        maplibre = mlgl.default || mlgl;

        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              "satellite-tiles": {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                attribution: "Esri, NASA, USGS"
              },
              // 2. Crystal-Clear Transparent Road & Highway Overlay (Zero Fog)
              "hybrid-roads": {
                type: "raster",
                tiles: [
                  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                maxzoom: 19
              },
              // 3. Crystal-Clear Transparent Street & Place Labels
              "hybrid-labels": {
                type: "raster",
                tiles: [
                  "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                maxzoom: 19
              },
              // 4. 3D Digital Elevation Terrain (DEM)
              "terrain-dem": {
                type: "raster-dem",
                encoding: "terrarium",
                tiles: [
                  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
                ],
                tileSize: 256,
                maxzoom: 15
              }
            },
            layers: [
              {
                id: "satellite-layer",
                type: "raster",
                source: "satellite-tiles",
                minzoom: 0,
                maxzoom: 19
              },
              {
                id: "hybrid-roads-layer",
                type: "raster",
                source: "hybrid-roads",
                minzoom: 10,
                maxzoom: 19,
                paint: {
                  "raster-opacity": 0.95
                }
              },
              {
                id: "hybrid-labels-layer",
                type: "raster",
                source: "hybrid-labels",
                minzoom: 10,
                maxzoom: 19,
                paint: {
                  "raster-opacity": 1.0
                }
              }
            ],
            terrain: {
              source: "terrain-dem",
              exaggeration: 2.0
            }
          },
          center: [88.5944, 27.2789],
          zoom: 15.2,
          pitch: 68,
          bearing: -25,
          maxPitch: 85,
          antialias: true
        });

        mapInstanceRef.current = map;

        // Add Interactive Navigation Controls (Zoom In/Out, Compass, Pitch)
        map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-left");

        map.on("load", () => {
          // Critical Danger Perimeter Circle
          const center = [88.5944, 27.2789];
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
              coordinates: [coords]
            }
          };

          map.addSource("danger-buffer", { type: "geojson", data: dangerBufferGeoJson });

          map.addLayer({
            id: "danger-buffer-fill",
            type: "fill",
            source: "danger-buffer",
            paint: {
              "fill-color": "#ef4444",
              "fill-opacity": 0.25
            }
          });

          map.addLayer({
            id: "danger-buffer-outline",
            type: "line",
            source: "danger-buffer",
            paint: {
              "line-color": "#ba1a1a",
              "line-width": 3,
              "line-dasharray": [2, 2]
            }
          });

          // Evacuation Safe Corridor (Dijkstra Route)
          const evacCorridor = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [88.5910, 27.2830],
                [88.5935, 27.2805],
                [88.5960, 27.2775],
                [88.5990, 27.2740],
                [88.6040, 27.2700]
              ]
            }
          };

          map.addSource("evac-corridor", { type: "geojson", data: evacCorridor });
          map.addLayer({
            id: "evac-corridor-glow",
            type: "line",
            source: "evac-corridor",
            paint: {
              "line-color": "#38bdf8",
              "line-width": 8,
              "line-opacity": 0.4,
              "line-blur": 3
            }
          });
          map.addLayer({
            id: "evac-corridor-line",
            type: "line",
            source: "evac-corridor",
            paint: {
              "line-color": "#38bdf8",
              "line-width": 3.5,
              "line-opacity": 0.95
            }
          });

          // Render Ground Report Markers
          groundReports.forEach((gr) => {
            const el = document.createElement("div");
            el.innerHTML = gr.type === "landslide" ? "🪨" : gr.type === "flood" ? "🌊" : gr.type === "blockage" ? "🚧" : "🏃";
            el.style.fontSize = "18px";
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
                  <div style="font-size:10px; color:#64748b;">Reported at ${gr.time}</div>
                  <div style="font-size:10px; color:#0f172a; margin-top:2px;"><b>Ranipool Basin Sector</b></div>
                `)
              )
              .addTo(map);
          });
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
    if (showStreets) {
      map.setLayoutProperty("osm-highways-layer", "visibility", "none");
      map.setLayoutProperty("street-labels-layer", "visibility", "none");
      setShowStreets(false);
    } else {
      map.setLayoutProperty("osm-highways-layer", "visibility", "visible");
      map.setLayoutProperty("street-labels-layer", "visibility", "visible");
      setShowStreets(true);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950">
      {/* 3D WebGL Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Responsive Non-Overlapping Tactical Top Bar */}
      <div className="absolute top-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white rounded-lg border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-none">Ranipool 3D Sector</span>
          </div>

          <button
            type="button"
            onClick={toggleView}
            className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-900 rounded-lg font-bold text-xs shadow-md border border-gray-200 transition-colors shrink-0"
          >
            {activeView === "3D" ? "🏔️ 3D View" : "🗺️ 2D View"}
          </button>

          <button
            type="button"
            onClick={toggleStreetGrid}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs shadow-md border border-emerald-200 transition-colors shrink-0"
          >
            {showStreets ? "🛣️ Roads: ON" : "🛣️ Roads: OFF"}
          </button>
        </div>

        {/* Right Status Badges */}
        <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto">
          <span className="bg-[#ba1a1a] text-white px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-tight shadow-md">
            HIGH RISK
          </span>
          <span className="bg-slate-800 text-white px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-tight shadow-md">
            ROAD BLOCKED
          </span>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md text-white rounded-xl p-2.5 border border-white/20 text-[11px] space-y-1.5 shadow-lg max-w-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/40 border border-red-500" />
          <span>450m Critical Inundation Perimeter</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded bg-sky-400" />
          <span>Dijkstra Safe Evacuation Route</span>
        </div>
        <div className="flex items-center gap-2 text-gray-400 font-mono text-[10px]">
          <span>📍 Lat: 27.2789, Lng: 88.5944 | Elev: 766m</span>
        </div>
      </div>
    </div>
  );
}
