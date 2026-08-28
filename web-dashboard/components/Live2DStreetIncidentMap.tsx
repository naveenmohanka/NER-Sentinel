"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

const incidentData: IncidentMarker[] = [
  {
    id: "inc-1",
    title: "Ranipool Flash Inundation",
    location: "Ranipool River Basin (Gangtok)",
    lat: 27.2789,
    lng: 88.5944,
    severity: "CRITICAL",
    roadStatus: "BLOCKED",
    link: "/risk-assessment",
    icon: "flood"
  },
  {
    id: "inc-2",
    title: "NH-10 Himalayan Debris Slide",
    location: "NH-10 Corridor (29th Mile)",
    lat: 27.2600,
    lng: 88.5800,
    severity: "HIGH",
    roadStatus: "BLOCKED",
    icon: "traffic"
  },
  {
    id: "inc-3",
    title: "Singtam Teesta Basin Surge",
    location: "Singtam Valley Sector",
    lat: 27.2317,
    lng: 88.4992,
    severity: "HIGH",
    roadStatus: "SUBMERGED",
    icon: "water_drop"
  },
  {
    id: "inc-4",
    title: "Bhusuk Mountain Ridge Slide",
    location: "Bhusuk Ridge (1357m)",
    lat: 27.3500,
    lng: 88.6200,
    severity: "MODERATE",
    roadStatus: "WATCH",
    icon: "landscape"
  }
];

export default function Live2DStreetIncidentMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<IncidentMarker | null>(null);

  useEffect(() => {
    let maplibre: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const mlgl = await import("maplibre-gl");
        maplibre = mlgl.default || mlgl;

        // Clean, High-Detail 2D Street Map (100% Free, Zero API Key Required)
        const map = new maplibre.Map({
          container: mapContainerRef.current,
          style: {
            version: 8,
            sources: {
              "esri-streets": {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                attribution: "Esri, DeLorme, NAVTEQ, USGS"
              }
            },
            layers: [
              {
                id: "esri-streets-layer",
                type: "raster",
                source: "esri-streets",
                minzoom: 0,
                maxzoom: 20
              }
            ]
          },
          center: [88.6065, 27.3000],
          zoom: 12.8,
          maxZoom: 19,
          antialias: true
        });

        mapInstanceRef.current = map;

        // Navigation controls
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new maplibre.FullscreenControl(), "top-right");

        map.on("load", () => {
          // Render Incident Pins
          incidentData.forEach((inc) => {
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
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: ${isCritical ? "#ba1a1a" : isHigh ? "#ea580c" : "#eab308"};
                border: 2.5px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 16px;
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
                ${inc.title.split(" ")[0]} ${inc.severity === "CRITICAL" ? "🔴" : ""}
              </div>
            `;

            el.addEventListener("click", () => {
              setSelectedIncident(inc);
              map.flyTo({ center: [inc.lng, inc.lat], zoom: 15.5, duration: 1200 });
              if (inc.link) {
                setTimeout(() => router.push(inc.link!), 1500);
              }
            });

            new maplibre.Marker({ element: el })
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const map = mapInstanceRef.current;
    if (!map || !searchQuery.trim()) return;

    const q = searchQuery.toLowerCase().trim();
    if (q.includes("ranipool")) {
      map.flyTo({ center: [88.5944, 27.2789], zoom: 16, duration: 1500 });
    } else if (q.includes("gangtok")) {
      map.flyTo({ center: [88.6138, 27.3314], zoom: 15.5, duration: 1500 });
    } else if (q.includes("singtam")) {
      map.flyTo({ center: [88.4992, 27.2317], zoom: 15.5, duration: 1500 });
    } else if (q.includes("bhusuk")) {
      map.flyTo({ center: [88.6200, 27.3500], zoom: 15.5, duration: 1500 });
    } else if (q.includes("nh-10") || q.includes("nh10")) {
      map.flyTo({ center: [88.5800, 27.2600], zoom: 15.5, duration: 1500 });
    } else {
      map.flyTo({ center: [88.6065, 27.3000], zoom: 14, duration: 1200 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden bg-slate-100 border border-[#dcd9db]">
      {/* 2D Interactive WebGL Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Google-Style Search Bar on Top of Map */}
      <div className="absolute top-4 left-4 right-16 z-20 max-w-md">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-gray-200"
        >
          <span className="material-symbols-outlined text-gray-500 pl-2 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Gangtok, Ranipool, Singtam, NH-10..."
            className="flex-1 bg-transparent text-xs font-semibold text-gray-800 outline-none pr-2"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Locate
          </button>
        </form>
      </div>

      {/* Floating Bottom Left: 2D Street Detail Notice */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-gray-200 shadow-lg max-w-xs text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-gray-900">
          <span className="text-blue-600">🗺️</span>
          <span>High-Detail 2D Street Network</span>
        </div>
        <p className="text-[11px] text-gray-600 leading-snug">
          Zoom in with scroll wheel or <b>+ / -</b> buttons to inspect exact Sikkim street names, bridge crossings, and lane geometry.
        </p>
      </div>
    </div>
  );
}
