"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import dynamic from "next/dynamic";
import InSARMonitor from "@/components/InSARMonitor";
import { API_BASE_URL } from "@/lib/config";

const SectorContextMap = dynamic(
  () => import("@/components/SectorContextMap"),
  { ssr: false, loading: () => <div className="p-8 text-center text-xs text-gray-500 font-mono">Loading 3D Sector Map...</div> }
);

const PRESET_SECTORS = [
  { id: "ranipool", name: "Ranipool Sector (Gangtok Basin, East Sikkim)", lat: 27.2789, lng: 88.5944, pop: "1,240" },
  { id: "guwahati", name: "Guwahati Basin (Brahmaputra Lowlands, Assam)", lat: 26.1445, lng: 91.7362, pop: "120,000" },
  { id: "shillong", name: "Shillong Ridge (East Khasi Hills, Meghalaya)", lat: 25.5788, lng: 91.8933, pop: "35,000" },
  { id: "singtam", name: "Singtam Teesta Valley (Sikkim)", lat: 27.2317, lng: 88.4992, pop: "8,500" },
  { id: "gangtok", name: "Gangtok Central Hub (East Sikkim)", lat: 27.3389, lng: 88.6065, pop: "45,000" },
  { id: "imphal", name: "Imphal River Catchment (Manipur)", lat: 24.8170, lng: 93.9368, pop: "55,000" },
  { id: "itanagar", name: "Itanagar Foothills (Arunachal Pradesh)", lat: 27.0844, lng: 93.6053, pop: "28,000" },
  { id: "agartala", name: "Agartala Haora Basin (Tripura)", lat: 23.8315, lng: 91.2868, pop: "40,000" },
];

