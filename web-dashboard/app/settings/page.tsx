"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

export default function SettingsPage() {
  // Profile State
  const [officerName, setOfficerName] = useState("Capt. Tashi Bhutia");
  const [designation, setDesignation] = useState("Senior Disaster Operations Controller");
  const [department, setDepartment] = useState("Gangtok District Disaster Management Authority (DDMA / SSDMA)");
  const [email, setEmail] = useState("tashi.bhutia@sikkim.gov.in");
  const [phone, setPhone] = useState("+91 94340 12345");

  // Preferences State
  const [language, setLanguage] = useState("English");
  const [theme, setTheme] = useState("Dark Tactical Glass");
  const [autoRefreshSec, setAutoRefreshSec] = useState("5");

  // Thresholds State
  const [smapThreshold, setSmapThreshold] = useState("0.40");
  const [rainfallThreshold, setRainfallThreshold] = useState("65");
  const [avoidRadius, setAvoidRadius] = useState("500");

  // System Connections State
  const [riskEngineUrl, setRiskEngineUrl] = useState("http://localhost:8080/api/v1");
  const [llmApiUrl, setLlmApiUrl] = useState("http://127.0.0.1:8001");
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);
  const [audioSirenEnabled, setAudioSirenEnabled] = useState(true);

  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopNavbar title="Settings & Preferences" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1200px] w-full mx-auto overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1b1b1d] tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 text-3xl">settings</span>
                <span>System Configuration &amp; User Profile</span>
              </h2>
              <p className="text-xs text-[#515f74] mt-1">
                Manage operational command profiles, regional languages, NASA satellite telemetry thresholds, and API gateways.
              </p>
            </div>

            {savedStatus && (
              <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 animate-in fade-in flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Settings Saved Successfully!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Section 1: Officer Command Profile */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="material-symbols-outlined text-blue-600">badge</span>
                <span>Command Officer Profile</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Full Name &amp; Rank:</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Operational Designation:</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Department / Authority:</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Official Government Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold text-gray-800 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Regional Language & Interface Preferences */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="material-symbols-outlined text-purple-600">translate</span>
                <span>Regional Language &amp; UI Preferences</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dashboard Language:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold bg-white outline-none cursor-pointer"
                  >
                    <option value="English">English (Official Operational Standard)</option>
                    <option value="Nepali">नेपाली (Nepali - Sikkim Regional)</option>
                    <option value="Hindi">हिन्दी (Hindi - National DDMA)</option>
                    <option value="Bengali">বাংলা (Bengali - Eastern Corridor)</option>
                    <option value="Assamese">অসমীয়া (Assamese - Brahmaputra Valley)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Telemetry Refresh Frequency:</label>
                  <select
                    value={autoRefreshSec}
                    onChange={(e) => setAutoRefreshSec(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold bg-white outline-none cursor-pointer"
                  >
                    <option value="2">Real-Time (Every 2 Seconds)</option>
                    <option value="5">Standard (Every 5 Seconds)</option>
                    <option value="15">Bandwidth Saver (Every 15 Seconds)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Map Visual Theme:</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-semibold bg-white outline-none cursor-pointer"
                  >
                    <option value="Dark Tactical Glass">Dark Tactical Glass (3D Satellite)</option>
                    <option value="Light Administrative">Light Administrative</option>
                    <option value="High-Contrast Night">High-Contrast Emergency Night</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Satellite Telemetry Thresholds & Multi-Factor ML */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="material-symbols-outlined text-emerald-600">satellite_alt</span>
                <span>NASA Satellite &amp; ML Model Trigger Thresholds</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">NASA SMAP Critical Moisture:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min="0.10"
                      max="0.65"
                      value={smapThreshold}
                      onChange={(e) => setSmapThreshold(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold outline-none"
                    />
                    <span className="text-gray-500 font-mono">m³/m³</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Default: 0.40 m³/m³ pore water saturation</span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">24h Rain Warning Trigger:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="300"
                      value={rainfallThreshold}
                      onChange={(e) => setRainfallThreshold(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold outline-none"
                    />
                    <span className="text-gray-500 font-mono">mm/24h</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">IMD Heavy Downpour threshold</span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Dijkstra Hazard Avoid Radius:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="50"
                      min="100"
                      max="2000"
                      value={avoidRadius}
                      onChange={(e) => setAvoidRadius(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl p-2.5 font-mono font-bold outline-none"
                    />
                    <span className="text-gray-500 font-mono">meters</span>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">Safety buffer around landslide debris</span>
                </div>
              </div>
            </div>

            {/* Section 4: Backend API Gateways & Emergency Broadcasts */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2.5">
                <span className="material-symbols-outlined text-orange-600">hub</span>
                <span>API Gateways &amp; Broadcast Channels</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Spring Boot Risk Engine Endpoint:</label>
                  <input
                    type="text"
                    value={riskEngineUrl}
                    onChange={(e) => setRiskEngineUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">LLM Natural Language Advisor Endpoint:</label>
                  <input
                    type="text"
                    value={llmApiUrl}
                    onChange={(e) => setLlmApiUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 font-mono text-xs focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-gray-800 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsAlertsEnabled}
                    onChange={(e) => setSmsAlertsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enable Public SMS Broadcast Gateway</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audioSirenEnabled}
                    onChange={(e) => setAudioSirenEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enable Tactical Audio Alert Sirens on Critical Incidents</span>
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 border border-gray-300 rounded-xl font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Defaults
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
