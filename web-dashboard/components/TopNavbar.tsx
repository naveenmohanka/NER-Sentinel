"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TopNavbarProps {
  title?: string;
}

export default function TopNavbar({ title = "Command Dashboard" }: TopNavbarProps) {
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const day = now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long" });
      const dateNum = now.getDate();
      const ordinal =
        dateNum % 10 === 1 && dateNum !== 11
          ? "st"
          : dateNum % 10 === 2 && dateNum !== 12
          ? "nd"
          : dateNum % 10 === 3 && dateNum !== 13
          ? "rd"
          : "th";
      const monthYear = now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        month: "short",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setLiveTime(`${dateNum}${ordinal} ${monthYear} | ${day} | ${timeStr}`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 bg-white border-b border-[#e2e8f0] shadow-xs flex justify-between items-center h-16 px-6 w-full z-20">
      {/* Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg md:text-xl font-bold text-[#1b1b1d] tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right Stats & Actions */}
      <div className="flex items-center gap-4 md:gap-5 text-sm">
        {/* Date & Time */}
        <span className="text-xs md:text-sm text-[#515f74] font-medium hidden sm:inline-block font-mono">
          {liveTime || "Syncing IST Clock..."}
        </span>

        {/* System Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-emerald-700 font-semibold text-xs md:text-sm bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span
            className="material-symbols-outlined text-[16px] text-emerald-600"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span>System Operational</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="text-[#515f74] hover:text-[#1b1b1d] hover:bg-gray-100 p-1.5 rounded-full transition-colors relative"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Profile Avatar & Sign Out */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar.png"
            alt="User Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 shadow-xs"
          />
          <Link
            href="/login"
            title="Sign Out to Login Page"
            className="text-gray-600 hover:text-red-600 hover:bg-red-50/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 text-xs font-bold border border-gray-200 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span className="hidden md:inline">Sign Out</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

