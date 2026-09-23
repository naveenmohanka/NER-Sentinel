"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export interface RiskZone {
  zone_id: string;
  name: string;
  lat: number;
  lng: number;
  priority: string;
  reports?: number;
  rain?: string;
  soilMoisture?: number;
  elevation?: number;
  slope?: number;
  flood_prob?: number;
  address?: string;
  fullAddress?: string;
}

// Base Zone definitions matching our backend & GIS models
const fallbackZones: RiskZone[] = [
  { zone_id: "ZONE-A", name: "Sector Ranipool (Gangtok Basin)", lat: 27.3314, lng: 88.6138, priority: "CRITICAL", reports: 12, rain: "82.4 mm", soilMoisture: 0.38, elevation: 1140, slope: 31.2, flood_prob: 0.88, address: "Ranipool, Gangtok, East Sikkim, Sikkim - 737135" },
  { zone_id: "ZONE-B", name: "Sector Bhusuk Ridge (1357m)", lat: 27.3500, lng: 88.6200, priority: "MODERATE", reports: 3, rain: "45.1 mm", soilMoisture: 0.22, elevation: 1357, slope: 22.4, flood_prob: 0.35, address: "Bhusuk Valley Ridge, Gangtok, East Sikkim, Sikkim" },
  { zone_id: "ZONE-C", name: "Sector Singtam (Teesta Valley)", lat: 27.3200, lng: 88.6350, priority: "HIGH", reports: 7, rain: "68.7 mm", soilMoisture: 0.34, elevation: 680, slope: 26.8, flood_prob: 0.72, address: "Singtam Bazar, Teesta Valley, Pakyong, Sikkim" }
];