function RiskAssessmentContent() {
  const searchParams = useSearchParams();

  // Coordinates & Sector State
  const [currentLat, setCurrentLat] = useState(27.2789);
  const [currentLng, setCurrentLng] = useState(88.5944);
  const [inputLat, setInputLat] = useState("27.2789");
  const [inputLng, setInputLng] = useState("88.5944");
  const [sectorName, setSectorName] = useState("Ranipool Sector (Gangtok Basin, East Sikkim)");
  const [selectedPreset, setSelectedPreset] = useState("ranipool");

  // Dynamic Telemetry State from FastAPI /predict
  const [riskLevel, setRiskLevel] = useState("CRITICAL");
  const [floodProb, setFloodProb] = useState(0.84);
  const [elevation, setElevation] = useState(766);
  const [slope, setSlope] = useState(28.5);
  const [soilMoisture, setSoilMoisture] = useState(0.42);
  const [smapStation, setSmapStation] = useState("Regional Station");
  const [rain1d, setRain1d] = useState(82.0);
  const [rain7d, setRain7d] = useState(105.0);
  const [population, setPopulation] = useState("1,240");
  const [isLoading, setIsLoading] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Sync with URL params OR localStorage (from Dashboard selection)
  useEffect(() => {
    const pLat = searchParams.get("lat");
    const pLng = searchParams.get("lng");
    const pName = searchParams.get("name");

    if (pLat && pLng) {
      const latVal = parseFloat(pLat);
      const lngVal = parseFloat(pLng);
      const nameVal = pName || "Custom Sector";
      setCurrentLat(latVal);
      setCurrentLng(lngVal);
      setInputLat(latVal.toFixed(4));
      setInputLng(lngVal.toFixed(4));
      setSectorName(nameVal);

      const match = PRESET_SECTORS.find(
        (p) => Math.abs(p.lat - latVal) < 0.05 && Math.abs(p.lng - lngVal) < 0.05
      );
      if (match) {
        setSelectedPreset(match.id);
        setPopulation(match.pop);
      } else {
        setSelectedPreset("custom");
      }
      return;
    }

    // If no URL parameters, read from localStorage to sync with Dashboard
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("ner_active_sector");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.lat && parsed?.lng) {
            const latVal = Number(parsed.lat);
            const lngVal = Number(parsed.lng);
            setCurrentLat(latVal);
            setCurrentLng(lngVal);
            setInputLat(latVal.toFixed(4));
            setInputLng(lngVal.toFixed(4));
            if (parsed.name) setSectorName(parsed.name);
            if (parsed.priority || parsed.risk_level) setRiskLevel(parsed.priority || parsed.risk_level);
            if (parsed.soilMoisture) setSoilMoisture(parsed.soilMoisture);

            const match = PRESET_SECTORS.find(
              (p) => Math.abs(p.lat - latVal) < 0.05 && Math.abs(p.lng - lngVal) < 0.05
            );
            if (match) {
              setSelectedPreset(match.id);
              setPopulation(match.pop);
            } else {
              setSelectedPreset("custom");
            }
          }
        }
      } catch (e) {
        console.error("localStorage read error:", e);
      }
    }
  }, [searchParams]);

  const saveActiveSectorGlobally = (lat: number, lng: number, name: string, rLvl?: string, rain?: string, smap?: number) => {
    if (typeof window !== "undefined") {
      const activeObj = {
        name,
        lat,
        lng,
        priority: rLvl || riskLevel,
        risk_level: rLvl || riskLevel,
        rain: rain || `${rain1d} mm`,
        soilMoisture: smap ?? soilMoisture,
        elevation,
        slope,
        timestamp: Date.now(),
      };
      localStorage.setItem("ner_active_sector", JSON.stringify(activeObj));
      window.dispatchEvent(new CustomEvent("ner_sector_changed", { detail: activeObj }));
    }
  };

  const fetchSectorAnalysis = async (lat: number, lng: number, name?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (res.ok) {
        const data = await res.json();
        let updatedRisk = "MEDIUM";
        let updatedRain = `${rain1d} mm`;
        let updatedMoisture = soilMoisture;

        const assessment = data.disaster_assessment;
        if (assessment) {
          updatedRisk = assessment.risk_level || "MEDIUM";
          setRiskLevel(updatedRisk);
          setFloodProb(assessment.probability_flood ?? 0.5);
        }
        if (data.nasa_srtm_topography) {
          setElevation(Math.round(data.nasa_srtm_topography.elevation_m || 766));
          setSlope(data.nasa_srtm_topography.slope_deg || 20);
        }
        if (data.nasa_smap_soil_moisture) {
          updatedMoisture = data.nasa_smap_soil_moisture.soil_moisture_m3m3 || 0.35;
          setSoilMoisture(updatedMoisture);
          setSmapStation(data.nasa_smap_soil_moisture.reference_station || "Regional");
        }
        if (data.precipitation_metrics) {
          const r1 = Math.round(data.precipitation_metrics.rain_1d_mm || 45);
          setRain1d(r1);
          setRain7d(Math.round(data.precipitation_metrics.rain_7d_mm || 90));
          updatedRain = `${r1} mm`;
        }

        saveActiveSectorGlobally(lat, lng, name || sectorName, updatedRisk, updatedRain, updatedMoisture);
      }
    } catch (err) {
      console.error("Failed to run predict for sector:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorAnalysis(currentLat, currentLng, sectorName);
  }, [currentLat, currentLng]);

  const handlePresetChange = (presetId: string) => {
    const found = PRESET_SECTORS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPreset(found.id);
      setSectorName(found.name);
      setCurrentLat(found.lat);
      setCurrentLng(found.lng);
      setInputLat(found.lat.toFixed(4));
      setInputLng(found.lng.toFixed(4));
      setPopulation(found.pop);
      setIsDispatched(false);
      saveActiveSectorGlobally(found.lat, found.lng, found.name);
    }
  };

  const handleCustomCoordinatesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(inputLat);
    const lngNum = parseFloat(inputLng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    // Check if close to known preset
    let targetName = `Target Sector [${latNum.toFixed(4)}°N, ${lngNum.toFixed(4)}°E]`;
    const match = PRESET_SECTORS.find(
      (p) => Math.abs(p.lat - latNum) < 0.05 && Math.abs(p.lng - lngNum) < 0.05
    );

    if (match) {
      targetName = match.name;
      setSectorName(match.name);
      setSelectedPreset(match.id);
      setPopulation(match.pop);
    } else {
      setSectorName(targetName);
      setSelectedPreset("custom");
      setPopulation("30,000 (Estimated)");
    }

    setCurrentLat(latNum);
    setCurrentLng(lngNum);
    setIsDispatched(false);
    saveActiveSectorGlobally(latNum, lngNum, targetName);
  };

  const handleGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const targetName = `My Live GPS Location [${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E]`;
        setInputLat(lat.toFixed(4));
        setInputLng(lng.toFixed(4));
        setCurrentLat(lat);
        setCurrentLng(lng);
        setSectorName(targetName);
        setSelectedPreset("custom");
        setIsGeolocating(false);
        saveActiveSectorGlobally(lat, lng, targetName);
      },
      (err) => {
        setIsGeolocating(false);
        alert("GPS Error: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const isCritical = riskLevel === "CRITICAL";
  const isHigh = riskLevel === "HIGH";

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopNavbar title="Risk Assessment" />

        <main className="flex-1 p-6 md:p-8 space-y-4 max-w-[1400px] w-full mx-auto overflow-y-auto">
          {/* Dynamic Interactive Sector Selector Bar */}
          <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-xs p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <span className="material-symbols-outlined text-[#ba1a1a] text-2xl">travel_explore</span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Select Disaster Sector
                </span>
                <select
                  value={selectedPreset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="border border-gray-300 bg-gray-50 text-xs font-bold text-[#1b1b1d] rounded-lg px-2.5 py-1.5 outline-none cursor-pointer max-w-[280px] sm:max-w-none truncate"
                >
                  <option value="ranipool">Ranipool (Gangtok Basin, East Sikkim)</option>
                  <option value="guwahati">Guwahati Basin (Brahmaputra, Assam)</option>
                  <option value="shillong">Shillong Ridge (Khasi Hills, Meghalaya)</option>
                  <option value="singtam">Singtam Teesta Valley (Sikkim)</option>
                  <option value="gangtok">Gangtok Hub (East Sikkim)</option>
                  <option value="imphal">Imphal River Catchment (Manipur)</option>
                  <option value="itanagar">Itanagar Foothills (Arunachal)</option>
                  <option value="agartala">Agartala Haora Basin (Tripura)</option>
                  {selectedPreset === "custom" && <option value="custom">📍 Custom / GPS Coordinates</option>}
                </select>
              </div>
            </div>

            {/* Custom Coordinate Inputs */}
            <form onSubmit={handleCustomCoordinatesSubmit} className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5">
                <span className="text-gray-500 font-mono font-bold">Lat:</span>
                <input
                  type="text"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  placeholder="26.1445"
                  className="w-20 font-mono font-bold text-gray-800 bg-transparent outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5">
                <span className="text-gray-500 font-mono font-bold">Lng:</span>
                <input
                  type="text"
                  value={inputLng}
                  onChange={(e) => setInputLng(e.target.value)}
                  placeholder="91.7362"
                  className="w-20 font-mono font-bold text-gray-800 bg-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#ba1a1a] hover:bg-[#961212] text-white font-bold rounded-lg shadow-xs transition-all active:scale-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">radar</span>
                <span>Analyze Sector</span>
              </button>

              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={isGeolocating}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-all flex items-center gap-1"
                title="Locate via GPS"
              >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                <span>{isGeolocating ? "Locating..." : "GPS"}</span>
              </button>
            </form>
          </div>

          {/* Breadcrumb / Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {/* Badges & Status Row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded flex items-center gap-1 ${
                  isCritical
                    ? "bg-red-100 text-[#ba1a1a]"
                    : isHigh
                    ? "bg-orange-100 text-orange-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}>
                  <span>{isCritical ? "🔴" : isHigh ? "🟠" : "🟢"}</span>
                  <span>{isCritical ? "PRIORITY 1" : isHigh ? "PRIORITY 2" : "MONITORING"}</span>
                </span>

                <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded ${
                  isCritical
                    ? "bg-red-50 text-[#ba1a1a] border border-red-200"
                    : isHigh
                    ? "bg-orange-50 text-orange-800 border border-orange-200"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                }`}>
                  {riskLevel} RISK ({Math.round(floodProb * 100)}% PROBABILITY)
                </span>

                <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>Trend: {isCritical ? "HIGH ELEVATION" : "STABLE"}</span>
                </span>
              </div>

              {/* Dynamic Sector Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-[#1b1b1d] tracking-tight flex items-center gap-2">
                <span>{sectorName}</span>
                {isLoading && <span className="material-symbols-outlined animate-spin text-gray-400 text-xl">progress_activity</span>}
              </h2>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-[#515f74] font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 animate-pulse">
                sensors
              </span>
              <span>NASA Multi-Satellite Stream Active</span>
            </div>
          </div>

          {/* Top Row: Map & Impact Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Location Context Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dcd9db] overflow-hidden flex flex-col shadow-sm min-h-[480px]">
              <div className="p-3.5 border-b border-[#e2e8f0] bg-white flex justify-between items-center">
                <h3 className="text-base font-bold text-[#1b1b1d] flex items-center gap-2">
                  <span>3D Terrain Context: {sectorName.split("(")[0]}</span>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    {elevation}m Elev • {slope}° Slope
                  </span>
                </h3>
                <Link
                  href="/live-situation"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">public</span>
                  <span>View Global Situation Map</span>
                </Link>
              </div>

              <div className="relative flex-1 w-full overflow-hidden min-h-[460px]">
                <SectorContextMap
                  targetLat={currentLat}
                  targetLng={currentLng}
                  sectorName={sectorName.split("(")[0].trim()}
                  elevation={elevation}
                  riskLevel={riskLevel}
                />
              </div>
            </div>

            {/* Right Column: Impact Assessment & Weather-Linked Risk */}
            <div className="flex flex-col gap-4">
              {/* Impact Assessment Card */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col flex-1">
                <h3 className="text-[11px] font-bold text-[#515f74] uppercase tracking-wider border-b border-gray-100 pb-2.5 mb-3">
                  Sector Impact Assessment
                </h3>

                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Population */}
                    <div>
                      <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1">
                        Est. Population
                      </p>
                      <p className="text-base font-bold text-[#1b1b1d] flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#515f74] text-[18px]">groups</span>
                        {population}
                      </p>
                      <div className="space-y-1 text-xs text-[#515f74]">
                        <p>
                          Evacuation Status:{" "}
                          <span className={`font-bold ${isCritical ? "text-[#ba1a1a]" : "text-emerald-700"}`}>
                            {isCritical ? "Active Corridors" : "Buffer Zone"}
                          </span>
                        </p>
                        <p>SMAP Station: <b>{smapStation}</b></p>
                      </div>
                    </div>

                    {/* Infrastructure */}
                    <div>
                      <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1">
                        Topography
                      </p>
                      <p className="text-base font-bold text-[#1b1b1d] flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#515f74] text-[18px]">terrain</span>
                        {elevation}m Elev
                      </p>
                      <div className="space-y-1 text-xs text-[#515f74]">
                        <p>Slope: <b>{slope.toFixed(1)}°</b></p>
                        <p>Soil Moisture: <b>{soilMoisture.toFixed(2)} m³/m³</b></p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Risk */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-2">
                      Operational Risk Severity
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#45464d] font-medium">Predicted Probability</span>
                        <span className="font-bold text-[#ba1a1a]">{Math.round(floodProb * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#45464d] font-medium">Logistics Threat</span>
                        <span className={`font-bold ${isCritical ? "text-[#ba1a1a]" : "text-orange-600"}`}>
                          {isCritical ? "CRITICAL (High Debris)" : "MODERATE (Clear)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather-Linked Risk Card */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col">
                <h4 className="text-[11px] font-bold text-[#515f74] uppercase tracking-wider mb-2.5">
                  NASA POWER Weather-Linked Risk
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-[#515f74] font-medium">1-Day Rainfall</p>
                      <p className="text-lg font-bold text-[#1b1b1d]">
                        {rain1d}<span className="text-xs font-normal">mm</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#515f74] font-medium">7-Day Rainfall Trend</p>
                      <p className={`text-lg font-bold ${rain7d > 100 ? "text-[#ba1a1a]" : "text-blue-600"}`}>
                        {rain7d}<span className="text-xs font-normal">mm</span>
                      </p>
                    </div>
                  </div>

                  {/* Progressive rainfall risk bars */}
                  <div className="w-full h-7 bg-slate-100 flex items-end justify-between px-2 pb-1 rounded-lg">
                    <div className="w-[14%] h-1 bg-[#515f74]/30 rounded-t" />
                    <div className="w-[14%] h-2 bg-[#515f74]/50 rounded-t" />
                    <div className="w-[14%] h-3 bg-[#515f74]/70 rounded-t" />
                    <div className="w-[14%] h-4 bg-red-400 rounded-t" />
                    <div className="w-[14%] h-5 bg-red-500 rounded-t" />
                    <div className="w-[14%] h-6 bg-[#ba1a1a] rounded-t" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Decision Evidence / Logic Centerpiece */}
          <div className="bg-white rounded-2xl border border-[#dcd9db] border-l-[5px] border-l-[#ba1a1a] shadow-sm p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#515f74] uppercase tracking-wider">
                  Decision Logic &amp; Response Protocol ({sectorName.split("(")[0]})
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#76777d]">
                  NER-SENTINEL ML V2.0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {/* Risk Inputs */}
                <div className="bg-[#f6f3f5] p-3.5 rounded-xl border border-[#e2e8f0] flex flex-col justify-center gap-2">
                  <span className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider">
                    Risk Inputs Analyzed
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      NASA SRTM Slope: {slope.toFixed(1)}°
                    </span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      SMAP Moisture: {soilMoisture.toFixed(2)}
                    </span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      7d Rain: {rain7d}mm
                    </span>
                  </div>
                </div>

                {/* Priority Status */}
                <div className="bg-red-500/5 p-3.5 rounded-xl border border-red-200 flex flex-col items-center justify-center gap-1.5 text-center">
                  <span className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider">
                    System Priority
                  </span>
                  <div className="flex items-center gap-1.5 text-[#ba1a1a]">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      priority_high
                    </span>
                    <span className="font-bold text-sm">
                      {isCritical ? "Priority 1 (Immediate Evac)" : isHigh ? "Priority 2 (High Alert)" : "Priority 3 (Monitoring)"}
                    </span>
                  </div>
                </div>

                {/* Action Required */}
                <div className="bg-[#131b2e] text-white p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center shadow-sm">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                    Action Required
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-white">
                      engineering
                    </span>
                    <span className="font-bold text-sm text-white">
                      {isCritical ? "Deploy NDRF & Activate Corridors" : "Continuous Sensor Telemetry"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Ground Reports, Incident Timeline, Response Action */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Recent Ground Reports */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col">
              <h3 className="text-base font-bold text-[#1b1b1d] mb-4 flex items-center justify-between">
                <span>Recent Field Reports ({sectorName.split("(")[0]})</span>
                <span className="material-symbols-outlined text-[#515f74] text-[20px]">
                  chat
                </span>
              </h3>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    water_drop
                  </span>
                  <div>
                    <p className="text-sm text-[#1b1b1d] font-medium leading-snug">
                      Water runoff surge across low-lying drainage paths
                    </p>
                    <p className="text-xs text-[#515f74] flex items-center gap-1 mt-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span>Verified Telemetry • 15 mins ago</span>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 border-t border-gray-100 pt-3">
                  <span className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    landscape
                  </span>
                  <div>
                    <p className="text-sm text-[#1b1b1d] font-medium leading-snug">
                      Soil saturation and slope movement monitored
                    </p>
                    <p className="text-xs text-[#515f74] flex items-center gap-1 mt-1 font-medium">
                      <span className="material-symbols-outlined text-[14px] text-teal-600" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span>Verified Telemetry • 22 mins ago</span>
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Incident Timeline */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col h-full">
              <h3 className="text-base font-bold text-[#1b1b1d] mb-4 flex items-center justify-between">
                <span>Incident Timeline</span>
                <span className="material-symbols-outlined text-[#515f74] text-[20px]">
                  history
                </span>
              </h3>

              <div className="relative border-l border-gray-200 ml-2 space-y-5 pb-2">
                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-[#131b2e] rounded-full -left-[6px] top-1" />
                  <p className="font-mono text-xs font-semibold text-[#515f74] mb-0.5">
                    Live Telemetry
                  </p>
                  <p className="text-xs text-[#1b1b1d] font-medium">
                    ML Predictor classified hazard as {riskLevel} ({Math.round(floodProb * 100)}% probability).
                  </p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-gray-400 rounded-full -left-[6px] top-1" />
                  <p className="font-mono text-xs text-[#515f74] mb-0.5">
                    30 mins ago
                  </p>
                  <p className="text-xs text-[#45464d]">
                    NASA SMAP station {smapStation} reported {soilMoisture.toFixed(2)} m³/m³ moisture.
                  </p>
                </div>
              </div>
            </div>

            {/* Response Action Card */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1b1b1d] mb-3">
                  Response Action ({sectorName.split("(")[0]})
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">Current Status</span>
                    <span className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                      isDispatched ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {isDispatched ? "DISPATCHED" : "NOT DISPATCHED"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">System Priority</span>
                    <span className="text-[#ba1a1a] font-bold uppercase tracking-tight">
                      {isCritical ? "P1 (CRITICAL)" : isHigh ? "P2 (HIGH)" : "P3 (LOW)"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">Recommended</span>
                    <span className="text-[#1b1b1d] font-semibold">
                      {isCritical ? "Evacuation Protocol" : "Continuous Monitoring"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatched(true)}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-colors ${
                    isDispatched
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                      : "bg-[#131b2e] hover:bg-[#25324d] text-white"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDispatched ? "check_circle" : "send"}
                  </span>
                  <span>
                    {isDispatched ? "Teams Dispatched to Sector" : `Dispatch Teams to ${sectorName.split("(")[0]}`}
                  </span>
                </button>

                <Link
                  href="/live-situation"
                  className="w-full bg-white hover:bg-gray-50 text-[#131b2e] font-bold text-xs py-2.5 px-4 rounded-lg border border-gray-300 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>View Global Coordination</span>
                </Link>
              </div>
            </div>
          </div>

          {/* InSAR Ground Deformation Monitor */}
          <InSARMonitor />
        </main>
      </div>
    </div>
  );
}

export default function RiskAssessmentPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-gray-500 font-mono">Loading Dynamic Sector Risk Engine...</div>}>
      <RiskAssessmentContent />
    </Suspense>
  );
}
