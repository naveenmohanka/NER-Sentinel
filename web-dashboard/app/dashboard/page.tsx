"use client";

import Sidebar from "@/components/Sidebar";
import TopNavbar from "@/components/TopNavbar";
import LiveRiskMap from "@/components/LiveRiskMap";
import ActiveIncidentsLog from "@/components/ActiveIncidentsLog";
import InSARMonitor from "@/components/InSARMonitor";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#f6f3f5] text-[#1b1b1d] antialiased">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <TopNavbar title="Command Dashboard" />

        {/* Dashboard Canvas Area */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
          {/* Live Risk & Connectivity Map */}
          <LiveRiskMap />

          {/* InSAR Satellite Ground Deformation Monitor */}
          <InSARMonitor />

          {/* Active Incidents Log Section */}
          <ActiveIncidentsLog />
        </main>
      </div>
    </div>
  );
}