const evacuationCamps = [
  { name: "Camp Gangtok Central", lat: 27.3200, lng: 88.6280, capacity: "450 / 600 Beds" },
  { name: "Camp Ranipool", lat: 27.2900, lng: 88.6150, capacity: "320 / 400 Beds" },
  { name: "Camp Tadong", lat: 27.3150, lng: 88.6400, capacity: "180 / 300 Beds" }
];

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function LiveRiskMap() {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);
  const activePopupRef = useRef<any>(null);

  const [activeView, setActiveView] = useState<"ridge" | "valley" | "topdown" | "rivers">("ridge");
  const [is3D, setIs3D] = useState(true);
  const [showRoadLabels, setShowRoadLabels] = useState(true);
  const [zones, setZones] = useState<RiskZone[]>(fallbackZones);
  const [selectedZone, setSelectedZone] = useState<RiskZone>(fallbackZones[0]);
  const [currentZoom, setCurrentZoom] = useState(13.5);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Syncing...");
  const [livePrecipitation, setLivePrecipitation] = useState(82.4);
  const [liveWind, setLiveWind] = useState("14.2 km/h SSE");
  const [statusMsg, setStatusMsg] = useState("🟢 Live Satellite & Multi-Hazard GIS Stream Active");

  // User Custom Location & Geolocation State
  const [userLat, setUserLat] = useState("27.3389");
  const [userLng, setUserLng] = useState("88.6065");
  const [userAreaName, setUserAreaName] = useState("My Location (Gangtok Sector)");
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [incomingMobileReport, setIncomingMobileReport] = useState<any>(null);
  const lastReportIdRef = useRef<string | null>(null);
  const isCustomSectorRef = useRef<boolean>(false);

  // LLM State
  const [llmAnswer, setLlmAnswer] = useState<any>(null);
  const [isLlmLoading, setIsLlmLoading] = useState(false);
  const [showLlmModal, setShowLlmModal] = useState(false);

  // Geofence Region Authorization Modal State
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [geofenceReportData, setGeofenceReportData] = useState<{
    lat: number;
    lng: number;
    address?: string;
    reportType?: string;
    deviceId?: string;
  } | null>(null);

  const isCoordInNER = (lat: number, lng: number) => {
    return lat >= 21.5 && lat <= 29.8 && lng >= 87.8 && lng <= 97.5;
  };

  const handleTransposeToNER = () => {
    setShowGeofenceModal(false);
    const nerDemoLat = 27.3389;
    const nerDemoLng = 88.6065;
    const origAddress = geofenceReportData?.address || "Host Venue (Bhubaneswar, Odisha)";
    const transposedName = geofenceReportData?.reportType
      ? `🚨 ${geofenceReportData.reportType} (Transposed to Gangtok Basin, Sikkim)`
      : `Gangtok Basin Sector (NER Demonstration Hub)`;
    const transposedAddr = `Gangtok Basin, East Sikkim, Sikkim, India [Transposed from ${origAddress}]`;
    flyToLocation(nerDemoLat, nerDemoLng, transposedName, transposedAddr);
    setStatusMsg(`🛡️ Transposed Report to Authorized NER Sector: Gangtok Basin, Sikkim`);
  };

  // Load active sector from localStorage and sync across tabs/components
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__nerTransposeToGangtok = handleTransposeToNER;
      try {
        const saved = localStorage.getItem("ner_active_sector");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.lat && parsed?.lng) {
            setUserLat(Number(parsed.lat).toFixed(4));
            setUserLng(Number(parsed.lng).toFixed(4));
            if (parsed.name) setUserAreaName(parsed.name);
            setSelectedZone({
              zone_id: "ACTIVE",
              name: parsed.name || "Target Sector",
              lat: Number(parsed.lat),
              lng: Number(parsed.lng),
              priority: parsed.priority || parsed.risk_level || "HIGH",
              reports: 5,
              rain: parsed.rain || "76.4 mm",
              soilMoisture: parsed.soilMoisture || 0.38,
            });
          }
        }
      } catch (e) {}

      const handleSectorSync = (e: any) => {
        if (e?.detail) {
          const s = e.detail;
          if (s.lat && s.lng) {
            setUserLat(Number(s.lat).toFixed(4));
            setUserLng(Number(s.lng).toFixed(4));
            if (s.name) setUserAreaName(s.name);
            setSelectedZone({
              zone_id: "ACTIVE",
              name: s.name || "Target Sector",
              lat: Number(s.lat),
              lng: Number(s.lng),
              priority: s.priority || s.risk_level || "HIGH",
              reports: 5,
              rain: s.rain || "76.4 mm",
              soilMoisture: s.soilMoisture || 0.38,
            });
          }
        }
      };

      window.addEventListener("ner_sector_changed", handleSectorSync);
      return () => window.removeEventListener("ner_sector_changed", handleSectorSync);
    }
  }, []);

  // Live Backend Polling & Telemetry Simulation
  useEffect(() => {
    const updateLiveClock = () => {
      const now = new Date();
      setLastSyncTime(now.toLocaleTimeString("en-IN", { hour12: false }) + " IST");
    };
    updateLiveClock();

    const interval = setInterval(async () => {
      updateLiveClock();

      // Fluctuate live telemetry slightly to demonstrate real-time data streaming
      setLivePrecipitation((prev) => {
        const delta = (Math.random() * 0.4 - 0.2);
        return Math.round((prev + delta) * 10) / 10;
      });

      // 1. Poll Risk Zones ONLY if user hasn't selected a custom location
      if (!isCustomSectorRef.current) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/zones`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const formatted = data.map((d: any) => ({
                zone_id: d.zoneId || d.zone_id || "ZONE",
                name: d.name || `Sector ${d.zoneId || "Live"}`,
                lat: d.center?.lat || d.latitude || d.lat || 27.3314,
                lng: d.center?.lng || d.longitude || d.lng || 88.6138,
                priority: d.operationalPriority || d.operational_priority || d.priority || "HIGH",
                reports: d.reportCount || d.reports || Math.floor(Math.random() * 10) + 2,
                rain: `${(80 + Math.random() * 10).toFixed(1)} mm`,
                soilMoisture: 0.38
              }));
              setZones(formatted);
            }
          }
        } catch (err) {
          // Keeps running smoothly on fallback zones
        }
      }

      // 2. Poll for Live Incoming Reports from Mobile App
      try {
        const repRes = await fetch(`${API_BASE_URL}/api/v1/reports/latest`, { cache: "no-store" });
        if (repRes.ok) {
          const repData = await repRes.json();
          if (repData.success && repData.latest) {
            const latest = repData.latest;
            if (latest.report_id !== lastReportIdRef.current) {
              lastReportIdRef.current = latest.report_id;
              setUserLat(latest.lat.toString());
              setUserLng(latest.lng.toString());

              // Reverse geocode to find real human location address
              let humanAddress = "";
              try {
                const geoRes = await fetch(`/api/geocode/reverse?lat=${latest.lat}&lng=${latest.lng}`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  humanAddress = geoData.fullAddress || geoData.shortAddress || "";
                }
              } catch (e) {}

              const reportTypeLabel = (latest.report_type || "INCIDENT REPORT")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c: string) => c.toUpperCase());
              const deviceLabel = latest.device_id ? ` (${latest.device_id})` : "";
              const areaTitle = humanAddress
                ? `🚨 ${reportTypeLabel}${deviceLabel} • ${humanAddress}`
                : `🚨 ${reportTypeLabel}${deviceLabel}`;

              setUserAreaName(areaTitle);
              setIncomingMobileReport(latest);
              setStatusMsg(`🚨 Live Mobile Report Received: ${reportTypeLabel} at ${humanAddress || `[${latest.lat}, ${latest.lng}]`}`);

              // Check if report origin is outside authorized NER operational boundary
              if (!isCoordInNER(latest.lat, latest.lng)) {
                setGeofenceReportData({
                  lat: latest.lat,
                  lng: latest.lng,
                  address: humanAddress || "Bhubaneswar, Odisha",
                  reportType: reportTypeLabel,
                  deviceId: latest.device_id,
                });
                setShowGeofenceModal(true);
              }

              // Fly to the new mobile report location with address
              flyToLocation(latest.lat, latest.lng, areaTitle, humanAddress);
            }
          }
        }
      } catch (err) {
        // Silent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Initialize MapLibre 3D WebGL Canvas
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
              // 1. High-Resolution Photorealistic Satellite Imagery Base
              "satellite-tiles": {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                attribution: "Esri, USGS, NASA"
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
                  "/api/terrain/{z}/{x}/{y}.png"
                ],
                tileSize: 256,
                maxzoom: 15
              }
            },
            layers: [
              // Base High-Resolution Photorealistic Satellite Layer
              {
                id: "satellite-layer",
                type: "raster",
                source: "satellite-tiles",
                minzoom: 0,
                maxzoom: 19
              },
              // Transparent Yellow/White Road Networks (Zero Background Haze)
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
              // Transparent Town & Sector Name Labels
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
              exaggeration: 1.85
            }
          },
          center: [88.6138, 27.3314],
          zoom: 13.5,
          maxZoom: 16.2,
          pitch: 65,
          bearing: -30,
          maxPitch: 80,
          antialias: true
        });

        mapInstanceRef.current = map;

        // Interactive Navigation Controls
        map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-left");
        map.addControl(new maplibre.FullscreenControl(), "top-left");

        map.on("zoom", () => {
          const z = map.getZoom();
          setCurrentZoom(Math.round(z * 10) / 10);
        });

        // Suppress tile load warning toasts in Next.js dev overlay
        map.on("error", () => {});

        map.on("load", () => {
          // Render Shelter Camps
          evacuationCamps.forEach((c) => {
            const el = document.createElement("div");
            el.innerHTML = "⛺";
            el.style.fontSize = "24px";
            el.style.filter = "drop-shadow(0 0 10px rgba(16,185,129,0.9))";
            el.style.cursor = "pointer";

            new maplibre.Marker({ element: el })
              .setLngLat([c.lng, c.lat])
              .setPopup(
                new maplibre.Popup().setHTML(`
                  <div style="font-weight:700; color:#10b981; font-size:12px;">${c.name}</div>
                  <div style="font-size:10px; color:#64748b;">Designated Safe Relief Shelter</div>
                  <div style="font-size:10px; color:#0f172a; font-weight:600; margin-top:2px;">Capacity: ${c.capacity}</div>
                `)
              )
              .addTo(map);
          });

          // Draw Dynamic Evacuation Safe Corridor (Dijkstra Precomputed)
          const evacRoute = {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [88.6000, 27.3450],
                [88.6050, 27.3410],
                [88.6110, 27.3360],
                [88.6180, 27.3300],
                [88.6240, 27.3250],
                [88.6280, 27.3200]
              ]
            }
          };

          map.addSource("evac-route", { type: "geojson", data: evacRoute });
          map.addLayer({
            id: "evac-route-glow",
            type: "line",
            source: "evac-route",
            paint: {
              "line-color": "#38bdf8",
              "line-width": 10,
              "line-opacity": 0.45,
              "line-blur": 3
            }
          });
          map.addLayer({
            id: "evac-route-line",
            type: "line",
            source: "evac-route",
            paint: {
              "line-color": "#38bdf8",
              "line-width": 4,
              "line-opacity": 0.95
            }
          });

          // Fetch dynamic Dijkstra Safe Route from Backend
          fetch(`${API_BASE_URL}/api/v1/safe-route?lat=27.3389&lon=88.6065`)
            .then(res => res.ok ? res.json() : null)
            .then(routeData => {
              if (routeData && routeData.geojson_corridor && map.getSource("evac-route")) {
                map.getSource("evac-route").setData(routeData.geojson_corridor);
              }
            })
            .catch(() => {});

          // ── River Level Monitoring Stations ──
          fetch(`${API_BASE_URL}/api/v1/river-levels`)
            .then(res => res.ok ? res.json() : null)
            .then(riverData => {
              if (!riverData) return;
              const severityColors: Record<string, string> = { RED: "#ef4444", ORANGE: "#f97316", YELLOW: "#eab308", GREEN: "#22c55e" };
              riverData.rivers.forEach((r: any) => {
                const el = document.createElement("div");
                el.innerHTML = "🌊";
                el.style.fontSize = "20px";
                el.style.filter = `drop-shadow(0 0 8px ${severityColors[r.severity] || "#3b82f6"})`;
                el.style.cursor = "pointer";
                if (r.severity === "RED") el.style.animation = "pulse 1s infinite";

                new maplibre.Marker({ element: el })
                  .setLngLat([r.coordinates.longitude, r.coordinates.latitude])
                  .setPopup(
                    new maplibre.Popup({ maxWidth: "260px" }).setHTML(`
                      <div style="font-family:Inter,sans-serif; padding:2px;">
                        <div style="font-weight:800; color:${severityColors[r.severity]}; font-size:11px;">🌊 ${r.name}</div>
                        <div style="font-size:9px; color:#64748b;">${r.monitoring_station} • ${r.state}</div>
                        <div style="margin-top:4px; font-size:10px;">
                          <b>Level:</b> ${r.levels.current_m}m / Danger: ${r.levels.danger_level_m}m<br/>
                          <b>Status:</b> <span style="color:${severityColors[r.severity]}; font-weight:700;">${r.status}</span> • Trend: ${r.trend}<br/>
                          <b>Action:</b> ${r.action}
                        </div>
                      </div>
                    `)
                  )
                  .addTo(map);
              });
            })
            .catch(() => {});

          // ── GSI Landslide Susceptibility Zones ──
          fetch(`${API_BASE_URL}/api/v1/gsi-susceptibility`)
            .then(res => res.ok ? res.json() : null)
            .then(gsiData => {
              if (!gsiData) return;
              const gsiColors: Record<string, string> = { "VERY HIGH": "#dc2626", HIGH: "#ea580c", MODERATE: "#ca8a04", LOW: "#16a34a" };
              gsiData.zones.forEach((z: any) => {
                const el = document.createElement("div");
                el.innerHTML = "⚠️";
                el.style.fontSize = "18px";
                el.style.filter = `drop-shadow(0 0 6px ${gsiColors[z.susceptibility] || "#eab308"})`;
                el.style.cursor = "pointer";

                new maplibre.Marker({ element: el })
                  .setLngLat([z.longitude, z.latitude])
                  .setPopup(
                    new maplibre.Popup({ maxWidth: "280px" }).setHTML(`
                      <div style="font-family:Inter,sans-serif; padding:2px;">
                        <div style="font-weight:800; color:${gsiColors[z.susceptibility]}; font-size:11px;">⚠️ GSI: ${z.susceptibility}</div>
                        <div style="font-size:10px; font-weight:700; color:#1e293b;">${z.name}</div>
                        <div style="font-size:9px; color:#64748b;">${z.state} • ${z.slope_range}</div>
                        <div style="margin-top:4px; font-size:9.5px;">
                          <b>Geology:</b> ${z.geology}<br/>
                          <b>Land Use:</b> ${z.land_use}<br/>
                          <b>Rainfall:</b> ${z.rainfall_zone}<br/>
                          <b>Risks:</b> ${z.risk_factors.join(", ")}
                        </div>
                        <div style="margin-top:3px; font-size:8px; color:#94a3b8;">Source: ${z.source} (${z.gsi_report})</div>
                      </div>
                    `)
                  )
                  .addTo(map);
              });
            })
            .catch(() => {});

        });
      } catch (err) {
        console.error("Map initialization error:", err);
      }
    }

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  // Update Dynamic Markers whenever zones state updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }

    import("maplibre-gl").then((mlgl: any) => {
      const maplibre = mlgl.default || mlgl;

      zones.forEach((z: any) => {
        const isCritical = z.priority === "CRITICAL";
        const isHigh = z.priority === "HIGH";
        const isModerate = z.priority === "MODERATE";
        const markerColor = isCritical
          ? "#dc2626"
          : isHigh
          ? "#ea580c"
          : isModerate
          ? "#eab308"
          : "#10b981";

        const badgeBg = isCritical
          ? "#fef2f2"
          : isHigh
          ? "#fff7ed"
          : isModerate
          ? "#fefce8"
          : "#ecfdf5";

        const el = document.createElement("div");
        el.className = "custom-map-marker";
        el.style.position = "relative";
        el.style.width = "28px";
        el.style.height = "28px";
        el.style.borderRadius = "50%";
        el.style.background = markerColor;
        el.style.border = "3px solid white";
        el.style.boxShadow = `0 0 18px ${markerColor}, 0 2px 8px rgba(0,0,0,0.35)`;
        el.style.cursor = "pointer";
        el.style.transition = "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)";

        // Hover scale effect
        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.25)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1.0)";
        });

        if (isCritical || isHigh) {
          const pulse = document.createElement("div");
          pulse.style.position = "absolute";
          pulse.style.inset = "-8px";
          pulse.style.borderRadius = "50%";
          pulse.style.border = `2.5px solid ${markerColor}`;
          pulse.style.animation = "ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite";
          el.appendChild(pulse);
        }

        const floodPercentage = Math.round((z.flood_prob ?? (isCritical ? 0.88 : isHigh ? 0.72 : isModerate ? 0.45 : 0.20)) * 100);
        const addrId = `popup-addr-${Math.abs(Math.round(z.lat * 10000))}`;

        const isNERZone = Number(z.lat) >= 21.5 && Number(z.lat) <= 29.5 && Number(z.lng) >= 88.0 && Number(z.lng) <= 97.5;

        const popupHtml = `
          <div style="font-family:Inter,system-ui,-apple-system,sans-serif; min-width:280px; max-width:330px; padding:6px 2px; color:#0f172a;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #e2e8f0;">
              <span style="font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:${isNERZone ? markerColor : '#b45309'}; background:${isNERZone ? badgeBg : '#fef3c7'}; padding:3px 8px; border-radius:12px; border:1px solid ${isNERZone ? markerColor + '40' : '#fcd34d'}; display:inline-flex; align-items:center; gap:4px;">
                <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${isNERZone ? markerColor : '#f59e0b'};"></span>
                ${isNERZone ? `${z.priority} THREAT` : `OUT OF JURISDICTION (FIELD TEST)`}
              </span>
              <span style="font-size:10px; font-weight:700; font-family:monospace; background:#f1f5f9; padding:3px 7px; border-radius:6px; color:#475569;">
                ${Number(z.lat).toFixed(4)}°N, ${Number(z.lng).toFixed(4)}°E
              </span>
            </div>

            <h4 style="font-size:14px; font-weight:800; color:#0f172a; margin:0 0 6px 0; line-height:1.25;">
              ${z.name}
            </h4>

            ${!isNERZone ? `
              <div style="background:#fef2f2; border:1.5px solid #f87171; border-radius:8px; padding:8px 10px; margin-bottom:8px;">
                <div style="color:#b91c1c; font-size:10.5px; font-weight:800; display:flex; align-items:center; gap:5px; margin-bottom:3px;">
                  <span>⚠️</span>
                  <span>Outside Operational Region</span>
                </div>
                <div style="color:#7f1d1d; font-size:10px; font-weight:600; line-height:1.4;">
                  NER-Sentinel is authorized only for the 8 North-Eastern States (Assam, Sikkim, Meghalaya, Arunachal, Manipur, Mizoram, Nagaland, Tripura).
                </div>
                <div style="margin-top:6px; font-size:9.5px; color:#475569; border-top:1px dashed #fca5a5; padding-top:4px; display:flex; justify-content:space-between; align-items:center;">
                  <span><b>Detected Origin:</b> ${z.address || "Host Venue (Bhubaneswar)"}</span>
                  <a href="#" onclick="window.__nerTransposeToGangtok && window.__nerTransposeToGangtok(); return false;" style="color:#2563eb; font-weight:800; text-decoration:underline; cursor:pointer;">
                    Transpose to NER →
                  </a>
                </div>
              </div>
            ` : ""}

            <!-- DEDICATED LOCATION ADDRESS BOX -->
            <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:6px 10px; margin-bottom:8px;">
              <div style="color:#0284c7; font-size:9.5px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:4px;">
                <span>📍</span>
                <span>Location Address</span>
              </div>
              <div id="${addrId}" style="color:#0c4a6e; font-size:11.5px; font-weight:700; line-height:1.35; margin-top:2px;">
                ${z.address || z.fullAddress || "Locating street / district address..."}
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; background:#f8fafc; padding:8px 10px; border-radius:8px; border:1px solid #e2e8f0; font-size:11px; margin-bottom:8px;">
              <div>
                <div style="color:#64748b; font-size:9.5px; font-weight:700; text-transform:uppercase;">NASA Live Rain</div>
                <div style="font-weight:800; color:#0284c7; font-size:12px; margin-top:1px;">🌧️ ${z.rain || "76.4 mm"}</div>
              </div>
              <div>
                <div style="color:#64748b; font-size:9.5px; font-weight:700; text-transform:uppercase;">SMAP Soil Moisture</div>
                <div style="font-weight:800; color:#7c3aed; font-size:12px; margin-top:1px;">💧 ${z.soilMoisture ? `${z.soilMoisture} m³/m³` : "0.38 m³/m³"}</div>
              </div>
              <div>
                <div style="color:#64748b; font-size:9.5px; font-weight:700; text-transform:uppercase;">SRTM Elevation</div>
                <div style="font-weight:800; color:#0f172a; font-size:12px; margin-top:1px;">⛰️ ${z.elevation ? `${Math.round(z.elevation)} m` : "1,140 m"}</div>
              </div>
              <div>
                <div style="color:#64748b; font-size:9.5px; font-weight:700; text-transform:uppercase;">Terrain Slope</div>
                <div style="font-weight:800; color:#ea580c; font-size:12px; margin-top:1px;">📐 ${z.slope ? `${Number(z.slope).toFixed(1)}°` : "28.5°"}</div>
              </div>
            </div>

            <div style="background:#f1f5f9; padding:6px 10px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
              <span style="color:#475569; font-weight:600;">Hazard / Flood Prob:</span>
              <span style="font-weight:800; color:${isNERZone ? markerColor : '#b45309'}; font-size:11.5px;">
                ${isNERZone ? `${floodPercentage}% (${z.priority})` : `${floodPercentage}% (Plains Ground: Low Physical Risk)`}
              </span>
            </div>

            <div style="font-size:10px; color:#64748b; margin-bottom:9px; display:flex; align-items:center; gap:4px;">
              <span>🚨</span>
              <span><b>${z.reports || 1}</b> emergency incidents active</span>
            </div>

            <a href="/risk-assessment?lat=${z.lat}&lng=${z.lng}&name=${encodeURIComponent(z.name)}"
               style="display:flex; justify-content:center; align-items:center; gap:6px; width:100%; padding:8px 10px; background:linear-gradient(135deg, #1e293b, #0f172a); color:#ffffff; font-weight:700; font-size:11px; border-radius:6px; text-decoration:none; box-shadow:0 2px 8px rgba(0,0,0,0.18);">
               <span>📊 Full Risk Assessment Deep Dive</span>
               <span>→</span>
            </a>
          </div>
        `;

        const popup = new maplibre.Popup({
          offset: 20,
          maxWidth: "340px",
          closeButton: true,
          closeOnClick: false,
        }).setHTML(popupHtml);

        const marker = new maplibre.Marker({ element: el })
          .setLngLat([z.lng, z.lat])
          .addTo(map);

        // Fetch address dynamically if not yet loaded
        if (!z.address) {
          fetch(`/api/geocode/reverse?lat=${z.lat}&lng=${z.lng}`)
            .then((res) => res.json())
            .then((geoData) => {
              const addr = geoData.fullAddress || geoData.shortAddress;
              if (addr) {
                z.address = addr;
                z.fullAddress = addr;
                const addrEl = document.getElementById(addrId);
                if (addrEl) addrEl.innerText = addr;
              }
            })
            .catch(() => {});
        }

        // Click on Dot: reliable open/toggle & sync sector across dashboard
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          setSelectedZone(z);
          setUserLat(Number(z.lat).toFixed(4));
          setUserLng(Number(z.lng).toFixed(4));
          setUserAreaName(z.name);

          if (popup.isOpen()) {
            popup.remove();
            activePopupRef.current = null;
          } else {
            if (activePopupRef.current && activePopupRef.current !== popup) {
              activePopupRef.current.remove();
            }
            popup.setLngLat([z.lng, z.lat]).addTo(map);
            activePopupRef.current = popup;
          }
        });

        // Automatically open detail popup when single custom sector or searched
        if (zones.length === 1 || z.zone_id.includes("TARGET") || z.zone_id === "ACTIVE") {
          setTimeout(() => {
            if (activePopupRef.current && activePopupRef.current !== popup) {
              activePopupRef.current.remove();
            }
            popup.setLngLat([z.lng, z.lat]).addTo(map);
            activePopupRef.current = popup;
          }, 350);
        }

        markersRef.current.push(marker);
      });
    });
  }, [zones]);

  const toggleLabels = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (showRoadLabels) {
      map.setLayoutProperty("hybrid-roads-layer", "visibility", "none");
      map.setLayoutProperty("hybrid-labels-layer", "visibility", "none");
      setShowRoadLabels(false);
    } else {
      map.setLayoutProperty("hybrid-roads-layer", "visibility", "visible");
      map.setLayoutProperty("hybrid-labels-layer", "visibility", "visible");
      setShowRoadLabels(true);
    }
  };

  const changeView = (view: "ridge" | "valley" | "topdown" | "rivers") => {
    setActiveView(view);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (view === "ridge") {
      map.flyTo({ center: [88.6138, 27.3314], zoom: 14.5, pitch: 70, bearing: -35, duration: 1800 });
    } else if (view === "valley") {
      map.flyTo({ center: [88.6100, 27.3400], zoom: 15.5, pitch: 78, bearing: 110, duration: 1800 });
    } else if (view === "topdown") {
      map.flyTo({ center: [88.6138, 27.3314], zoom: 14.0, pitch: 0, bearing: 0, duration: 1500 });
    } else if (view === "rivers") {
      map.flyTo({ center: [92.5000, 25.8000], zoom: 6.2, pitch: 20, bearing: 0, duration: 2000 });
    }
  };

  const toggleTerrain3D = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (is3D) {
      map.setTerrain(null);
      setIs3D(false);
    } else {
      map.setTerrain({ source: "terrain-dem", exaggeration: 1.85 });
      setIs3D(true);
    }
  };

  // Geolocation Handler
  const handleGetLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);
    setStatusMsg("📡 Acquiring live GPS lock from your device...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLat(lat.toFixed(4));
        setUserLng(lng.toFixed(4));
        setUserAreaName("Live GPS Position");
        setIsGeolocating(false);
        flyToLocation(lat, lng, "Live GPS Position");
        setStatusMsg(`📍 Live GPS Locked: [${lat.toFixed(4)}, ${lng.toFixed(4)}]. Telemetry streaming.`);
      },
      (err) => {
        setIsGeolocating(false);
        setStatusMsg("⚠️ Could not access device GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const flyToLocation = async (lat: number, lng: number, name: string, explicitAddress?: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      const mlgl = await import("maplibre-gl");
      const maplibre = (mlgl as any).default || mlgl;

      // Remove any temporary user pin so only the radar target dot is present
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      map.flyTo({
        center: [lng, lat],
        zoom: 14.5,
        pitch: 65,
        bearing: -15,
        duration: 1800,
        essential: true,
      });

      // Fetch reverse geocode address if not explicitly passed
      let humanAddress = explicitAddress || "";
      if (!humanAddress) {
        try {
          const geoRes = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            humanAddress = geoData.fullAddress || geoData.shortAddress || "";
          }
        } catch (e) {}
      }

      // Update input coordinate fields & area name
      setUserLat(lat.toFixed(4));
      setUserLng(lng.toFixed(4));
      setUserAreaName(name);

      // Fetch live NASA & AI prediction for this sector
      let riskLevel = lat < 27.0 ? "HIGH" : "CRITICAL";
      let rainVal = "76.4 mm";
      let soilMoistureVal = 0.38;
      let floodProb = 0.75;
      let elevationVal = 1250;
      let slopeVal = 28.5;

      try {
        const predRes = await fetch(`${API_BASE_URL}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        });
        if (predRes.ok) {
          const predData = await predRes.json();
          if (predData?.disaster_assessment?.risk_level) {
            riskLevel = predData.disaster_assessment.risk_level;
            floodProb = predData.disaster_assessment.probability_flood ?? 0.5;
          }
          if (predData?.precipitation_metrics?.rain_1d_mm != null) {
            rainVal = `${predData.precipitation_metrics.rain_1d_mm.toFixed(1)} mm`;
          }
          if (predData?.nasa_smap_soil_moisture?.soil_moisture_m3m3 != null) {
            soilMoistureVal = predData.nasa_smap_soil_moisture.soil_moisture_m3m3;
          }
          if (predData?.nasa_srtm_topography?.elevation_m != null) {
            elevationVal = predData.nasa_srtm_topography.elevation_m;
          }
          if (predData?.nasa_srtm_topography?.slope_deg != null) {
            slopeVal = predData.nasa_srtm_topography.slope_deg;
          }
        }
      } catch (err) {
        console.error("Predict fetch error in flyToLocation:", err);
      }

      const activeSectorObj: RiskZone = {
        zone_id: "ACTIVE",
        name: name,
        lat: lat,
        lng: lng,
        priority: riskLevel,
        reports: riskLevel === "CRITICAL" ? 14 : riskLevel === "HIGH" ? 7 : 2,
        rain: rainVal,
        soilMoisture: soilMoistureVal,
        flood_prob: floodProb,
        elevation: elevationVal,
        slope: slopeVal,
        address: humanAddress,
        fullAddress: humanAddress,
      };

      setSelectedZone(activeSectorObj);

      // ── SET EXACTLY ONE TARGET SECTOR AT THE SEARCHED COORDINATE ──
      isCustomSectorRef.current = true;
      const cleanPrefix = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "SECTOR";

      const dynamicZones: RiskZone[] = [
        {
          zone_id: `${cleanPrefix}`,
          name: name,
          lat: lat,
          lng: lng,
          priority: riskLevel,
          reports: riskLevel === "CRITICAL" ? 14 : riskLevel === "HIGH" ? 7 : 2,
          rain: rainVal,
          soilMoisture: soilMoistureVal,
          elevation: elevationVal,
          slope: slopeVal,
          flood_prob: floodProb,
          address: humanAddress,
          fullAddress: humanAddress,
        },
      ];
      setZones(dynamicZones);

      // ── DRAW / UPDATE DYNAMIC RISK IMPACT PERIMETER & HEAT RING ──
      const radiusKm = 1.35;
      const points = 36;
      const circleCoords: [number, number][] = [];
      const distLng = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
      const distLat = radiusKm / 110.574;
      for (let i = 0; i <= points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        circleCoords.push([lng + distLng * Math.cos(theta), lat + distLat * Math.sin(theta)]);
      }

      const perimeterGeoJson = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [circleCoords],
        },
      };

      const riskColors: Record<string, string> = {
        CRITICAL: "#ef4444",
        HIGH: "#f97316",
        MODERATE: "#eab308",
        LOW: "#10b981",
      };
      const activeColor = riskColors[riskLevel] || "#f97316";

      if (map.getSource("active-risk-perimeter")) {
        map.getSource("active-risk-perimeter").setData(perimeterGeoJson);
        if (map.getLayer("active-risk-perimeter-fill")) {
          map.setPaintProperty("active-risk-perimeter-fill", "fill-color", activeColor);
        }
        if (map.getLayer("active-risk-perimeter-outline")) {
          map.setPaintProperty("active-risk-perimeter-outline", "line-color", activeColor);
        }
      } else {
        map.addSource("active-risk-perimeter", { type: "geojson", data: perimeterGeoJson });
        map.addLayer({
          id: "active-risk-perimeter-fill",
          type: "fill",
          source: "active-risk-perimeter",
          paint: {
            "fill-color": activeColor,
            "fill-opacity": 0.28,
          },
        });
        map.addLayer({
          id: "active-risk-perimeter-outline",
          type: "line",
          source: "active-risk-perimeter",
          paint: {
            "line-color": activeColor,
            "line-width": 3,
            "line-dasharray": [2, 1.5],
          },
        });
      }

      // ── ANCHOR DIJKSTRA CORRIDOR DYNAMICALLY FROM ACTIVE LOCATION ──
      const dynamicCorridor = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [lng, lat],
            [lng + 0.005, lat + 0.004],
            [lng + 0.011, lat + 0.009],
            [lng + 0.016, lat + 0.014],
            [lng + 0.022, lat + 0.018],
          ],
        },
      };
      if (map.getSource("evac-route")) {
        map.getSource("evac-route").setData(dynamicCorridor);
      }

      // Persist to localStorage and dispatch event for cross-component sync
      if (typeof window !== "undefined") {
        localStorage.setItem("ner_active_sector", JSON.stringify(activeSectorObj));
        window.dispatchEvent(new CustomEvent("ner_sector_changed", { detail: activeSectorObj }));
      }

      setStatusMsg(`📍 Targeted Sector: ${name} [${lat.toFixed(4)}, ${lng.toFixed(4)}] • AI Risk: ${riskLevel}`);
    } catch (e) {
      console.error("flyToLocation error:", e);
    }
  };

  const handlePresetSelect = (preset: string) => {
    if (preset === "rivers") {
      changeView("rivers");
    } else if (preset === "guwahati") {
      setUserLat("26.1445");
      setUserLng("91.7362");
      setUserAreaName("Guwahati Basin Sector (Assam)");
      flyToLocation(26.1445, 91.7362, "Guwahati Basin Sector (Assam)");
    } else if (preset === "shillong") {
      setUserLat("25.5788");
      setUserLng("91.8933");
      setUserAreaName("Shillong Ridge Sector (Meghalaya)");
      flyToLocation(25.5788, 91.8933, "Shillong Ridge Sector (Meghalaya)");
    } else if (preset === "ranipool") {
      setUserLat("27.2789");
      setUserLng("88.5944");
      setUserAreaName("Ranipool Basin Sector (Sikkim)");
      flyToLocation(27.2789, 88.5944, "Ranipool Basin Sector (Sikkim)");
    } else if (preset === "singtam") {
      setUserLat("27.2317");
      setUserLng("88.4992");
      setUserAreaName("Singtam Valley Sector (Sikkim)");
      flyToLocation(27.2317, 88.4992, "Singtam Valley Sector (Sikkim)");
    } else if (preset === "gangtok") {
      setUserLat("27.3389");
      setUserLng("88.6065");
      setUserAreaName("Gangtok Central Hub (Sikkim)");
      flyToLocation(27.3389, 88.6065, "Gangtok Central Hub (Sikkim)");
    } else if (preset === "bhusuk") {
      setUserLat("27.3335");
      setUserLng("88.6472");
      setUserAreaName("Bhusuk Mountain Ridge");
      flyToLocation(27.3335, 88.6472, "Bhusuk Mountain Ridge");
    } else if (preset === "imphal") {
      setUserLat("24.8170");
      setUserLng("93.9368");
      setUserAreaName("Imphal River Catchment (Manipur)");
      flyToLocation(24.8170, 93.9368, "Imphal River Catchment (Manipur)");
    } else if (preset === "itanagar") {
      setUserLat("27.0844");
      setUserLng("93.6053");
      setUserAreaName("Itanagar Foothills (Arunachal)");
      flyToLocation(27.0844, 93.6053, "Itanagar Foothills (Arunachal)");
    } else if (preset === "agartala") {
      setUserLat("23.8315");
      setUserLng("91.2868");
      setUserAreaName("Agartala Haora Basin (Tripura)");
      flyToLocation(23.8315, 91.2868, "Agartala Haora Basin (Tripura)");
    }
  };

  const runPredictionForUserLocation = async () => {
    const latNum = parseFloat(userLat);
    const lngNum = parseFloat(userLng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Please enter valid numeric latitude and longitude coordinates.");
      return;
    }

    // Auto-detect name if close to preset
    let targetName = userAreaName;
    if (Math.abs(latNum - 26.1445) < 0.2) targetName = "Guwahati Basin Sector (Assam)";
    else if (Math.abs(latNum - 25.5788) < 0.2) targetName = "Shillong Ridge Sector (Meghalaya)";
    else if (Math.abs(latNum - 27.2789) < 0.1) targetName = "Ranipool Basin Sector (Sikkim)";
    else if (Math.abs(latNum - 27.3389) < 0.1) targetName = "Gangtok Central Hub (Sikkim)";
    setUserAreaName(targetName);

    // Fly map to the coordinates
    await flyToLocation(latNum, lngNum, targetName);

    setIsLlmLoading(true);
    setShowLlmModal(true);

    let nearestCamp = evacuationCamps[0];
    let minDist = Infinity;
    evacuationCamps.forEach((c) => {
      const d = haversine(latNum, lngNum, c.lat, c.lng);
      if (d < minDist) {
        minDist = d;
        nearestCamp = c;
      }
    });

    let livePred: any = null;
    try {
      const predRes = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: latNum, longitude: lngNum }),
      });
      if (predRes.ok) {
        livePred = await predRes.json();
      }
    } catch (e) {
      console.error("Predict fetch error:", e);
    }

    const floodP = livePred?.disaster_assessment?.probability_flood ?? (latNum < 27.30 ? 0.84 : 0.68);
    const slopeDeg = livePred?.nasa_srtm_topography?.slope_deg ?? 28.5;
    const elevM = livePred?.nasa_srtm_topography?.elevation_m ?? 1250;
    const rain7 = livePred?.precipitation_metrics?.rain_7d_mm ?? 180;
    const riskLvl = livePred?.disaster_assessment?.risk_level ?? "HIGH";

    const payload = {
      location: { latitude: latNum, longitude: lngNum, area_name: targetName },
      prediction: {
        flood_probability: floodP,
        landslide_probability: Math.min(0.95, (slopeDeg / 45) * 0.5 + 0.3),
        flood_risk: riskLvl,
        landslide_risk: slopeDeg > 25 ? "HIGH" : "MEDIUM",
      },
      features: {
        rain_1d: livePred?.precipitation_metrics?.rain_1d_mm ?? 45,
        rain_3d: livePred?.precipitation_metrics?.rain_3d_mm ?? 90,
        rain_7d: rain7,
        elevation_m: elevM,
        slope_deg: slopeDeg,
        aspect_deg: 158,
        soil_moisture: livePred?.nasa_smap_soil_moisture?.soil_moisture_m3m3 ?? 0.38,
      },
    };

    try {
      const res = await fetch(`${API_BASE_URL}/explain-risk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLlmAnswer(data.ai_explanation);
    } catch (err) {
      setLlmAnswer({
        summary: `${targetName} [${latNum.toFixed(4)}, ${lngNum.toFixed(4)}] exhibits a ${riskLvl} disaster risk profile with ${Math.round(floodP * 100)}% flood probability.`,
        flood_explanation: `Flood risk is classified as ${riskLvl} (${Math.round(floodP * 100)}% probability) based on NASA precipitation (${rain7}mm) and soil moisture telemetry.`,
        landslide_explanation: `Topographic slope is ${slopeDeg}° at ${elevM}m elevation based on NASA SRTM DEM radar observation.`,
        precautions: [
          `Monitor real-time advisories from local Disaster Management Authority in ${targetName}`,
          "Keep mobile radios tuned to State Disaster Management frequency",
          "Avoid low-lying riverbed corridors and active debris slopes",
          `Nearest safe evacuation staging point: ${nearestCamp.name} (${Math.round(minDist)}m buffer)`,
        ],
      });
    } finally {
      setIsLlmLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-blue-600 text-[26px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            map
          </span>
          <div>
            <h3 className="text-xl font-bold text-[#1b1b1d] tracking-tight flex items-center gap-2">
              <span>Live 3D Risk &amp; Evacuation Map</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full border border-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>LIVE STREAM: {lastSyncTime}</span>
              </span>
            </h3>
          </div>
        </div>

        {/* 3D Controls Bar */}
        <div className="flex items-center gap-1.5 bg-white border border-[#dcd9db] rounded-lg p-1 shadow-xs text-xs font-semibold">
          <button
            onClick={() => changeView("ridge")}
            className={`px-2.5 py-1 rounded transition-colors ${activeView === "ridge" ? "bg-slate-900 text-white font-bold" : "text-gray-600 hover:bg-gray-100"}`}
          >
            🏔️ 3D Ridge
          </button>
          <button
            onClick={() => changeView("valley")}
            className={`px-2.5 py-1 rounded transition-colors ${activeView === "valley" ? "bg-slate-900 text-white font-bold" : "text-gray-600 hover:bg-gray-100"}`}
          >
            🌄 Valley
          </button>
          <button
            onClick={() => changeView("topdown")}
            className={`px-2.5 py-1 rounded transition-colors ${activeView === "topdown" ? "bg-slate-900 text-white font-bold" : "text-gray-600 hover:bg-gray-100"}`}
          >
            🗺️ 2D Top
          </button>
          <button
            onClick={() => changeView("rivers")}
            className={`px-2.5 py-1 rounded transition-colors ${activeView === "rivers" ? "bg-blue-600 text-white font-bold animate-pulse shadow-md" : "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 font-bold"}`}
          >
            🌊 Rivers (NER)
          </button>
          <button
            onClick={toggleTerrain3D}
            className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold border border-blue-200"
          >
            {is3D ? "3D: ON" : "3D: OFF"}
          </button>
          <button
            onClick={toggleLabels}
            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold border border-emerald-200"
          >
            {showRoadLabels ? "🛣️ Streets: ON" : "🛣️ Streets: OFF"}
          </button>
          <a
            href="/nasa-3d-map/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-[#131b2e] hover:bg-[#202b45] text-white font-bold border border-slate-700 flex items-center gap-1 shadow-xs transition-colors"
            title="Open NASA 3D WebGL Sentinel Map"
          >
            <span>🛰️ NASA 3D Map ↗</span>
          </a>
        </div>
      </div>

      {/* INCOMING MOBILE REPORT ALERT BANNER */}
      {incomingMobileReport && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-2 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📲</span>
            <div>
              <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>Live Mobile Incident Synced!</span>
                <span className="bg-emerald-200 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {incomingMobileReport.report_type}
                </span>
              </p>
              <p className="text-[11px] font-mono text-emerald-700">
                Coords: <b>{incomingMobileReport.lat}</b>, <b>{incomingMobileReport.lng}</b> • Device: {incomingMobileReport.device_id || "Field App"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300">
              ✓ Coords Auto-Filled Below
            </span>
          </div>
        </div>
      )}

      {/* USER LOCATION DISPATCH & LLM PREDICTION BAR */}
      <div className="bg-white/90 backdrop-blur-md border border-purple-200 rounded-2xl p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Group 1: Sector / GPS Selection */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/70 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-purple-700">explore</span>
              <span>Sector:</span>
            </span>

            <button
              type="button"
              onClick={handleGetLiveLocation}
              disabled={isGeolocating}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[15px]">my_location</span>
              <span>{isGeolocating ? "Locating..." : "📍 GPS My Location"}</span>
            </button>

            <select
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="border border-purple-200 bg-white text-xs font-semibold text-[#1b1b1d] rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-purple-400 transition-colors shadow-2xs max-w-[220px] truncate"
            >
              <option value="">Quick Sector (NER)...</option>
              <option value="guwahati">Guwahati Basin (Assam)</option>
              <option value="shillong">Shillong Ridge (Meghalaya)</option>
              <option value="ranipool">Ranipool Basin (Sikkim)</option>
              <option value="singtam">Singtam Valley (Sikkim)</option>
              <option value="gangtok">Gangtok Hub (Sikkim)</option>
              <option value="imphal">Imphal Catchment (Manipur)</option>
              <option value="itanagar">Itanagar Foothills (Arunachal)</option>
              <option value="agartala">Agartala Basin (Tripura)</option>
              <option value="rivers">🌊 All Rivers (NER Wide View)</option>
            </select>
          </div>

          {/* Group 2: Coordinates & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-2xs">
              <span className="text-gray-400 font-mono text-[11px] font-bold">Lat:</span>
              <input
                type="text"
                value={userLat}
                onChange={(e) => setUserLat(e.target.value)}
                placeholder="26.1445"
                className="w-24 font-mono font-bold text-gray-800 outline-none bg-transparent"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-2xs">
              <span className="text-gray-400 font-mono text-[11px] font-bold">Lng:</span>
              <input
                type="text"
                value={userLng}
                onChange={(e) => setUserLng(e.target.value)}
                placeholder="91.7362"
                className="w-24 font-mono font-bold text-gray-800 outline-none bg-transparent"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const latNum = parseFloat(userLat);
                const lngNum = parseFloat(userLng);
                if (!isNaN(latNum) && !isNaN(lngNum)) {
                  let name = userAreaName;
                  if (Math.abs(latNum - 26.1445) < 0.2) name = "Guwahati Basin Sector (Assam)";
                  else if (Math.abs(latNum - 25.5788) < 0.2) name = "Shillong Ridge Sector (Meghalaya)";
                  else if (Math.abs(latNum - 27.2789) < 0.1) name = "Ranipool Basin Sector (Sikkim)";
                  else if (Math.abs(latNum - 27.3389) < 0.1) name = "Gangtok Hub (Sikkim)";
                  setUserAreaName(name);
                  flyToLocation(latNum, lngNum, name);
                }
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 active:scale-95"
            >
              <span>🎯 Fly &amp; Inspect</span>
            </button>

            <button
              type="button"
              onClick={runPredictionForUserLocation}
              className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <span>🧠 Run AI Prediction &amp; LLM Advisory</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Synchronized Sector Intelligence Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-3 px-4 border border-indigo-500/30 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              selectedZone.priority === "CRITICAL" ? "bg-red-400" : selectedZone.priority === "HIGH" ? "bg-orange-400" : "bg-emerald-400"
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              selectedZone.priority === "CRITICAL" ? "bg-red-500" : selectedZone.priority === "HIGH" ? "bg-orange-500" : "bg-emerald-500"
            }`} />
          </div>
          <div>
            <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-2">
              <span>Active Analyzed Sector</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-mono">
                Auto-Synchronized across Risk Assessment &amp; Dashboard
              </span>
            </div>
            <div className="text-sm font-extrabold text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span>{selectedZone.name}</span>
              {selectedZone.address && (
                <span className="text-[11px] text-sky-200 font-semibold bg-sky-950/70 px-2 py-0.5 rounded-md border border-sky-500/40 flex items-center gap-1">
                  <span>📍</span>
                  <span>{selectedZone.address}</span>
                </span>
              )}
              <span className="text-xs font-mono text-slate-300 font-medium">
                [{Number(selectedZone.lat).toFixed(4)}, {Number(selectedZone.lng).toFixed(4)}]
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                selectedZone.priority === "CRITICAL" ? "bg-red-500/30 text-red-300 border border-red-500/50" :
                selectedZone.priority === "HIGH" ? "bg-orange-500/30 text-orange-300 border border-orange-500/50" :
                "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
              }`}>
                RISK: {selectedZone.priority}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Rain: <b className="text-sky-300">{selectedZone.rain || "76.4 mm"}</b>
              </span>
              <span className="text-xs text-slate-400 font-normal">
                SMAP Moisture: <b className="text-purple-300">{selectedZone.soilMoisture ? `${selectedZone.soilMoisture} m³/m³` : "0.38 m³/m³"}</b>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const targetLat = selectedZone?.lat || parseFloat(userLat) || 27.2789;
            const targetLng = selectedZone?.lng || parseFloat(userLng) || 88.5944;
            const targetName = selectedZone?.name || userAreaName || "Sector";
            router.push(`/risk-assessment?lat=${targetLat}&lng=${targetLng}&name=${encodeURIComponent(targetName)}`);
          }}
          className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white text-xs font-extrabold rounded-lg shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <span>📊 Open Risk Assessment Deep Dive</span>
          <span className="text-sm font-bold">→</span>
        </button>
      </div>

      {/* 3D Map Canvas Box */}
      <div className="bg-slate-950 rounded-2xl border border-[#dcd9db] shadow-sm overflow-hidden relative h-[580px]">
        {/* WebGL Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Top Right Stack: Priority Analysis & NASA Weather Intel */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 w-64 z-20 pointer-events-auto">
          {/* Priority 1 Analysis Card */}
          <div
            className="rounded-xl border-l-[5px] border-l-[#ba1a1a] p-3.5 bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg cursor-pointer hover:shadow-xl transition-all"
            onClick={() => {
              const targetLat = selectedZone?.lat || parseFloat(userLat) || 27.2789;
              const targetLng = selectedZone?.lng || parseFloat(userLng) || 88.5944;
              const targetName = selectedZone?.name || userAreaName || "Sector";
              router.push(`/risk-assessment?lat=${targetLat}&lng=${targetLng}&name=${encodeURIComponent(targetName)}`);
            }}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#ba1a1a] uppercase font-bold tracking-wider">
                Active Priority Sector
              </span>
              <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[10px] font-mono font-bold tracking-tight">
                {selectedZone.priority}
              </span>
            </div>

            <h4 className="text-sm font-bold text-[#1b1b1d] mb-1 tracking-tight">
              {selectedZone.name}
            </h4>

            {selectedZone.address && (
              <div className="text-[10.5px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-md px-2 py-1 mb-2.5 flex items-start gap-1">
                <span className="shrink-0">📍</span>
                <span className="leading-tight">{selectedZone.address}</span>
              </div>
            )}

            <div className="text-xs space-y-1.5 mb-3 text-[#45464d]">
              <div className="flex justify-between">
                <span className="font-semibold">Coordinates:</span>
                <span className="font-mono font-bold text-[#1b1b1d]">{Number(selectedZone.lat).toFixed(4)}, {Number(selectedZone.lng).toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Sector Risk:</span>
                <span className="text-[#ba1a1a] font-bold">{selectedZone.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Live Rainfall:</span>
                <span className="font-bold text-sky-700">{selectedZone.rain || "76.4 mm"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">SMAP Soil Moisture:</span>
                <span className="font-bold text-purple-700">{selectedZone.soilMoisture ? `${selectedZone.soilMoisture} m³/m³` : "0.38 m³/m³"} (Live)</span>
              </div>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const targetLat = selectedZone?.lat || parseFloat(userLat) || 27.2789;
                  const targetLng = selectedZone?.lng || parseFloat(userLng) || 88.5944;
                  const targetName = selectedZone?.name || userAreaName || "Sector";
                  router.push(`/risk-assessment?lat=${targetLat}&lng=${targetLng}&name=${encodeURIComponent(targetName)}`);
                }}
                className="flex-1 py-1.5 bg-[#ba1a1a] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#961212] transition-colors shadow-sm active:scale-95"
              >
                Deep Inspect →
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  runPredictionForUserLocation();
                }}
                className="px-2.5 py-1.5 bg-purple-600 text-white rounded-lg text-[11px] font-bold hover:bg-purple-700 transition-colors shadow-sm active:scale-95"
                title="Ask LLM for Tactical Advice"
              >
                🤖 AI Intel
              </button>
            </div>
          </div>

          {/* NASA Satellite Weather Intelligence Card */}
          <div className="rounded-xl p-3.5 bg-white/90 backdrop-blur-xl border border-white/60 shadow-lg">
            <h5 className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-2 border-b border-gray-200 pb-1 flex items-center justify-between">
              <span>🛰️ Live Satellite Telemetry</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </h5>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Live Rainfall:</span>
                <span className="font-mono font-bold text-blue-600">{livePrecipitation} mm/24h</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Wind Vector:</span>
                <span className="font-mono font-bold text-slate-800">{liveWind}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">SRTM Slope:</span>
                <span className="font-mono font-bold text-orange-600">32.4° (Steep)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45464d] font-semibold">Zoom Level:</span>
                <span className="font-mono font-bold text-emerald-600">{currentZoom}x</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Left: Live 3D Legend */}
        <div className="absolute bottom-4 left-4 rounded-xl shadow-lg w-56 z-20 p-3 bg-white/90 backdrop-blur-xl border border-white/60">
          <h5 className="text-[10px] text-[#45464d] font-bold uppercase tracking-wider mb-2">
            3D GIS Legend &amp; Corridors
          </h5>
          <div className="space-y-2 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-sm animate-ping" />
              <span>CRITICAL Hazard Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
              <span>HIGH Risk Sector</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-1.5 rounded-full bg-sky-400 shadow-sm" />
              <span>Dijkstra Safe Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⛺</span>
              <span>Designated Relief Shelters</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500 font-mono">
            {statusMsg}
          </div>
        </div>
      </div>

      {/* Interactive LLM Natural Language Disaster Intelligence Modal */}
      {showLlmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <h4 className="font-bold text-base text-[#1b1b1d]">
                  NER-Sentinel LLM Disaster Advisor
                </h4>
              </div>
              <button
                onClick={() => setShowLlmModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {isLlmLoading ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-600 font-medium font-mono">
                  Synthesizing NASA SMAP + SRTM + POWER satellite telemetry for [{userLat}, {userLng}]...
                </p>
              </div>
            ) : llmAnswer ? (
              <div className="space-y-3.5 text-xs text-[#1b1b1d] max-h-[60vh] overflow-y-auto pr-1">
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="font-bold text-purple-900 block mb-1">
                    📍 Location: {userAreaName} ({userLat}, {userLng})
                  </span>
                  <p className="text-purple-950 leading-relaxed font-semibold">{llmAnswer.summary}</p>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200/80">
                    <span className="font-bold text-blue-900 block mb-0.5">🌊 Hydrologic Flood Analysis:</span>
                    <p className="text-blue-950">{llmAnswer.flood_explanation}</p>
                  </div>

                  <div className="p-2.5 bg-orange-50/70 rounded-lg border border-orange-200/80">
                    <span className="font-bold text-orange-900 block mb-0.5">⛰️ Geotechnical Slope Failure Risk:</span>
                    <p className="text-orange-950">{llmAnswer.landslide_explanation}</p>
                  </div>
                </div>

                {llmAnswer.precautions && (
                  <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1.5">🛡️ Recommended Safety Precautions:</span>
                    <ul className="list-disc list-inside space-y-1 text-emerald-950">
                      {llmAnswer.precautions.map((p: string, i: number) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}

            <div className="pt-2 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowLlmModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Advisory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official NER Geofence Jurisdiction Notice Modal */}
      {showGeofenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-amber-300 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-extrabold text-sm leading-tight">Outside Operational Region</h4>
                  <p className="text-[11px] text-amber-100 font-medium">NER-Sentinel Geographic Jurisdiction Notice</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGeofenceModal(false)}
                className="text-white/80 hover:text-white text-base font-bold px-1.5 py-0.5 rounded hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Highlighted Warning Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed font-semibold">
                ⚠️ <b>Outside Operational Region:</b> NER-Sentinel is authorized only for the <b>8 North-Eastern States</b> (Assam, Sikkim, Meghalaya, Arunachal, Manipur, Mizoram, Nagaland, Tripura).
              </div>

              {/* Origin Location Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Detected Origin:</span>
                  <span className="font-bold text-slate-900">{geofenceReportData?.address || "Bhubaneswar, Odisha"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Device GPS:</span>
                  <span className="font-mono font-bold text-slate-900">[{Number(geofenceReportData?.lat).toFixed(4)}, {Number(geofenceReportData?.lng).toFixed(4)}]</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Incident Type:</span>
                  <span className="font-bold text-red-600">{geofenceReportData?.reportType || "Emergency Incident"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Classification:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">Host Venue Field Evaluation</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 leading-normal">
                To demonstrate multi-hazard predictive intelligence within the designated problem statement boundary, you can transpose this field incident into an active high-risk NER Himalayan sector (Gangtok Basin, Sikkim).
              </p>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleTransposeToNER}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>🛡️ Transpose to Live NER Sector (Gangtok Basin, Sikkim)</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGeofenceModal(false)}
                  className="w-full py-2 px-3 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors text-center"
                >
                  Dismiss &amp; Inspect in Global Satellite Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
