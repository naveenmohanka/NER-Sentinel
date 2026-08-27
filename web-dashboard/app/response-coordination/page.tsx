"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";

interface Team {
  id: string;
  name: string;
  battalion: string;
  sector: string;
  strength: number;
  status: "DEPLOYED" | "EN ROUTE" | "STANDBY";
  equipment: string[];
}

const initialTeams: Team[] = [
  {
    id: "T-01",
    name: "SDRF Sikkim Alpha Team",
    battalion: "Sikkim State Disaster Response Force",
    sector: "Ranipool River Basin",
    strength: 18,
    status: "DEPLOYED",
    equipment: ["Inflatable Rescue Boats", "Hydraulic Cutters", "Satellite Comms"]
  },
  {
    id: "T-02",
    name: "NDRF 1st Battalion Task Force",
    battalion: "National Disaster Response Force (Patgaon Base)",
    sector: "Singtam Teesta Valley",
    strength: 32,
    status: "EN ROUTE",
    equipment: ["Heavy Excavators", "Dewatering Pumps", "Medical Unit"]
  },
  {
    id: "T-03",
    name: "GREF / BRO Road Clearing Unit",
    battalion: "Border Roads Organisation (Swastik Project)",
    sector: "NH-10 Himalayan Corridor (29th Mile)",
    strength: 24,
    status: "DEPLOYED",
    equipment: ["Bull-dozers", "Rock Drills", "Dump Trucks"]
  },
  {
    id: "T-04",
    name: "ITBP 13th Battalion Relief Team",
    battalion: "Indo-Tibetan Border Police",
    sector: "Bhusuk Ridge Sector",
    strength: 20,
    status: "STANDBY",
    equipment: ["High-Altitude Rescue Gear", "Emergency Tents", "Ration Supplies"]
  }
];

export default function ResponseCoordinationPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [selectedShelter, setSelectedShelter] = useState("Camp Gangtok Central");

  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <TopNavbar title="Response Coordination" />

        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-[1400px] w-full mx-auto overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1b1b1d] tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-3xl">groups</span>
                <span>Inter-Agency Tactical Response Coordination</span>
              </h2>
              <p className="text-xs text-[#515f74] mt-1">
                Multi-agency dispatch board connecting SDRF Sikkim, NDRF 1st Bn, BRO Project Swastik, and ITBP.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold font-mono text-xs rounded-lg border border-emerald-300">
                4 Active Battalions
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold font-mono text-xs rounded-lg border border-blue-300">
                94 Responders Deployed
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-[#dcd9db] shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Camp Gangtok Central</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-bold text-gray-900">420 / 600</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">70% Capacity</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#dcd9db] shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Camp Ranipool Sector</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-bold text-gray-900">280 / 400</span>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">70% Capacity</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#dcd9db] shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Camp Tadong Area</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-bold text-gray-900">150 / 500</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">30% Capacity</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#dcd9db] shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Dijkstra Evac Corridors</span>
              <div className="flex justify-between items-end mt-2">
                <span className="text-2xl font-bold text-blue-600">3 Active</span>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Real-Time Routing</span>
              </div>
            </div>
          </div>

          {/* Teams Table */}
          <div className="bg-white rounded-2xl border border-[#dcd9db] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-600">military_tech</span>
                <span>Active Task Force Units</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-gray-600 uppercase font-bold border-b border-gray-200">
                  <tr>
                    <th className="p-3.5">Unit / Task Force</th>
                    <th className="p-3.5">Assigned Sector</th>
                    <th className="p-3.5">Strength</th>
                    <th className="p-3.5">Operational Equipment</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teams.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900">
                        <div>{t.name}</div>
                        <div className="text-[11px] text-gray-500 font-normal">{t.battalion}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-gray-700">{t.sector}</td>
                      <td className="p-3.5 font-mono font-bold text-gray-800">{t.strength} Personnel</td>
                      <td className="p-3.5 text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {t.equipment.map((eq, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[10px]">
                              {eq}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          t.status === "DEPLOYED"
                            ? "bg-red-100 text-red-800"
                            : t.status === "EN ROUTE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-colors">
                          Dispatch Comms
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
