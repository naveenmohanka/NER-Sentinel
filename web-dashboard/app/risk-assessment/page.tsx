"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

export default function RiskAssessmentPage() {
  const [isDispatched, setIsDispatched] = useState(false);

  const handleDispatch = () => {
    setIsDispatched(true);
  };

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <TopNavbar title="Risk Assessment" />

        {/* Risk Assessment Canvas */}
        <main className="flex-1 p-6 md:p-8 space-y-4 max-w-[1400px] w-full mx-auto overflow-y-auto">
          {/* Breadcrumb / Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {/* Badges & Status Row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-bold font-mono bg-red-100 text-[#ba1a1a] px-2.5 py-1 rounded flex items-center gap-1">
                  <span>🔴</span> PRIORITY 1
                </span>
                <span className="text-xs font-bold font-mono bg-[#515f74]/15 text-[#3a485c] px-2.5 py-1 rounded">
                  HIGH RISK
                </span>
                <span className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">
                    trending_up
                  </span>
                  Risk Trend: INCREASING
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-[#1b1b1d] tracking-tight">
                Kalyanpur
              </h2>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-[#515f74] font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                update
              </span>
              <span>Last Updated: 10:42 AM</span>
            </div>
          </div>

          {/* Top Row: Map & Impact Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Location Context Map */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#dcd9db] overflow-hidden flex flex-col shadow-sm min-h-[480px]">
              <div className="p-3.5 border-b border-[#e2e8f0] bg-white flex justify-between items-center">
                <h3 className="text-base font-bold text-[#1b1b1d]">
                  Location Context
                </h3>
                <Link
                  href="/"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_back
                  </span>
                  <span>View Global Map</span>
                </Link>
              </div>

              <div className="relative flex-1 bg-slate-100 w-full overflow-hidden min-h-[420px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/risk-map-bg.png"
                  alt="Location Context - Kalyanpur"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Floating Status Badges on Map */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <span className="bg-[#ba1a1a] text-white px-3 py-1 rounded-full font-bold text-[11px] shadow-sm">
                    HIGH
                  </span>
                  <span className="bg-[#515f74] text-white px-3 py-1 rounded-full font-bold text-[11px] shadow-sm">
                    BLOCKED
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Impact Assessment & Weather-Linked Risk */}
            <div className="flex flex-col gap-4">
              {/* Impact Assessment Card */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col flex-1">
                <h3 className="text-[11px] font-bold text-[#515f74] uppercase tracking-wider border-b border-gray-100 pb-2.5 mb-3">
                  Impact Assessment
                </h3>

                <div className="flex-1 flex flex-col justify-between gap-4">
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Population */}
                    <div>
                      <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1">
                        Population
                      </p>
                      <p className="text-base font-bold text-[#1b1b1d] flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#515f74] text-[18px]">
                          groups
                        </span>
                        1,240
                      </p>
                      <div className="space-y-1 text-xs text-[#515f74]">
                        <p>
                          Evacuation:{" "}
                          <span className="text-[#ba1a1a] font-bold">70%</span>
                        </p>
                        <p>High-Risk: 840</p>
                        <p>Vulnerable: 120</p>
                      </div>
                    </div>

                    {/* Infrastructure */}
                    <div>
                      <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-1">
                        Infrastructure
                      </p>
                      <p className="text-base font-bold text-[#1b1b1d] flex items-center gap-1.5 mb-2">
                        <span className="material-symbols-outlined text-[#515f74] text-[18px]">
                          add_road
                        </span>
                        Road+Bridge
                      </p>
                      <div className="space-y-1 text-xs text-[#515f74]">
                        <p>Roads: 4 High-Risk</p>
                        <p>
                          Power:{" "}
                          <span className="text-[#ba1a1a] font-bold">
                            Critical
                          </span>
                        </p>
                        <p>Bridges: 2 At Capacity</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Risk */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider mb-2">
                      Operational Risk
                    </p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[#45464d] font-medium">
                          Damage Severity
                        </span>
                        <span className="font-bold text-[#ba1a1a]">
                          7.2/10
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#45464d] font-medium">
                          Logistics Disruption
                        </span>
                        <span className="font-bold text-[#ba1a1a]">High</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather-Linked Risk Card */}
              <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col">
                <h4 className="text-[11px] font-bold text-[#515f74] uppercase tracking-wider mb-2.5">
                  Weather-Linked Risk
                </h4>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-[#515f74] font-medium">
                        Current
                      </p>
                      <p className="text-lg font-bold text-[#1b1b1d]">
                        82<span className="text-xs font-normal">mm</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[#515f74] font-medium">
                        Forecast
                      </p>
                      <p className="text-lg font-bold text-[#ba1a1a]">
                        105<span className="text-xs font-normal">mm</span>
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
                  Decision Logic &amp; Response Protocol
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#76777d]">
                  LOGIC ENGINE V4.2
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
                {/* Risk Inputs */}
                <div className="bg-[#f6f3f5] p-3.5 rounded-xl border border-[#e2e8f0] flex flex-col justify-center gap-2">
                  <span className="text-[10px] font-bold text-[#515f74] uppercase tracking-wider">
                    Risk Inputs
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      Rising Rainfall
                    </span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      Blocked Road
                    </span>
                    <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-[11px] font-medium text-[#1b1b1d] shadow-2xs">
                      Ground Reports
                    </span>
                  </div>
                </div>

                {/* Priority Status */}
                <div className="bg-red-500/5 p-3.5 rounded-xl border border-red-200 flex flex-col items-center justify-center gap-1.5 text-center">
                  <span className="text-[10px] font-bold text-[#ba1a1a] uppercase tracking-wider">
                    Priority Status
                  </span>
                  <div className="flex items-center gap-1.5 text-[#ba1a1a]">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      priority_high
                    </span>
                    <span className="font-bold text-sm">
                      Priority 1 (Immediate)
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
                      Deploy Teams &amp; Clear Debris
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
                <span>Recent Ground Reports</span>
                <span className="material-symbols-outlined text-[#515f74] text-[20px]">
                  chat
                </span>
              </h3>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <span
                    className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    water_drop
                  </span>
                  <div>
                    <p className="text-sm text-[#1b1b1d] font-medium leading-snug">
                      Submerged Road at Main Crossing
                    </p>
                    <p className="text-xs text-[#515f74] flex items-center gap-1 mt-1 font-medium">
                      <span
                        className="material-symbols-outlined text-[14px] text-teal-600"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span>Verified • 15 mins ago</span>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 border-t border-gray-100 pt-3">
                  <span
                    className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    waves
                  </span>
                  <div>
                    <p className="text-sm text-[#1b1b1d] font-medium leading-snug">
                      Water level rising rapidly near school
                    </p>
                    <p className="text-xs text-[#515f74] flex items-center gap-1 mt-1 font-medium">
                      <span
                        className="material-symbols-outlined text-[14px] text-teal-600"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span>Verified • 22 mins ago</span>
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3 border-t border-gray-100 pt-3">
                  <span
                    className="material-symbols-outlined text-[#ba1a1a] text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    block
                  </span>
                  <div>
                    <p className="text-sm text-[#1b1b1d] font-medium leading-snug">
                      Access bridge completely blocked by debris
                    </p>
                    <p className="text-xs text-[#515f74] flex items-center gap-1 mt-1 font-medium">
                      <span
                        className="material-symbols-outlined text-[14px] text-teal-600"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      <span>Verified • 45 mins ago</span>
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
                    10:40 AM
                  </p>
                  <p className="text-xs text-[#1b1b1d] font-medium">
                    Priority upgraded to P1 based on logic rules.
                  </p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-gray-400 rounded-full -left-[6px] top-1" />
                  <p className="font-mono text-xs text-[#515f74] mb-0.5">
                    10:28 AM
                  </p>
                  <p className="text-xs text-[#45464d]">
                    Ground report confirmed bridge blockage.
                  </p>
                </div>

                <div className="relative pl-5">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-gray-400 rounded-full -left-[6px] top-1" />
                  <p className="font-mono text-xs text-[#515f74] mb-0.5">
                    10:12 AM
                  </p>
                  <p className="text-xs text-[#45464d]">
                    Automated weather alert triggered for Kalyanpur sector.
                  </p>
                </div>
              </div>
            </div>

            {/* Response Action Card */}
            <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1b1b1d] mb-3">
                  Response Action
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">
                      Current Status
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                        isDispatched
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {isDispatched ? "DISPATCHED" : "NOT DISPATCHED"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">
                      System Priority
                    </span>
                    <span className="text-[#ba1a1a] font-bold uppercase tracking-tight">
                      P1 (CRITICAL)
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-[#515f74] font-medium">
                      Recommended
                    </span>
                    <span className="text-[#1b1b1d] font-semibold">
                      Immediate Response
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4 pt-2">
                <button
                  type="button"
                  onClick={handleDispatch}
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
                    {isDispatched ? "Teams Dispatched" : "Dispatch Teams"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "Response Coordination will be available in the next module."
                    );
                  }}
                  className="w-full bg-white hover:bg-gray-50 text-[#131b2e] font-bold text-xs py-2.5 px-4 rounded-lg border border-gray-300 uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    visibility
                  </span>
                  <span>View Coordination</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

